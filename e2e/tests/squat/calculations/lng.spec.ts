import { test, Page } from '@playwright/test';
import { checkResults, fillForm, setLocatorValue, TestCase } from './testUtils';

const PORT = process.env.PORT ?? '3000';

const testCases: TestCase[] = [
  {
    name: 'Sloped Channel',
    vessel: 'LNG Tanker',
    additionalSetup: async function (page: Page) {
      await page.getByTestId(this.vessel).click();
      await page.getByTestId(this.name).click();
      await setLocatorValue(page.getByTestId('channelWidth').locator('input'), '200');
      await setLocatorValue(page.getByTestId('slopeHeight').locator('input'), '12', true);
    },
    expectedResults: {
      'heel-due-wind': '1,27',
      'constant-heel-during-turn': '7,64',
      'corrected-draught': '8,33',
      'corrected-draught-during-turn': '9,89',
      'UKC-vessel-motions': '2,01',
      'UKC-straight-course': '2,01',
      'UKC-during-turn': '−1,45',
      'squat-result': '2,26',
      'relative-wind-direction': '39',
      'wind-force': '7,7',
      'wave-force': '37,9',
      'bow-thruster-force': '20,1',
      'remaining-safety-margin': '−26,6',
      'minimum-external-force-required': '5,3',
      'drift-relative-wind-direction': '39',
      'drift-relative-wind-speed': '12',
      'estimated-drift-angle': '0,11',
      'estimated-vessel-breadth-due-drift': '29,82',
    },
  },
];

const lngSections = [
  {
    name: 'General',
    fields: [
      { name: 'lengthBPP', value: '170' },
      { name: 'breadth', value: '29.5' },
      { name: 'draught', value: '8' },
    ],
  },
  {
    name: 'Weather',
    fields: [
      { name: 'windSpeed', value: '8', clear: true },
      { name: 'waveHeight', value: '2', clear: true },
      { name: 'wavePeriod', value: '4', clear: true },
    ],
  },
  {
    name: 'Detailed',
    fields: [
      { name: 'windSurface', value: '2500' },
      { name: 'deckCargo', value: '5000' },
      { name: 'bowThruster', value: '1500' },
    ],
  },
  {
    name: 'Fairway',
    fields: [
      { name: 'sweptDepth', value: '12.5', clear: true },
      { name: 'waterLevel', value: '10' },
      { name: 'waterDepth', value: '23' },
    ],
  },
  { name: 'Stability', fields: [{ name: 'KG', value: '8' }] },
  {
    name: 'Vessel',
    fields: [
      { name: 'vesselCourse', value: '10', clear: true },
      { name: 'vesselSpeed', value: '16' },
    ],
  },
];

test.describe('Squat calculations for LNG Tanker', () => {
  test('should calculate correct values for LNG Tanker + sloped', async ({ page }) => {
    const testCase = testCases.find((tc) => tc.name === 'Sloped Channel')!;
    await page.goto(`http://localhost:${PORT}/`);
    await fillForm(page, lngSections);
    await testCase.additionalSetup(page);
    await checkResults(page, testCase.expectedResults);
  });
});
