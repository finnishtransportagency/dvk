import React, { ReactElement } from 'react';
import { createShareableLink } from '../utils/helpers';

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
  max?: number;
  unit?: string | ReactElement;
};

// Initialize data

// TODO: Load vessels from indexedDB / LocalStorage
export const vessels = [
  { id: 0, name: 'None', lengthBPP: 0, breadth: 0, depth: 0 },
  { id: 1, name: 'Big rig', lengthBPP: 1, breadth: 1, depth: 1 },
  { id: 2, name: 'My Yacht', lengthBPP: 2, breadth: 2, depth: 2 },
  { id: 3, name: "Neighbour's fishing boat", lengthBPP: 3, breadth: 3, depth: 3 },
  { id: 4, name: 'Row boat', lengthBPP: 4, breadth: 4, depth: 4 },
];
export const vesselProfiles = [
  { id: 1, name: 'homePage.squat.vessel.bulker' },
  { id: 2, name: 'homePage.squat.vessel.container' },
  { id: 3, name: 'homePage.squat.vessel.ferry' },
  { id: 4, name: 'homePage.squat.vessel.LNG-tanker' },
];
export const fairwayForms = [
  {
    id: 1,
    name: 'homePage.squat.environment.open-water',
    desc: 'homePage.squat.environment.open-water-description',
    img: 'assets/open_water_small.svg',
  },
  { id: 2, name: 'homePage.squat.environment.channel', desc: 'homePage.squat.environment.channel-description', img: 'assets/channel_small.svg' },
  {
    id: 3,
    name: 'homePage.squat.environment.sloped-channel',
    desc: 'homePage.squat.environment.sloped-channel-description',
    img: 'assets/sloped_channel_small.svg',
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
  };
  validations: Record<string, unknown>;
};

const mSquared = (
  <>
    m<sup>2</sup>
  </>
);
const kgPerCubicM = (
  <>
    kg/m<sup>3</sup>
  </>
);

// Declare field parameters
export const fieldParams: Record<string, FieldParam> = {
  lengthBPP: { default: 0, min: 0, max: 350, unit: 'm' },
  breadth: { default: 0, min: 0, max: 50, unit: 'm' },
  draught: { default: 0, min: 0, max: 20, unit: 'm' },
  blockCoefficient: { default: 0.75, min: 0.4, max: 1 },
  displacement: { default: 0, min: 0, max: 250000, unit: 'mt' },
  windSurface: { default: 0, min: 0, max: 25000, unit: mSquared },
  deckCargo: { default: 0, min: 0, max: 20000, unit: mSquared },
  bowThruster: { default: 0, min: 0, max: 5500, unit: 'kW' },
  bowThrusterEfficiency: { default: 100, min: 0, max: 100, unit: '%' },
  profileSelected: { default: 0, min: 0, max: 3 },
  KG: { default: 0, min: 0, max: 20 },
  GM: { default: 0.15, min: 0.15, max: 5 },
  KB: { default: 0, min: 0, max: 15 },
  windSpeed: { default: 0, min: 0, max: 35, unit: 'm/s' },
  windDirection: { default: 90, min: 0, max: 350, unit: 'deg' },
  waveHeight: { default: 0, min: 0, max: 15, unit: 'm' },
  wavePeriod: { default: 0, min: 0, max: 20, unit: 's' },
  sweptDepth: { default: 0, min: 0, max: 20, unit: 'm' },
  waterLevel: { default: 0, min: -150, max: 150, unit: 'cm' },
  waterDepth: { default: 0, min: 0, max: 30, unit: 'm' },
  fairwayForm: { default: 0, min: 0, max: 2 },
  channelWidth: { default: 0, min: 0, unit: 'm' },
  slopeScale: { default: 0, min: 0 },
  slopeHeight: { default: 0, min: 0, unit: 'm' },
  vesselCourse: { default: 0, min: 0, max: 350, unit: 'deg' },
  vesselSpeed: { default: 0, min: 0, max: 35, unit: 'kts' },
  turningRadius: { default: 0.75, min: 0.1, max: 2, unit: 'nm' },
  airDensity: { default: 1.3, min: 1, max: 1.5, unit: kgPerCubicM },
  waterDensity: { default: 1005, min: 1000, max: 1025, unit: kgPerCubicM },
  requiredUKC: { default: 0.5, min: 0.5, max: 5, unit: 'm' },
  safetyMarginWindForce: { default: 25, min: 0, max: 25, unit: '%' },
  motionClearance: { default: 0.3, min: 0, max: 3, unit: 'm' },
};

// Set initially valid fields
let validatedFields = {
  blockCoefficient: true,
  windSurface: true,
  deckCargo: true,
  bowThruster: true,
  bowThrusterEfficiency: true,
  vesselProfile: true,
  GM: true,
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
export const getFieldValue = (fieldName: string, force?: boolean) => {
  const queryParams = new URLSearchParams(window.location.search);
  const defaultValue = fieldParams[fieldName].default;
  const min = fieldParams[fieldName].min;
  const max = fieldParams[fieldName].max;
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
      [fieldName]: currentValue >= min && (max ? currentValue <= max : true),
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
    showDeepWaterValues: false,
    showBarrass: false,
  },
  validations: validatedFields,
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
      };
    }
  | { type: 'reset' }
  | { type: 'url' };

export const SquatReducer = (state: State, action: Action) => {
  // Sort out correct value type from input element
  let inputValue: string | number | number[] | object | boolean = '';
  if (action.type !== 'reset' && action.type !== 'url') {
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
  // Return updated state
  switch (action.type) {
    case 'vessel-select':
      return { ...state, vessel: { ...state.vessel, [action.payload.key]: inputValue } };
    case 'vessel-general':
      return { ...state, vessel: { ...state.vessel, general: { ...state.vessel.general, [action.payload.key]: inputValue } } };
    case 'vessel-detailed':
      return { ...state, vessel: { ...state.vessel, detailed: { ...state.vessel.detailed, [action.payload.key]: inputValue } } };
    case 'vessel-stability':
      return { ...state, vessel: { ...state.vessel, stability: { ...state.vessel.stability, [action.payload.key]: inputValue } } };
    case 'environment-weather':
      return {
        ...state,
        environment: { ...state.environment, weather: { ...state.environment.weather, [action.payload.key]: inputValue } },
      };
    case 'environment-fairway':
      return {
        ...state,
        environment: { ...state.environment, fairway: { ...state.environment.fairway, [action.payload.key]: inputValue } },
      };
    case 'environment-vessel':
      return { ...state, environment: { ...state.environment, vessel: { ...state.environment.vessel, [action.payload.key]: inputValue } } };
    case 'environment-attribute':
      return {
        ...state,
        environment: { ...state.environment, attribute: { ...state.environment.attribute, [action.payload.key]: inputValue } },
      };
    case 'calculations':
      return {
        ...state,
        calculations: { ...state.calculations, [action.payload.key]: inputValue },
      };
    case 'status':
      return {
        ...state,
        status: { ...state.status, [action.payload.key]: inputValue },
      };
    case 'validation':
      return {
        ...state,
        validations: { ...state.validations, [action.payload.key]: inputValue },
      };
    case 'reset':
      return initialState;
    case 'url':
      // Update current url to match state
      window.history.replaceState(null, document.title, createShareableLink(state));
      return state;
    default:
      console.warn(`Unknown action type, state not updated.`);
      return state;
  }
};
