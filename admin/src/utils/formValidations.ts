import { diff } from 'deep-object-diff';
import { FairwayCardInput, GeometryInput, HarborInput, TextInput, Text } from '../graphql/generated';
import { PictureGroup, ValidationType } from './constants';
import { dateError, endDateError } from './common';

function requiredError(input?: TextInput | Text | null): boolean {
  return !input?.fi?.trim() || !input?.sv?.trim() || !input?.en?.trim();
}

export function translationError(input?: TextInput | Text | null): boolean {
  return (!!input?.fi?.trim() || !!input?.sv?.trim() || !!input?.en?.trim()) && requiredError(input);
}

function geometryError(input?: GeometryInput | null): boolean {
  return (!!input?.lat.trim() || !!input?.lon.trim()) && (!input?.lat.trim() || !input.lon.trim());
}

function validateVtsAndTug(state: FairwayCardInput, requiredMsg: string) {
  const vtsNameErrors =
    state.trafficService?.vts
      ?.flatMap((vts, i) => (requiredError(vts?.name) ? i : null))
      .filter((val) => Number.isInteger(val))
      .map((vIndex) => {
        return {
          id: 'vtsName-' + vIndex,
          msg: requiredMsg,
        };
      }) ?? [];

  const vhfNameErrors =
    state.trafficService?.vts
      ?.map((vts) => vts?.vhf?.flatMap((vhf, j) => (translationError(vhf?.name) ? j : null)).filter((val) => Number.isInteger(val)))
      .flatMap((vhfIndices, vtsIndex) => {
        return (
          vhfIndices?.map((vhfIndex) => {
            return {
              id: 'vhfName-' + vtsIndex + '-' + vhfIndex,
              msg: requiredMsg,
            };
          }) ?? []
        );
      }) ?? [];

  const vhfChannelErrors =
    state.trafficService?.vts
      ?.map((vts) => vts?.vhf?.flatMap((vhf, j) => (!vhf?.channel.trim() ? j : null)).filter((val) => Number.isInteger(val)))
      .flatMap((vhfIndices, vtsIndex) => {
        return (
          vhfIndices?.map((vhfIndex) => {
            return {
              id: 'vhfChannel-' + vtsIndex + '-' + vhfIndex,
              msg: requiredMsg,
            };
          }) ?? []
        );
      }) ?? [];

  const tugNameErrors =
    state.trafficService?.tugs
      ?.flatMap((tug, i) => (requiredError(tug?.name) ? i : null))
      .filter((val) => Number.isInteger(val))
      .map((tIndex) => {
        return {
          id: 'tugName-' + tIndex,
          msg: requiredMsg,
        };
      }) ?? [];
  return { vtsNameErrors, vhfNameErrors, vhfChannelErrors, tugNameErrors };
}

function validatePictures(state: FairwayCardInput, requiredMsg: string) {
  const groupedPicTexts: PictureGroup[] = [];
  state.pictures?.map((pic) => {
    if (pic.groupId && !groupedPicTexts.some((p) => p.groupId === pic.groupId)) {
      const currentGroup = state.pictures?.filter((p) => p.groupId === pic.groupId);
      groupedPicTexts.push({
        groupId: pic.groupId,
        text: {
          fi: currentGroup?.find((p) => p.lang === 'fi')?.text ?? '',
          sv: currentGroup?.find((p) => p.lang === 'sv')?.text ?? '',
          en: currentGroup?.find((p) => p.lang === 'en')?.text ?? '',
        },
      });
    }
  });
  const pictureTextErrors = groupedPicTexts
    .filter((pic) => translationError(pic.text))
    .map((picGroup) => {
      return {
        id: 'pictureText-' + picGroup.groupId,
        msg: requiredMsg,
      };
    });
  return pictureTextErrors;
}

function validateTemporaryNotifications(state: FairwayCardInput, requiredMsg: string, invalidErrorMsg: string, endDateErrorMsg: string) {
  const temporaryNotificationContentErrors =
    state.temporaryNotifications
      ?.flatMap((notification, i) => (requiredError(notification.content) ? i : null))
      .filter((val) => Number.isInteger(val))
      .map((vIndex) => {
        return {
          id: 'temporaryNotificationContent-' + vIndex,
          msg: requiredMsg,
        };
      }) ?? [];
  const temporaryNotificationStartDateErrors =
    state.temporaryNotifications
      ?.flatMap((notification, i) => (!notification.startDate ? i : null))
      .filter((val) => Number.isInteger(val))
      .map((vIndex) => {
        return {
          id: 'temporaryNotificationStartDate-' + vIndex,
          msg: requiredMsg,
        };
      }) ?? [];
  const temporaryNotificationEndDateInputErrors =
    state.temporaryNotifications
      ?.flatMap((notification, i) => (notification.endDate && dateError(notification.endDate) ? i : null))
      .filter((val) => Number.isInteger(val))
      .map((vIndex) => {
        return {
          id: 'temporaryNotificationEndDate-' + vIndex,
          msg: invalidErrorMsg,
        };
      }) ?? [];
  const temporaryNotificationEndDateErrors =
    state.temporaryNotifications
      ?.flatMap((notification, i) => (notification.endDate && endDateError(notification.startDate, notification.endDate ?? '') ? i : null))
      .filter((val) => Number.isInteger(val))
      .map((vIndex) => {
        return {
          id: 'temporaryNotificationEndDate-' + vIndex,
          msg: endDateErrorMsg,
        };
      }) ?? [];
  return {
    temporaryNotificationContentErrors,
    temporaryNotificationStartDateErrors,
    temporaryNotificationEndDateInputErrors,
    temporaryNotificationEndDateErrors,
  };
}

// invalidErrorMsg and dateErrorMsg are only for temporaryNotifications, since they're bit of a special case
export function validateFairwayCardForm(
  state: FairwayCardInput,
  requiredMsg: string,
  primaryIdErrorMsg: string,
  invalidErrorMsg: string,
  endDateErrorMsg: string
): ValidationType[] {
  const manualValidations = [
    { id: 'name', msg: requiredError(state.name) ? requiredMsg : '' },
    { id: 'primaryId', msg: primaryIdErrorMsg },
    { id: 'fairwayIds', msg: state.fairwayIds.length < 1 ? requiredMsg : '' },
    { id: 'fairwayPrimary', msg: state.fairwayIds.length > 1 && state.primaryFairwayId && state.primaryFairwayId.length < 1 ? requiredMsg : '' },
    {
      id: 'fairwaySecondary',
      msg: state.fairwayIds.length > 1 && state.secondaryFairwayId && state.secondaryFairwayId.length < 1 ? requiredMsg : '',
    },
    { id: 'group', msg: state.group.length < 1 ? requiredMsg : '' },
    {
      id: 'additionalInfo',
      msg: translationError(state.additionalInfo) ? requiredMsg : '',
    },
    {
      id: 'line',
      msg: translationError(state.lineText) ? requiredMsg : '',
    },
    {
      id: 'designSpeed',
      msg: translationError(state.designSpeed) ? requiredMsg : '',
    },
    {
      id: 'speedLimit',
      msg: translationError(state.speedLimit) ? requiredMsg : '',
    },
    {
      id: 'anchorage',
      msg: translationError(state.anchorage) ? requiredMsg : '',
    },
    {
      id: 'navigationCondition',
      msg: translationError(state.navigationCondition) ? requiredMsg : '',
    },
    {
      id: 'iceCondition',
      msg: translationError(state.iceCondition) ? requiredMsg : '',
    },
    {
      id: 'windRecommendation',
      msg: translationError(state.windRecommendation) ? requiredMsg : '',
    },
    {
      id: 'vesselRecommendation',
      msg: translationError(state.vesselRecommendation) ? requiredMsg : '',
    },
    {
      id: 'visibility',
      msg: translationError(state.visibility) ? requiredMsg : '',
    },
    {
      id: 'pilotExtraInfo',
      msg: translationError(state.trafficService?.pilot?.extraInfo) ? requiredMsg : '',
    },
  ];

  const { vtsNameErrors, vhfNameErrors, vhfChannelErrors, tugNameErrors } = validateVtsAndTug(state, requiredMsg);
  const {
    temporaryNotificationContentErrors,
    temporaryNotificationStartDateErrors,
    temporaryNotificationEndDateInputErrors,
    temporaryNotificationEndDateErrors,
  } = validateTemporaryNotifications(state, requiredMsg, invalidErrorMsg, endDateErrorMsg);
  const pictureTextErrors = validatePictures(state, requiredMsg);

  return manualValidations.concat(
    vtsNameErrors,
    vhfNameErrors,
    vhfChannelErrors,
    tugNameErrors,
    pictureTextErrors,
    temporaryNotificationContentErrors,
    temporaryNotificationStartDateErrors,
    temporaryNotificationEndDateInputErrors,
    temporaryNotificationEndDateErrors
  );
}

function validateQuay(state: HarborInput, requiredMsg: string) {
  const quayNameErrors =
    state.quays
      ?.flatMap((quay, i) => (translationError(quay?.name) ? i : null))
      .filter((val) => Number.isInteger(val))
      .map((qIndex) => {
        return {
          id: 'quayName-' + qIndex,
          msg: requiredMsg,
        };
      }) ?? [];
  const quayExtraInfoErrors =
    state.quays
      ?.flatMap((quay, i) => (translationError(quay?.extraInfo) ? i : null))
      .filter((val) => Number.isInteger(val))
      .map((qIndex) => {
        return {
          id: 'quayExtraInfo-' + qIndex,
          msg: requiredMsg,
        };
      }) ?? [];
  const quayLatErrors =
    state.quays
      ?.flatMap((quay, i) => (!quay?.geometry?.lat ? i : null))
      .filter((val) => Number.isInteger(val))
      .map((qIndex) => {
        return {
          id: 'quayLat-' + qIndex,
          msg: requiredMsg,
        };
      }) ?? [];
  const quayLonErrors =
    state.quays
      ?.flatMap((quay, i) => (!quay?.geometry?.lon ? i : null))
      .filter((val) => Number.isInteger(val))
      .map((qIndex) => {
        return {
          id: 'quayLon-' + qIndex,
          msg: requiredMsg,
        };
      }) ?? [];
  const sectionGeometryErrors =
    state.quays
      ?.map((quay) => quay?.sections?.flatMap((section, j) => (geometryError(section?.geometry) ? j : null)).filter((val) => Number.isInteger(val)))
      .flatMap((sIndices, qIndex) => {
        return (
          sIndices?.map((sIndex) => {
            return {
              id: 'sectionGeometry-' + qIndex + '-' + sIndex,
              msg: requiredMsg,
            };
          }) ?? []
        );
      }) ?? [];
  return { quayNameErrors, quayExtraInfoErrors, quayLatErrors, quayLonErrors, sectionGeometryErrors };
}

export function validateHarbourForm(state: HarborInput, requiredMsg: string, primaryIdErrorMsg: string): ValidationType[] {
  const manualValidations = [
    { id: 'name', msg: requiredError(state.name) ? requiredMsg : '' },
    {
      id: 'extraInfo',
      msg: translationError(state.extraInfo) ? requiredMsg : '',
    },
    {
      id: 'cargo',
      msg: translationError(state.cargo) ? requiredMsg : '',
    },
    {
      id: 'harbourBasin',
      msg: translationError(state.harborBasin) ? requiredMsg : '',
    },
    {
      id: 'companyName',
      msg: translationError(state.company) ? requiredMsg : '',
    },
    { id: 'primaryId', msg: primaryIdErrorMsg },
    { id: 'lat', msg: !state.geometry?.lat ? requiredMsg : '' },
    { id: 'lon', msg: !state.geometry?.lon ? requiredMsg : '' },
  ];

  const { quayNameErrors, quayExtraInfoErrors, quayLatErrors, quayLonErrors, sectionGeometryErrors } = validateQuay(state, requiredMsg);
  return manualValidations.concat(quayNameErrors, quayExtraInfoErrors, quayLatErrors, quayLonErrors, sectionGeometryErrors);
}

export function hasUnsavedChanges(oldState: FairwayCardInput | HarborInput, currentState: FairwayCardInput | HarborInput) {
  const diffObj = diff(oldState, currentState);
  return JSON.stringify(diffObj) !== '{}';
}
