import { AppSyncResolverEvent, AppSyncResolverHandler } from 'aws-lambda/trigger/appsync-resolver';
import { Harbor, HarborInput, Maybe, MutationSaveHarborArgs, TextInput } from '../../../../graphql/generated';
import { log } from '../../logger';
import HarborDBModel from '../../db/harborDBModel';
import { getCurrentUser } from '../../api/login';

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

function mapHarborToModel(harbor: HarborInput, old: HarborDBModel | undefined): HarborDBModel {
  return {
    id: harbor.id,
    name: harbor.name,
    status: harbor.status,
    company: mapText(harbor.company),
    creator: old ? old.creator : 'Erkki Esimerkki',
    creationTimestamp: old ? old.creationTimestamp : Date.now(),
    modifier: 'Erkki Esimerkki',
    modificationTimestamp: Date.now(),
    email: map<string>(harbor.email),
    extraInfo: mapText(harbor.extraInfo),
    fax: map<string>(harbor.fax),
    harborBasin: mapText(harbor.harborBasin),
    internet: map<string>(harbor.internet),
    phoneNumber: mapStringArray(harbor.phoneNumber),
    geometry: harbor.geometry ? { type: 'Point', coordinates: [harbor.geometry.lat, harbor.geometry.lon] } : undefined,
    cargo: harbor.cargo
      ?.map((c) => {
        return { fi: c?.fi || undefined, sv: c?.sv || undefined, en: c?.en || undefined };
      })
      .filter((c) => c.fi || c.sv || c.en),
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
    const newModel = mapHarborToModel(event.arguments.harbor, dbModel);
    log.debug('harbor: %o', newModel);
    await HarborDBModel.save(newModel);
    return newModel;
  }
  throw new Error('Harbor id missing');
};
