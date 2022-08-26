import { State } from '../hooks/squatReducer';

// Helper functions
const getQuerystringForField = (fieldName: string, value: number, defaultValue: number) => {
  if (value !== defaultValue) {
    return fieldName + '=' + value;
  }
  return '';
};

export const createShareableLink = (currentState: State) => {
  // Get current base url (use given if available)
  const urlParams = new URLSearchParams(window.location.search);
  const baseURL = urlParams.get('baseURL');
  const currentURL = baseURL ? baseURL : window.location.href.split('?')[0];

  // Build query string based on current state
  let parametres = [];
  parametres.push(getQuerystringForField('lengthBPP', currentState.vessel.general.lengthBPP, 0));
  parametres.push(getQuerystringForField('breadth', currentState.vessel.general.breadth, 0));
  parametres.push(getQuerystringForField('draught', currentState.vessel.general.draught, 0));
  parametres.push(getQuerystringForField('blockCoefficient', currentState.vessel.general.blockCoefficient, 0.75));
  parametres.push(getQuerystringForField('displacement', currentState.vessel.general.displacement, 0));

  parametres.push(getQuerystringForField('windSurface', currentState.vessel.detailed.windSurface, 0));
  parametres.push(getQuerystringForField('deckCargo', currentState.vessel.detailed.deckCargo, 0));
  parametres.push(getQuerystringForField('bowThruster', currentState.vessel.detailed.bowThruster, 0));
  parametres.push(getQuerystringForField('bowThrusterEfficiency', currentState.vessel.detailed.bowThrusterEfficiency, 100));
  parametres.push(getQuerystringForField('profileSelected', currentState.vessel.detailed.profileSelected.id - 1, 0));

  parametres.push(getQuerystringForField('KG', currentState.vessel.stability.KG, 0));
  parametres.push(getQuerystringForField('GM', currentState.vessel.stability.GM, 0.15));
  parametres.push(getQuerystringForField('KB', currentState.vessel.stability.KB, 0));

  parametres.push(getQuerystringForField('windSpeed', currentState.environment.weather.windSpeed, 0));
  parametres.push(getQuerystringForField('windDirection', currentState.environment.weather.windDirection, 90));
  parametres.push(getQuerystringForField('waveHeight', currentState.environment.weather.waveHeight, 0));
  parametres.push(getQuerystringForField('wavePeriod', currentState.environment.weather.wavePeriod, 0));

  parametres.push(getQuerystringForField('sweptDepth', currentState.environment.fairway.sweptDepth, 0));
  parametres.push(getQuerystringForField('waterLevel', currentState.environment.fairway.waterLevel, 0));
  parametres.push(getQuerystringForField('waterDepth', currentState.environment.fairway.waterDepth, 0));
  parametres.push(getQuerystringForField('fairwayForm', currentState.environment.fairway.fairwayForm.id - 1, 0));
  parametres.push(getQuerystringForField('channelWidth', currentState.environment.fairway.channelWidth, 0));
  parametres.push(getQuerystringForField('slopeScale', currentState.environment.fairway.slopeScale, 0));
  parametres.push(getQuerystringForField('slopeHeight', currentState.environment.fairway.slopeHeight, 0));

  parametres.push(getQuerystringForField('vesselCourse', currentState.environment.vessel.vesselCourse, 0));
  parametres.push(getQuerystringForField('vesselSpeed', currentState.environment.vessel.vesselSpeed, 0));
  parametres.push(getQuerystringForField('turningRadius', currentState.environment.vessel.turningRadius, 0.75));

  parametres.push(getQuerystringForField('airDensity', currentState.environment.attribute.airDensity, 1.3));
  parametres.push(getQuerystringForField('waterDensity', currentState.environment.attribute.waterDensity, 1005));
  parametres.push(getQuerystringForField('requiredUKC', currentState.environment.attribute.requiredUKC, 0.5));
  parametres.push(getQuerystringForField('safetyMarginWindForce', currentState.environment.attribute.safetyMarginWindForce, 25));
  parametres.push(getQuerystringForField('motionClearance', currentState.environment.attribute.motionClearance, 0.3));

  parametres = parametres.filter((param) => {
    return param && param?.length > 0 ? true : false;
  });

  return currentURL + (parametres.length ? '?' + parametres.join('&') : '');
};

export const copyToClipboard = (text: string) => {
  navigator.clipboard.writeText(text);
  return true;
};
