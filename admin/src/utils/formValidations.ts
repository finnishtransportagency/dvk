import { diff } from 'deep-object-diff';
import { FairwayCardInput, GeometryInput, HarborInput, TextInput, Text, InputMaybe, SquatCalculationInput } from '../graphql/generated';
import { FairwayForm, PictureGroup, ValidationType } from './constants';
import { dateError, endDateError } from './common';

function requiredError(input?: TextInput | Text | null): boolean {
  return !input?.fi?.trim() || !input?.sv?.trim() || !input?.en?.trim();
}

export function translationError(input?: TextInput | Text | null): boolean {
  return (!!input?.fi?.trim() || !!input?.sv?.trim() || !!input?.en?.trim()) && requiredError(input);
}

export function geometryError(input?: GeometryInput | null): boolean {
  return (!!input?.lat.trim() || !!input?.lon.trim()) && (!input?.lat.trim() || !input.lon.trim());
}

export type QuayOrSection = {
  geometry: InputMaybe<GeometryInput>;
  actionTarget: string;
};

export function locationError(comparable?: QuayOrSection, geometrysToCompare?: QuayOrSection[] | undefined) {
  // action target checks that quay or section is not compared with itself
  return (
    comparable?.geometry?.lat &&
    comparable?.geometry?.lon &&
    geometrysToCompare?.some(
      (g) =>
        comparable.actionTarget !== g.actionTarget &&
        parseFloat(g?.geometry?.lat ?? '') === parseFloat(comparable.geometry?.lat ?? '') &&
        parseFloat(g?.geometry?.lon ?? '') === parseFloat(comparable?.geometry?.lon ?? '')
    )
  );
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

function validateMandatorySquatField(
  state: FairwayCardInput,
  fieldPrefix: string,
  requiredMsg: string,
  mapper: (calc: SquatCalculationInput, i: number) => number | null
) {
  const errors =
    state.squatCalculations
      ?.flatMap(mapper)
      .filter((val) => Number.isInteger(val))
      .map((vIndex) => {
        return {
          id: fieldPrefix + '-' + vIndex,
          msg: requiredMsg,
        };
      }) ?? [];
  return errors;
}

function validateSquatCalculations(state: FairwayCardInput, requiredMsg: string, invalidMsg: string) {
  const squatPlaceErrors = validateMandatorySquatField(state, 'squatCalculationPlace', requiredMsg, (calc, i) =>
    requiredError(calc.place) ? i : null
  );
  const squatTargetFairwaysErrors = validateMandatorySquatField(state, 'squatTargetFairwayIds', requiredMsg, (calc, i) =>
    !calc.targetFairways ? i : null
  );
  const squatAreasErrors = validateMandatorySquatField(state, 'squatSuitableFairwayAreaIds', requiredMsg, (calc, i) =>
    !calc.suitableFairwayAreas ? i : null
  );
  const squatEstimatedWaterDepthErrors = validateMandatorySquatField(state, 'squatCalculationEstimatedWaterDepth', requiredMsg, (calc, i) =>
    !calc.estimatedWaterDepth ? i : null
  );
  const squatFairwayFormErrors = validateMandatorySquatField(state, 'squatCalculationFairwayForm', requiredMsg, (calc, i) =>
    !calc.fairwayForm ? i : null
  );
  const squatFairwayWidthErrors = validateMandatorySquatField(state, 'squatCalculationFairwayWidth', requiredMsg, (calc, i) =>
    (calc.fairwayForm ?? -1) > FairwayForm.OpenWater && !calc.fairwayWidth ? i : null
  );
  const squatSlopeScaleErrors = validateMandatorySquatField(state, 'squatCalculationSlopeScale', requiredMsg, (calc, i) =>
    (calc.fairwayForm ?? -1) === FairwayForm.SlopedChannel && !calc.slopeScale ? i : null
  );
  const squatSlopeHeightErrors = validateMandatorySquatField(state, 'squatCalculationSlopeHeight', requiredMsg, (calc, i) =>
    (calc.fairwayForm ?? -1) === FairwayForm.SlopedChannel && !calc.slopeHeight ? i : null
  );
  const squatAdditionalInformationErrors = validateMandatorySquatField(state, 'squatCalculationAdditionalInformation', requiredMsg, (calc, i) =>
    requiredError(calc.place) ? i : null
  );

  //Custom check about depth value
  const squatFairwayWidthValueErrors =
    state.squatCalculations
      ?.flatMap((calc, i) => ((calc.depth ?? 0) > (calc.estimatedWaterDepth ?? 0) ? i : null))
      .filter((val) => Number.isInteger(val))
      .map((vIndex) => {
        return {
          id: 'squatCalculationEstimatedWaterDepth-' + vIndex,
          msg: invalidMsg,
        };
      }) ?? [];

  return {
    squatPlaceErrors,
    squatTargetFairwaysErrors,
    squatAreasErrors,
    squatEstimatedWaterDepthErrors,
    squatFairwayFormErrors,
    squatFairwayWidthErrors,
    squatFairwayWidthValueErrors,
    squatSlopeScaleErrors,
    squatSlopeHeightErrors,
    squatAdditionalInformationErrors,
  };
}

// invalidErrorMsg and dateErrorMsg are only for temporaryNotifications, since they're bit of a special case
export function validateFairwayCardForm(
  state: FairwayCardInput,
  requiredMsg: string,
  invalidErrorMsg: string,
  endDateErrorMsg: string
): ValidationType[] {
  const manualValidations = [
    { id: 'name', msg: requiredError(state.name) ? requiredMsg : '' },
    { id: 'fairwayIds', msg: state.fairwayIds.length < 1 ? requiredMsg : '' },
    { id: 'fairwayPrimary', msg: state.fairwayIds.length > 1 && state.primaryFairwayId && state.primaryFairwayId.length < 1 ? requiredMsg : '' },
    {
      id: 'fairwaySecondary',
      msg: state.fairwayIds.length > 1 && state.secondaryFairwayId && state.secondaryFairwayId.length < 1 ? requiredMsg : '',
    },
    // trim because group is given as an empty string so empty form can be saved from creation modal
    { id: 'group', msg: state.group.trim().length < 1 ? requiredMsg : '' },
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

  const {
    squatPlaceErrors,
    squatTargetFairwaysErrors,
    squatAreasErrors,
    squatEstimatedWaterDepthErrors,
    squatFairwayFormErrors,
    squatFairwayWidthErrors,
    squatFairwayWidthValueErrors,
    squatSlopeScaleErrors,
    squatSlopeHeightErrors,
    squatAdditionalInformationErrors,
  } = validateSquatCalculations(state, requiredMsg, invalidErrorMsg);
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
    temporaryNotificationEndDateErrors,
    squatPlaceErrors,
    squatTargetFairwaysErrors,
    squatAreasErrors,
    squatEstimatedWaterDepthErrors,
    squatFairwayFormErrors,
    squatFairwayWidthErrors,
    squatFairwayWidthValueErrors,
    squatSlopeScaleErrors,
    squatSlopeHeightErrors,
    squatAdditionalInformationErrors
  );
}

function validateQuay(state: HarborInput, requiredMsg: string, duplicateLocationMsg: string) {
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
  let quayFirstMatchFound = false;
  const quayLocationErrors =
    state.quays
      ?.flatMap((quay, i) => {
        const hasError = locationError(
          { actionTarget: String(i), geometry: quay?.geometry } as QuayOrSection,
          state?.quays?.map((q, idx) => ({ geometry: q?.geometry, actionTarget: String(idx) }) as QuayOrSection)
        );
        if (hasError) {
          if (!quayFirstMatchFound) {
            quayFirstMatchFound = true;
            return null;
          }
          return i;
        }
        return null;
      })
      .filter((val) => Number.isInteger(val))
      .map((qIndex) => {
        return {
          id: 'quayLocation-' + qIndex,
          msg: duplicateLocationMsg,
        };
      }) ?? [];
  let sectionFirstMatchFound = false;
  const sectionLocationErrors =
    state.quays
      ?.map((quay, i) =>
        quay?.sections
          ?.flatMap((section, j) => {
            const target = i + '-' + j;
            const hasError = locationError(
              { actionTarget: target, geometry: section?.geometry } as QuayOrSection,
              state?.quays?.flatMap(
                (q, qIdx) => q?.sections?.map((s, sIdx) => ({ geometry: s?.geometry, actionTarget: qIdx + '-' + sIdx }) as QuayOrSection) ?? []
              )
            );
            if (hasError) {
              if (!sectionFirstMatchFound) {
                sectionFirstMatchFound = true;
                return null;
              }
              return j;
            }
            return null;
          })
          .filter((val) => Number.isInteger(val))
      )
      .flatMap((sIndices, qIndex) => {
        return (
          sIndices?.map((sIndex) => {
            return {
              id: 'sectionLocation-' + qIndex + '-' + sIndex,
              msg: duplicateLocationMsg,
            };
          }) ?? []
        );
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
  return { quayNameErrors, quayExtraInfoErrors, quayLatErrors, quayLonErrors, quayLocationErrors, sectionLocationErrors, sectionGeometryErrors };
}

export function validateHarbourForm(state: HarborInput, requiredMsg: string, duplicateLocationErrorMsg: string): ValidationType[] {
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
    { id: 'lat', msg: !state.geometry?.lat ? requiredMsg : '' },
    { id: 'lon', msg: !state.geometry?.lon ? requiredMsg : '' },
  ];

  const { quayNameErrors, quayExtraInfoErrors, quayLatErrors, quayLonErrors, quayLocationErrors, sectionLocationErrors, sectionGeometryErrors } =
    validateQuay(state, requiredMsg, duplicateLocationErrorMsg);
  return manualValidations.concat(
    quayNameErrors,
    quayExtraInfoErrors,
    quayLatErrors,
    quayLonErrors,
    quayLocationErrors,
    sectionLocationErrors,
    sectionGeometryErrors
  );
}

export function hasUnsavedChanges(oldState: FairwayCardInput | HarborInput, currentState: FairwayCardInput | HarborInput) {
  const diffObj = diff(oldState, currentState);
  return JSON.stringify(diffObj) !== '{}';
}
