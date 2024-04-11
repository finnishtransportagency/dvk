import { AppSyncResolverEvent, AppSyncResolverHandler } from 'aws-lambda/trigger/appsync-resolver';
import {
  FairwayCard,
  FairwayCardInput,
  InputMaybe,
  Maybe,
  MutationSaveFairwayCardArgs,
  Operation,
  OperationError,
  PictureInput,
  Status,
} from '../../../../graphql/generated';
import { auditLog, log } from '../../logger';
import FairwayCardDBModel, { Picture } from '../../db/fairwayCardDBModel';
import {
  getPilotPlaceMap,
  getPilotRoutes,
  mapEmail,
  mapEmails,
  mapFairwayCardDBModelToGraphqlType,
  mapId,
  mapIds,
  mapInternetAddress,
  mapMandatoryText,
  mapPhoneNumber,
  mapPhoneNumbers,
  mapPilotJourney,
  mapString,
  mapText,
  mapVhfChannel,
} from '../../db/modelMapper';
import { CurrentUser, getCurrentUser } from '../../api/login';
import { diff } from 'deep-object-diff';
import { ConditionalCheckFailedException } from '@aws-sdk/client-dynamodb';
import { getExpires, getNewStaticBucketName } from '../../environment';
import { PutObjectTaggingCommand, S3Client } from '@aws-sdk/client-s3';
import { deleteCacheObjects } from '../cache';

// Feature cache s3 objects related to fairway card
const CACHE_KEYS = [
  'pilot',
  'harbor',
  'area1,2',
  'area3,4,5,6',
  'specialarea151,2,3,4,5,6',
  'specialarea21,2,3,4,5,6',
  'line1,2',
  'line3,4,5,6',
  'safetyequipment1,2,99',
  'safetyequipmentfault',
];

export function mapFairwayCardToModel(card: FairwayCardInput, old: FairwayCardDBModel | undefined, user: CurrentUser): FairwayCardDBModel {
  return {
    id: mapId(card.id),
    name: mapMandatoryText(card.name),
    status: card.status,
    n2000HeightSystem: !!card.n2000HeightSystem,
    group: mapString(card.group),
    creationTimestamp: old ? old.creationTimestamp : Date.now(),
    creator: old ? old.creator : `${user.firstName} ${user.lastName}`,
    modifier: `${user.firstName} ${user.lastName}`,
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
    additionalInfo: mapText(card.additionalInfo),
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
        email: mapEmail(card.trafficService?.pilot?.email),
        extraInfo: mapText(card.trafficService?.pilot?.extraInfo),
        fax: mapPhoneNumber(card.trafficService?.pilot?.fax),
        internet: mapInternetAddress(card.trafficService?.pilot?.internet),
        phoneNumber: mapPhoneNumber(card.trafficService?.pilot?.phoneNumber),
        places:
          card.trafficService?.pilot?.places?.map((p) => {
            return {
              id: p.id,
              pilotJourney: mapPilotJourney(p.pilotJourney),
            };
          }) ?? [],
      },
      tugs:
        card.trafficService?.tugs?.map((t) => {
          return {
            email: mapEmail(t?.email),
            fax: mapPhoneNumber(t?.fax),
            name: mapText(t?.name),
            phoneNumber: mapPhoneNumbers(t?.phoneNumber),
          };
        }) ?? null,
      vts:
        card.trafficService?.vts?.map((v) => {
          return {
            email: mapEmails(v?.email),
            name: mapText(v?.name),
            phoneNumber: mapPhoneNumber(v?.phoneNumber),
            vhf: v?.vhf?.map((v2) => {
              return {
                name: mapText(v2?.name),
                channel: mapVhfChannel(v2?.channel),
              };
            }),
          };
        }) ?? null,
    },
    harbors:
      card.harbors?.map((id) => {
        return { id };
      }) ?? null,
    pilotRoutes:
      card.pilotRoutes?.map((id) => {
        return { id };
      }) ?? null,
    fairwayIds: mapIds(card.fairwayIds),
    expires: card.status === Status.Removed ? getExpires() : null,
    pictures:
      card.pictures?.map((p) => {
        return {
          id: p.id,
          sequenceNumber: p.sequenceNumber ?? null,
          orientation: p.orientation,
          rotation: p.rotation ?? null,
          modificationTimestamp: p.modificationTimestamp ?? null,
          scaleLabel: mapString(p.scaleLabel, 20),
          scaleWidth: mapString(p.scaleWidth, 20),
          text: mapString(p.text, 100),
          lang: mapString(p.lang, 2),
          groupId: p.groupId ?? null,
          legendPosition: p.legendPosition ?? null,
        };
      }) ?? null,
  };
}

const s3Client = new S3Client({ region: 'eu-west-1' });

async function tagPictures(cardId: string, pictures: InputMaybe<PictureInput[]> | undefined, oldPictures: Maybe<Picture[]> | undefined) {
  const promises = [];
  const bucketName = getNewStaticBucketName();
  for (const picture of pictures ?? []) {
    const command = new PutObjectTaggingCommand({
      Key: `${cardId}/${picture.id}`,
      Bucket: bucketName,
      Tagging: { TagSet: [{ Key: 'InUse', Value: 'true' }] },
    });
    log.debug(`setting InUse to true for ${picture.id}`);
    promises.push(s3Client.send(command));
  }
  for (const oldPicture of oldPictures ?? []) {
    if (!pictures?.find((p) => p.id === oldPicture.id)) {
      const command = new PutObjectTaggingCommand({
        Key: `${cardId}/${oldPicture.id}`,
        Bucket: bucketName,
        Tagging: { TagSet: [{ Key: 'InUse', Value: 'false' }] },
      });
      promises.push(s3Client.send(command));
      log.debug(`setting InUse to false for ${oldPicture.id}`);
    }
  }
  await Promise.all(promises);
}

export const handler: AppSyncResolverHandler<MutationSaveFairwayCardArgs, FairwayCard> = async (
  event: AppSyncResolverEvent<MutationSaveFairwayCardArgs>
): Promise<FairwayCard> => {
  const user = await getCurrentUser(event);
  log.info(`saveFairwayCard(${event.arguments.card.id}, ${user.uid})`);
  const dbModel = await FairwayCardDBModel.get(event.arguments.card.id);
  const newModel = mapFairwayCardToModel(event.arguments.card, dbModel, user);
  log.debug('card: %o', newModel);
  await tagPictures(event.arguments.card.id, event.arguments.card.pictures, dbModel?.pictures);
  try {
    if (dbModel?.status === Status.Public && newModel.status !== Status.Public) {
      // Clear feature cache s3 objects related to fairway card
      await deleteCacheObjects(CACHE_KEYS);
    }
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
  const pilotRoutes = await getPilotRoutes();
  return mapFairwayCardDBModelToGraphqlType(newModel, pilotMap, user, pilotRoutes);
};
