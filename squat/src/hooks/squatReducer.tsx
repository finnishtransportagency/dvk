import { countDecimals, createShareableLink } from '../utils/helpers';
import openWater from '../theme/img/open_water_small.svg';
import slopedChannel from '../theme/img/sloped_channel_small.svg';
import channel from '../theme/img/channel_small.svg';
import tanker from '../theme/img/tanker.svg';
import container from '../theme/img/container_ship.svg';
import ferry from '../theme/img/ferry.svg';
import lngTanker from '../theme/img/lng_tanker.svg';

// Common types

type Vessel = {
  id: number;
  name: string;
  lengthBPP: number;
  breadth: number;
  depth: number;
};

type VesselProfile = {
  id: number;
  name: string;
};

type FairwayForm = {
  id: number;
  name: string;
  desc: string;
  img: string;
};

type FieldParam = {
  default: number;
  min: number;
  max: number;
  unit?: string;
  unitId?: string;
  step?: string;
};

// Initialize data
export const vesselProfiles = [
  { id: 1, name: 'homePage.squat.vessel.bulker', img: tanker, opaque: true },
  { id: 2, name: 'homePage.squat.vessel.container', img: container, opaque: true },
  { id: 3, name: 'homePage.squat.vessel.ferry', img: ferry, opaque: true },
  { id: 4, name: 'homePage.squat.vessel.LNG-tanker', img: lngTanker, opaque: true },
];
export const fairwayForms = [
  {
    id: 1,
    name: 'homePage.squat.environment.open-water',
    desc: 'homePage.squat.environment.open-water-description',
    img: openWater,
  },
  {
    id: 2,
    name: 'homePage.squat.environment.channel',
    desc: 'homePage.squat.environment.channel-description',
    img: channel,
  },
  {
    id: 3,
    name: 'homePage.squat.environment.sloped-channel',
    desc: 'homePage.squat.environment.sloped-channel-description',
    img: slopedChannel,
  },
];

// Set up reducer and state properties

export type State = {
  vessel: {
    vesselSelected: Vessel | null;
    general: {
      lengthBPP: number;
      breadth: number;
      draught: number;
      blockCoefficient: number;
      displacement: number;
    };
    detailed: {
      windSurface: number;
      deckCargo: number;
      bowThruster: number;
      bowThrusterEfficiency: number;
      profileSelected: VesselProfile;
    };
    stability: {
      KG: number;
      GM: number;
      KB: number;
    };
  };
  environment: {
    weather: {
      windSpeed: number;
      windDirection: number;
      waveHeight: number;
      wavePeriod: number;
      waveLength: number[];
      waveAmplitude: number[];
    };
    fairway: {
      sweptDepth: number;
      waterLevel: number;
      waterDepth: number;
      fairwayForm: FairwayForm;
      channelWidth: number;
      slopeScale: number;
      slopeHeight: number;
    };
    vessel: {
      vesselCourse: number;
      vesselSpeed: number;
      turningRadius: number;
    };
    attribute: {
      airDensity: number;
      waterDensity: number;
      requiredUKC: number;
      safetyMarginWindForce: number;
      motionClearance: number;
    };
  };
  calculations: {
    forces: {
      relativeWindDirection: number;
      relativeWindSpeed: number;
      windForce: number;
      waveForce: number;
      bowThrusterForce: number;
      remainingSafetyMargin: number;
      externalForceRequired: number;
      estimatedDriftAngle: number;
      estimatedBreadth: number;
    };
    squat: {
      heelDueWind: number;
      constantHeelDuringTurn: number;
      correctedDraught: number;
      correctedDraughtDuringTurn: number;
      UKCVesselMotions: number[][];
      UKCStraightCourse: number[];
      UKCDuringTurn: number[];
      squatBarrass: number;
      squatHG: number;
      squatHGListed: number;
    };
  };
  status: {
    showDeepWaterValues: boolean;
    showBarrass: boolean;
    showLimitedView: boolean;
  };
  validations: Record<string, unknown>;
  embeddedSquat: boolean;
};

// Declare field parameters
export const fieldParams: Record<string, FieldParam> = {
  lengthBPP: { default: 0, min: 0, max: 350, unit: 'm', step: '0.01' },
  breadth: { default: 0, min: 0, max: 50, unit: 'm', step: '0.01' },
  draught: { default: 0, min: 0, max: 20, unit: 'm', step: '0.01' },
  blockCoefficient: { default: 0.75, min: 0.4, max: 1, step: '0.01' },
  displacement: { default: 0, min: 0, max: 250000, unit: 'mt' },
  windSurface: { default: 0, min: 0, max: 25000, unit: 'm\u00B2', unitId: 'm2' },
  deckCargo: { default: 0, min: 0, max: 20000, unit: 'm\u00B2', unitId: 'm2' },
  bowThruster: { default: 0, min: 0, max: 5500, unit: 'kW' },
  bowThrusterEfficiency: { default: 100, min: 0, max: 100, unit: '%' },
  profileSelected: { default: 0, min: 0, max: 3 },
  KG: { default: 0, min: 0, max: 20, step: '0.01' },
  GM: { default: 0.15, min: 0.15, max: 5, step: '0.01' },
  KB: { default: 0, min: 0, max: 15, step: '0.01' },
  windSpeed: { default: 0, min: 0, max: 35, unit: 'm/s' },
  windDirection: { default: 90, min: 0, max: 359, unit: '°', unitId: 'deg' },
  waveHeight: { default: 0, min: 0, max: 15, unit: 'm', step: '0.1' },
  wavePeriod: { default: 0, min: 0, max: 20, unit: 's', step: '0.1' },
  sweptDepth: { default: 0, min: 0, max: 20, unit: 'm', step: '0.1' },
  waterLevel: { default: 0, min: -150, max: 150, unit: 'cm' },
  waterDepth: { default: 0, min: 0, max: 30, unit: 'm', step: '0.1' },
  fairwayForm: { default: 0, min: 0, max: 2 },
  channelWidth: { default: 0, min: 0, max: 300, unit: 'm' },
  slopeScale: { default: 0.1, min: 1 / 10, max: 10 / 1, step: '0.1' },
  slopeHeight: { default: 0, min: 0, max: 20, unit: 'm', step: '0.1' },
  vesselCourse: { default: 0, min: 0, max: 359, unit: '°', unitId: 'deg' },
  vesselSpeed: { default: 0, min: 0, max: 35, unit: 'kts' },
  turningRadius: { default: 0.75, min: 0.1, max: 2, unit: 'M', step: '0.01' },
  airDensity: { default: 1.3, min: 1, max: 1.5, unit: 'kg/m\u00B3', unitId: 'kg/m3', step: '0.1' },
  waterDensity: { default: 1005, min: 1000, max: 1025, unit: 'kg/m\u00B3', unitId: 'kg/m3' },
  requiredUKC: { default: 0.5, min: 0.5, max: 5, unit: 'm', step: '0.01' },
  safetyMarginWindForce: { default: 0, min: 0, max: 25, unit: '%', step: '0.01' },
  motionClearance: { default: 0.3, min: 0, max: 3, unit: 'm', step: '0.01' },
};

// Set initially valid fields
let validatedFields = {
  blockCoefficient: true,
  windSurface: true,
  deckCargo: true,
  bowThruster: true,
  bowThrusterEfficiency: true,
  vesselProfile: true,
  KG: true,
  GM: true,
  KB: true,
  windSpeed: true,
  windDirection: true,
  waveHeight: true,
  wavePeriod: true,
  waterDepth: true,
  fairwayForm: true,
  vesselCourse: true,
  vesselSpeed: true,
  turningRadius: true,
  airDensity: true,
  waterDensity: true,
  requiredUKC: true,
  safetyMarginWindForce: true,
  motionClearance: true,
};

// Initialize field values from url parameter if set and check validity
export const getBooleanFieldValue = (fieldName: string, defaultValue: boolean) => {
  const queryParams = new URLSearchParams(window.location.search);
  return queryParams.get(fieldName) ? queryParams.get(fieldName)?.toLowerCase() === 'true' : defaultValue;
};

export const getFieldValue = (fieldName: string, force?: boolean) => {
  const queryParams = new URLSearchParams(window.location.search);
  const defaultValue = fieldParams[fieldName].default;
  const min = fieldParams[fieldName].min;
  const max = fieldParams[fieldName].max;
  const step = fieldParams[fieldName].step;
  let currentValue = queryParams.get(fieldName) ? Number(queryParams.get(fieldName)?.replace(',', '.')) : defaultValue;

  if (force) {
    if (currentValue < min) {
      currentValue = min;
    } else if (max && currentValue > max) {
      currentValue = max;
    }
  }
  // Set field validity if other than default value
  if (currentValue !== defaultValue) {
    validatedFields = {
      ...validatedFields,
      [fieldName]: currentValue >= min && currentValue <= max && countDecimals(currentValue) <= countDecimals(Number(step)),
    };
  }
  return currentValue;
};

// Set initial state
export const initialState: State = {
  vessel: {
    vesselSelected: null,
    general: {
      lengthBPP: getFieldValue('lengthBPP'),
      breadth: getFieldValue('breadth'),
      draught: getFieldValue('draught'),
      blockCoefficient: getFieldValue('blockCoefficient'),
      displacement: getFieldValue('displacement'),
    },
    detailed: {
      windSurface: getFieldValue('windSurface'),
      deckCargo: getFieldValue('deckCargo'),
      bowThruster: getFieldValue('bowThruster'),
      bowThrusterEfficiency: getFieldValue('bowThrusterEfficiency'),
      profileSelected: vesselProfiles[getFieldValue('profileSelected', true)],
    },
    stability: {
      KG: getFieldValue('KG'),
      GM: getFieldValue('GM'),
      KB: getFieldValue('KB'),
    },
  },
  environment: {
    weather: {
      windSpeed: getFieldValue('windSpeed'),
      windDirection: getFieldValue('windDirection'),
      waveHeight: getFieldValue('waveHeight'),
      wavePeriod: getFieldValue('wavePeriod'),
      waveLength: [0, 0],
      waveAmplitude: [0, 0],
    },
    fairway: {
      sweptDepth: getFieldValue('sweptDepth'),
      waterLevel: getFieldValue('waterLevel'),
      waterDepth: getFieldValue('waterDepth'),
      fairwayForm: fairwayForms[getFieldValue('fairwayForm', true)],
      channelWidth: getFieldValue('channelWidth'),
      slopeScale: getFieldValue('slopeScale'),
      slopeHeight: getFieldValue('slopeHeight'),
    },
    vessel: {
      vesselCourse: getFieldValue('vesselCourse'),
      vesselSpeed: getFieldValue('vesselSpeed'),
      turningRadius: getFieldValue('turningRadius'),
    },
    attribute: {
      airDensity: getFieldValue('airDensity'),
      waterDensity: getFieldValue('waterDensity'),
      requiredUKC: getFieldValue('requiredUKC'),
      safetyMarginWindForce: getFieldValue('safetyMarginWindForce'),
      motionClearance: getFieldValue('motionClearance'),
    },
  },
  calculations: {
    forces: {
      relativeWindDirection: 0,
      relativeWindSpeed: 0,
      windForce: 0,
      waveForce: 0,
      bowThrusterForce: 0,
      remainingSafetyMargin: 0,
      externalForceRequired: 0,
      estimatedDriftAngle: 0,
      estimatedBreadth: 0,
    },
    squat: {
      heelDueWind: 0,
      constantHeelDuringTurn: 0,
      correctedDraught: 0,
      correctedDraughtDuringTurn: 0,
      UKCVesselMotions: [
        [0, 0],
        [0, 0],
      ],
      UKCStraightCourse: [0, 0],
      UKCDuringTurn: [0, 0],
      squatBarrass: 0,
      squatHG: 0,
      squatHGListed: 0,
    },
  },
  status: {
    showDeepWaterValues: getBooleanFieldValue('showDeepWaterValues', false),
    showBarrass: getBooleanFieldValue('showBarrass', false),
    showLimitedView: getBooleanFieldValue('showLimitedView', false),
  },
  validations: validatedFields,
  embeddedSquat: false,
};

export const initialStateEmbedded: State = {
  ...initialState,
  embeddedSquat: true,
  status: {
    showDeepWaterValues: false,
    showBarrass: getBooleanFieldValue('showBarrass', false),
    showLimitedView: true,
  },
};

export type Action =
  | {
      type:
        | 'vessel-select'
        | 'vessel-general'
        | 'vessel-detailed'
        | 'vessel-stability'
        | 'environment-weather'
        | 'environment-fairway'
        | 'environment-vessel'
        | 'environment-attribute'
        | 'calculations'
        | 'status'
        | 'validation';
      payload: {
        key: string;
        value: string | number | number[] | object | boolean;
        elType?: string;
        fallThrough?: boolean;
      };
    }
  | { type: 'reset' };

export const SquatReducer = (state: State, action: Action) => {
  // Sort out correct value type from input element
  let inputValue: string | number | number[] | object | boolean = '';
  if (action.type !== 'reset') {
    switch (action.payload.elType?.toLocaleLowerCase()) {
      case 'ion-select':
      case 'ion-radio-group':
      case 'object':
      case 'boolean':
        inputValue = action.payload.value;
        break;
      default:
        inputValue = Number(action.payload.value);
    }
  }
  let newState;
  // Return updated state
  switch (action.type) {
    case 'vessel-select':
      newState = { ...state, vessel: { ...state.vessel, [action.payload.key]: inputValue } };
      break;
    case 'vessel-general':
      newState = { ...state, vessel: { ...state.vessel, general: { ...state.vessel.general, [action.payload.key]: inputValue } } };
      break;
    case 'vessel-detailed':
      newState = { ...state, vessel: { ...state.vessel, detailed: { ...state.vessel.detailed, [action.payload.key]: inputValue } } };
      break;
    case 'vessel-stability':
      newState = { ...state, vessel: { ...state.vessel, stability: { ...state.vessel.stability, [action.payload.key]: inputValue } } };
      break;
    case 'environment-weather':
      newState = {
        ...state,
        environment: { ...state.environment, weather: { ...state.environment.weather, [action.payload.key]: inputValue } },
      };
      break;
    case 'environment-fairway':
      newState = {
        ...state,
        environment: { ...state.environment, fairway: { ...state.environment.fairway, [action.payload.key]: inputValue } },
      };
      break;
    case 'environment-vessel':
      newState = { ...state, environment: { ...state.environment, vessel: { ...state.environment.vessel, [action.payload.key]: inputValue } } };
      break;
    case 'environment-attribute':
      newState = {
        ...state,
        environment: { ...state.environment, attribute: { ...state.environment.attribute, [action.payload.key]: inputValue } },
      };
      break;
    case 'calculations':
      newState = {
        ...state,
        calculations: { ...state.calculations, [action.payload.key]: inputValue },
      };
      break;
    case 'status':
      newState = {
        ...state,
        status: { ...state.status, [action.payload.key]: inputValue },
      };
      break;
    case 'validation':
      newState = {
        ...state,
        validations: { ...state.validations, [action.payload.key]: inputValue },
      };
      break;
    case 'reset':
      return state.embeddedSquat ? initialStateEmbedded : initialState;
    default:
      console.warn(`Unknown action type, state not updated.`);
      return state;
  }
  // Update current url to match new state
  window.history.replaceState(null, document.title, createShareableLink(newState));
  return action.payload.fallThrough ? state : newState;
};
