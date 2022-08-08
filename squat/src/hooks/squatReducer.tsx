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
    intermediate: {
      froudeNumber: number;
    };
  };
  status: {
    showDeepWaterValues: boolean;
    showBarrass: boolean;
  };
  validations: Record<string, unknown>;
};

export const initialState = {
  vessel: {
    vesselSelected: null,
    general: {
      lengthBPP: 0,
      breadth: 0,
      draught: 0,
      blockCoefficient: 0.75,
      displacement: 0,
    },
    detailed: {
      windSurface: 0,
      deckCargo: 0,
      bowThruster: 0,
      bowThrusterEfficiency: 100,
      profileSelected: vesselProfiles[0],
    },
    stability: {
      KG: 0,
      GM: 0,
      KB: 0,
    },
  },
  environment: {
    weather: {
      windSpeed: 0,
      windDirection: 90,
      waveHeight: 0,
      wavePeriod: 0,
      waveLength: [0, 0],
      waveAmplitude: [0, 0],
    },
    fairway: {
      sweptDepth: 0,
      waterLevel: 0,
      waterDepth: 0,
      fairwayForm: fairwayForms[0],
      channelWidth: 0,
      slopeScale: 0,
      slopeHeight: 0,
    },
    vessel: {
      vesselCourse: 0,
      vesselSpeed: 0,
      turningRadius: 0.75,
    },
    attribute: {
      airDensity: 1.3,
      waterDensity: 1005,
      requiredUKC: 0.5,
      safetyMarginWindForce: 25,
      motionClearance: 0.3,
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
    intermediate: {
      froudeNumber: 0,
    },
  },
  status: {
    showDeepWaterValues: false,
    showBarrass: false,
  },
  validations: { blockCoefficient: true, displacement: true, bowThrusterEfficiency: true, deckCargo: true, windDirection: true, turningRadius: true },
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
        | 'calculations-intermediate'
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
    case 'calculations-intermediate':
      return {
        ...state,
        calculations: { ...state.calculations, intermediate: { ...state.calculations.intermediate, [action.payload.key]: inputValue } },
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
