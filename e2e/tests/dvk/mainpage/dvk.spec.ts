import { test, expect } from '@playwright/test';

const PORT = process.env.PORT ?? '3000';
const url = `http://localhost:${PORT}/vaylakortti`;

test.describe('Open front page and go to fairway cards', () => {
  test('should open fairway card list in finnish', async ({ page }) => {
    await page.goto(url);

    // Expect a title
    await expect(page).toHaveTitle(/Digitaalinen väyläkortti/);

    // Click the menu button and fairway cards link
    await page.getByTitle('Avaa valikko').click();
    await page.getByTestId('fairwaysLink').click();
    await expect(page.getByRole('heading', { name: 'Väyläkortit' })).toBeVisible();

    // xpath example, would be prettier with for example with locator('ion-row.fairwayCards.md').getByRole('link')
    const count = await page.locator('xpath=//ion-content[@id = "fairwayCardsContainer"] /div/div/ion-grid/ion-row/ion-col/ion-label/a').count();
    expect(count).toBeGreaterThan(0);
  });

  test('should open fairway card list in swedish', async ({ page }) => {
    await page.goto(url + '/?lang=sv');

    // Expect a title
    await expect(page).toHaveTitle(/Digital farledskort/);

    // Click the menu button and fairway cards link
    await page.getByTitle('Öppna meny').click();
    await page.getByTestId('fairwaysLink').click();
    await expect(page.getByRole('heading', { name: 'Farledskort' })).toBeVisible();

    // this link count could be a function instead of copy paste
    const count = await page.locator('xpath=//ion-content[@id = "fairwayCardsContainer"] /div/div/ion-grid/ion-row/ion-col/ion-label/a').count();
    expect(count).toBeGreaterThan(0);
  });

  test('should open fairway card list in english', async ({ page }) => {
    await page.goto(url + '/?lang=en');

    // Expect a title
    await expect(page).toHaveTitle(/Digital Fairway Card/);

    // Click the menu button and fairway cards link
    await page.getByTitle('Open menu').click();
    await page.getByTestId('fairwaysLink').click();
    await expect(page.getByRole('heading', { name: 'Fairway cards' })).toBeVisible();

    const count = await page.locator('xpath=//ion-content[@id = "fairwayCardsContainer"] /div/div/ion-grid/ion-row/ion-col/ion-label/a').count();
    expect(count).toBeGreaterThan(0);
  });
});
