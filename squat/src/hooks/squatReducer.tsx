// Common interfaces

interface Vessel {
  id: number;
  name: string;
  lengthBPP: number;
  breadth: number;
  depth: number;
};

interface VesselProfile {
  id: number;
  name: string;
};

interface FairwayForm {
  id: number;
  name: string;
  desc: string;
  img: string;
};

// Initialize data

// TODO: Load vessels from indexedDB / LocalStorage
export const vessels = [
  { id: 0, name: "None", lengthBPP: 0, breadth: 0, depth: 0 },
  { id: 1, name: "Big rig", lengthBPP: 1, breadth: 1, depth: 1 },
  { id: 2, name: "My Yacht", lengthBPP: 2, breadth: 2, depth: 2 },
  { id: 3, name: "Neighbour's fishing boat", lengthBPP: 3, breadth: 3, depth: 3 },
  { id: 4, name: "Row boat", lengthBPP: 4, breadth: 4, depth: 4 }
];
export const vesselProfiles = [
  { id: 1, name: "homePage.squat.vessel.bulker" },
  { id: 2, name: "homePage.squat.vessel.container" },
  { id: 3, name: "homePage.squat.vessel.ferry" },
  { id: 4, name: "homePage.squat.vessel.lng-tanker" }
];
export const fairwayForms = [
  { id: 1, name: "homePage.squat.environment.open-water", desc: "homePage.squat.environment.open-water-description", img: "assets/fairway-A.png" },
  { id: 2, name: "homePage.squat.environment.channel", desc: "homePage.squat.environment.channel-description", img: "assets/fairway-C.png" },
  { id: 3, name: "homePage.squat.environment.sloped-channel", desc: "homePage.squat.environment.sloped-channel-description", img: "assets/fairway-B.png" }
];

// Set up reducer and state properties

export type State = {
  vessel: {
    vesselSelected: Vessel|null;
    general: {
      lengthBPP: number;
      breadth: number;
      draught: number;
      blockCoefficient: number;
      displacement: number;
    },
    detailed: {
      windSurface: number;
      deckCargo: number;
      bowThruster: number;
      bowThrusterEfficiency: number;
      profileSelected: VesselProfile|null;
    },
    stability: {
      KG: number;
      GM: number;
      KB: number;
    }
  },
  environment: {
    weather: {
      windSpeed: number;
      windDirection: number;
      waveHeight: number;
      wavePeriod: number;
    },
    fairway: {
      sweptDepth: number;
      waterLevel: number;
      fairwayForm: FairwayForm|null;
      channelWidth: number;
      slopeScale: number;
      slopeHeight: number;
    },
    vessel: {
      vesselCourse: number;
      vesselSpeed: number;
      turningRadius: number;
    },
    attribute: {
      airDensity: number;
      waterDensity: number;
      requiredUKC: number;
      safetyMarginWindForce: number;
    }
  }
};

export type Action =
  | {
      type: 'vessel-select' | 'vessel-general' | 'vessel-detailed' | 'vessel-stability'
        | 'environment-weather' | 'environment-fairway' | 'environment-vessel' | 'environment-attribute';
      payload: {
        key: string;
        value: string;
      };
    }
  | { type: 'reset' };

export const initialState = {
  vessel: {
    vesselSelected: null,
    general: {
      lengthBPP: 0,
      breadth: 0,
      draught: 0,
      blockCoefficient: 0.75,
      displacement: 0
    },
    detailed: {
      windSurface: 0,
      deckCargo: 0,
      bowThruster: 0,
      bowThrusterEfficiency: 100,
      profileSelected: vesselProfiles[0]
    },
    stability: {
      KG: 0,
      GM: 0,
      KB: 0
    }
  },
  environment: {
    weather: {
      windSpeed: 0,
      windDirection: 90,
      waveHeight: 0,
      wavePeriod: 0
    },
    fairway: {
      sweptDepth: 0,
      waterLevel: 0,
      fairwayForm: fairwayForms[0],
      channelWidth: 0,
      slopeScale: 0,
      slopeHeight: 0
    },
    vessel: {
      vesselCourse: 0,
      vesselSpeed: 0,
      turningRadius: 0.75
    },
    attribute: {
      airDensity: 1.3,
      waterDensity: 1005,
      requiredUKC: 0.5,
      safetyMarginWindForce: 25
    }
  }
};

export const SquatReducer = (state: State, action: Action) => {
  switch (action.type) {
    case 'vessel-select':
      return { ...state, vessel: { ...state.vessel, [action.payload.key]: action.payload.value } };
    case 'vessel-general':
      return { ...state, vessel: { ...state.vessel, general: { ...state.vessel.general, [action.payload.key]: action.payload.value } } };
    case 'vessel-detailed':
      return { ...state, vessel: { ...state.vessel, detailed: { ...state.vessel.detailed, [action.payload.key]: action.payload.value } } };
    case 'vessel-stability':
      return { ...state, vessel: { ...state.vessel, stability: { ...state.vessel.stability, [action.payload.key]: action.payload.value } } };
    case 'environment-weather':
      return { ...state, environment: { ...state.environment, weather: { ...state.environment.weather, [action.payload.key]: action.payload.value } } };
    case 'environment-fairway':
      return { ...state, environment: { ...state.environment, fairway: { ...state.environment.fairway, [action.payload.key]: action.payload.value } } };
    case 'environment-vessel':
      return { ...state, environment: { ...state.environment, vessel: { ...state.environment.vessel, [action.payload.key]: action.payload.value } } };
    case 'environment-attribute':
      return { ...state, environment: { ...state.environment, attribute: { ...state.environment.attribute, [action.payload.key]: action.payload.value } } };
    case 'reset':
      return initialState;
    default:
      //throw new Error(`Unknown action type: ${action}`);
      return state;
  }
};
