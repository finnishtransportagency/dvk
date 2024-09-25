import { GetCommand, ScanCommand, ScanCommandInput } from '@aws-sdk/lib-dynamodb';
import { GeometryPoint, Maybe, Operation, Status } from '../../../graphql/generated';
import { log } from '../logger';
import { getDynamoDBDocumentClient } from './dynamoClient';
import { Text } from './fairwayCardDBModel';
import { getHarborTableName } from '../environment';
import { getPutCommands } from '../util';

export type Quay = {
  name?: Maybe<Text>;
  length?: Maybe<number>;
  sections?: Maybe<Section[]>;
  extraInfo?: Maybe<Text>;
  geometry?: Maybe<GeometryPoint>;
};

export type Section = {
  name?: Maybe<string>;
  depth?: Maybe<number>;
  geometry?: Maybe<GeometryPoint>;
};

class HarborDBModel {
  id: string;

  version: string;

  status?: Maybe<Status>;

  n2000HeightSystem?: Maybe<boolean>;

  modifier?: Maybe<string>;

  modificationTimestamp?: Maybe<number>;

  creationTimestamp?: Maybe<number>;

  creator?: Maybe<string>;

  quays?: Maybe<Quay[]>;

  name: Text;

  company?: Maybe<Text>;

  phoneNumber?: Maybe<string[]>;

  fax?: Maybe<string>;

  email?: Maybe<string>;

  internet?: Maybe<string>;

  extraInfo?: Maybe<Text>;

  harborBasin?: Maybe<Text>;

  cargo?: Maybe<Text>;

  geometry?: Maybe<GeometryPoint>;

  expires?: Maybe<number>;

  latest?: Maybe<number>;

  private static getLatestSortKey() {
    return 'v0_latest';
  }

  private static getPublicSortKey() {
    return 'v0_public';
  }

  static async getVersion(id: string, version: string = 'v1'): Promise<HarborDBModel | undefined> {
    const response = await getDynamoDBDocumentClient().send(new GetCommand({ TableName: getHarborTableName(), Key: { id: id, version: version } }));
    const harbor = response?.Item as HarborDBModel | undefined;
    log.debug('Harbor card name: %s', harbor?.name?.fi);
    return harbor;
  }

  static async getLatest(id: string): Promise<HarborDBModel | undefined> {
    // v0 always the latest
    const response = await getDynamoDBDocumentClient().send(
      new GetCommand({ TableName: getHarborTableName(), Key: { id: id, version: this.getLatestSortKey() } })
    );
    const harbor = response?.Item as HarborDBModel | undefined;
    log.debug('Harbor card name: %s', harbor?.name?.fi);
    return harbor;
  }

  static async getPublic(id: string): Promise<HarborDBModel | undefined> {
    // v0 always the public version
    const response = await getDynamoDBDocumentClient().send(
      new GetCommand({ TableName: getHarborTableName(), Key: { id: id, version: this.getPublicSortKey() } })
    );
    const harbor = response?.Item as HarborDBModel | undefined;
    log.debug('Harbor card name: %s', harbor?.name?.fi);
    return harbor;
  }

  static async getAllLatest(): Promise<HarborDBModel[]> {
    const harbors: HarborDBModel[] | undefined = [];
    let response;

    const params: ScanCommandInput = {
      TableName: getHarborTableName(),
      FilterExpression: '#version = :vVersion',
      ExpressionAttributeNames: { '#version': 'version' },
      ExpressionAttributeValues: { ':vVersion': this.getLatestSortKey() },
    };

    do {
      response = await getDynamoDBDocumentClient().send(new ScanCommand(params));
      response.Items?.forEach((item) => harbors.push(item as HarborDBModel));
      params.ExclusiveStartKey = response.LastEvaluatedKey;
    } while (typeof response.LastEvaluatedKey !== 'undefined');

    if (harbors) {
      log.debug('%d harbor(s) found', harbors.length);
      return harbors;
    }
    log.debug('No harbors found');
    return [];
  }

  static async getAllPublic(): Promise<HarborDBModel[]> {
    const harbors: HarborDBModel[] | undefined = [];
    let response;

    const params: ScanCommandInput = {
      TableName: getHarborTableName(),
      FilterExpression: '#version = :vVersion AND attribute_exists(#currentPublic)',
      ExpressionAttributeNames: { '#version': 'version', '#currentPublic': 'currentPublic' },
      ExpressionAttributeValues: { ':vVersion': this.getPublicSortKey() },
    };

    do {
      response = await getDynamoDBDocumentClient().send(new ScanCommand(params));
      response.Items?.forEach((item) => harbors.push(item as HarborDBModel));
      params.ExclusiveStartKey = response.LastEvaluatedKey;
    } while (typeof response.LastEvaluatedKey !== 'undefined');

    if (harbors) {
      log.debug('%d public harbor(s) found', harbors.length);
      return harbors;
    }
    log.debug('No public harbors found');
    return [];
  }

  static async getVersions(): Promise<HarborDBModel[]> {
    const harbors: HarborDBModel[] | undefined = [];
    let response;

    const params: ScanCommandInput = {
      TableName: getHarborTableName(),
      FilterExpression: 'attribute_exists(#status)',
      ExpressionAttributeNames: {
        '#status': 'status',
      },
    };

    do {
      response = await getDynamoDBDocumentClient().send(new ScanCommand(params));
      response.Items?.forEach((item) => harbors.push(item as HarborDBModel));
      params.ExclusiveStartKey = response.LastEvaluatedKey;
    } while (typeof response.LastEvaluatedKey !== 'undefined');

    if (harbors) {
      log.debug('%d Harbor(s) found', harbors.length);
      return harbors;
    }
    log.debug('No harbors found');
    return [];
  }

  static async save(data: HarborDBModel, operation: Operation) {
    const latestVersionNumber = await HarborDBModel.getLatest(data.id).then((harbor) => harbor?.latest);
    //get only number out of the string
    let versionNumber = Number(data.version.slice(1));

    if (operation === Operation.Createversion) {
      versionNumber = latestVersionNumber ? latestVersionNumber + 1 : 2;
    }

    const putCommands = getPutCommands(data, getHarborTableName(), operation, versionNumber, latestVersionNumber);
    await Promise.all(putCommands.map((command) => getDynamoDBDocumentClient().send(command)));
  }
}

export default HarborDBModel;
