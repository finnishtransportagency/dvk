import { GetCommand, PutCommand, ScanCommand } from '@aws-sdk/lib-dynamodb';
import { Status } from '../../../graphql/generated';
import { log } from '../logger';
import { getDynamoDBDocumentClient } from './dynamoClient';

const fairwayCardTable = process.env.FAIRWAY_CARD_TABLE;

export type Text = {
  fi?: string;
  sv?: string;
  en?: string;
};

export type FairwayDBModel = {
  id: number;
  primary?: boolean;
  secondary?: boolean;
};

export type TrafficServiceDBModel = {
  pilot?: Pilot;
  vts?: VTS[];
  tugs?: Tug[];
};

export type Tug = {
  name?: Text;
  phoneNumber?: string[];
  fax?: string;
  email?: string;
};

export type VHF = {
  name?: Text;
  channel?: number;
};

export type VTS = {
  name?: Text;
  phoneNumber?: string;
  email?: string[];
  vhf?: VHF[];
};

export type Pilot = {
  email?: string;
  phoneNumber?: string;
  fax?: string;
  internet?: string;
  extraInfo?: Text;
  places?: PilotPlace[];
};

export type PilotPlace = {
  id: number;
  pilotJourney?: number;
};

export type FairwayCardIdName = {
  id: string;
  name?: Text;
};

export type Harbor = {
  id: string;
};

type FairwayCardByFairwayIdIndex = {
  id: string;
  fairwayIds: string;
};

class FairwayCardDBModel {
  id: string;

  name: Text;

  status: Status;

  n2000HeightSystem?: boolean;

  modifier?: string;

  modificationTimestamp?: number;

  creationTimestamp?: number;

  creator?: string;

  group?: string;

  fairwayIds?: string;

  lineText?: Text;

  designSpeed?: Text;

  generalInfo?: Text;

  anchorage?: Text;

  navigationCondition?: Text;

  iceCondition?: Text;

  attention?: Text;

  speedLimit?: Text;

  visibility?: Text;

  windGauge?: Text;

  vesselRecommendation?: Text;

  seaLevel?: Text;

  windRecommendation?: Text;

  trafficService?: TrafficServiceDBModel;

  harbors?: Harbor[];

  fairways: FairwayDBModel[];

  static async get(id: string): Promise<FairwayCardDBModel | undefined> {
    const response = await getDynamoDBDocumentClient().send(new GetCommand({ TableName: fairwayCardTable, Key: { id } }));
    const fairwayCard = response.Item as FairwayCardDBModel | undefined;
    log.debug('Fairway card name: %s', fairwayCard?.name?.fi);
    return fairwayCard;
  }

  static async getAll(): Promise<FairwayCardDBModel[]> {
    const response = await getDynamoDBDocumentClient().send(new ScanCommand({ TableName: fairwayCardTable }));
    const fairwayCards = response.Items as FairwayCardDBModel[] | undefined;
    if (fairwayCards) {
      log.debug('%d fairway card(s) found', fairwayCards.length);
      return fairwayCards;
    }
    log.debug('No fairway cards found');
    return [];
  }

  static async findByFairwayId(id: number): Promise<FairwayCardDBModel[]> {
    const response = await getDynamoDBDocumentClient().send(
      new ScanCommand({
        TableName: fairwayCardTable,
        IndexName: 'FairwayCardByFairwayIdIndex',
        FilterExpression: 'contains (fairwayIds, :vId)',
        ExpressionAttributeValues: { ':vId': `#${id}#` },
      })
    );
    const items = response.Items as FairwayCardByFairwayIdIndex[] | [];
    log.debug('%d fairway card(s) found', items.length);
    const fairwayCards: FairwayCardDBModel[] = [];
    for (const entry of items) {
      const card = await FairwayCardDBModel.get(entry.id);
      if (card) {
        fairwayCards.push(card);
      }
    }
    return fairwayCards;
  }

  static async save(data: FairwayCardDBModel) {
    await getDynamoDBDocumentClient().send(new PutCommand({ TableName: fairwayCardTable, Item: data }));
  }
}

export default FairwayCardDBModel;
