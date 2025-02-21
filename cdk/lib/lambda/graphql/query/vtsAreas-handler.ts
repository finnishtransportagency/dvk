import { Handler } from "aws-lambda";
import { getNewStaticBucketName } from "../../environment";
import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { VtsAreas } from "../../../../graphql/generated";

const s3Client = new S3Client({});
const BUCKET_NAME = getNewStaticBucketName();
const FILE_KEY = 'staticVts';

export const handler: Handler = async () => {
  try {
    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: FILE_KEY,
    });

    const response = await s3Client.send(command);
    const bodyContents = await response.Body?.transformToString();
    const vtsAreas: VtsAreas = JSON.parse(bodyContents ?? '{"vtsAreas": []}');

    return {
      areas: vtsAreas ?? [],
    };
  } catch (error) {
    console.error('Error fetching VTS areas: ', error);
    return {
      areas: [],
    }
  }
}