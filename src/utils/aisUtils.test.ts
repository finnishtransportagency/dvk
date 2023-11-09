import { getCountryCode } from './aisUtils';

test('get correct country code from mmsi', () => {
  expect(getCountryCode(230111000)?.code).toBe('FI');
  expect(getCountryCode(636222662)?.code).toBe('LR');
  expect(getCountryCode(538333443)?.code).toBe('MH');
  expect(getCountryCode(255444660)?.code).toBe('PT');
  expect(getCountryCode(376555000)?.code).toBe('VC');
  expect(getCountryCode(999999999)?.code).toBe(undefined);
});
