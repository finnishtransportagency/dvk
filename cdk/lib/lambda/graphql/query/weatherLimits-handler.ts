import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { Handler } from 'aws-lambda';
import { getNewStaticBucketName } from '../../environment';

interface Limit {
  lowerLimit?: number;
  upperLimit?: number;
  status: 'green' | 'yellow' | 'red';
}

interface WeatherLimit {
  id: string;
  type: string;
  windLimits: Limit[];
  windGustLimits: Limit[];
  waveLimits: Limit[];
  visibilityLimits: Limit[];
}

interface WeatherLimitsData {
  limits: WeatherLimit[];
}

const s3Client = new S3Client({});
const BUCKET_NAME = process.env.WEATHER_LIMITS_BUCKET ?? getNewStaticBucketName();
const FILE_KEY = process.env.WEATHER_LIMITS_KEY ?? 'weather-limits.json';

export const handler: Handler = async () => {
  try {
    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: FILE_KEY,
    });

    const response = await s3Client.send(command);
    const bodyContents = await response.Body?.transformToString();
    const weatherLimits: WeatherLimitsData = JSON.parse(bodyContents ?? '{"limits": []}');

    return {
      limits: weatherLimits.limits,
    };
  } catch (error) {
    console.error('Error fetching weather limits:', error);
    return {
      limits: [],
    };
  }
};
