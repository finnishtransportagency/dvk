import { DynamoDBStreamEvent, DynamoDBRecord, DynamoDBStreamHandler } from 'aws-lambda/trigger/dynamodb-stream';
import { AttributeValue } from '@aws-sdk/client-dynamodb';
import { unmarshall } from '@aws-sdk/util-dynamodb';
import { log } from '../logger';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';

const s3Client = new S3Client({ region: 'eu-west-1' });

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function saveToS3(data: Record<string, any>, bucket: string) {
  const command = new PutObjectCommand({
    Key: data.id + '.json',
    Bucket: bucket,
    Body: JSON.stringify(data),
    ContentType: 'application/json',
  });

  log.info(`saving ${data.id}.json to s3://${bucket}`);
  log.debug(command);

  await s3Client.send(command);
}

function getBucketForTable(arn: string | undefined) {
  if (!arn) {
    return undefined;
  } else if (arn.includes('FairwayCard')) {
    return process.env.FAIRWAYCARD_VERSIONING_BUCKET;
  } else if (arn.includes('Harbor')) {
    return process.env.HARBOR_VERSIONING_BUCKET;
  } else if (arn.includes('PilotPlace')) {
    return process.env.PILOT_VERSIONING_BUCKET;
  }
  return undefined;
}

async function handleUpdate(record: DynamoDBRecord) {
  log.info('handling event from %s', record.eventSourceARN);

  if (!record.dynamodb?.NewImage) {
    log.error('no new record to save to s3');
    return;
  }

  const bucket = getBucketForTable(record.eventSourceARN);
  if (!bucket) {
    log.error('no known table found %s', record.eventSourceARN);
    return;
  }

  const data = unmarshall(record.dynamodb.NewImage as { [key: string]: AttributeValue });

  await saveToS3(data, bucket);
}

function handleRemove(record: DynamoDBRecord) {
  log.info('remove record: %s', record.dynamodb?.Keys?.id);
  //TODO: to be decided if removing means a status change or physical removal
  //and in case of (db) removal, do we create a final s3 json with "removed"-status or what
  //and what are the effects to that files s3 lifecycle
}

const handler: DynamoDBStreamHandler = async function (event: DynamoDBStreamEvent) {
  event.Records.forEach((record) => {
    log.debug('Event source: %s', record.eventSource);
    log.debug('Event sourceARN: %s', record.eventSourceARN);
    log.debug('Event Id: %s', record.eventID);
    log.debug('Event Type: %s', record.eventName);
    log.debug('DynamoDB Record: %j', record.dynamodb);
  });

  for (const record of event.Records) {
    switch (record.eventName) {
      case 'INSERT':
      case 'MODIFY':
        await handleUpdate(record);
        break;
      case 'REMOVE':
        handleRemove(record);
    }
  }
};

export { handler };
