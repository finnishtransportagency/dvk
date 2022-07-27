import { GetCommand, ScanCommand } from '@aws-sdk/lib-dynamodb';
import { log } from '../logger';
import { getDynamoDBDocumentClient } from './dynamoClient';

const fairwayTable = process.env.FAIRWAY_TABLE;

class FairwayModel {
  id: number;

  name: string;

  static async get(id: number): Promise<FairwayModel | undefined> {
    const response = await getDynamoDBDocumentClient().send(new GetCommand({ TableName: fairwayTable, Key: { id } }));
    const fairway = response.Item as FairwayModel | undefined;
    log.debug('Fairway name: %s', fairway?.name);
    return fairway;
  }

  static async getAll(): Promise<FairwayModel[]> {
    const response = await getDynamoDBDocumentClient().send(new ScanCommand({ TableName: fairwayTable }));
    const fairways = response.Items as FairwayModel[] | undefined;
    if (fairways) {
      log.debug('%d fairway(s) found', fairways.length);
      return fairways;
    }
    log.debug('No fairways found');
    return [];
  }
}

export default FairwayModel;
