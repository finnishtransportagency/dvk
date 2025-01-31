import { fieldParams, State } from '../hooks/squatReducer';

// Helper functions
export const countDecimals = (val: number) => {
  if (!val || isNaN(val)) return 0;
  if (Math.floor(val.valueOf()) === val.valueOf()) return 0;
  const valStr = val.toString();
  if (valStr.indexOf('e-') > -1) return Number(valStr.split('e-')[1]);
  return valStr.split('.')[1].length;
};

const getQuerystringForField = (fieldName: string, value: number | boolean, explicitDefault?: boolean) => {
  const defaultValue = explicitDefault ?? fieldParams[fieldName].default;
  if (value !== defaultValue) {
    return fieldName + '=' + value;
  }
  return '';
};

const getFieldParameters = (currentState: State) => {
  const limitedView = currentState.status.showLimitedView;
  const embeddedSquat = currentState.embeddedSquat;
  let parameters = [];

  // Vessel - General
  parameters.push(getQuerystringForField('lengthBPP', currentState.vessel.general.lengthBPP));
  parameters.push(getQuerystringForField('breadth', currentState.vessel.general.breadth));
  parameters.push(getQuerystringForField('draught', currentState.vessel.general.draught));
  parameters.push(getQuerystringForField('blockCoefficient', currentState.vessel.general.blockCoefficient));
  parameters.push(getQuerystringForField('displacement', currentState.vessel.general.displacement));

  // Vessel - Stability
  parameters.push(getQuerystringForField('KG', currentState.vessel.stability.KG));
  parameters.push(getQuerystringForField('GM', currentState.vessel.stability.GM));
  parameters.push(getQuerystringForField('KB', currentState.vessel.stability.KB));

  if (!limitedView) {
    // Vessel - Detailed
    parameters.push(getQuerystringForField('windSurface', currentState.vessel.detailed.windSurface));
    parameters.push(getQuerystringForField('deckCargo', currentState.vessel.detailed.deckCargo));
    parameters.push(getQuerystringForField('bowThruster', currentState.vessel.detailed.bowThruster));
    parameters.push(getQuerystringForField('bowThrusterEfficiency', currentState.vessel.detailed.bowThrusterEfficiency));
    parameters.push(getQuerystringForField('profileSelected', currentState.vessel.detailed.profileSelected.id - 1));

    // Environment - Weather
    parameters.push(getQuerystringForField('windSpeed', currentState.environment.weather.windSpeed));
    parameters.push(getQuerystringForField('windDirection', currentState.environment.weather.windDirection));
    parameters.push(getQuerystringForField('waveHeight', currentState.environment.weather.waveHeight));
    parameters.push(getQuerystringForField('wavePeriod', currentState.environment.weather.wavePeriod));
  }

  // Environment - Fairway
  parameters.push(getQuerystringForField('sweptDepth', currentState.environment.fairway.sweptDepth));
  parameters.push(getQuerystringForField('waterLevel', currentState.environment.fairway.waterLevel));
  if (!limitedView) parameters.push(getQuerystringForField('waterDepth', currentState.environment.fairway.waterDepth));
  parameters.push(getQuerystringForField('fairwayForm', currentState.environment.fairway.fairwayForm.id - 1));
  parameters.push(getQuerystringForField('channelWidth', currentState.environment.fairway.channelWidth));
  parameters.push(getQuerystringForField('slopeScale', currentState.environment.fairway.slopeScale));
  parameters.push(getQuerystringForField('slopeHeight', currentState.environment.fairway.slopeHeight));

  // Environment - Vessel
  if (!limitedView) parameters.push(getQuerystringForField('vesselCourse', currentState.environment.vessel.vesselCourse));
  parameters.push(getQuerystringForField('vesselSpeed', currentState.environment.vessel.vesselSpeed));
  if (!limitedView) {
    parameters.push(getQuerystringForField('turningRadius', currentState.environment.vessel.turningRadius));

    // Environment - Attribute
    parameters.push(getQuerystringForField('airDensity', currentState.environment.attribute.airDensity));
    parameters.push(getQuerystringForField('waterDensity', currentState.environment.attribute.waterDensity));
  }
  parameters.push(getQuerystringForField('requiredUKC', currentState.environment.attribute.requiredUKC));
  if (!limitedView) parameters.push(getQuerystringForField('safetyMarginWindForce', currentState.environment.attribute.safetyMarginWindForce));
  parameters.push(getQuerystringForField('motionClearance', currentState.environment.attribute.motionClearance));

  // Calculations - Status
  if (!limitedView) parameters.push(getQuerystringForField('showDeepWaterValues', currentState.status.showDeepWaterValues, false));
  parameters.push(getQuerystringForField('showBarrass', currentState.status.showBarrass, false));
  if (!embeddedSquat) parameters.push(getQuerystringForField('showLimitedView', currentState.status.showLimitedView, false));

  parameters = parameters.filter((param) => {
    return param && param?.length > 0;
  });

  return parameters;
};

const getUrlBasedParameters = (
  parameters: string[],
  showLanguages: string | null,
  showLogo: string | null,
  lang: string | null,
  baseURL: string | null,
  useBaseURL?: boolean
) => {
  if (showLanguages && !useBaseURL) parameters.push('showLanguages=' + showLanguages);
  if (showLogo && !useBaseURL) parameters.push('showLogo=' + showLogo);
  if (lang && !useBaseURL) parameters.push('lang=' + lang);
  if (baseURL && !useBaseURL) parameters.push('baseURL=' + baseURL);

  return parameters;
};

export const createShareableLink = (currentState: State, useBaseURL?: boolean) => {
  // Get current base url (use given if available)
  const urlParams = new URLSearchParams(window.location.search);
  const baseURL = urlParams.get('baseURL');
  const showLanguages = urlParams.get('showLanguages');
  const showLogo = urlParams.get('showLogo');
  const lang = urlParams.get('lang');
  const currentURL = useBaseURL && baseURL ? baseURL : window.location.href.split('?')[0];

  // Build query string based on current state (in the same order as form fields)
  let parameters = getFieldParameters(currentState);
  parameters = getUrlBasedParameters(parameters, showLanguages, showLogo, lang, baseURL, useBaseURL);
  return currentURL + (parameters.length ? '?' + parameters.join('&') : '');
};

export const copyToClipboard = (text: string) => {
  navigator.clipboard.writeText(text);
  return true;
};

export function removeSoftHyphen(text: string) {
  return text.replace(/\u00AD/g, '');
}
