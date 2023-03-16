import { AppSyncResolverEvent, AppSyncResolverHandler } from 'aws-lambda/trigger/appsync-resolver';
import { Harbor, HarborInput, Maybe, MutationSaveHarborArgs, Operation, OperationError, TextInput } from '../../../../graphql/generated';
import { auditLog, log } from '../../logger';
import HarborDBModel from '../../db/harborDBModel';
import { CurrentUser, getCurrentUser } from '../../api/login';
import { mapHarborDBModelToGraphqlType } from '../../db/modelMapper';
import { detailedDiff } from 'deep-object-diff';

function mapText(text?: Maybe<TextInput>) {
  if (text) {
    return {
      fi: text.fi,
      sv: text.sv,
      en: text.en,
    };
  } else {
    return undefined;
  }
}

function map<T>(text: Maybe<T> | undefined): T | undefined {
  return text ? text : undefined;
}

function mapStringArray(text: Maybe<Maybe<string>[]> | undefined): string[] | undefined {
  return text ? (text.map((t) => map<string>(t)).filter((t) => t !== undefined) as string[]) : undefined;
}

function mapHarborToModel(harbor: HarborInput, old: HarborDBModel | undefined, user: CurrentUser): HarborDBModel {
  return {
    id: harbor.id,
    name: harbor.name,
    n2000HeightSystem: !!harbor.n2000HeightSystem,
    status: harbor.status,
    company: mapText(harbor.company),
    creator: old ? old.creator : user.uid,
    creationTimestamp: old ? old.creationTimestamp : Date.now(),
    modifier: user.uid,
    modificationTimestamp: Date.now(),
    email: map<string>(harbor.email),
    extraInfo: mapText(harbor.extraInfo),
    fax: map<string>(harbor.fax),
    harborBasin: mapText(harbor.harborBasin),
    internet: map<string>(harbor.internet),
    phoneNumber: mapStringArray(harbor.phoneNumber),
    geometry: harbor.geometry ? { type: 'Point', coordinates: [harbor.geometry.lat, harbor.geometry.lon] } : undefined,
    cargo: mapText(harbor.cargo),
    quays: harbor.quays?.map((q) => {
      return {
        extraInfo: mapText(q?.extraInfo),
        length: map<number>(q?.length),
        name: mapText(q?.name),
        geometry: q?.geometry ? { type: 'Point', coordinates: [q.geometry.lat, q.geometry.lon] } : undefined,
        sections: q?.sections?.map((s) => {
          return {
            depth: map<number>(s?.depth),
            name: map<string>(s?.name),
            geometry: s?.geometry ? { type: 'Point', coordinates: [s.geometry.lat, s.geometry.lon] } : undefined,
          };
        }),
      };
    }),
  };
}

export const handler: AppSyncResolverHandler<MutationSaveHarborArgs, Harbor> = async (
  event: AppSyncResolverEvent<MutationSaveHarborArgs>
): Promise<Harbor> => {
  const user = await getCurrentUser(event);
  log.info(`saveHarbor(${event.arguments.harbor?.id}, ${user.uid})`);
  if (event.arguments.harbor?.id) {
    const dbModel = await HarborDBModel.get(event.arguments.harbor.id);
    if (event.arguments.harbor.operation === Operation.Create && dbModel !== undefined) {
      log.warn(`Harbor with id ${event.arguments.harbor.id} already exists`);
      throw new Error(OperationError.HarborAlreadyExist);
    }
    const newModel = mapHarborToModel(event.arguments.harbor, dbModel, user);
    log.debug('harbor: %o', newModel);
    await HarborDBModel.save(newModel);
    if (dbModel) {
      const changes = detailedDiff(dbModel, newModel);
      auditLog.info({ changes, user: user.uid }, 'Harbor updated');
    } else {
      auditLog.info({ harbor: newModel, user: user.uid }, 'Harbor added');
    }
    return mapHarborDBModelToGraphqlType(newModel, user);
  }
  log.warn({ input: event.arguments.harbor }, 'Harbor id missing');
  throw new Error(OperationError.HarborIdMissing);
};
