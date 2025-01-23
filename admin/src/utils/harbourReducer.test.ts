import { HarborInput, Operation, Status } from '../graphql/generated';

export const testState: HarborInput = {
  id: 'originalid',
  n2000HeightSystem: true,
  publishDetails: 'pubdetails',
  name: { fi: 'namefi', sv: 'namesv', en: 'nameen' },
  extraInfo: { fi: 'extrainfofi', sv: 'extrainfosv', en: 'extrainfoen' },
  harborBasin: { fi: 'basinfi', sv: 'basinsv', en: 'basinen' },
  company: { fi: 'cofi', sv: 'cosv', en: 'coen' },
  email: 'harbour@gmail.com',
  phoneNumber: ['0123456789'],
  internet: 'www.harbours.org',
  cargo: { fi: 'cargofi', sv: 'cargosv', en: 'cargoen' },
  status: Status.Draft,
  version: '1',
  operation: Operation.Update,
  geometry: { lat: '20', lon: '60' },
  quays: [
    {
      extraInfo: { fi: 'quayinfo1fi', sv: 'quayinfo1sv', en: 'quayinfo1en' },
      geometry: { lat: '20.1', lon: '60.1' },
      length: '10',
      name: { fi: 'quayname1fi', sv: 'quayname1sv', en: 'quayname1en' },
      sections: [
        {
          name: 'section1',
          depth: '100',
          geometry: { lat: '20.2', lon: '60.2' },
        },
      ],
    },
  ],
};

test('dummy', () => {});
