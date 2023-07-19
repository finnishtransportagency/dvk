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
  const defaultValue = explicitDefault !== undefined ? explicitDefault : fieldParams[fieldName].default;
  if (value !== defaultValue) {
    return fieldName + '=' + value;
  }
  return '';
};

export const createShareableLink = (currentState: State, useBaseURL?: boolean) => {
  // Get current base url (use given if available)
  const urlParams = new URLSearchParams(window.location.search);
  const baseURL = urlParams.get('baseURL');
  const showLanguages = urlParams.get('showLanguages');
  const showLogo = urlParams.get('showLogo');
  const lang = urlParams.get('lang');
  const currentURL = useBaseURL && baseURL ? baseURL : window.location.href.split('?')[0];
  const limitedView = currentState.status.showLimitedView;

  // Build query string based on current state
  let parametres = [];
  parametres.push(getQuerystringForField('lengthBPP', currentState.vessel.general.lengthBPP));
  parametres.push(getQuerystringForField('breadth', currentState.vessel.general.breadth));
  parametres.push(getQuerystringForField('draught', currentState.vessel.general.draught));
  parametres.push(getQuerystringForField('blockCoefficient', currentState.vessel.general.blockCoefficient));
  parametres.push(getQuerystringForField('displacement', currentState.vessel.general.displacement));

  parametres.push(getQuerystringForField('sweptDepth', currentState.environment.fairway.sweptDepth));
  parametres.push(getQuerystringForField('fairwayForm', currentState.environment.fairway.fairwayForm.id - 1));
  parametres.push(getQuerystringForField('channelWidth', currentState.environment.fairway.channelWidth));
  parametres.push(getQuerystringForField('slopeScale', currentState.environment.fairway.slopeScale));
  parametres.push(getQuerystringForField('slopeHeight', currentState.environment.fairway.slopeHeight));

  parametres.push(getQuerystringForField('vesselSpeed', currentState.environment.vessel.vesselSpeed));

  parametres.push(getQuerystringForField('requiredUKC', currentState.environment.attribute.requiredUKC));
  parametres.push(getQuerystringForField('motionClearance', currentState.environment.attribute.motionClearance));

  if (!limitedView) {
    parametres.push(getQuerystringForField('windSurface', currentState.vessel.detailed.windSurface));
    parametres.push(getQuerystringForField('deckCargo', currentState.vessel.detailed.deckCargo));
    parametres.push(getQuerystringForField('bowThruster', currentState.vessel.detailed.bowThruster));
    parametres.push(getQuerystringForField('bowThrusterEfficiency', currentState.vessel.detailed.bowThrusterEfficiency));
    parametres.push(getQuerystringForField('profileSelected', currentState.vessel.detailed.profileSelected.id - 1));

    parametres.push(getQuerystringForField('KG', currentState.vessel.stability.KG));
    parametres.push(getQuerystringForField('GM', currentState.vessel.stability.GM));
    parametres.push(getQuerystringForField('KB', currentState.vessel.stability.KB));

    parametres.push(getQuerystringForField('windSpeed', currentState.environment.weather.windSpeed));
    parametres.push(getQuerystringForField('windDirection', currentState.environment.weather.windDirection));
    parametres.push(getQuerystringForField('waveHeight', currentState.environment.weather.waveHeight));
    parametres.push(getQuerystringForField('wavePeriod', currentState.environment.weather.wavePeriod));

    parametres.push(getQuerystringForField('waterLevel', currentState.environment.fairway.waterLevel));
    parametres.push(getQuerystringForField('waterDepth', currentState.environment.fairway.waterDepth));

    parametres.push(getQuerystringForField('vesselCourse', currentState.environment.vessel.vesselCourse));
    parametres.push(getQuerystringForField('turningRadius', currentState.environment.vessel.turningRadius));

    parametres.push(getQuerystringForField('airDensity', currentState.environment.attribute.airDensity));
    parametres.push(getQuerystringForField('waterDensity', currentState.environment.attribute.waterDensity));
    parametres.push(getQuerystringForField('safetyMarginWindForce', currentState.environment.attribute.safetyMarginWindForce));
  }

  parametres.push(getQuerystringForField('showDeepWaterValues', currentState.status.showDeepWaterValues, false));
  parametres.push(getQuerystringForField('showBarrass', currentState.status.showBarrass, false));
  parametres.push(getQuerystringForField('showLimitedView', currentState.status.showLimitedView, false));

  parametres = parametres.filter((param) => {
    return param && param?.length > 0 ? true : false;
  });

  if (showLanguages && !useBaseURL) parametres.push('showLanguages=' + showLanguages);
  if (showLogo && !useBaseURL) parametres.push('showLogo=' + showLogo);
  if (lang && !useBaseURL) parametres.push('lang=' + lang);
  if (baseURL && !useBaseURL) parametres.push('baseURL=' + baseURL);
  return currentURL + (parametres.length ? '?' + parametres.join('&') : '');
};

export const copyToClipboard = (text: string) => {
  navigator.clipboard.writeText(text);
  return true;
};

export function getAssetUrl(path: string): string {
  if (import.meta.env.NODE_ENV === 'test') {
    // workaround for "Failed to parse URL" error when running tests
    return 'data:image/svg+xml,';
  } else if (import.meta.env.DEV || import.meta.env.BASE_URL === '/') {
    return path;
  } else {
    return import.meta.env.BASE_URL + '/' + path;
  }
}
