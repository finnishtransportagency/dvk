import { AppSyncResolverEvent, AppSyncResolverHandler } from 'aws-lambda';
import { Fairway, NavigationLine, QueryFairwayArgs } from '../../../../graphql/generated';
import { NavigationLinesService } from '../../api/navigationLinesService';
import { log } from '../../logger';

const navigationService = new NavigationLinesService();

export const handler: AppSyncResolverHandler<QueryFairwayArgs, NavigationLine[], Fairway> = async (
  event: AppSyncResolverEvent<QueryFairwayArgs>
): Promise<NavigationLine[]> => {
  log.info(`navigationLines(${event.source?.id})`);
  const lines = navigationService.getNavigationLinesByFairway(event.source?.id);
  return lines.map((apiLine) => {
    const line: NavigationLine = {
      id: apiLine.id,
      fairwayId: apiLine.jnro,
      draft: apiLine.syvyys,
      draft2: apiLine.harausSyvyys,
      length: apiLine.pituus,
      geometry: apiLine.geometry,
    };
    return line;
  });
};
