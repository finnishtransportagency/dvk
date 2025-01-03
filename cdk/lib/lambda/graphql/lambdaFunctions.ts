import * as path from 'path';

interface BackendLambda {
  entry: string;
  fieldName: string; // this should correlate to graphql schema field name
  typeName: string;
  useVpc?: boolean;
  useCaching?: boolean; // used to add per resolver caching as needed
  timeout?: number; // seconds
  memorySize?: number;
  useSqs?: boolean;
}

const lambdaFunctions: BackendLambda[] = [
  {
    entry: path.join(__dirname, 'query/fairwayCards-handler.ts'),
    typeName: 'Query',
    fieldName: 'fairwayCards',
    useVpc: true,
    useCaching: true,
    memorySize: 512,
  },
  {
    entry: path.join(__dirname, 'query/fairwayCard-handler.ts'),
    typeName: 'Query',
    fieldName: 'fairwayCard',
    useVpc: true,
  },
  {
    entry: path.join(__dirname, 'query/fairwayCardPreview-handler.ts'),
    typeName: 'Query',
    fieldName: 'fairwayCardPreview',
    useVpc: true,
  },
  {
    entry: path.join(__dirname, 'query/fairwayCardFairways-handler.ts'),
    typeName: 'FairwayCard',
    fieldName: 'fairways',
    useVpc: true,
    memorySize: 512,
  },
  {
    entry: path.join(__dirname, 'query/fairwayCardHarbors-handler.ts'),
    typeName: 'FairwayCard',
    fieldName: 'harbors',
    useVpc: false,
  },
  {
    entry: path.join(__dirname, 'query/harborPreview-handler.ts'),
    typeName: 'Query',
    fieldName: 'harborPreview',
    useVpc: true,
  },
  {
    entry: path.join(__dirname, 'query/safetyEquipmentFaults-handler.ts'),
    typeName: 'Query',
    fieldName: 'safetyEquipmentFaults',
    useVpc: true,
    memorySize: 512,
  },
  {
    entry: path.join(__dirname, 'query/marineWarnings-handler.ts'),
    typeName: 'Query',
    fieldName: 'marineWarnings',
    useVpc: true,
    memorySize: 512,
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
    memorySize: 512,
  },
  {
    entry: path.join(__dirname, 'query/pilotPlaces-handler.ts'),
    typeName: 'Query',
    fieldName: 'pilotPlaces',
    useVpc: true,
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
    memorySize: 512,
  },
  {
    entry: path.join(__dirname, 'query/mareographs-handler.ts'),
    typeName: 'Query',
    fieldName: 'mareographs',
    useVpc: true,
  },
  {
    entry: path.join(__dirname, 'mutation/saveFairwayCard-handler.ts'),
    typeName: 'Mutation',
    fieldName: 'saveFairwayCard',
    useVpc: true,
    memorySize: 512,
  },
  {
    entry: path.join(__dirname, 'mutation/saveHarbor-handler.ts'),
    typeName: 'Mutation',
    fieldName: 'saveHarbor',
    useVpc: false,
  },
  {
    entry: path.join(__dirname, 'mutation/uploadPicture-handler.ts'),
    typeName: 'Mutation',
    fieldName: 'uploadPicture',
    useVpc: false,
  },
  {
    entry: path.join(__dirname, 'mutation/saveFeedback-handler.ts'),
    typeName: 'Mutation',
    fieldName: 'saveFeedback',
    useVpc: false,
    useSqs: true,
  },
];

export default lambdaFunctions;
