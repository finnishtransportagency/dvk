import { test, expect, Page } from '@playwright/test';

const PORT = process.env.PORT ?? '3000';

test.describe('Squat calculator in different languages', () => {
  test('should display all fields in every language', async ({ page }) => {
    await page.goto(`http://localhost:${PORT}/`);
    await page.getByRole('button', { name: 'På svenska' }).click();
    await checkSections(page);

    await page.getByRole('button', { name: 'In English' }).click();
    await checkSections(page);

    await page.getByRole('button', { name: 'Suomeksi' }).click();
    await checkSections(page);
  });
});

async function checkSections(page: Page) {
  await checkGeneralSection(page);
  await checkWeatherSection(page);
  await checkDetailedSection(page);
  await checkFairwaySection(page);
  await checkStabilitySection(page);
  await checkVesselSection(page);
  await checkAttributeSection(page);
}

async function checkGeneralSection(page: Page) {
  await expect(page.getByTestId('lengthBPP')).toBeVisible();
  await expect(page.getByTestId('breadth')).toBeVisible();
  await expect(page.getByTestId('draught')).toBeVisible();
  await expect(page.getByTestId('blockCoefficient')).toBeVisible();
  await expect(page.getByTestId('displacement')).toBeVisible();
}

async function checkWeatherSection(page: Page) {
  await expect(page.getByTestId('windSpeed')).toBeVisible();
  await expect(page.getByTestId('windDirection')).toBeVisible();
  await expect(page.getByTestId('waveHeight')).toBeVisible();
  await expect(page.getByTestId('wavePeriod')).toBeVisible();
}

async function checkDetailedSection(page: Page) {
  await expect(page.getByTestId('windSurface')).toBeVisible();
  await expect(page.getByTestId('deckCargo')).toBeVisible();
  await expect(page.getByTestId('bowThruster')).toBeVisible();
  await expect(page.getByTestId('bowThrusterEfficiency')).toBeVisible();
  await expect(page.getByTestId('Bulker / Tanker')).toBeVisible();
  await expect(page.getByTestId('Container')).toBeVisible();
  await expect(page.getByTestId('Ferry')).toBeVisible();
  await expect(page.getByTestId('LNG Tanker')).toBeVisible();
}

async function checkFairwaySection(page: Page) {
  await expect(page.getByTestId('sweptDepth')).toBeVisible();
  await expect(page.getByTestId('waterLevel')).toBeVisible();
  await expect(page.getByTestId('waterDepth')).toBeVisible();
}

async function checkStabilitySection(page: Page) {
  await expect(page.getByTestId('KG')).toBeVisible();
  await expect(page.getByTestId('GM')).toBeVisible();
  await expect(page.getByTestId('KB')).toBeVisible();
}

async function checkVesselSection(page: Page) {
  await expect(page.getByTestId('vesselCourse')).toBeVisible();
  await expect(page.getByTestId('vesselSpeed')).toBeVisible();
  await expect(page.getByTestId('turningRadius')).toBeVisible();
}

async function checkAttributeSection(page: Page) {
  await expect(page.getByTestId('airDensity')).toBeVisible();
  await expect(page.getByTestId('waterDensity')).toBeVisible();
  await expect(page.getByTestId('requiredUKC')).toBeVisible();
  await expect(page.getByTestId('motionClearance')).toBeVisible();
  await expect(page.getByTestId('safetyMarginWindForce')).toBeVisible();
}
