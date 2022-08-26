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

// Initialize field values from url parameter if set and check validity
let validatedFields = {
  blockCoefficient: true,
  displacement: true,
  bowThrusterEfficiency: true,
  deckCargo: true,
  GM: true,
  windDirection: true,
  turningRadius: true,
};

export const getFieldValue = (fieldName: string, defaultValue: number, min?: number, max?: number, force?: boolean) => {
  const queryParams = new URLSearchParams(window.location.search);
  let currentValue = queryParams.get(fieldName) ? Number(queryParams.get(fieldName)?.replace(',', '.')) : defaultValue;

  if (force) {
    if ((min || typeof min == 'number') && currentValue < min) {
      currentValue = min;
    } else if (max && currentValue > max) {
      currentValue = max;
    }
  }
  // Set field validity if other than default value
  if (currentValue !== defaultValue) {
    validatedFields = {
      ...validatedFields,
      [fieldName]: (min || typeof min == 'number' ? currentValue >= min : true) && (max ? currentValue <= max : true),
    };
  }
  return currentValue;
};

// Set initial state
export const initialState = {
  vessel: {
    vesselSelected: null,
    general: {
      lengthBPP: getFieldValue('lengthBPP', 0, 0, 350),
      breadth: getFieldValue('breadth', 0, 0, 50),
      draught: getFieldValue('draught', 0, 0, 20),
      blockCoefficient: getFieldValue('blockCoefficient', 0.75, 0.4, 1),
      displacement: getFieldValue('displacement', 0, 0, 250000),
    },
    detailed: {
      windSurface: getFieldValue('windSurface', 0, 0, 25000),
      deckCargo: getFieldValue('deckCargo', 0, 0, 20000),
      bowThruster: getFieldValue('bowThruster', 0, 0, 5500),
      bowThrusterEfficiency: getFieldValue('bowThrusterEfficiency', 100, 0, 100),
      profileSelected: vesselProfiles[getFieldValue('profileSelected', 0, 0, 3, true)],
    },
    stability: {
      KG: getFieldValue('KG', 0, 0, 20),
      GM: getFieldValue('GM', 0.15, 0.15, 5),
      KB: getFieldValue('KB', 0, 0, 15),
    },
  },
  environment: {
    weather: {
      windSpeed: getFieldValue('windSpeed', 0, 0, 35),
      windDirection: getFieldValue('windDirection', 90, 0, 350),
      waveHeight: getFieldValue('waveHeight', 0, 0, 15),
      wavePeriod: getFieldValue('wavePeriod', 0, 0, 20),
      waveLength: [0, 0],
      waveAmplitude: [0, 0],
    },
    fairway: {
      sweptDepth: getFieldValue('sweptDepth', 0, 0, 20),
      waterLevel: getFieldValue('waterLevel', 0, -1.5, 1.5),
      waterDepth: getFieldValue('waterDepth', 0, 0, 30),
      fairwayForm: fairwayForms[getFieldValue('fairwayForm', 0, 0, 2, true)],
      channelWidth: getFieldValue('channelWidth', 0, 0),
      slopeScale: getFieldValue('slopeScale', 0, 0),
      slopeHeight: getFieldValue('slopeHeight', 0, 0),
    },
    vessel: {
      vesselCourse: getFieldValue('vesselCourse', 0, 0, 350),
      vesselSpeed: getFieldValue('vesselSpeed', 0, 0, 35),
      turningRadius: getFieldValue('turningRadius', 0.75, 0.1, 2),
    },
    attribute: {
      airDensity: getFieldValue('airDensity', 1.3, 1, 1.5),
      waterDensity: getFieldValue('waterDensity', 1005, 1000, 1025),
      requiredUKC: getFieldValue('requiredUKC', 0.5, 0.5, 5),
      safetyMarginWindForce: getFieldValue('safetyMarginWindForce', 25, 0, 25),
      motionClearance: getFieldValue('motionClearance', 0.3, 0, 3),
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

// Reset current url
//window.history.replaceState(null, document.title, window.location.href.split('?')[0]);

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
    default:
      console.warn(`Unknown action type, state not updated.`);
      return state;
  }
};
