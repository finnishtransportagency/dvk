import { AppSyncResolverEvent, AppSyncResolverHandler } from 'aws-lambda/trigger/appsync-resolver';
import { Harbor, HarborInput, Maybe, MutationSaveHarborArgs, Operation, OperationError, Status, TextInput } from '../../../../graphql/generated';
import { auditLog, log } from '../../logger';
import HarborDBModel from '../../db/harborDBModel';
import { CurrentUser, getCurrentUser } from '../../api/login';
import { mapHarborDBModelToGraphqlType } from '../../db/modelMapper';
import { diff } from 'deep-object-diff';
import { ConditionalCheckFailedException } from '@aws-sdk/client-dynamodb';
import { getExpires } from '../../environment';

function mapText(text?: Maybe<TextInput>) {
  if (text && text.fi && text.sv && text.en) {
    return {
      fi: text.fi,
      sv: text.sv,
      en: text.en,
    };
  } else if (text && (text.fi || text.sv || text.en)) {
    throw new Error(OperationError.InvalidInput);
  } else {
    return null;
  }
}

function mapMandatoryText(text: TextInput) {
  if (text.fi && text.sv && text.en) {
    return {
      fi: text.fi,
      sv: text.sv,
      en: text.en,
    };
  } else {
    throw new Error(OperationError.InvalidInput);
  }
}

function mapString(text: Maybe<string> | undefined): string | null {
  return text ? text : null;
}

function mapNumber(text: Maybe<number> | undefined): number | null {
  return text ?? null;
}

function mapStringArray(text: Maybe<Maybe<string>[]> | undefined): string[] | null {
  return text ? (text.map((t) => mapString(t)).filter((t) => t !== null) as string[]) : null;
}

function mapHarborToModel(harbor: HarborInput, old: HarborDBModel | undefined, user: CurrentUser): HarborDBModel {
  return {
    id: harbor.id,
    name: mapMandatoryText(harbor.name),
    n2000HeightSystem: !!harbor.n2000HeightSystem,
    status: harbor.status,
    company: mapText(harbor.company),
    creator: old ? old.creator : user.uid,
    creationTimestamp: old ? old.creationTimestamp : Date.now(),
    modifier: user.uid,
    modificationTimestamp: Date.now(),
    email: mapString(harbor.email),
    extraInfo: mapText(harbor.extraInfo),
    fax: mapString(harbor.fax),
    harborBasin: mapText(harbor.harborBasin),
    internet: mapString(harbor.internet),
    phoneNumber: mapStringArray(harbor.phoneNumber),
    geometry: harbor.geometry ? { type: 'Point', coordinates: [harbor.geometry.lat, harbor.geometry.lon] } : null,
    cargo: mapText(harbor.cargo),
    quays:
      harbor.quays?.map((q) => {
        return {
          extraInfo: mapText(q?.extraInfo),
          length: mapNumber(q?.length),
          name: mapText(q?.name),
          geometry: q?.geometry ? { type: 'Point', coordinates: [q.geometry.lat, q.geometry.lon] } : null,
          sections:
            q?.sections?.map((s) => {
              return {
                depth: mapNumber(s?.depth),
                name: mapString(s?.name),
                geometry: s?.geometry ? { type: 'Point', coordinates: [s.geometry.lat, s.geometry.lon] } : null,
              };
            }) || null,
        };
      }) || null,
    expires: harbor.status === Status.Removed ? getExpires() : null,
  };
}

export const handler: AppSyncResolverHandler<MutationSaveHarborArgs, Harbor> = async (
  event: AppSyncResolverEvent<MutationSaveHarborArgs>
): Promise<Harbor> => {
  const user = await getCurrentUser(event);
  log.info(`saveHarbor(${event.arguments.harbor?.id}, ${user.uid})`);
  if (event.arguments.harbor?.id) {
    const dbModel = await HarborDBModel.get(event.arguments.harbor.id);
    const newModel = mapHarborToModel(event.arguments.harbor, dbModel, user);
    log.debug('harbor: %o', newModel);
    try {
      await HarborDBModel.save(newModel, event.arguments.harbor.operation);
    } catch (e) {
      if (e instanceof ConditionalCheckFailedException && e.name === 'ConditionalCheckFailedException') {
        throw new Error(event.arguments.harbor.operation === Operation.Create ? OperationError.HarborAlreadyExist : OperationError.HarborNotExist);
      }
      throw e;
    }
    if (event.arguments.harbor.operation === Operation.Update) {
      const changes = dbModel ? diff(dbModel, newModel) : null;
      auditLog.info({ changes, harbor: newModel, user: user.uid }, 'Harbor updated');
    } else {
      auditLog.info({ harbor: newModel, user: user.uid }, 'Harbor added');
    }
    return mapHarborDBModelToGraphqlType(newModel, user);
  }
  log.warn({ input: event.arguments.harbor }, 'Harbor id missing');
  throw new Error(OperationError.HarborIdMissing);
};
