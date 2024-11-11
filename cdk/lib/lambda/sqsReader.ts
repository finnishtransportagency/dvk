import { SQSEvent, SQSHandler } from 'aws-lambda';

export const handler: SQSHandler = async (event: SQSEvent) => {
  for (const record of event.Records) {
    console.log('Message Body: ', record.body);
    
    try {
      // Process the message here
      console.log('Message processed successfully');
    } catch (error) {
      console.error('Error processing message:', error);
      throw error; // Throwing error will cause Lambda to return the message to the queue
    }
  }
};
