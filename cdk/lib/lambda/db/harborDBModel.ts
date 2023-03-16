import { GetCommand, PutCommand, ScanCommand } from '@aws-sdk/lib-dynamodb';
import { GeometryPoint, Status } from '../../../graphql/generated';
import { log } from '../logger';
import { getDynamoDBDocumentClient } from './dynamoClient';
import { Text } from './fairwayCardDBModel';

const harborTable = process.env.HARBOR_TABLE;

export type Quay = {
  name?: Text;
  length?: number;
  sections?: Section[];
  extraInfo?: Text;
  geometry?: GeometryPoint;
};

export type Section = {
  name?: string;
  depth?: number;
  geometry?: GeometryPoint;
};

class HarborDBModel {
  id: string;

  status?: Status;

  n2000HeightSystem?: boolean;

  modifier?: string;

  modificationTimestamp?: number;

  creationTimestamp?: number;

  creator?: string;

  quays?: Quay[];

  name: Text;

  company?: Text;

  phoneNumber?: string[];

  fax?: string;

  email?: string;

  internet?: string;

  extraInfo?: Text;

  harborBasin?: Text;

  cargo?: Text;

  geometry?: GeometryPoint;

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

  static async save(data: HarborDBModel) {
    await getDynamoDBDocumentClient().send(new PutCommand({ TableName: harborTable, Item: data }));
  }
}

export default HarborDBModel;
