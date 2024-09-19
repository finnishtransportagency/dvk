import { test, Page } from '@playwright/test';
import { checkResults, fillForm, setLocatorValue, TestCase } from './testUtils';

const PORT = process.env.PORT ?? '3000';

const testCases: TestCase[] = [
  {
    name: 'Open Water',
    additionalSetup: async (page: Page) => {},
    expectedResults: {
      'heel-due-wind': '0,54',
      'constant-heel-during-turn': '2,12',
      'corrected-draught': '12,19',
      'corrected-draught-during-turn': '12,63',
      'UKC-vessel-motions': '−0,96',
      'UKC-straight-course': '−0,96',
      'UKC-during-turn': '−1,98',
      'squat-result': '1,37',
      'relative-wind-direction': '35',
      'wind-force': '2,7',
      'wave-force': '9,6',
      'bow-thruster-force': '13,4',
      'remaining-safety-margin': '108,4',
      'minimum-external-force-required': '-',
      'drift-relative-wind-direction': '35',
      'drift-relative-wind-speed': '9',
      'estimated-drift-angle': '0,02',
      'estimated-vessel-breadth-due-drift': '32,32',
    },
  },
  {
    name: 'Sloped Channel',
    additionalSetup: async (page: Page) => {
      await setLocatorValue(page.getByTestId('channelWidth').locator('input'), '200');
      await setLocatorValue(page.getByTestId('slopeHeight').locator('input'), '12', true);
    },
    expectedResults: {
      'heel-due-wind': '0,54',
      'constant-heel-during-turn': '2,12',
      'corrected-draught': '12,19',
      'corrected-draught-during-turn': '12,63',
      'UKC-vessel-motions': '−1,27',
      'UKC-straight-course': '−1,27',
      'UKC-during-turn': '−2,3',
      'squat-result': '1,68',
      'relative-wind-direction': '35',
      'wind-force': '2,7',
      'wave-force': '9,6',
      'bow-thruster-force': '13,4',
      'remaining-safety-margin': '108,4',
      'minimum-external-force-required': '-',
      'drift-relative-wind-direction': '35',
      'drift-relative-wind-speed': '9',
      'estimated-drift-angle': '0,02',
      'estimated-vessel-breadth-due-drift': '32,32',
    },
  },
  {
    name: 'Channel',
    additionalSetup: async (page: Page) => {
      await setLocatorValue(page.getByTestId('channelWidth').locator('input'), '200');
    },
    expectedResults: {
      'heel-due-wind': '0,54',
      'constant-heel-during-turn': '2,12',
      'corrected-draught': '12,19',
      'corrected-draught-during-turn': '12,63',
      'UKC-vessel-motions': '−1,58',
      'UKC-straight-course': '−1,58',
      'UKC-during-turn': '−2,61',
      'squat-result': '1,99',
      'relative-wind-direction': '35',
      'wind-force': '2,7',
      'wave-force': '9,6',
      'bow-thruster-force': '13,4',
      'remaining-safety-margin': '108,4',
      'minimum-external-force-required': '-',
      'drift-relative-wind-direction': '35',
      'drift-relative-wind-speed': '9',
      'estimated-drift-angle': '0,02',
      'estimated-vessel-breadth-due-drift': '32,32',
    },
  },
];

const bulkerSections = [
  {
    name: 'General',
    fields: [
      { name: 'lengthBPP', value: '189.90' },
      { name: 'breadth', value: '32.26' },
      { name: 'draught', value: '12.04' },
    ],
  },
  {
    name: 'Weather',
    fields: [
      { name: 'windSpeed', value: '5', clear: true },
      { name: 'waveHeight', value: '1', clear: true },
      { name: 'wavePeriod', value: '10', clear: true },
    ],
  },
  {
    name: 'Detailed',
    fields: [
      { name: 'windSurface', value: '2500' },
      { name: 'deckCargo', value: '8000' },
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
      { name: 'vesselSpeed', value: '12' },
    ],
  },
];

test.describe('Squat calculations for bulker vessel', () => {
  test('should calculate correct values for bulker + open water', async ({ page }) => {
    const testCase = testCases.find((tc) => tc.name === 'Open Water')!;
    await page.goto(`http://localhost:${PORT}/`);
    await fillForm(page, bulkerSections);
    await page.getByTestId(testCase.name).click();
    await testCase.additionalSetup(page);
    await checkResults(page, testCase.expectedResults);
  });

  test('should calculate correct values for bulker + sloped', async ({ page }) => {
    const testCase = testCases.find((tc) => tc.name === 'Sloped Channel')!;
    await page.goto(`http://localhost:${PORT}/`);
    await fillForm(page, bulkerSections);
    await page.getByTestId(testCase.name).click();
    await testCase.additionalSetup(page);
    await checkResults(page, testCase.expectedResults);
  });

  test('should calculate correct values for bulker + channel', async ({ page }) => {
    const testCase = testCases.find((tc) => tc.name === 'Channel')!;
    await page.goto(`http://localhost:${PORT}/`);
    await fillForm(page, bulkerSections);
    await page.getByTestId(testCase.name).click();
    await testCase.additionalSetup(page);
    await checkResults(page, testCase.expectedResults);
  });
});
