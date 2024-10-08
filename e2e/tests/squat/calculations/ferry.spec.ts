import { test, Page } from '@playwright/test';
import { checkResults, fillForm, setLocatorValue, TestCase } from './testUtils';

const PORT = process.env.PORT ?? '3000';

const testCases: TestCase[] = [
  {
    name: 'Sloped Channel',
    vessel: 'Ferry',
    additionalSetup: async function (page: Page) {
      await page.getByTestId(this.vessel).click();
      await page.getByTestId(this.name).click();
      await setLocatorValue(page.getByTestId('channelWidth').locator('input'), '200');
      await setLocatorValue(page.getByTestId('slopeHeight').locator('input'), '12', true);
    },
    expectedResults: {
      'heel-due-wind': '0,36',
      'constant-heel-during-turn': '8,64',
      'corrected-draught': '8,1',
      'corrected-draught-during-turn': '10,24',
      'UKC-vessel-motions': '2,13',
      'UKC-straight-course': '2,13',
      'UKC-during-turn': '−2,25',
      'squat-result': '2,37',
      'relative-wind-direction': '27',
      'wind-force': '1,7',
      'wave-force': '19,1',
      'bow-thruster-force': '13,4',
      'remaining-safety-margin': '44,4',
      'minimum-external-force-required': '-',
      'drift-relative-wind-direction': '27',
      'drift-relative-wind-speed': '11',
      'estimated-drift-angle': '0,09',
      'estimated-vessel-breadth-due-drift': '31,33',
    },
  },
];

const ferrySections = [
  {
    name: 'General',
    fields: [
      { name: 'lengthBPP', value: '212' },
      { name: 'breadth', value: '31' },
      { name: 'draught', value: '8' },
    ],
  },
  {
    name: 'Weather',
    fields: [
      { name: 'windSpeed', value: '5', clear: true },
      { name: 'waveHeight', value: '1.5', clear: true },
      { name: 'wavePeriod', value: '5', clear: true },
    ],
  },
  {
    name: 'Detailed',
    fields: [
      { name: 'windSurface', value: '2000' },
      { name: 'deckCargo', value: '5000' },
      { name: 'bowThruster', value: '1000' },
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
      { name: 'vesselSpeed', value: '17' },
    ],
  },
];

test.describe('Squat calculations for ferry', () => {
  test('should calculate correct values for ferry + sloped', async ({ page }) => {
    const testCase = testCases.find((tc) => tc.name === 'Sloped Channel')!;
    await page.goto(`http://localhost:${PORT}/`);
    await fillForm(page, ferrySections);
    await testCase.additionalSetup(page);
    await checkResults(page, testCase.expectedResults);
  });
});
