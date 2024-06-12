import { HarborInput, Operation, OperationError, Status } from '../graphql/generated';
import { CurrentUser } from '../lib/lambda/api/login';
import { mapHarborToModel } from '../lib/lambda/graphql/mutation/saveHarbor-handler';

const currentUser: CurrentUser = { firstName: 'Test', lastName: 'Test', uid: 'test', roles: [] };
test('test mapHarborToModel minimal', () => {
  expect(() => mapHarborToModel({} as HarborInput, undefined, currentUser)).toThrow(OperationError.InvalidInput);
  const input: HarborInput = {
    id: 'a1',
    version: 'v2',
    name: { fi: 'test', sv: 'testsv', en: 'testen' },
    n2000HeightSystem: false,
    operation: Operation.Create,
    geometry: { lat: '60', lon: '20' },
    status: Status.Draft,
  };
  expect(mapHarborToModel(input, undefined, currentUser)).toMatchSnapshot({
    modificationTimestamp: expect.any(Number),
    creationTimestamp: expect.any(Number),
  });
});

test('test mapHarborToModel all', () => {
  const input: HarborInput = {
    id: 'a2',
    version: 'v2',
    name: { fi: 'test2', sv: 'testsv2', en: 'testen2' },
    n2000HeightSystem: true,
    operation: Operation.Update,
    geometry: { lat: '62', lon: '18' },
    status: Status.Public,
    cargo: {
      fi: 'cargofi',
      sv: 'cargosv',
      en: 'cargoen',
    },
    company: {
      fi: 'companyfi',
      sv: 'companysv',
      en: 'companyen',
    },
    email: 'email@fi',
    extraInfo: {
      fi: 'extrafi',
      sv: 'extrasv',
      en: 'extraen',
    },
    fax: '32321',
    internet: 'www.fi',
    phoneNumber: ['12345', '22222'],
    harborBasin: {
      fi: 'basinfi',
      sv: 'basinsv',
      en: 'basinen',
    },
    quays: [
      {
        extraInfo: {
          fi: 'cargofi',
          sv: 'cargosv',
          en: 'cargoen',
        },
        name: {
          fi: 'cargofi',
          sv: 'cargosv',
          en: 'cargoen',
        },
        geometry: { lat: '63.2', lon: '22.1' },
        length: '123',
        sections: [
          {
            depth: '10',
            geometry: { lat: '62.2', lon: '17' },
            name: 'stest',
          },
        ],
      },
    ],
  };
  expect(mapHarborToModel(input, undefined, currentUser)).toMatchSnapshot({
    modificationTimestamp: expect.any(Number),
    creationTimestamp: expect.any(Number),
  });
});
