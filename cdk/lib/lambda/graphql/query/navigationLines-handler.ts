import { NavigationLine } from '../../../../graphql/generated';
import { NavigationLinesService } from '../../api/navigationLinesService';
import { log } from '../../logger';

const navigationService = new NavigationLinesService();

export const handler = async (): Promise<NavigationLine[]> => {
  log.info(`navigationLines()`);
  const lines = navigationService.getNavigationLines();
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
