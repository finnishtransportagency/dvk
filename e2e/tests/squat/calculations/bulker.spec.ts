import { test, expect, Page, Locator } from '@playwright/test';
import { fill } from 'lodash';

const PORT = process.env.PORT ?? '3000';

test.describe('Squat calculations for bulker vessel', () => {
  test('should calculate correct values for bulker + open water', async ({ page }) => {
    await page.goto(`http://localhost:${PORT}/`);
    await fillForm(page);
    // TODO: move to fill form
    await page.getByTestId('Open Water').click();
    // END TODO
    await checkResults(page, 'Open Water');
  });

  test('should calculate correct values for bulker + sloped', async ({ page }) => {
    await page.goto(`http://localhost:${PORT}/`);
    await fillForm(page);
    //TODO: move to fill form
    await page.getByTestId('Sloped Channel').click();
    const channelWidth = page.getByTestId('channelWidth').locator('input');
    await channelWidth.fill('200');
    await channelWidth.press('Tab');
    const slopeHeight = page.getByTestId('slopeHeight').locator('input');
    await slopeHeight.clear();
    await slopeHeight.fill('12');
    await slopeHeight.press('Tab');
    // END TODO
    await checkResults(page, 'Sloped Channel');
  });

  test('should calculate correct values for bulker + channel', async ({ page }) => {
    await page.goto(`http://localhost:${PORT}/`);
    await fillForm(page);
    //TODO: move to fill form
    await page.getByTestId('Channel').click();
    const channelWidth = page.getByTestId('channelWidth').locator('input');
    await channelWidth.fill('200');
    await channelWidth.press('Tab');
    // END TODO
    await checkResults(page, 'Channel');
  });
});

async function fillForm(page: Page) {
  // default is bulker and open water
  await fillGeneralSection(page);
  await fillWeatherSection(page);
  await fillDetailedSection(page);
  await fillFairwaySection(page);
  await fillStabilitySection(page);
  await fillVesselSection(page);
}

async function setLocatorValue(locator: Locator, value: string, clear: boolean = false) {
  if (clear) await locator.clear();
  await locator.fill(value);
  await locator.press('Tab');
}

async function fillGeneralSection(page: Page) {
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
  const windSpeed = page.getByTestId('windSpeed').locator('input');
  await windSpeed.clear(); // some fields or values are not always updating without clear
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
  const kg = page.getByTestId('KG').locator('input');
  await kg.fill('8');
  await kg.press('Tab');
}

async function fillVesselSection(page: Page) {
  const vesselCourse = page.getByTestId('vesselCourse').locator('input');
  await vesselCourse.clear();
  await vesselCourse.fill('10');
  await vesselCourse.press('Tab');
  const vesselSpeed = page.getByTestId('vesselSpeed').locator('input');
  await vesselSpeed.fill('12');
  await vesselSpeed.press('Tab');
}

async function checkResults(page: Page, fairwayType: 'Open Water' | 'Sloped Channel' | 'Channel') {
  // TODO get expected values from static helper
  const heelDueWind = page.getByTestId('heel-due-wind');
  await expect(heelDueWind).toHaveText('0,54');
  const constantHeelDuringTurn = page.getByTestId('constant-heel-during-turn');
  await expect(constantHeelDuringTurn).toHaveText('2,12');
  const correctedDraught = page.getByTestId('corrected-draught');
  await expect(correctedDraught).toHaveText('12,19');
  const correctedDraughtDuringTurn = page.getByTestId('corrected-draught-during-turn');
  await expect(correctedDraughtDuringTurn).toHaveText('12,63');
  const UKCVesselMotions = page.getByTestId('UKC-vessel-motions');
  await expect(UKCVesselMotions).toHaveText('−0,96');
  const UKCStraightCourse = page.getByTestId('UKC-straight-course');
  await expect(UKCStraightCourse).toHaveText('−0,96');
  const UKCDuringTurn = page.getByTestId('UKC-during-turn');
  await expect(UKCDuringTurn).toHaveText('−1,98');
  const squatResult = page.getByTestId('squat-result');
  await expect(squatResult).toHaveText('1,37');
  const relativeWindDirection = page.getByTestId('relative-wind-direction');
  await expect(relativeWindDirection).toHaveText('35');
  // this data-testid for some reason does not appear
  // const relativeWindSpeed = page.getByTestId('relative-wind-speed');
  // await expect(relativeWindSpeed).toHaveText('9');
  const windForce = page.getByTestId('wind-force');
  await expect(windForce).toHaveText('2,7');
  const waveForce = page.getByTestId('wave-force');
  await expect(waveForce).toHaveText('9,6');
  const bowThrusterForce = page.getByTestId('bow-thruster-force');
  await expect(bowThrusterForce).toHaveText('13,4');
  const remainingSafetyMargin = page.getByTestId('remaining-safety-margin');
  await expect(remainingSafetyMargin).toHaveText('108,4');
  const minimumExternalForceRequired = page.getByTestId('minimum-external-force-required');
  await expect(minimumExternalForceRequired).toHaveText('-');
  const driftRelativeWindDirection = page.getByTestId('drift-relative-wind-direction');
  await expect(driftRelativeWindDirection).toHaveText('35');
  const driftRelativeWindSpeed = page.getByTestId('drift-relative-wind-speed');
  await expect(driftRelativeWindSpeed).toHaveText('9');
  const estimatedDriftAngle = page.getByTestId('estimated-drift-angle');
  await expect(estimatedDriftAngle).toHaveText('0,02');
  const estimatedVesselBreadthDueDrift = page.getByTestId('estimated-vessel-breadth-due-drift');
  await expect(estimatedVesselBreadthDueDrift).toHaveText('32,32');
}
