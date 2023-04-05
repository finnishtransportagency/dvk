import * as path from 'path';

interface BackendLambda {
  entry: string;
  fieldName: string; // this should correlate to graphql schema field name
  typeName: string;
  useVpc?: boolean;
}

const lambdaFunctions: BackendLambda[] = [
  {
    entry: path.join(__dirname, 'query/fairwayCards-handler.ts'),
    typeName: 'Query',
    fieldName: 'fairwayCards',
    useVpc: false,
  },
  {
    entry: path.join(__dirname, 'query/fairwayCard-handler.ts'),
    typeName: 'Query',
    fieldName: 'fairwayCard',
    useVpc: false,
  },
  {
    entry: path.join(__dirname, 'query/fairwayCardFairways-handler.ts'),
    typeName: 'FairwayCard',
    fieldName: 'fairways',
    useVpc: true,
  },
  {
    entry: path.join(__dirname, 'query/fairwayCardsByFairwayId-handler.ts'),
    typeName: 'Query',
    fieldName: 'fairwayCardsByFairwayId',
    useVpc: false,
  },
  {
    entry: path.join(__dirname, 'query/fairwayCardHarbors-handler.ts'),
    typeName: 'FairwayCard',
    fieldName: 'harbors',
    useVpc: false,
  },
  {
    entry: path.join(__dirname, 'query/safetyEquipmentFaults-handler.ts'),
    typeName: 'Query',
    fieldName: 'safetyEquipmentFaults',
    useVpc: true,
  },
  {
    entry: path.join(__dirname, 'query/marineWarnings-handler.ts'),
    typeName: 'Query',
    fieldName: 'marineWarnings',
    useVpc: true,
  },
  {
    entry: path.join(__dirname, 'query/currentUser-handler.ts'),
    typeName: 'Query',
    fieldName: 'currentUser',
    useVpc: false,
  },
  {
    entry: path.join(__dirname, 'query/fairwayCardsAndHarbors-handler.ts'),
    typeName: 'Query',
    fieldName: 'fairwayCardsAndHarbors',
    useVpc: false,
  },
  {
    entry: path.join(__dirname, 'query/pilotPlaces-handler.ts'),
    typeName: 'Query',
    fieldName: 'pilotPlaces',
    useVpc: false,
  },
  {
    entry: path.join(__dirname, 'query/harbors-handler.ts'),
    typeName: 'Query',
    fieldName: 'harbors',
    useVpc: false,
  },
  {
    entry: path.join(__dirname, 'query/harbor-handler.ts'),
    typeName: 'Query',
    fieldName: 'harbor',
    useVpc: false,
  },
  {
    entry: path.join(__dirname, 'query/fairways-handler.ts'),
    typeName: 'Query',
    fieldName: 'fairways',
    useVpc: true,
  },
  {
    entry: path.join(__dirname, 'mutation/saveFairwayCard-handler.ts'),
    typeName: 'Mutation',
    fieldName: 'saveFairwayCard',
    useVpc: false,
  },
  {
    entry: path.join(__dirname, 'mutation/saveHarbor-handler.ts'),
    typeName: 'Mutation',
    fieldName: 'saveHarbor',
    useVpc: false,
  },
];

export default lambdaFunctions;
