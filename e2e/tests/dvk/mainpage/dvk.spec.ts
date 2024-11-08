import { test, expect } from '@playwright/test';

const PORT = process.env.PORT ?? '3000';
const url = `http://localhost:${PORT}/vaylakortti`;

test.describe('Check map elements', () => {
  test('map scale should exist with correct format', async ({ page }) => {
    await page.goto(url);
    await expect(page.locator('.ol-scale-line-inner')).toHaveText(/\d+ (m|km)$/);
  });

  test('button opens layer control', async ({ page }) => {
    await page.goto(url);
    await expect(page.locator('.layerControl')).toBeVisible();
    await page.locator('.layerControl').click();
    await expect(page.getByTestId('layerModalContainer')).toBeVisible();
  });

  test('centre and zoom buttons visible', async ({ page }) => {
    await page.goto(url);
    await expect(page.locator('.centerToOwnLocationControl')).toBeVisible();
    await expect(page.locator('.ol-zoom-in')).toBeVisible();
    await expect(page.locator('.ol-zoom-out')).toBeVisible();
  });
});

test.describe('Open front page and go to fairway cards', () => {
  test('should open fairway card list in finnish', async ({ page }) => {
    await runTestsInLanguage(page, {
      lang: 'fi',
      title: 'Digitaalinen väyläkortti',
      menuTitle: 'Avaa valikko',
      card: 'Väyläkortit',
      searchPlaceholder: 'Hae väylän nimellä tai numerolla',
    });
  });

  test('should open fairway card list in swedish', async ({ page }) => {
    await runTestsInLanguage(page, {
      lang: 'sv',
      title: 'Digital farledskort',
      menuTitle: 'Öppna meny',
      card: 'Farledskort',
      searchPlaceholder: 'Sök med farledsnamn eller',
    });
  });

  test('should open fairway card list in english', async ({ page }) => {
    await runTestsInLanguage(page, {
      lang: 'en',
      title: 'Digital Fairway Card',
      menuTitle: 'Open menu',
      card: 'Fairway cards',
      searchPlaceholder: 'Search by fairway name or number',
    });
  });

  async function runTestsInLanguage(page, langParams) {
    await page.goto(url + '/?lang=' + langParams.lang);

    // Expect a title
    await expect(page).toHaveTitle(langParams.title);

    // Click the menu button and fairway cards link
    await page.getByTitle(langParams.menuTitle).click();
    await page.getByTestId('fairwaysLink').click();
    await expect(page.getByRole('heading', { name: langParams.card })).toBeVisible();

    // this link count could be a function instead of copy paste
    const listOfCards = page.locator('xpath=//ion-content[@id = "fairwayCardsContainer"] /div/div/ion-grid/ion-row/ion-col/ion-label/a');
    expect(await listOfCards.count()).toBeGreaterThan(0);
    const randomCardName = await listOfCards.nth(Math.floor(Math.random() * (await listOfCards.count()))).innerText();

    await page.getByTestId('searchInput').getByPlaceholder(langParams.searchPlaceholder).click();
    await page.getByTestId('searchInput').getByPlaceholder(langParams.searchPlaceholder).fill(randomCardName);
    await page.getByTestId('searchInput').getByPlaceholder(langParams.searchPlaceholder).press('Enter');

    await expect(page.getByTestId('fairwayTitle')).toHaveText(randomCardName);

    //Click the fairway card tab
    await page.getByTestId('tabButton-1').click();
    //Check it's active
    expect(page.locator('.tabContent.tab1.active')).toBeVisible();
    //Check the wide button works
    expect(page.locator('.tabContent.tab1.wide.active')).toBeHidden();
    await page.getByTestId('toggleWide').click();
    expect(page.locator('.tabContent.tab1.wide.active')).toBeVisible();
    await page.getByTestId('toggleWide').click();

    let shouldBeVisibleTestIds = [
      'navigation',
      'navigationCondition',
      'iceCondition',
      'fairwayInfo',
      'liningAndMarking',
      'dimensionInfo',
      'prohibitionData',
      'speedLimit',
      'trafficServices',
      'pilotOrder',
      'vts',
    ];

    await Promise.all(
      shouldBeVisibleTestIds.map(async (id) => {
        expect(page.getByTestId(id)).toBeVisible;
      })
    );

    //Click the 2nd tab
    await page.getByTestId('tabButton-2').click();
    //Check it's active
    expect(page.locator('.tabContent.tab2.active')).toBeVisible();
    //Check the wide button works
    expect(page.locator('.tabContent.tab2.wide.active')).toBeHidden();
    await page.getByTestId('toggleWide').click();
    expect(page.locator('.tabContent.tab2.wide.active')).toBeVisible();
    await page.getByTestId('toggleWide').click();

    shouldBeVisibleTestIds = ['restrictions', 'cargo', 'harbourBasin', 'contactDetails'];

    await Promise.all(
      shouldBeVisibleTestIds.map(async (id) => {
        expect(page.getByTestId(id)).toBeVisible;
      })
    );

    //Click the 3rd tab
    await page.getByTestId('tabButton-3').click();
    //Check it's active
    expect(page.locator('.tabContent.tab3.active')).toBeVisible();
    //Check the wide button works
    expect(page.locator('.tabContent.tab3.wide.active')).toBeHidden();
    await page.getByTestId('toggleWide').click();
    expect(page.locator('.tabContent.tab3.wide.active')).toBeVisible();
    await page.getByTestId('toggleWide').click();
  }
});
