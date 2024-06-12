import { GetCommand, ScanCommand } from '@aws-sdk/lib-dynamodb';
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

  private static getLatestSortKey() {
    return 'v0_latest';
  }

  private static getPublicSortKey() {
    return 'v0_public';
  }

  // at the moment this gives any latest version, should be separate function for latest public
  static async get(id: string, version: string = 'v0_latest'): Promise<HarborDBModel | undefined> {
    const response = await getDynamoDBDocumentClient().send(new GetCommand({ TableName: getHarborTableName(), Key: { id: id, version: version } }));
    const harbor = response?.Item as HarborDBModel | undefined;
    log.debug('Harbor name: %s', harbor?.name?.fi);
    return harbor;
  }

  static async getVersion(id: string, version: string = 'v1'): Promise<HarborDBModel | undefined> {
    // v0 always the latest version
    const response = await getDynamoDBDocumentClient().send(new GetCommand({ TableName: getHarborTableName(), Key: { id: id, version: version } }));
    const harbor = response?.Item as HarborDBModel | undefined;
    log.debug('Harbor card name: %s', harbor?.name?.fi);
    return harbor;
  }

  static async getLatest(id: string): Promise<HarborDBModel | undefined> {
    // v0 always the public version
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
    const response = await getDynamoDBDocumentClient().send(
      new ScanCommand({
        TableName: getHarborTableName(),
        FilterExpression: '#version = :vVersion',
        ExpressionAttributeNames: { '#version': 'version' },
        ExpressionAttributeValues: { ':vVersion': this.getLatestSortKey() },
      })
    );
    const harbors = response?.Items as HarborDBModel[] | undefined;
    if (harbors) {
      log.debug('%d harbor(s) found', harbors.length);
      return harbors;
    }
    log.debug('No harbors found');
    return [];
  }

  static async getAllPublic(): Promise<HarborDBModel[]> {
    const response = await getDynamoDBDocumentClient().send(
      new ScanCommand({
        TableName: getHarborTableName(),
        FilterExpression: '#version = :vVersion AND attribute_exists(#currentPublic)',
        ExpressionAttributeNames: { '#version': 'version', '#currentPublic': 'currentPublic' },
        ExpressionAttributeValues: { ':vVersion': this.getPublicSortKey() },
      })
    );
    const harbors = response?.Items as HarborDBModel[] | undefined;
    if (harbors) {
      log.debug('%d public harbor(s) found', harbors.length);
      return harbors;
    }
    log.debug('No public harbors found');
    return [];
  }

  static async save(data: HarborDBModel, operation: Operation) {
    const putCommands = getPutCommands(data, getHarborTableName(), operation);
    await Promise.all(putCommands.map((command) => getDynamoDBDocumentClient().send(command)));
  }
}

export default HarborDBModel;
