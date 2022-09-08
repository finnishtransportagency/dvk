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
  name?: string;
  statementStart?: Text;
  statementEnd?: Text;
  geotiffImages?: string[];
};

export type TrafficService = {
  pilot?: Pilot;
  vts?: VTS;
  tug?: Text;
};

export type VTS = {
  name?: Text;
  phoneNumber?: string;
  email?: string[];
  vhf?: string;
};

export type Pilot = {
  email?: string;
  phoneNumber?: string;
  fax?: string;
  internet?: string;
  geometry?: GeometryPoint;
  pilotJourney?: number;
};

export type Harbor = {
  quays?: Quay[];
  name?: Text;
  phoneNumber?: string;
  fax?: string;
  email?: string;
  internet?: string;
};

export type Quay = {
  name?: Text;
  length?: number;
  draft?: number[];
  extraInfo?: Text;
  cargo?: Text;
  geometry?: GeometryPoint;
};

class FairwayCardDBModel {
  id: string;

  name?: Text;

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

  harbor?: Harbor;

  fairways: FairwayDBModel[];

  static async get(id: string): Promise<FairwayCardDBModel | undefined> {
    const response = await getDynamoDBDocumentClient().send(new GetCommand({ TableName: fairwayCardTable, Key: { id } }));
    const fairwayCard = response.Item as FairwayCardDBModel | undefined;
    log.debug('Fairway card name: %s', fairwayCard?.name?.fi);
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
