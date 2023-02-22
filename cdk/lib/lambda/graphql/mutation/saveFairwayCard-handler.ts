import { AppSyncResolverEvent, AppSyncResolverHandler } from 'aws-lambda/trigger/appsync-resolver';
import { FairwayCard, Maybe, MutationSaveFairwayCardArgs, Text } from '../../../../graphql/generated';
import { log } from '../../logger';
import FairwayCardDBModel from '../../db/fairwayCardDBModel';
import { getPilotPlaceMap, mapFairwayCardDBModelToGraphqlType, mapFairwayIds } from '../../db/modelMapper';

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

function mapFairwayCardToModel(card: FairwayCard): FairwayCardDBModel {
  return {
    id: card.id,
    name: mapText(card.name),
    n2000HeightSystem: !!card.n2000HeightSystem,
    group: map<string>(card.group),
    modificationTimestamp: Date.now(),
    fairways: card.fairways.map((f) => {
      return { id: f.id, primary: f.primary || false };
    }),
    generalInfo: mapText(card.generalInfo),
    anchorage: mapText(card.anchorage),
    iceCondition: mapText(card.iceCondition),
    attention: mapText(card.attention),
    lineText: mapText(card.lineText),
    designSpeed: mapText(card.designSpeed),
    navigationCondition: mapText(card.navigationCondition),
    windRecommendation: mapText(card.windRecommendation),
    windGauge: mapText(card.windGauge),
    visibility: mapText(card.visibility),
    seaLevel: mapText(card.seaLevel),
    speedLimit: mapText(card.speedLimit),
    vesselRecommendation: mapText(card.vesselRecommendation),
    trafficService: {
      pilot: {
        email: map<string>(card.trafficService?.pilot?.email),
        extraInfo: mapText(card.trafficService?.pilot?.extraInfo),
        fax: map<string>(card.trafficService?.pilot?.fax),
        internet: map<string>(card.trafficService?.pilot?.internet),
        phoneNumber: map<string>(card.trafficService?.pilot?.phoneNumber),
        places:
          card.trafficService?.pilot?.places?.map((p) => {
            return {
              id: p.id,
              pilotJourney: map<number>(p.pilotJourney),
            };
          }) || [],
      },
      tugs: card.trafficService?.tugs?.map((t) => {
        return {
          email: map<string>(t?.email),
          fax: map<string>(t?.fax),
          name: mapText(t?.name),
          phoneNumber: mapStringArray(t?.phoneNumber),
        };
      }),
      vts: card.trafficService?.vts?.map((v) => {
        return {
          email: mapStringArray(v?.email),
          name: mapText(v?.name),
          phoneNumber: map<string>(v?.phoneNumber),
          vhf: v?.vhf?.map((v2) => {
            return {
              name: mapText(v2?.name),
              channel: map<number>(v2?.channel),
            };
          }),
        };
      }),
    },
    harbors: card.harbors?.map((h) => {
      return { id: h.id };
    }),
    fairwayIds: mapFairwayIds(card),
  };
}

export const handler: AppSyncResolverHandler<MutationSaveFairwayCardArgs, FairwayCard> = async (
  event: AppSyncResolverEvent<MutationSaveFairwayCardArgs>
): Promise<FairwayCard> => {
  log.info(`saveFairwayCard(${event.arguments.card?.id})`);
  if (event.arguments.card?.id) {
    await FairwayCardDBModel.save(mapFairwayCardToModel(event.arguments.card));
    const dbModel = await FairwayCardDBModel.get(event.arguments.card.id);
    if (dbModel) {
      const pilotMap = await getPilotPlaceMap();
      return mapFairwayCardDBModelToGraphqlType(dbModel, pilotMap);
    }
  }
  throw new Error('Card id missing');
};
