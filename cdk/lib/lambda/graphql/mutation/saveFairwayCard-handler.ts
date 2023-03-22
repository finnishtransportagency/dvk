import { AppSyncResolverEvent, AppSyncResolverHandler } from 'aws-lambda/trigger/appsync-resolver';
import {
  FairwayCard,
  FairwayCardInput,
  Maybe,
  MutationSaveFairwayCardArgs,
  Operation,
  OperationError,
  Status,
  TextInput,
} from '../../../../graphql/generated';
import { auditLog, log } from '../../logger';
import FairwayCardDBModel from '../../db/fairwayCardDBModel';
import { getPilotPlaceMap, mapFairwayCardDBModelToGraphqlType, mapIds } from '../../db/modelMapper';
import { CurrentUser, getCurrentUser } from '../../api/login';
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

function mapFairwayCardToModel(card: FairwayCardInput, old: FairwayCardDBModel | undefined, user: CurrentUser): FairwayCardDBModel {
  return {
    id: card.id,
    name: mapMandatoryText(card.name),
    status: card.status,
    n2000HeightSystem: !!card.n2000HeightSystem,
    group: mapString(card.group),
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
        email: mapString(card.trafficService?.pilot?.email),
        extraInfo: mapText(card.trafficService?.pilot?.extraInfo),
        fax: mapString(card.trafficService?.pilot?.fax),
        internet: mapString(card.trafficService?.pilot?.internet),
        phoneNumber: mapString(card.trafficService?.pilot?.phoneNumber),
        places:
          card.trafficService?.pilot?.places?.map((p) => {
            return {
              id: p.id,
              pilotJourney: mapNumber(p.pilotJourney),
            };
          }) || [],
      },
      tugs:
        card.trafficService?.tugs?.map((t) => {
          return {
            email: mapString(t?.email),
            fax: mapString(t?.fax),
            name: mapText(t?.name),
            phoneNumber: mapStringArray(t?.phoneNumber),
          };
        }) || null,
      vts:
        card.trafficService?.vts?.map((v) => {
          return {
            email: mapStringArray(v?.email),
            name: mapText(v?.name),
            phoneNumber: mapString(v?.phoneNumber),
            vhf: v?.vhf?.map((v2) => {
              return {
                name: mapText(v2?.name),
                channel: mapNumber(v2?.channel),
              };
            }),
          };
        }) || null,
    },
    harbors:
      card.harbors?.map((id) => {
        return { id };
      }) || null,
    fairwayIds: mapIds(card.fairwayIds),
    expires: card.status === Status.Removed ? getExpires() : null,
  };
}

export const handler: AppSyncResolverHandler<MutationSaveFairwayCardArgs, FairwayCard> = async (
  event: AppSyncResolverEvent<MutationSaveFairwayCardArgs>
): Promise<FairwayCard> => {
  const user = await getCurrentUser(event);
  log.info(`saveFairwayCard(${event.arguments.card?.id}, ${user.uid})`);
  if (event.arguments.card?.id) {
    const dbModel = await FairwayCardDBModel.get(event.arguments.card.id);
    const newModel = mapFairwayCardToModel(event.arguments.card, dbModel, user);
    log.debug('card: %o', newModel);
    try {
      await FairwayCardDBModel.save(newModel, event.arguments.card.operation);
    } catch (e) {
      if (e instanceof ConditionalCheckFailedException && e.name === 'ConditionalCheckFailedException') {
        throw new Error(event.arguments.card.operation === Operation.Create ? OperationError.CardAlreadyExist : OperationError.CardNotExist);
      }
      throw e;
    }
    if (event.arguments.card.operation === Operation.Update) {
      const changes = dbModel ? diff(dbModel, newModel) : null;
      auditLog.info({ changes, card: newModel, user: user.uid }, 'FairwayCard updated');
    } else {
      auditLog.info({ card: newModel, user: user.uid }, 'FairwayCard added');
    }
    const pilotMap = await getPilotPlaceMap();
    return mapFairwayCardDBModelToGraphqlType(newModel, pilotMap, user);
  }
  log.warn({ input: event.arguments.card }, 'Card id missing');
  throw new Error(OperationError.CardIdMissing);
};
