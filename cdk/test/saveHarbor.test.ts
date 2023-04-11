import { HarborInput, Operation, OperationError, Status } from '../graphql/generated';
import { CurrentUser } from '../lib/lambda/api/login';
import { mapHarborToModel } from '../lib/lambda/graphql/mutation/saveHarbor-handler';

const currentUser: CurrentUser = { firstName: 'Test', lastName: 'Test', uid: 'test', roles: [] };
test('test mapHarborToModel minimal', () => {
  expect(() => mapHarborToModel({} as HarborInput, undefined, currentUser)).toThrow(OperationError.InvalidInput);
  const input: HarborInput = {
    id: 'a1',
    name: { fi: 'test', sv: 'testsv', en: 'testen' },
    n2000HeightSystem: false,
    operation: Operation.Create,
    geometry: { lat: '2', lon: '1' },
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
    name: { fi: 'test2', sv: 'testsv2', en: 'testen2' },
    n2000HeightSystem: true,
    operation: Operation.Update,
    geometry: { lat: '22', lon: '11' },
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
    fax: '323',
    internet: 'www.fi',
    phoneNumber: ['1', '22'],
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
        geometry: { lat: '33.2', lon: '222.1' },
        length: '123',
        sections: [
          {
            depth: '10',
            geometry: { lat: '62.2', lon: '123' },
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
