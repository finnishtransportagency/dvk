import { FairwayCardInput } from '../graphql/generated';
import { PictureGroup, ValidationType } from './constants';

function isInputValid(inputFi?: string, inputSv?: string, inputEn?: string, errorText?: string) {
  return (inputFi?.trim() || inputSv?.trim() || inputEn?.trim()) && (!inputFi?.trim() || !inputSv?.trim() || !inputEn?.trim()) ? errorText ?? '' : '';
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
      ?.map(
        (vts) =>
          vts?.vhf
            ?.flatMap((vhf, j) =>
              (vhf?.name?.fi.trim() || vhf?.name?.sv.trim() || vhf?.name?.en.trim()) &&
              (!vhf?.name?.fi.trim() || !vhf?.name?.sv.trim() || !vhf?.name?.en.trim())
                ? j
                : null
            )
            .filter((val) => Number.isInteger(val))
      )
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
    .filter(
      (pic) => (pic.text.fi.trim() || pic.text.sv.trim() || pic.text.en.trim()) && (!pic.text.fi.trim() || !pic.text.sv.trim() || !pic.text.en.trim())
    )
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
      msg: isInputValid(state.lineText?.fi, state.lineText?.sv, state.lineText?.en, requiredMsg),
    },
    {
      id: 'designSpeed',
      msg: isInputValid(state.designSpeed?.fi, state.designSpeed?.sv, state.designSpeed?.en, requiredMsg),
    },
    {
      id: 'speedLimit',
      msg: isInputValid(state.speedLimit?.fi, state.speedLimit?.sv, state.speedLimit?.en, requiredMsg),
    },
    {
      id: 'anchorage',
      msg: isInputValid(state.anchorage?.fi, state.anchorage?.sv, state.anchorage?.en, requiredMsg),
    },
    {
      id: 'navigationCondition',
      msg: isInputValid(state.navigationCondition?.fi, state.navigationCondition?.sv, state.navigationCondition?.en, requiredMsg),
    },
    {
      id: 'iceCondition',
      msg: isInputValid(state.iceCondition?.fi, state.iceCondition?.sv, state.iceCondition?.en, requiredMsg),
    },
    {
      id: 'windRecommendation',
      msg: isInputValid(state.windRecommendation?.fi, state.windRecommendation?.sv, state.windRecommendation?.en, requiredMsg),
    },
    {
      id: 'vesselRecommendation',
      msg: isInputValid(state.vesselRecommendation?.fi, state.vesselRecommendation?.sv, state.vesselRecommendation?.en, requiredMsg),
    },
    {
      id: 'visibility',
      msg: isInputValid(state.visibility?.fi, state.visibility?.sv, state.visibility?.en, requiredMsg),
    },
    {
      id: 'windGauge',
      msg: isInputValid(state.windGauge?.fi, state.windGauge?.sv, state.windGauge?.en, requiredMsg),
    },
    {
      id: 'seaLevel',
      msg: isInputValid(state.seaLevel?.fi, state.seaLevel?.sv, state.seaLevel?.en, requiredMsg),
    },
    {
      id: 'pilotExtraInfo',
      msg: isInputValid(
        state.trafficService?.pilot?.extraInfo?.fi,
        state.trafficService?.pilot?.extraInfo?.sv,
        state.trafficService?.pilot?.extraInfo?.en,
        requiredMsg
      ),
    },
  ];

  const { vtsNameErrors, vhfNameErrors, vhfChannelErrors, tugNameErrors } = validateVtsAndTug(state, requiredMsg);
  const pictureTextErrors = validatePictures(state, requiredMsg);

  return manualValidations.concat(vtsNameErrors, vhfNameErrors, vhfChannelErrors, tugNameErrors, pictureTextErrors);
}
