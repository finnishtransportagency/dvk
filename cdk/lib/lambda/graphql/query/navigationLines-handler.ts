import { NavigationLine } from '../../../../graphql/generated';
import { log } from '../../logger';

export const handler = async (): Promise<NavigationLine[]> => {
  log.info(`navigationLines()`);
  return [];
};
