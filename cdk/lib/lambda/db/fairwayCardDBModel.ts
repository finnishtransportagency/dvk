import { GetCommand, ScanCommand } from '@aws-sdk/lib-dynamodb';
import { Geometry } from '../../../graphql/generated';
import { log } from '../logger';
import { getDynamoDBDocumentClient } from './dynamoClient';

const fairwayCardTable = process.env.FAIRWAY_CARD_TABLE;

export type Text = {
  fi: string;
  sv?: string;
  en?: string;
};

export type FairwayDBModel = {
  id: number;
  name?: string;
  geotiffImages?: string[];
};

export type TrafficService = {
  pilot?: Pilot;
  vts?: VTS;
  tug?: string;
};

export type VTS = {
  name?: Text;
  phoneNumber?: string;
  email?: string[];
  vhf?: string;
};

export type Pilot = {
  email?: string;
  telephoneNumber?: string;
  fax?: string;
  internet?: string;
  pilotPlace?: Geometry;
  pilotPlaceText?: string;
  pilotJourney?: string;
};

export type Harbor = {
  wharf?: Wharf[];
  name?: Text;
  phoneNumber?: string;
  fax?: string;
  email?: string;
  internet?: string;
};

export type Wharf = {
  name?: Text;
  freeText?: Text;
  cargo?: Text;
  geometry?: Geometry;
};

class FairwayCardDBModel {
  id: string;

  name?: Text;

  lineText?: Text;

  anchorage?: Text[];

  navigationCondition?: Text;

  iceCondition?: Text;

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
