import { AppSyncResolverEvent, AppSyncResolverHandler } from 'aws-lambda/trigger/appsync-resolver';
import { MutationUploadPictureArgs, PictureUploadInput } from '../../../../graphql/generated';
import { auditLog, log } from '../../logger';
import { getCurrentUser } from '../../api/login';
import { getNewStaticBucketName } from '../../environment';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';

const s3Client = new S3Client({ region: 'eu-west-1' });

async function savePictures(picture: PictureUploadInput) {
  const bucketName = getNewStaticBucketName();
  const command = new PutObjectCommand({
    Key: `${picture.cardId}/${picture.id}`,
    Bucket: bucketName,
    Body: Buffer.from(picture.base64Data, 'base64'),
    Tagging: 'InUse=false',
  });
  await s3Client.send(command);
  log.debug('picture saved to %s', bucketName);
}

export const handler: AppSyncResolverHandler<MutationUploadPictureArgs, number> = async (
  event: AppSyncResolverEvent<MutationUploadPictureArgs>
): Promise<number> => {
  const user = await getCurrentUser(event);
  log.info(`uploadPicture(${event.arguments.picture.id}, ${user.uid})`);
  await savePictures(event.arguments.picture);
  auditLog.info({ cardId: event.arguments.picture.cardId, id: event.arguments.picture.id, user: user.uid }, 'Picture uploaded');
  return Date.now();
};
