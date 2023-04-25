import { AppSyncResolverEvent, AppSyncResolverHandler } from 'aws-lambda/trigger/appsync-resolver';
import { Harbor, HarborInput, MutationSaveHarborArgs, Operation, OperationError, Status } from '../../../../graphql/generated';
import { auditLog, log } from '../../logger';
import HarborDBModel from '../../db/harborDBModel';
import { CurrentUser, getCurrentUser } from '../../api/login';
import {
  mapEmail,
  mapGeometry,
  mapHarborDBModelToGraphqlType,
  mapQuayDepth,
  mapQuayLength,
  mapId,
  mapInternetAddress,
  mapMandatoryText,
  mapPhoneNumber,
  mapPhoneNumbers,
  mapString,
  mapText,
} from '../../db/modelMapper';
import { diff } from 'deep-object-diff';
import { ConditionalCheckFailedException } from '@aws-sdk/client-dynamodb';
import { getExpires } from '../../environment';

export function mapHarborToModel(harbor: HarborInput, old: HarborDBModel | undefined, user: CurrentUser): HarborDBModel {
  return {
    id: mapId(harbor.id),
    name: mapMandatoryText(harbor.name),
    n2000HeightSystem: !!harbor.n2000HeightSystem,
    status: harbor.status,
    company: mapText(harbor.company),
    creator: old ? old.creator : `${user.firstName} ${user.lastName}`,
    creationTimestamp: old ? old.creationTimestamp : Date.now(),
    modifier: `${user.firstName} ${user.lastName}`,
    modificationTimestamp: Date.now(),
    email: mapEmail(harbor.email),
    extraInfo: mapText(harbor.extraInfo),
    fax: mapPhoneNumber(harbor.fax),
    harborBasin: mapText(harbor.harborBasin),
    internet: mapInternetAddress(harbor.internet),
    phoneNumber: mapPhoneNumbers(harbor.phoneNumber),
    geometry: mapGeometry(harbor.geometry),
    cargo: mapText(harbor.cargo),
    quays:
      harbor.quays?.map((q) => {
        return {
          extraInfo: mapText(q?.extraInfo),
          length: mapQuayLength(q?.length),
          name: mapText(q?.name),
          geometry: mapGeometry(q?.geometry),
          sections:
            q?.sections?.map((s) => {
              return {
                depth: mapQuayDepth(s?.depth),
                name: mapString(s?.name, 200),
                geometry: mapGeometry(s?.geometry),
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
