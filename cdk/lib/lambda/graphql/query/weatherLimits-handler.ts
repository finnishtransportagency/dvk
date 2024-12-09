import { S3 } from 'aws-sdk';
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
  waveLimits: Limit[];
  visibilityLimits: Limit[];
}

interface WeatherLimitsData {
  limits: WeatherLimit[];
}

const s3 = new S3();
const BUCKET_NAME = process.env.WEATHER_LIMITS_BUCKET || getNewStaticBucketName();
const FILE_KEY = process.env.WEATHER_LIMITS_KEY || 'weather-limits.json';

export const handler: Handler = async () => {
  try {
    const response = await s3.getObject({
      Bucket: BUCKET_NAME,
      Key: FILE_KEY,
    }).promise();

    const weatherLimits: WeatherLimitsData = JSON.parse(response.Body?.toString() || '{"limits": []}');

    return {
      limits: weatherLimits.limits
    };
  } catch (error) {
    console.error('Error fetching weather limits:', error);
    return {
      limits: []
    };
  }
}
