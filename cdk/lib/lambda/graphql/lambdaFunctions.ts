import * as path from 'path';

interface BackendLambda {
  entry: string;
  fieldName: string; // this should correlate to graphql schema field name
  typeName: string;
}

const lambdaFunctions: BackendLambda[] = [
  {
    entry: path.join(__dirname, 'query/fairwayCards-handler.ts'),
    typeName: 'Query',
    fieldName: 'fairwayCards',
  },
  {
    entry: path.join(__dirname, 'query/fairwayCard-handler.ts'),
    typeName: 'Query',
    fieldName: 'fairwayCard',
  },
  {
    entry: path.join(__dirname, 'query/fairwayCardFairways-handler.ts'),
    typeName: 'FairwayCard',
    fieldName: 'fairways',
  },
  {
    entry: path.join(__dirname, 'query/fairwayCardsByFairwayId-handler.ts'),
    typeName: 'Query',
    fieldName: 'fairwayCardsByFairwayId',
  },
  {
    entry: path.join(__dirname, 'query/fairwayCardHarbors-handler.ts'),
    typeName: 'FairwayCard',
    fieldName: 'harbors',
  },
  {
    entry: path.join(__dirname, 'query/safetyEquipmentFaults-handler.ts'),
    typeName: 'Query',
    fieldName: 'safetyEquipmentFaults',
  },
  {
    entry: path.join(__dirname, 'query/marineWarnings-handler.ts'),
    typeName: 'Query',
    fieldName: 'marineWarnings',
  },
  {
    entry: path.join(__dirname, 'query/currentUser-handler.ts'),
    typeName: 'Query',
    fieldName: 'currentUser',
  },
  {
    entry: path.join(__dirname, 'query/fairwayCardsAndHarbors-handler.ts'),
    typeName: 'Query',
    fieldName: 'fairwayCardsAndHarbors',
  },
  {
    entry: path.join(__dirname, 'query/pilotPlaces-handler.ts'),
    typeName: 'Query',
    fieldName: 'pilotPlaces',
  },
  {
    entry: path.join(__dirname, 'query/harbors-handler.ts'),
    typeName: 'Query',
    fieldName: 'harbors',
  },
  {
    entry: path.join(__dirname, 'query/harbor-handler.ts'),
    typeName: 'Query',
    fieldName: 'harbor',
  },
  {
    entry: path.join(__dirname, 'query/fairways-handler.ts'),
    typeName: 'Query',
    fieldName: 'fairways',
  },
  {
    entry: path.join(__dirname, 'mutation/saveFairwayCard-handler.ts'),
    typeName: 'Mutation',
    fieldName: 'saveFairwayCard',
  },
  {
    entry: path.join(__dirname, 'mutation/saveHarbor-handler.ts'),
    typeName: 'Mutation',
    fieldName: 'saveHarbor',
  },
];

export default lambdaFunctions;
