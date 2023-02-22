import { AppSyncResolverEvent, AppSyncResolverHandler } from 'aws-lambda/trigger/appsync-resolver';
import { Harbor, Maybe, MutationSaveHarborArgs, Text } from '../../../../graphql/generated';
import { log } from '../../logger';
import HarborDBModel from '../../db/harborDBModel';

function mapText(text?: Maybe<Text>) {
  if (text) {
    return {
      fi: text.fi || undefined,
      sv: text.sv || undefined,
      en: text.en || undefined,
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

function mapHarborToModel(harbor: Harbor): HarborDBModel {
  return {
    id: harbor.id,
    name: mapText(harbor.name),
    company: mapText(harbor.company),
    email: map<string>(harbor.email),
    extraInfo: mapText(harbor.extraInfo),
    fax: map<string>(harbor.fax),
    harborBasin: mapText(harbor.harborBasin),
    internet: map<string>(harbor.internet),
    phoneNumber: mapStringArray(harbor.phoneNumber),
    geometry: harbor.geometry ? { type: harbor.geometry.type, coordinates: harbor.geometry.coordinates } : undefined,
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
        geometry: q?.geometry ? { type: q.geometry.type, coordinates: q.geometry.coordinates } : undefined,
        sections: q?.sections?.map((s) => {
          return {
            depth: map<number>(s?.depth),
            name: map<string>(s?.name),
            geometry: s?.geometry ? { type: s.geometry.type, coordinates: s.geometry.coordinates } : undefined,
          };
        }),
      };
    }),
  };
}

export const handler: AppSyncResolverHandler<MutationSaveHarborArgs, Harbor> = async (
  event: AppSyncResolverEvent<MutationSaveHarborArgs>
): Promise<Harbor> => {
  log.info(`saveHarbor(${event.arguments.harbor?.id})`);
  if (event.arguments.harbor?.id) {
    await HarborDBModel.save(mapHarborToModel(event.arguments.harbor));
    const dbModel = await HarborDBModel.get(event.arguments.harbor.id);
    if (dbModel) {
      return dbModel;
    }
  }
  throw new Error('Harbor id missing');
};
