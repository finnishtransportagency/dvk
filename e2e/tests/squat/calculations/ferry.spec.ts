import { test, expect, Page, Locator } from '@playwright/test';

const PORT = process.env.PORT ?? '3000';

test.describe('Squat calculations for bulker vessel', () => {
  test('should calculate correct values for bulker + open water', async ({ page }) => {
    await page.goto(`http://localhost:${PORT}/`);
    await fillFormAndCheckResults(page);
  });

  test('should calculate correct values for bulker + sloped', async ({ page }) => {
    await page.goto(`http://localhost:${PORT}/`);
    await fillFormAndCheckResults(page);
  });

  test('should calculate correct values for bulker + channel', async ({ page }) => {
    await page.goto(`http://localhost:${PORT}/`);
    await fillFormAndCheckResults(page);
  });
});

async function fillFormAndCheckResults(page: Page) {
  // default is bulker and open water
  await fillGeneralSection(page);
  await fillWeatherSection(page);
  await fillDetailedSection(page);
  await fillFairwaySection(page);
  //   await checkStabilitySection(page);
  //   await checkVesselSection(page);
  //   await checkAttributeSection(page);

  //   await verifyResults(page);
}

async function setLocatorValue(locator: Locator, value: string, clear: boolean = false) {
  if (clear) await locator.clear();
  await locator.fill(value);
  await locator.press('Tab');
}

async function fillGeneralSection(page: Page) {
  // TODO: default is bulker and open water
  const lengthBPP = page.getByTestId('lengthBPP').locator('input');
  await lengthBPP.fill('189.90');
  await lengthBPP.press('Tab');
  const breadth = page.getByTestId('breadth').locator('input');
  await breadth.fill('32.26');
  await breadth.press('Tab');
  const draught = page.getByTestId('draught').locator('input');
  await draught.fill('12.04');
  await draught.press('Tab');
}

async function fillWeatherSection(page: Page) {
  //TODO: default is bulker and open water
  const windSpeed = page.getByTestId('windSpeed').locator('input');
  await windSpeed.clear(); // weather values are not always updating without clear
  await windSpeed.fill('5');
  await windSpeed.press('Tab');
  const waveHeight = page.getByTestId('waveHeight').locator('input');
  await waveHeight.clear();
  await waveHeight.fill('1');
  await waveHeight.press('Tab');
  const wavePeriod = page.getByTestId('wavePeriod').locator('input');
  await wavePeriod.clear();
  await wavePeriod.fill('10');
  await wavePeriod.press('Tab');
}

async function fillDetailedSection(page: Page) {
  const windSurface = page.getByTestId('windSurface').locator('input');
  await windSurface.fill('2500');
  await windSurface.press('Tab');
  const deckCargo = page.getByTestId('deckCargo').locator('input');
  await deckCargo.fill('8000');
  await deckCargo.press('Tab');
  const bowThruster = page.getByTestId('bowThruster').locator('input');
  await bowThruster.fill('1000');
  await bowThruster.press('Tab');
}

async function fillFairwaySection(page: Page) {
  const sweptDepth = page.getByTestId('sweptDepth').locator('input');
  await sweptDepth.clear();
  await sweptDepth.fill('12.5');
  await sweptDepth.press('Tab');
  const waterLevel = page.getByTestId('waterLevel').locator('input');
  await waterLevel.fill('10');
  await waterLevel.press('Tab');
  const waterDepth = page.getByTestId('waterDepth').locator('input');
  await waterDepth.fill('23');
  await waterDepth.press('Tab');
}

async function fillStabilitySection(page: Page) {
  await expect(page.getByTestId('KG')).toBeVisible();
  await expect(page.getByTestId('GM')).toBeVisible();
  await expect(page.getByTestId('KB')).toBeVisible();
}

async function fillVesselSection(page: Page) {
  await expect(page.getByTestId('vesselCourse')).toBeVisible();
  await expect(page.getByTestId('vesselSpeed')).toBeVisible();
  await expect(page.getByTestId('turningRadius')).toBeVisible();
}

async function fillAttributeSection(page: Page) {
  await expect(page.getByTestId('airDensity')).toBeVisible();
  await expect(page.getByTestId('waterDensity')).toBeVisible();
  await expect(page.getByTestId('requiredUKC')).toBeVisible();
  await expect(page.getByTestId('motionClearance')).toBeVisible();
  await expect(page.getByTestId('safetyMarginWindForce')).toBeVisible();
}
