import { AppSyncResolverEvent, AppSyncResolverHandler } from 'aws-lambda/trigger/appsync-resolver';
import { MutationUploadPictureArgs, PictureUploadInput } from '../../../../graphql/generated';
import { auditLog, log } from '../../logger';
import { getCurrentUser } from '../../api/login';
import { getNewStaticBucketName } from '../../environment';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';

const s3Client = new S3Client({ region: 'eu-west-1' });

async function savePicture(picture: PictureUploadInput) {
  const bucketName = getNewStaticBucketName();
  const key = `${picture.cardId}/${picture.cardVersion}/${picture.id}`;
  const command = new PutObjectCommand({
    Key: key,
    Bucket: bucketName,
    Body: Buffer.from(picture.base64Data, 'base64'),
    ContentType: picture.contentType,
    Tagging: 'InUse=false',
  });
  await s3Client.send(command);
  log.debug('picture %s saved to %s', key, bucketName);
}

export const handler: AppSyncResolverHandler<MutationUploadPictureArgs, boolean> = async (
  event: AppSyncResolverEvent<MutationUploadPictureArgs>
): Promise<boolean> => {
  const picture = event.arguments.picture;
  const user = await getCurrentUser(event);
  log.info(`uploadPicture(${picture.id}, ${user.uid})`);
  try {
    await savePicture(picture);
    auditLog.info({ cardId: picture.cardId, id: picture.id, version: picture.cardVersion, user: user.uid }, 'Picture uploaded');
    return true;
  } catch (e) {
    log.error('Uploading picture failed: %s', e);
    return false;
  }
};
