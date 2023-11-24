import { type CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  schema: '../cdk/graphql/schema.graphql',
  documents: './src/**/*.graphql',
  generates: {
    'src/graphql/generated.ts': {
      plugins: ['typescript', 'typescript-operations', 'typescript-react-query'],
      config: { withHooks: true, reactQueryVersion: 5 },
    },
  },
};

export default config;
