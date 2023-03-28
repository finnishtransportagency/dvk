import { FairwayCardInput, Operation, OperationError, Status } from '../graphql/generated';
import { CurrentUser } from '../lib/lambda/api/login';
import { mapFairwayCardToModel } from '../lib/lambda/graphql/mutation/saveFairwayCard-handler';

const currentUser: CurrentUser = { firstName: 'Test', lastName: 'Test', uid: 'test', roles: [] };
test('test mapFairwayCardToModel minimal', () => {
  expect(() => mapFairwayCardToModel({} as FairwayCardInput, undefined, currentUser)).toThrow(OperationError.InvalidInput);
  const input: FairwayCardInput = {
    id: 'a1',
    name: { fi: 'test', sv: 'testsv', en: 'testen' },
    n2000HeightSystem: false,
    operation: Operation.Create,
    status: Status.Draft,
    group: '1',
    fairwayIds: [1],
  };
  expect(mapFairwayCardToModel(input, undefined, currentUser)).toMatchSnapshot({
    modificationTimestamp: expect.any(Number),
    creationTimestamp: expect.any(Number),
  });
});

test('test mapFairwayCardToModel all', () => {
  const input: FairwayCardInput = {
    id: 'a2',
    name: { fi: 'test2', sv: 'testsv2', en: 'testen2' },
    n2000HeightSystem: true,
    operation: Operation.Update,
    status: Status.Public,
    group: '1',
    fairwayIds: [1],
    anchorage: {
      fi: 'anchorage',
      sv: 'anchoragesv',
      en: 'anchorageen',
    },
    attention: {
      fi: 'attentionfi',
      sv: 'attentionsv',
      en: 'attentionen',
    },
    designSpeed: {
      fi: 'designSpeed',
      sv: 'designSpeedsv',
      en: 'designSpeeden',
    },
    generalInfo: {
      fi: 'generalInfo',
      sv: 'generalInfosv',
      en: 'generalInfoen',
    },
    harbors: ['1'],
    iceCondition: {
      fi: 'iceCondition',
      sv: 'iceConditionsv',
      en: 'iceConditionen',
    },
    lineText: {
      fi: 'lineText',
      sv: 'lineTextsv',
      en: 'lineTexten',
    },
    navigationCondition: {
      fi: 'navigationCondition',
      sv: 'navigationConditionsv',
      en: 'navigationConditionen',
    },
    primaryFairwayId: 1,
    seaLevel: {
      fi: 'seaLevel',
      sv: 'seaLevelsv',
      en: 'seaLevelen',
    },
    secondaryFairwayId: 1,
    speedLimit: {
      fi: 'speedLimit',
      sv: 'speedLimitsv',
      en: 'speedLimiten',
    },
    trafficService: {
      pilot: {
        email: 'i@fi',
        extraInfo: {
          fi: 'extraInfo',
          sv: 'extraInfosv',
          en: 'extraInfoen',
        },
        fax: '123',
        internet: 'www',
        phoneNumber: '1234',
        places: [{ id: 1, pilotJourney: 0 }],
      },
      tugs: [
        {
          name: {
            fi: 'name',
            sv: 'namesv',
            en: 'nameen',
          },
          email: 'test@fi',
          fax: '12',
          phoneNumber: ['+358'],
        },
      ],
      vts: [
        {
          name: {
            fi: 'name',
            sv: 'namesv',
            en: 'nameen',
          },
          email: ['email@fi'],
          phoneNumber: '789',
          vhf: [
            {
              name: {
                fi: 'name',
                sv: 'namesv',
                en: 'nameen',
              },
              channel: 0,
            },
          ],
        },
      ],
    },
    vesselRecommendation: {
      fi: 'vesselRecommendation',
      sv: 'vesselRecommendationsv',
      en: 'vesselRecommendationen',
    },
    visibility: {
      fi: 'visibility',
      sv: 'visibilitysv',
      en: 'visibilityen',
    },
    windGauge: {
      fi: 'windGauge',
      sv: 'windGaugesv',
      en: 'windGaugeen',
    },
    windRecommendation: {
      fi: 'windRecommendation',
      sv: 'windRecommendationsv',
      en: 'windRecommendationen',
    },
  };
  expect(mapFairwayCardToModel(input, undefined, currentUser)).toMatchSnapshot({
    modificationTimestamp: expect.any(Number),
    creationTimestamp: expect.any(Number),
  });
});
