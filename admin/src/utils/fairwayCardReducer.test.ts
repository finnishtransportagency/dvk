import { FairwayCardInput, Operation, Orientation, Status } from '../graphql/generated';
import { ValidationParameters } from './fairwayCardReducer';

export function getTestState(): FairwayCardInput {
  return {
    fairwayIds: [1, 2, 3],
    primaryFairwayId: [
      { id: 1, sequenceNumber: 1 },
      { id: 2, sequenceNumber: 2 },
    ],
    secondaryFairwayId: [
      { id: 1, sequenceNumber: 1 },
      { id: 2, sequenceNumber: 3 },
      { id: 3, sequenceNumber: 2 },
    ],
    group: 'archipelago',
    harbors: ['a', 'b'],
    pilotRoutes: [4, 5],
    id: 'originalid',
    n2000HeightSystem: true,
    publishDetails: 'pubdetails',
    name: { fi: 'namefi', sv: 'namesv', en: 'nameen' },
    status: Status.Draft,
    version: '1',
    operation: Operation.Update,
    lineText: { fi: 'linefi', sv: 'linesv', en: 'lineen' },
    speedLimit: { fi: 'speedlimitfi', sv: 'speedlimitsv', en: 'speedlimiten' },
    designSpeed: { fi: 'designspeedfi', sv: 'designspeedsv', en: 'designspeeden' },
    anchorage: { fi: 'anchoragefi', sv: 'anchoragesv', en: 'anchorageen' },
    navigationCondition: { fi: 'navigationconditionfi', sv: 'navigationconditionsv', en: 'navigationconditionen' },
    iceCondition: { fi: 'iceconditionfi', sv: 'iceconditionsv', en: 'iceconditionen' },
    windRecommendation: { fi: 'windrecommendationfi', sv: 'windrecommendationsv', en: 'windrecommendationen' },
    vesselRecommendation: { fi: 'vesselrecommendationfi', sv: 'vesselrecommendationsv', en: 'vesselrecommendationen' },
    visibility: { fi: 'visibilityfi', sv: 'visibilitysv', en: 'visibilityen' },
    mareographs: [7, 8, 9],
    squatCalculations: [
      {
        place: { fi: 'squat1placefi', sv: 'squat1placesv', en: 'squat1placeen' },
        targetFairways: [1, 2],
        suitableFairwayAreas: [10, 11],
        depth: 10,
        estimatedWaterDepth: '11',
        fairwayForm: 0,
      },
    ],
    temporaryNotifications: [{ content: { fi: 'contentfi', sv: 'contentsv', en: 'contenten' }, startDate: '01012000', endDate: '12122001' }],
    trafficService: {
      pilot: {
        extraInfo: { fi: 'extrainfofi', sv: 'extrainfosv', en: 'extrainfoen' },
        phoneNumber: '04013579',
        fax: '04013578',
        internet: 'pilots.com',
        places: [
          {
            id: 1,
            pilotJourney: '9',
          },
          {
            id: 2,
            pilotJourney: '10',
          },
        ],
      },
      vts: [
        {
          name: { fi: 'vts1fi', sv: 'vts1sv', en: 'vts1en' },
          email: ['vts1@gmail.com'],
          phoneNumber: '0123987654',
          vhf: [
            {
              channel: 'channel1',
              name: { fi: 'vhf1fi', sv: 'vhf1sv', en: 'vhf1en' },
            },
          ],
        },
      ],
      tugs: [
        {
          name: { fi: 'tug1fi', sv: 'tug1sv', en: 'tug1en' },
          email: 'tug1@gmail.com',
          phoneNumber: ['0123456789'],
          fax: '000111222',
        },
      ],
    },
    pictures: [
      {
        groupId: 1,
        id: 'pix1',
        lang: 'fi',
        legendPosition: 'sw',
        modificationTimestamp: 0,
        orientation: Orientation.Landscape,
        rotation: 45,
        scaleLabel: 'scalelabel',
        scaleWidth: '20',
        sequenceNumber: 1,
        text: 'pixtext',
      },
    ],
  };
}

export const emptyValidationParameters: ValidationParameters = {
  validationErrors: [],
  setValidationErrors: () => {},
  reservedIds: [],
};

test('dummy', () => {});
