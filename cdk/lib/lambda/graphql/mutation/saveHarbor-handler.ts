import { AppSyncResolverEvent, AppSyncResolverHandler } from 'aws-lambda/trigger/appsync-resolver';
import { Harbor, HarborInput, MutationSaveHarborArgs, Operation, OperationError, Status } from '../../../../graphql/generated';
import { auditLog, log } from '../../logger';
import HarborDBModel from '../../db/harborDBModel';
import { CurrentUser, getCurrentUser } from '../../api/login';
import { mapHarborDBModelToGraphqlType, mapMandatoryText, mapNumber, mapString, mapStringArray, mapText } from '../../db/modelMapper';
import { diff } from 'deep-object-diff';
import { ConditionalCheckFailedException } from '@aws-sdk/client-dynamodb';
import { getExpires } from '../../environment';

export function mapHarborToModel(harbor: HarborInput, old: HarborDBModel | undefined, user: CurrentUser): HarborDBModel {
  return {
    id: harbor.id,
    name: mapMandatoryText(harbor.name),
    n2000HeightSystem: !!harbor.n2000HeightSystem,
    status: harbor.status,
    company: mapText(harbor.company),
    creator: old ? old.creator : `${user.firstName} ${user.lastName}`,
    creationTimestamp: old ? old.creationTimestamp : Date.now(),
    modifier: `${user.firstName} ${user.lastName}`,
    modificationTimestamp: Date.now(),
    email: mapString(harbor.email),
    extraInfo: mapText(harbor.extraInfo),
    fax: mapString(harbor.fax),
    harborBasin: mapText(harbor.harborBasin),
    internet: mapString(harbor.internet),
    phoneNumber: mapStringArray(harbor.phoneNumber),
    geometry: harbor.geometry ? { type: 'Point', coordinates: [harbor.geometry.lat, harbor.geometry.lon] } : null,
    cargo: mapText(harbor.cargo),
    quays:
      harbor.quays?.map((q) => {
        return {
          extraInfo: mapText(q?.extraInfo),
          length: mapNumber(q?.length),
          name: mapText(q?.name),
          geometry: q?.geometry ? { type: 'Point', coordinates: [q.geometry.lat, q.geometry.lon] } : null,
          sections:
            q?.sections?.map((s) => {
              return {
                depth: mapNumber(s?.depth),
                name: mapString(s?.name),
                geometry: s?.geometry ? { type: 'Point', coordinates: [s.geometry.lat, s.geometry.lon] } : null,
              };
            }) || null,
        };
      }) || null,
    expires: harbor.status === Status.Removed ? getExpires() : null,
  };
}

export const handler: AppSyncResolverHandler<MutationSaveHarborArgs, Harbor> = async (
  event: AppSyncResolverEvent<MutationSaveHarborArgs>
): Promise<Harbor> => {
  const user = await getCurrentUser(event);
  log.info(`saveHarbor(${event.arguments.harbor?.id}, ${user.uid})`);
  if (event.arguments.harbor?.id) {
    const dbModel = await HarborDBModel.get(event.arguments.harbor.id);
    const newModel = mapHarborToModel(event.arguments.harbor, dbModel, user);
    log.debug('harbor: %o', newModel);
    try {
      await HarborDBModel.save(newModel, event.arguments.harbor.operation);
    } catch (e) {
      if (e instanceof ConditionalCheckFailedException && e.name === 'ConditionalCheckFailedException') {
        throw new Error(event.arguments.harbor.operation === Operation.Create ? OperationError.HarborAlreadyExist : OperationError.HarborNotExist);
      }
      throw e;
    }
    if (event.arguments.harbor.operation === Operation.Update) {
      const changes = dbModel ? diff(dbModel, newModel) : null;
      auditLog.info({ changes, harbor: newModel, user: user.uid }, 'Harbor updated');
    } else {
      auditLog.info({ harbor: newModel, user: user.uid }, 'Harbor added');
    }
    return mapHarborDBModelToGraphqlType(newModel, user);
  }
  log.warn({ input: event.arguments.harbor }, 'Harbor id missing');
  throw new Error(OperationError.HarborIdMissing);
};
