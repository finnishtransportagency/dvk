import { test, Page } from '@playwright/test';
import { checkResults, fillForm, setLocatorValue, TestCase } from './testUtils';

const PORT = process.env.PORT ?? '3000';

const testCases: TestCase[] = [
  {
    name: 'Sloped Channel',
    vessel: 'Container',
    additionalSetup: async function (page: Page) {
      await page.getByTestId(this.vessel).click();
      await page.getByTestId(this.name).click();
      await setLocatorValue(page.getByTestId('channelWidth').locator('input'), '200');
      await setLocatorValue(page.getByTestId('slopeHeight').locator('input'), '12', true);
    },
    expectedResults: {
      'heel-due-wind': '0,06',
      'constant-heel-during-turn': '3,34',
      'corrected-draught': '11,04',
      'corrected-draught-during-turn': '12,03',
      'UKC-vessel-motions': '0,52',
      'UKC-straight-course': '0,52',
      'UKC-during-turn': '−1,47',
      'squat-result': '1,04',
      'relative-wind-direction': '20',
      'wind-force': '0,3',
      'wave-force': '1,5',
      'bow-thruster-force': '16,1',
      'remaining-safety-margin': '189,1',
      'minimum-external-force-required': '-',
      'drift-relative-wind-direction': '20',
      'drift-relative-wind-speed': '6',
      'estimated-drift-angle': '0,05',
      'estimated-vessel-breadth-due-drift': '35,37',
    },
  },
];

const containerSections = [
  {
    name: 'General',
    fields: [
      { name: 'lengthBPP', value: '200' },
      { name: 'breadth', value: '35.20' },
      { name: 'draught', value: '11.02' },
    ],
  },
  {
    name: 'Weather',
    fields: [
      { name: 'windSpeed', value: '2', clear: true },
      { name: 'waveHeight', value: '0.5', clear: true },
      { name: 'wavePeriod', value: '2', clear: true },
    ],
  },
  {
    name: 'Detailed',
    fields: [
      { name: 'windSurface', value: '2700' },
      { name: 'deckCargo', value: '10000' },
      { name: 'bowThruster', value: '1200' },
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
  { name: 'Stability', fields: [{ name: 'KG', value: '10' }] },
  {
    name: 'Vessel',
    fields: [
      { name: 'vesselCourse', value: '10', clear: true },
      { name: 'vesselSpeed', value: '10' },
    ],
  },
];

test.describe('Squat calculations for Container', () => {
  test('should calculate correct values for Container + sloped', async ({ page }) => {
    const testCase = testCases.find((tc) => tc.name === 'Sloped Channel')!;
    await page.goto(`http://localhost:${PORT}/`);
    await fillForm(page, containerSections);
    await testCase.additionalSetup(page);
    await checkResults(page, testCase.expectedResults);
  });
});
