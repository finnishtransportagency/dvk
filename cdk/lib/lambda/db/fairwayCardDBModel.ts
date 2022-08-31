import { GetCommand, ScanCommand } from '@aws-sdk/lib-dynamodb';
import { log } from '../logger';
import { getDynamoDBDocumentClient } from './dynamoClient';

const fairwayCardTable = process.env.FAIRWAY_CARD_TABLE;

type Text = {
  fi: string;
  sv?: string;
  en?: string;
};

export type FairwayDBModel = {
  id: number;
  name?: string;
  geotiffImages?: string[];
};

class FairwayCardDBModel {
  id: string;

  name?: Text;

  fairways: FairwayDBModel[];

  static async get(id: string): Promise<FairwayCardDBModel | undefined> {
    const response = await getDynamoDBDocumentClient().send(new GetCommand({ TableName: fairwayCardTable, Key: { id } }));
    const fairwayCard = response.Item as FairwayCardDBModel | undefined;
    log.debug('Fairway card name: %s', fairwayCard?.name);
    return fairwayCard;
  }

  static async getAll(): Promise<FairwayCardDBModel[]> {
    const response = await getDynamoDBDocumentClient().send(new ScanCommand({ TableName: fairwayCardTable }));
    const fairways = response.Items as FairwayCardDBModel[] | undefined;
    if (fairways) {
      log.debug('%d fairway card(s) found', fairways.length);
      return fairways;
    }
    log.debug('No fairway cards found');
    return [];
  }
}

export default FairwayCardDBModel;
