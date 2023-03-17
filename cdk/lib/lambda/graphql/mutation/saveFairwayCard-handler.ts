import { AppSyncResolverEvent, AppSyncResolverHandler } from 'aws-lambda/trigger/appsync-resolver';
import {
  FairwayCard,
  FairwayCardInput,
  Maybe,
  MutationSaveFairwayCardArgs,
  Operation,
  OperationError,
  TextInput,
} from '../../../../graphql/generated';
import { auditLog, log } from '../../logger';
import FairwayCardDBModel from '../../db/fairwayCardDBModel';
import { getPilotPlaceMap, mapFairwayCardDBModelToGraphqlType, mapIds } from '../../db/modelMapper';
import { CurrentUser, getCurrentUser } from '../../api/login';
import { diff } from './diff';

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

function mapFairwayCardToModel(card: FairwayCardInput, old: FairwayCardDBModel | undefined, user: CurrentUser): FairwayCardDBModel {
  return {
    id: card.id,
    name: card.name,
    status: card.status,
    n2000HeightSystem: !!card.n2000HeightSystem,
    group: map<string>(card.group),
    creationTimestamp: old ? old.creationTimestamp : Date.now(),
    creator: old ? old.creator : user.uid,
    modifier: user.uid,
    modificationTimestamp: Date.now(),
    fairways: card.fairwayIds.map((id, idx) => {
      return {
        id,
        primary: card.primaryFairwayId ? card.primaryFairwayId === id : idx === 0,
        secondary: card.secondaryFairwayId ? id === card.secondaryFairwayId : idx === 0,
      };
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
    harbors: card.harbors?.map((id) => {
      return { id };
    }),
    fairwayIds: mapIds(card.fairwayIds),
  };
}

export const handler: AppSyncResolverHandler<MutationSaveFairwayCardArgs, FairwayCard> = async (
  event: AppSyncResolverEvent<MutationSaveFairwayCardArgs>
): Promise<FairwayCard> => {
  const user = await getCurrentUser(event);
  log.info(`saveFairwayCard(${event.arguments.card?.id}, ${user.uid})`);
  if (event.arguments.card?.id) {
    const dbModel = await FairwayCardDBModel.get(event.arguments.card.id);
    if (event.arguments.card.operation === Operation.Create && dbModel !== undefined) {
      log.warn(`Card with id ${event.arguments.card.id} already exists`);
      throw new Error(OperationError.CardAlreadyExist);
    }
    const newModel = mapFairwayCardToModel(event.arguments.card, dbModel, user);
    log.debug('card: %o', newModel);
    await FairwayCardDBModel.save(newModel);
    // fetch again since dynamodb omits undefined
    const updatedDbModel = await FairwayCardDBModel.get(event.arguments.card.id);
    if (dbModel && updatedDbModel) {
      const changes = diff(dbModel, updatedDbModel);
      auditLog.info({ changes, card: updatedDbModel, user: user.uid }, 'FairwayCard updated');
    } else {
      auditLog.info({ harbor: updatedDbModel, user: user.uid }, 'FairwayCard added');
    }
    const pilotMap = await getPilotPlaceMap();
    return mapFairwayCardDBModelToGraphqlType(newModel, pilotMap, user);
  }
  log.warn({ input: event.arguments.card }, 'Card id missing');
  throw new Error(OperationError.CardIdMissing);
};
