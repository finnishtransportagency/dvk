import { getCountryCode } from './aisUtils';

test('get correct country code from mmsi', () => {
  expect(getCountryCode(230111000)).toBe('FI');
  expect(getCountryCode(636222662)).toBe('LR');
  expect(getCountryCode(538333443)).toBe('MH');
  expect(getCountryCode(255444660)).toBe('PT');
  expect(getCountryCode(376555000)).toBe('VC');
});
