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
  mapVersion,
  mapVhfChannel,
} from '../../db/modelMapper';
import { CurrentUser, getCurrentUser } from '../../api/login';
import { diff } from 'deep-object-diff';
import { ConditionalCheckFailedException } from '@aws-sdk/client-dynamodb';
import { getExpires, getNewStaticBucketName } from '../../environment';
import { CopyObjectCommand, PutObjectTaggingCommand, S3Client } from '@aws-sdk/client-s3';
import { FeatureCollection, GeoJsonProperties, Geometry } from 'geojson';
import { deleteCacheObjects } from '../cache';

export function mapFairwayCardToModel(
  card: FairwayCardInput,
  old: FairwayCardDBModel | undefined,
  user: CurrentUser,
  newPictures?: PictureInput[]
): FairwayCardDBModel {
  const pictures = newPictures || card.pictures;

  return {
    id: mapId(card.id),
    version: mapVersion(card.version),
    name: mapMandatoryText(card.name),
    status: card.status,
    n2000HeightSystem: !!card.n2000HeightSystem,
    group: mapString(card.group),
    creationTimestamp: old ? old.creationTimestamp : Date.now(),
    creator: old ? old.creator : `${user.firstName} ${user.lastName}`,
    modifier: `${user.firstName} ${user.lastName}`,
    modificationTimestamp: Date.now(),
    fairways: card.fairwayIds.map((id) => {
      const primary = card.primaryFairwayId?.find((pId) => pId.id === id);
      const secondary = card.secondaryFairwayId?.find((sId) => sId.id === id);
      return {
        id,
        primary: !!primary,
        primarySequenceNumber: primary?.sequenceNumber,
        secondary: !!secondary,
        secondarySequenceNumber: secondary?.sequenceNumber,
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
    visibility: mapText(card.visibility),
    mareographs: card.mareographs?.map((id) => {
      return { id };
    }),
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
      pictures?.map((p) => {
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
    temporaryNotifications:
      card.temporaryNotifications?.map((notification) => {
        return {
          content: mapText(notification.content),
          startDate: mapString(notification.startDate),
          endDate: mapString(notification.endDate),
        };
      }) ?? null,
  };
}

const s3Client = new S3Client({ region: 'eu-west-1' });

async function tagPictures(
  cardId: string,
  version: string,
  pictures: InputMaybe<PictureInput[]> | undefined,
  oldPictures: Maybe<Picture[]> | undefined
) {
  const bucketName = getNewStaticBucketName();
  const promises = [];

  for (const picture of pictures ?? []) {
    const command = new PutObjectTaggingCommand({
      Key: `${cardId}/${version}/${picture.id}`,
      Bucket: bucketName,
      Tagging: { TagSet: [{ Key: 'InUse', Value: 'true' }] },
    });
    log.debug(`setting InUse to true for ${picture.id}`);
    promises.push(s3Client.send(command));
  }
  for (const oldPicture of oldPictures ?? []) {
    if (!pictures?.find((p) => p.id === oldPicture.id)) {
      const command = new PutObjectTaggingCommand({
        Key: `${cardId}/${version}/${oldPicture.id}`,
        Bucket: bucketName,
        Tagging: { TagSet: [{ Key: 'InUse', Value: 'false' }] },
      });
      promises.push(s3Client.send(command));
      log.debug(`setting InUse to false for ${oldPicture.id}`);
    }
  }
  await Promise.all(promises);
}

async function copyPictures(
  cardId: string,
  cardVersion: string,
  sourceId: string,
  sourceVersion: string,
  pictures: PictureInput[]
): Promise<PictureInput[]> {
  const bucketName = getNewStaticBucketName();
  const promises = [];
  const newPictures: PictureInput[] = [];

  for (const picture of pictures) {
    const newPictureId = `${cardId}-${picture.groupId}-${picture.lang}`;
    const newKey = `${cardId}/${cardVersion}/${newPictureId}`;

    const command = new CopyObjectCommand({
      Key: newKey,
      Bucket: bucketName,
      CopySource: `${bucketName}/${sourceId}/${sourceVersion}/${picture.id}`,
    });
    promises.push(s3Client.send(command));
    newPictures.push({
      ...picture,
      id: newPictureId,
      modificationTimestamp: Date.now(),
    });
  }
  await Promise.all(promises);
  return newPictures;
}

async function clearCardFromFairwayCache(
  newModel: FairwayCardDBModel,
  card: FairwayCardInput,
  latestVersionNumber: FairwayCardDBModel | null | undefined,
  currentPublicCard: FairwayCardDBModel | null | undefined
) {
  try {
    // Clear fairway cache of a fairway card
    // delete when more sophisticated caching is implemented
    // needed to get updated starting and ending fairways for fairwaycard
    // if linked fairways are for example 1111, 2222, then the key for cache clearing is 'fairways:1111:2222'
    const fairways = newModel.fairways.map((f: { id: any }) => f.id);
    if (fairways) {
      const cacheKey = 'fairways:' + fairways.join(':');
      await deleteCacheObjects([cacheKey]);
    }
    await FairwayCardDBModel.save(newModel, card.operation, latestVersionNumber, currentPublicCard);
  } catch (e) {
    if (e instanceof ConditionalCheckFailedException && e.name === 'ConditionalCheckFailedException') {
      throw new Error(card.operation === Operation.Create ? OperationError.CardAlreadyExist : OperationError.CardNotExist);
    }
    throw e;
  }
}

export const handler: AppSyncResolverHandler<MutationSaveFairwayCardArgs, FairwayCard> = async (
  event: AppSyncResolverEvent<MutationSaveFairwayCardArgs>
): Promise<FairwayCard> => {
  const user = await getCurrentUser(event);
  const card = event.arguments.card;
  const pictureSourceId = event.arguments.pictureSourceId;
  const pictureSourceVersion = event.arguments.pictureSourceVersion;

  log.info(`saveFairwayCard(${card.id}/${card.version}, ${pictureSourceId}/${pictureSourceVersion}, ${user.uid})`);

  let dbModel;
  let pictures;
  let currentPublicCard = null;

  const latestVersion = await FairwayCardDBModel.getLatest(card.id);

  if (card.operation === Operation.Update) {
    dbModel = await FairwayCardDBModel.getVersion(card.id, card.version);
    await tagPictures(card.id, card.version, card.pictures, dbModel?.pictures);
  } else if (card.operation === Operation.Publish) {
    const publicVersion = await FairwayCardDBModel.getPublic(card.id).then((fairwayCard) => fairwayCard?.currentPublic);
    if (publicVersion) {
      currentPublicCard = await FairwayCardDBModel.getVersion(card.id, 'v' + publicVersion);
    }
  } else if (pictureSourceId && pictureSourceVersion && !!card.pictures?.length) {
    pictures = await copyPictures(
      card.id,
      card.operation === Operation.Createversion ? 'v' + (Number(latestVersion?.latestVersionUsed ?? latestVersion?.latest) + 1) : card.version,
      pictureSourceId,
      pictureSourceVersion,
      card.pictures
    );
  }

  const newModel = mapFairwayCardToModel(card, dbModel, user, pictures);
  log.debug('card: %o', newModel);

  clearCardFromFairwayCache(newModel, card, latestVersion, currentPublicCard);

  if (card.operation === Operation.Update) {
    const changes = dbModel ? diff(dbModel, newModel) : null;
    auditLog.info({ changes, card: newModel, user: user.uid }, 'FairwayCard updated');
  } else {
    auditLog.info({ card: newModel, user: user.uid }, 'FairwayCard added');
  }
  const pilotMap = await getPilotPlaceMap();
  const pilotRoutes = (await getPilotRoutes()) as FeatureCollection<Geometry, GeoJsonProperties>;
  return mapFairwayCardDBModelToGraphqlType(newModel, pilotMap, user, pilotRoutes);
};
