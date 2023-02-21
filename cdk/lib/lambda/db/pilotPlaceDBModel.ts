import { GetCommand, ScanCommand } from '@aws-sdk/lib-dynamodb';
import { GeometryPoint } from '../../../graphql/generated';
import { log } from '../logger';
import { getDynamoDBDocumentClient } from './dynamoClient';

const pilotPlaceTable = process.env.PILOTPLACE_TABLE;

class PilotPlaceDBModel {
  id: number;

  name: string;

  geometry: GeometryPoint;

  static async getAll(): Promise<PilotPlaceDBModel[]> {
    const response = await getDynamoDBDocumentClient().send(new ScanCommand({ TableName: pilotPlaceTable }));
    const places = response.Items as PilotPlaceDBModel[] | undefined;
    if (places) {
      log.debug('%d pilot place(s) found', places.length);
      return places;
    }
    log.debug('No pilot places found');
    return [];
  }

  static async get(id: number): Promise<PilotPlaceDBModel | undefined> {
    const response = await getDynamoDBDocumentClient().send(new GetCommand({ TableName: pilotPlaceTable, Key: { id } }));
    const place = response.Item as PilotPlaceDBModel | undefined;
    log.debug('Pilot place name: %s', place?.name);
    return place;
  }
}

export default PilotPlaceDBModel;
