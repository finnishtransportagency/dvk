import { GetCommand, ScanCommand, ScanCommandInput } from '@aws-sdk/lib-dynamodb';
import { Maybe, Status, Operation, Orientation, Mareograph } from '../../../graphql/generated';
import { log } from '../logger';
import { getDynamoDBDocumentClient } from './dynamoClient';
import { getFairwayCardTableName } from '../environment';
import { getPutCommands } from '../util';

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

  version: string;

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

  vesselRecommendation?: Maybe<Text>;

  mareographs?: Maybe<Mareograph[]>;

  windRecommendation?: Maybe<Text>;

  trafficService?: Maybe<TrafficServiceDBModel>;

  harbors?: Maybe<Harbor[]>;

  fairways: FairwayDBModel[];

  expires?: Maybe<number>;

  pictures?: Maybe<Picture[]>;

  pilotRoutes?: Maybe<PilotRoute[]>;

  temporaryNotifications?: Maybe<TemporaryNotification[]>;

  private static getLatestSortKey() {
    return 'v0_latest';
  }

  private static getPublicSortKey() {
    return 'v0_public';
  }

  // this can be deleted when structure changed to use getVersion, getLatest and getPublic
  static async get(id: string, version: string = 'v0_latest'): Promise<FairwayCardDBModel | undefined> {
    const response = await getDynamoDBDocumentClient().send(
      new GetCommand({ TableName: getFairwayCardTableName(), Key: { id: id, version: version } })
    );
    const fairwayCard = response?.Item as FairwayCardDBModel | undefined;
    log.debug('Fairway card name: %s', fairwayCard?.name?.fi);
    return fairwayCard;
  }

  static async getVersion(id: string, version: string = 'v1'): Promise<FairwayCardDBModel | undefined> {
    const response = await getDynamoDBDocumentClient().send(
      new GetCommand({ TableName: getFairwayCardTableName(), Key: { id: id, version: version } })
    );
    const fairwayCard = response?.Item as FairwayCardDBModel | undefined;
    log.debug('Fairway card name: %s', fairwayCard?.name?.fi);
    return fairwayCard;
  }

  static async getLatest(id: string): Promise<FairwayCardDBModel | undefined> {
    // v0 always the latest
    const response = await getDynamoDBDocumentClient().send(
      new GetCommand({ TableName: getFairwayCardTableName(), Key: { id: id, version: this.getLatestSortKey() } })
    );
    const fairwayCard = response?.Item as FairwayCardDBModel | undefined;
    log.debug('Fairway card name: %s', fairwayCard?.name?.fi);
    return fairwayCard;
  }

  static async getPublic(id: string): Promise<FairwayCardDBModel | undefined> {
    // v0 always the public version
    const response = await getDynamoDBDocumentClient().send(
      new GetCommand({ TableName: getFairwayCardTableName(), Key: { id: id, version: this.getPublicSortKey() } })
    );
    const fairwayCard = response?.Item as FairwayCardDBModel | undefined;
    log.debug('Fairway card name: %s', fairwayCard?.name?.fi);
    return fairwayCard;
  }

  static async getAllLatest(): Promise<FairwayCardDBModel[]> {
    const fairwayCards: FairwayCardDBModel[] | undefined = [];
    let response;

    const params: ScanCommandInput = {
      TableName: getFairwayCardTableName(),
      FilterExpression: '#version = :vVersion',
      ExpressionAttributeNames: { '#version': 'version' },
      ExpressionAttributeValues: { ':vVersion': this.getLatestSortKey() },
    };

    do {
      response = await getDynamoDBDocumentClient().send(new ScanCommand(params));
      response.Items?.forEach((item) => fairwayCards.push(item as FairwayCardDBModel));
      params.ExclusiveStartKey = response.LastEvaluatedKey;
    } while (typeof response.LastEvaluatedKey !== 'undefined');

    if (fairwayCards) {
      log.debug('%d fairway card(s) found', fairwayCards.length);
      return fairwayCards;
    }
    log.debug('No fairway cards found');
    return [];
  }

  static async getAllPublic(): Promise<FairwayCardDBModel[]> {
    const fairwayCards: FairwayCardDBModel[] | undefined = [];
    let response;

    const params: ScanCommandInput = {
      TableName: getFairwayCardTableName(),
      FilterExpression: '#version = :vVersion AND attribute_exists(#currentPublic)',
      ExpressionAttributeNames: { '#version': 'version', '#currentPublic': 'currentPublic' },
      ExpressionAttributeValues: { ':vVersion': this.getPublicSortKey() },
    };

    do {
      response = await getDynamoDBDocumentClient().send(new ScanCommand(params));
      response.Items?.forEach((item) => fairwayCards.push(item as FairwayCardDBModel));
      params.ExclusiveStartKey = response.LastEvaluatedKey;
    } while (typeof response.LastEvaluatedKey !== 'undefined');

    if (fairwayCards) {
      log.debug('%d Public fairway card(s) found', fairwayCards.length);
      return fairwayCards;
    }
    log.debug('No public fairway cards found');
    return [];
  }

  static async save(data: FairwayCardDBModel, operation: Operation) {
    const putCommands = getPutCommands(data, getFairwayCardTableName(), operation);
    await Promise.all(putCommands.map((command) => getDynamoDBDocumentClient().send(command)));
  }
}

export default FairwayCardDBModel;
