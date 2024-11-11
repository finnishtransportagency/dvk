import { AppSyncResolverEvent, AppSyncResolverHandler } from 'aws-lambda/trigger/appsync-resolver';
import { SQSClient, SendMessageCommand } from '@aws-sdk/client-sqs';
import { getFeedbackSQSQueueUrl } from '../../environment';
import { log } from '../../logger';

interface FeedbackInput {
  rating: number;
  feedback: string;
}

export const handler: AppSyncResolverHandler<{ feedback: FeedbackInput }, boolean> = async (
  event: AppSyncResolverEvent<{ feedback: FeedbackInput }>
) => {
  try {
    const { rating, feedback } = event.arguments.feedback;
    const queueUrl = await getFeedbackSQSQueueUrl();

    const sqs = new SQSClient({});
    const command = new SendMessageCommand({
      QueueUrl: queueUrl,
      MessageBody: JSON.stringify({ rating, feedback }),
    });

    await sqs.send(command);

    log.info('Feedback sent to SQS queue', { rating, feedback });
    return true;
  } catch (error) {
    log.error('Error sending feedback to SQS queue', { error });
    throw error;
  }
};