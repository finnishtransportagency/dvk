import { GetCommand, PutCommand, ScanCommand } from '@aws-sdk/lib-dynamodb';
import { GeometryPoint, Maybe, Operation, Status } from '../../../graphql/generated';
import { log } from '../logger';
import { getDynamoDBDocumentClient } from './dynamoClient';
import { Text } from './fairwayCardDBModel';

const harborTable = process.env.HARBOR_TABLE;

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

  static async get(id: string): Promise<HarborDBModel | undefined> {
    const response = await getDynamoDBDocumentClient().send(new GetCommand({ TableName: harborTable, Key: { id } }));
    const harbor = response.Item as HarborDBModel | undefined;
    log.debug('Harbor name: %s', harbor?.name?.fi);
    return harbor;
  }

  static async getAll(): Promise<HarborDBModel[]> {
    const response = await getDynamoDBDocumentClient().send(new ScanCommand({ TableName: harborTable }));
    const harbors = response.Items as HarborDBModel[] | undefined;
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
        TableName: harborTable,
        FilterExpression: '#status = :vStatus',
        ExpressionAttributeNames: { '#status': 'status' },
        ExpressionAttributeValues: { ':vStatus': Status.Public },
      })
    );
    const harbors = response.Items as HarborDBModel[] | undefined;
    if (harbors) {
      log.debug('%d public harbor(s) found', harbors.length);
      return harbors;
    }
    log.debug('No public harbors found');
    return [];
  }

  static async save(data: HarborDBModel, operation: Operation) {
    const expr = operation === Operation.Create ? 'attribute_not_exists(id)' : 'attribute_exists(id)';
    await getDynamoDBDocumentClient().send(new PutCommand({ TableName: harborTable, Item: data, ConditionExpression: expr }));
  }
}

export default HarborDBModel;
