import { GetCommand, PutCommand, ScanCommand } from '@aws-sdk/lib-dynamodb';
import { Maybe, Status, Operation, Orientation } from '../../../graphql/generated';
import { log } from '../logger';
import { getDynamoDBDocumentClient } from './dynamoClient';
import { getFairwayCardTableName } from '../environment';

export type Text = {
  fi?: Maybe<string>;
  sv?: Maybe<string>;
  en?: Maybe<string>;
};

export type FairwayDBModel = {
  id: number;
  primary?: Maybe<boolean>;
  secondary?: Maybe<boolean>;
};

export type TrafficServiceDBModel = {
  pilot?: Maybe<Pilot>;
  vts?: Maybe<VTS[]>;
  tugs?: Maybe<Tug[]>;
};

export type Tug = {
  name?: Maybe<Text>;
  phoneNumber?: Maybe<string[]>;
  fax?: Maybe<string>;
  email?: Maybe<string>;
};

export type VHF = {
  name?: Maybe<Text>;
  channel?: Maybe<number>;
};

export type VTS = {
  name?: Maybe<Text>;
  phoneNumber?: Maybe<string>;
  email?: Maybe<string[]>;
  vhf?: Maybe<VHF[]>;
};

export type Pilot = {
  email?: Maybe<string>;
  phoneNumber?: Maybe<string>;
  fax?: Maybe<string>;
  internet?: Maybe<string>;
  extraInfo?: Maybe<Text>;
  places?: Maybe<PilotPlace[]>;
};

export type PilotPlace = {
  id: number;
  pilotJourney?: Maybe<number>;
};

export type FairwayCardIdName = {
  id: string;
  name?: Maybe<Text>;
};

export type Harbor = {
  id: string;
};

export type Picture = {
  id: string;
  sequenceNumber?: Maybe<number>;
  orientation: Orientation;
  rotation?: Maybe<number>;
  scaleWidth?: Maybe<string>;
  scaleLabel?: Maybe<string>;
  text?: Maybe<string>;
  lang?: Maybe<string>;
  groupId?: Maybe<number>;
  modificationTimestamp?: Maybe<number>;
  legendPosition?: Maybe<string>;
};

export type PilotRoute = {
  id: number;
};

export type TemporaryNotification = {
  content?: Maybe<Text>;
  startDate?: Maybe<string>;
  endDate?: Maybe<string>;
};

class FairwayCardDBModel {
  id: string;

  name: Text;

  status: Status;

  n2000HeightSystem?: Maybe<boolean>;

  modifier?: Maybe<string>;

  modificationTimestamp?: Maybe<number>;

  creationTimestamp?: Maybe<number>;

  creator?: Maybe<string>;

  group?: Maybe<string>;

  fairwayIds?: Maybe<string>;

  additionalInfo?: Maybe<Text>;

  lineText?: Maybe<Text>;

  designSpeed?: Maybe<Text>;

  generalInfo?: Maybe<Text>;

  anchorage?: Maybe<Text>;

  navigationCondition?: Maybe<Text>;

  iceCondition?: Maybe<Text>;

  attention?: Maybe<Text>;

  speedLimit?: Maybe<Text>;

  visibility?: Maybe<Text>;

  windGauge?: Maybe<Text>;

  vesselRecommendation?: Maybe<Text>;

  seaLevel?: Maybe<Text>;

  windRecommendation?: Maybe<Text>;

  trafficService?: Maybe<TrafficServiceDBModel>;

  harbors?: Maybe<Harbor[]>;

  fairways: FairwayDBModel[];

  expires?: Maybe<number>;

  pictures?: Maybe<Picture[]>;

  pilotRoutes?: Maybe<PilotRoute[]>;

  temporaryNotifications?: Maybe<TemporaryNotification[]>;

  static async get(id: string): Promise<FairwayCardDBModel | undefined> {
    const response = await getDynamoDBDocumentClient().send(new GetCommand({ TableName: getFairwayCardTableName(), Key: { id } }));
    const fairwayCard = response.Item as FairwayCardDBModel | undefined;
    log.debug('Fairway card name: %s', fairwayCard?.name?.fi);
    return fairwayCard;
  }

  static async getAll(): Promise<FairwayCardDBModel[]> {
    const response = await getDynamoDBDocumentClient().send(new ScanCommand({ TableName: getFairwayCardTableName() }));
    const fairwayCards = response.Items as FairwayCardDBModel[] | undefined;
    if (fairwayCards) {
      log.debug('%d fairway card(s) found', fairwayCards.length);
      return fairwayCards;
    }
    log.debug('No fairway cards found');
    return [];
  }

  static async getAllPublic(): Promise<FairwayCardDBModel[]> {
    const response = await getDynamoDBDocumentClient().send(
      new ScanCommand({
        TableName: getFairwayCardTableName(),
        FilterExpression: '#status = :vStatus',
        ExpressionAttributeNames: { '#status': 'status' },
        ExpressionAttributeValues: { ':vStatus': Status.Public },
      })
    );
    const fairwayCards = response.Items as FairwayCardDBModel[] | undefined;
    if (fairwayCards) {
      log.debug('%d public fairway card(s) found', fairwayCards.length);
      return fairwayCards;
    }
    log.debug('No public fairway cards found');
    return [];
  }

  static async save(data: FairwayCardDBModel, operation: Operation) {
    const expr = operation === Operation.Create ? 'attribute_not_exists(id)' : 'attribute_exists(id)';
    await getDynamoDBDocumentClient().send(new PutCommand({ TableName: getFairwayCardTableName(), Item: data, ConditionExpression: expr }));
  }
}

export default FairwayCardDBModel;
