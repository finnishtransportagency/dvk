import { FairwayCardInput, HarborInput, TextInput } from '../graphql/generated';
import { PictureGroup, ValidationType } from './constants';

function checkTranslations(input?: TextInput | null): boolean {
  return !!(input?.fi.trim() || input?.sv.trim() || input?.en.trim()) && (!input?.fi.trim() || !input?.sv.trim() || !input?.en.trim());
}

function validateInput(input?: TextInput | null, errorText?: string): string {
  return checkTranslations(input) ? errorText ?? '' : '';
}

function validateVtsAndTug(state: FairwayCardInput, requiredMsg: string) {
  const vtsNameErrors =
    state.trafficService?.vts
      ?.flatMap((vts, i) => (!vts?.name?.fi.trim() || !vts?.name?.sv.trim() || !vts?.name?.en.trim() ? i : null))
      .filter((val) => Number.isInteger(val))
      .map((vIndex) => {
        return {
          id: 'vtsName-' + vIndex,
          msg: requiredMsg,
        };
      }) ?? [];

  const vhfNameErrors =
    state.trafficService?.vts
      ?.map((vts) => vts?.vhf?.flatMap((vhf, j) => (checkTranslations(vhf?.name) ? j : null)).filter((val) => Number.isInteger(val)))
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
      ?.flatMap((tug, i) => (!tug?.name?.fi.trim() || !tug?.name?.sv.trim() || !tug?.name?.en.trim() ? i : null))
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
    .filter((pic) => checkTranslations(pic.text))
    .map((picGroup) => {
      return {
        id: 'pictureText-' + picGroup.groupId,
        msg: requiredMsg,
      };
    });
  return pictureTextErrors;
}

export function validateFairwayCardForm(state: FairwayCardInput, requiredMsg: string, primaryIdErrorMsg: string): ValidationType[] {
  const manualValidations = [
    { id: 'name', msg: !state.name.fi.trim() || !state.name.sv.trim() || !state.name.en.trim() ? requiredMsg : '' },
    { id: 'primaryId', msg: primaryIdErrorMsg },
    { id: 'fairwayIds', msg: state.fairwayIds.length < 1 ? requiredMsg : '' },
    { id: 'group', msg: state.group.length < 1 ? requiredMsg : '' },
    {
      id: 'line',
      msg: validateInput(state.lineText, requiredMsg),
    },
    {
      id: 'designSpeed',
      msg: validateInput(state.designSpeed, requiredMsg),
    },
    {
      id: 'speedLimit',
      msg: validateInput(state.speedLimit, requiredMsg),
    },
    {
      id: 'anchorage',
      msg: validateInput(state.anchorage, requiredMsg),
    },
    {
      id: 'navigationCondition',
      msg: validateInput(state.navigationCondition, requiredMsg),
    },
    {
      id: 'iceCondition',
      msg: validateInput(state.iceCondition, requiredMsg),
    },
    {
      id: 'windRecommendation',
      msg: validateInput(state.windRecommendation, requiredMsg),
    },
    {
      id: 'vesselRecommendation',
      msg: validateInput(state.vesselRecommendation, requiredMsg),
    },
    {
      id: 'visibility',
      msg: validateInput(state.visibility, requiredMsg),
    },
    {
      id: 'windGauge',
      msg: validateInput(state.windGauge, requiredMsg),
    },
    {
      id: 'seaLevel',
      msg: validateInput(state.seaLevel, requiredMsg),
    },
    {
      id: 'pilotExtraInfo',
      msg: validateInput(state.trafficService?.pilot?.extraInfo, requiredMsg),
    },
  ];

  const { vtsNameErrors, vhfNameErrors, vhfChannelErrors, tugNameErrors } = validateVtsAndTug(state, requiredMsg);
  const pictureTextErrors = validatePictures(state, requiredMsg);

  return manualValidations.concat(vtsNameErrors, vhfNameErrors, vhfChannelErrors, tugNameErrors, pictureTextErrors);
}

function validateQuay(state: HarborInput, requiredMsg: string) {
  const quayNameErrors =
    state.quays
      ?.flatMap((quay, i) => (checkTranslations(quay?.name) ? i : null))
      .filter((val) => Number.isInteger(val))
      .map((qIndex) => {
        return {
          id: 'quayName-' + qIndex,
          msg: requiredMsg,
        };
      }) ?? [];
  const quayExtraInfoErrors =
    state.quays
      ?.flatMap((quay, i) => (checkTranslations(quay?.extraInfo) ? i : null))
      .filter((val) => Number.isInteger(val))
      .map((qIndex) => {
        return {
          id: 'quayExtraInfo-' + qIndex,
          msg: requiredMsg,
        };
      }) ?? [];
  const quayGeometryErrors =
    state.quays
      ?.flatMap((quay, i) =>
        (quay?.geometry?.lat.trim() || quay?.geometry?.lon.trim()) && (!quay?.geometry?.lat.trim() || !quay?.geometry?.lon.trim()) ? i : null
      )
      .filter((val) => Number.isInteger(val))
      .map((qIndex) => {
        return {
          id: 'quayGeometry-' + qIndex,
          msg: requiredMsg,
        };
      }) ?? [];
  const sectionGeometryErrors =
    state.quays
      ?.map(
        (quay) =>
          quay?.sections
            ?.flatMap((section, j) =>
              (section?.geometry?.lat.trim() || section?.geometry?.lon.trim()) && (!section?.geometry?.lat.trim() || !section?.geometry?.lon.trim())
                ? j
                : null
            )
            .filter((val) => Number.isInteger(val))
      )
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
  return { quayNameErrors, quayExtraInfoErrors, quayGeometryErrors, sectionGeometryErrors };
}

export function validateHarbourForm(state: HarborInput, requiredMsg: string, primaryIdErrorMsg: string): ValidationType[] {
  const manualValidations = [
    { id: 'name', msg: !state.name.fi.trim() || !state.name.sv.trim() || !state.name.en.trim() ? requiredMsg : '' },
    {
      id: 'extraInfo',
      msg: validateInput(state.extraInfo),
    },
    {
      id: 'cargo',
      msg: validateInput(state.cargo),
    },
    {
      id: 'harbourBasin',
      msg: validateInput(state.harborBasin),
    },
    {
      id: 'companyName',
      msg: validateInput(state.company),
    },
    { id: 'primaryId', msg: primaryIdErrorMsg },
    { id: 'lat', msg: !state.geometry.lat ? requiredMsg : '' },
    { id: 'lon', msg: !state.geometry.lon ? requiredMsg : '' },
  ];

  const { quayNameErrors, quayExtraInfoErrors, quayGeometryErrors, sectionGeometryErrors } = validateQuay(state, requiredMsg);
  return manualValidations.concat(quayNameErrors).concat(quayExtraInfoErrors).concat(quayGeometryErrors).concat(sectionGeometryErrors);
}
