import { AppSyncResolverEvent } from 'aws-lambda/trigger/appsync-resolver';

export type LambdaResult = {
  data: unknown;
};

export type AppSyncEventArguments = unknown;
export async function handleEvent(event: AppSyncResolverEvent<AppSyncEventArguments>): Promise<LambdaResult> {
  return { data: {} };
}
