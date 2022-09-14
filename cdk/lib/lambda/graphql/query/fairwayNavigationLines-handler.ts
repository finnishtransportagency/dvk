import { AppSyncResolverEvent, AppSyncResolverHandler } from 'aws-lambda';
import { Fairway, NavigationLine, QueryFairwayCardArgs } from '../../../../graphql/generated';
import { NavigationLinesService } from '../../api/navigationLinesService';
import { log } from '../../logger';

const navigationService = new NavigationLinesService();

export const handler: AppSyncResolverHandler<QueryFairwayCardArgs, NavigationLine[], Fairway> = async (
  event: AppSyncResolverEvent<QueryFairwayCardArgs, Fairway>
): Promise<NavigationLine[]> => {
  log.info(`navigationLines(${event.source.id})`);
  const lines = navigationService.getNavigationLinesByFairway(event.source.id);
  return lines.map((apiLine) => {
    const line: NavigationLine = {
      id: apiLine.id,
      fairwayId: apiLine.jnro,
      depth: apiLine.syvyys,
      draft: apiLine.harausSyvyys,
      length: apiLine.pituus,
      geometry: apiLine.geometry,
    };
    return line;
  });
};
