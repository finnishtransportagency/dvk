import { GetCommand, ScanCommand } from '@aws-sdk/lib-dynamodb';
import { GeometryPoint } from '../../../graphql/generated';
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
  geotiffImages?: string[];
};

export type TrafficService = {
  pilot?: Pilot;
  vts?: VTS;
  tugs?: Tug[];
};

export type Tug = {
  name?: Text;
  phoneNumber?: string[];
  fax?: string;
  email?: string;
};

export type VTS = {
  name?: Text;
  phoneNumber?: string;
  email?: string[];
  vhf?: number;
};

export type Pilot = {
  email?: string;
  phoneNumber?: string;
  fax?: string;
  internet?: string;
  geometry?: GeometryPoint;
  pilotJourney?: number;
  extraInfo?: Text;
};

export type Harbor = {
  quays?: Quay[];
  name?: Text;
  phoneNumber?: string;
  fax?: string;
  email?: string;
  internet?: string;
  extraInfo?: Text;
  harborBasin?: Text;
  cargo?: Text[];
};

export type Quay = {
  name?: Text;
  length?: number;
  sections?: [Section];
  extraInfo?: Text;
  geometry?: GeometryPoint;
};

export type Section = {
  name?: Text;
  draft?: number;
};

type FairwayCardByFairwayIdIndex = {
  id: string;
  fairwayIds: string;
};

class FairwayCardDBModel {
  id: string;

  name?: Text;

  modificationTimestamp?: number;

  group?: string;

  fairwayIds?: string;

  lineText?: Text;

  anchorage?: Text[];

  navigationCondition?: Text;

  iceCondition?: Text;

  attention?: Text;

  speedLimit?: Text[];

  visibility?: Text;

  windGauge?: Text;

  vesselRecommendation?: Text;

  seaLevel?: Text;

  windRecommendation?: Text;

  trafficService?: TrafficService;

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
}

export default FairwayCardDBModel;
