// import DynamoDB from 'aws-sdk/clients/dynamodb';
import { DynamoDBStreamEvent } from 'aws-lambda/trigger/dynamodb-stream';
// import { log } from '../logger';
// import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
// import { getEnvironment } from '../environment';
// import { FairwayCard } from '../../../graphql/generated';

// const s3Client = new S3Client({ region: 'eu-west-1' });

// async function saveToS3(fairwaycard: FairwayCard) {
//   log.info('Function not implemented.');

//   const command = new PutObjectCommand({
//     Key: fairwaycard.id + '.json',
//     Bucket: `fairwaycard-versioning-${getEnvironment()}`,
//     Body: fairwaycard,
//     ContentType: 'application/json',
//   });

//   await s3Client.send(command);
// }

// async function handleUpdate(record: DynamoDBRecord) {
//   if (!record.dynamodb?.NewImage) {
//     log.info('no record to save to s3');
//     return;
//   }

//   const fairwaycard = DynamoDB.Converter.unmarshall(record.dynamodb.NewImage) as FairwayCard;
//   console.log('output FairwayCard: ', fairwaycard);

//   await saveToS3(fairwaycard);
// }

// function handleRemove(record: DynamoDBRecord) {
//   console.log('remove record:', record);
// }

const handler = function (event: DynamoDBStreamEvent) {
  event.Records.forEach((record) => {
    console.log('Event Id: %s', record.eventID);
    console.log('Event Id: %s', record.eventName);
    console.log('DynamoDB Record: %j', record.dynamodb);
  });

  // for (const record of (event as DynamoDBStreamEvent).Records) {
  //   switch (record.eventName) {
  //     case 'INSERT':
  //     case 'MODIFY':
  //       handleUpdate(record);
  //       break;
  //     case 'REMOVE':
  //       handleRemove(record);
  //   }
  // }
};

export { handler };
