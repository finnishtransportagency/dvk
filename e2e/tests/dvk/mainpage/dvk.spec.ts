import { test, expect, Page } from '@playwright/test';

const PORT = process.env.PORT ?? '3000';
const url = `http://localhost:${PORT}/vaylakortti`;

enum Languages {
  Finnish = 1,
  Swedish = 2,
  English = 3,
}

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
    await page.goto(url + '/?lang=en');
    await page.getByTitle('Open menu').click();
    //Change language to English
    await page.getByRole('button', { name: 'Suomeksi' }).click();
    await page.getByTestId('closeMenu').click();
    await runTestsInLanguage(page, {
      title: 'Digitaalinen väyläkortti',
      menuTitle: 'Avaa valikko',
      card: 'Väyläkortit',
      searchPlaceholder: 'Hae väylän nimellä tai numerolla',
      language: Languages.Finnish,
    });
  });

  test('should open fairway card list in swedish', async ({ page }) => {
    await page.goto(url + '/?lang=fi');
    await page.getByTitle('Avaa valikko').click();
    //Change language to English
    await page.getByRole('button', { name: 'På svenska' }).click();
    await page.getByTestId('closeMenu').click();
    await runTestsInLanguage(page, {
      title: 'Digital farledskort',
      menuTitle: 'Öppna meny',
      card: 'Farledskort',
      searchPlaceholder: 'Sök med farledsnamn eller nummer',
      language: Languages.Swedish,
    });
  });

  test('should open fairway card list in english', async ({ page }) => {
    //Start page in Swedish
    await page.goto(url + '/?lang=sv');
    await page.getByTitle('Öppna meny').click();
    //Change language to English
    await page.getByRole('button', { name: 'In English' }).click();
    await page.getByTestId('closeMenu').click();
    await runTestsInLanguage(page, {
      title: 'Digital Fairway Card',
      menuTitle: 'Open menu',
      card: 'Fairway cards',
      searchPlaceholder: 'Search by fairway name or number',
      language: Languages.English,
    });
  });

  async function runTestsInLanguage(
    page: Page,
    langParams: { title: string; menuTitle: string; card: string; searchPlaceholder: string; language: Languages }
  ) {
    // Expect a title
    await expect(page).toHaveTitle(langParams.title);

    // Click the menu button and fairway cards link
    await page.getByTitle(langParams.menuTitle).click();
    await page.getByTestId('fairwaysLink').click();
    await expect(page.getByRole('heading', { name: langParams.card })).toBeVisible();

    //Get the list of fairway cards
    const listOfCards = page.getByTestId('cardlink');
    expect(await listOfCards.count()).toBeGreaterThan(0);

    //Select a random card here - even this is a bad idea for reproducing any error, this is how it was in the original robot tests
    const randomCardName = await listOfCards.first().innerText();

    //Put the text of the card in the search to check the search functionality
    await page.getByTestId('searchInput').getByPlaceholder(langParams.searchPlaceholder).click();
    await page.getByTestId('searchInput').getByPlaceholder(langParams.searchPlaceholder).fill(randomCardName);
    await page.getByTestId('searchInput').getByPlaceholder(langParams.searchPlaceholder).press('Enter');

    //Check the card is selected
    await expect(page.getByTestId('fairwayTitle')).toHaveText(randomCardName);

    //Click the fairway card tab
    await checkTab(page, 1);

    checkValuesExistsOnTab(
      page,
      [
        ['navigation', 'Väylän navigoitavuus', 'Navigerbarhet', 'Fairway navigability'],
        ['navigation', 'Navigointiolosuhteet', 'Navigationsförhållanden', 'Navigation conditions'],
        ['navigation', 'Jääolosuhteet', 'Isförhållanden', 'Ice conditions'],
        [null, 'Väylätiedot', 'Farledsdata', 'Fairway data'],
        [null, 'Linjaus ja merkintä', 'Farledsdragning och utmärkning', 'Channel alignment and marking'],
        ['dimensionInfoControl', 'Väylän mitoitustiedot', 'Dimensionering', 'Fairway dimensions'],
        [null, 'Kohtaamis- ja ohittamiskieltoalueet', 'Områden med mötes- och omkörningsförbud', 'Meeting and overtaking prohibition areas'],
        [null, 'Nopeusrajoitukset', 'Fartbegränsningar och -rekommendationer', 'Speed limits and recommendations'],
        [null, 'Liikennepalvelut', 'Trafikservice', 'Traffic services'],
        [null, 'Luotsintilaus', 'Lotsbeställning', 'Pilotage'],
        [null, 'VTS', 'VTS', 'VTS'],
      ],
      langParams.language
    );

    //Click the 2nd tab
    await checkTab(page, 2);
    checkValuesExistsOnTab(
      page,
      [
        [null, 'Sataman rajoitukset', 'Hamnens begränsningar', 'Harbour restrictions'],
        [null, 'Lastinkäsittely', 'Lasthantering', 'Cargo handling'],
        [null, 'Satama-allas', 'Hamnbassäng', 'Harbour basin'],
        [null, 'Yhteystiedot', 'Kontaktinformation', 'Contact details'],
      ],
      langParams.language
    );

    //Check 3rd tab
    await checkTab(page, 3);
  }

  async function checkValuesExistsOnTab(page: Page, testVisibility: (string | null)[][], langId: number) {
    for (const element of testVisibility) {
      //If we specifify a data test id use it otherwise default to looking on the page
      if (element[0]) {
        expect(
          await page
            .getByTestId(element[0])
            .getByText(element[langId] ?? '')
            .count()
        ).toBeGreaterThan(0);
      } else {
        expect(await page.getByText(element[langId] ?? '').count()).toBeGreaterThan(0);
      }
    }
  }

  async function checkTab(page: Page, tab: string | number) {
    //Click the tab
    await page.getByTestId('tabButton-' + tab).click();
    //Check it's active
    await expect(page.locator('.tabContent.tab' + tab + '.active')).toBeVisible();

    //Check the wide button works....and resets on second click
    await expect(page.locator('.tabContent.tab' + tab + '.wide.active')).toBeHidden();
    await page.getByTestId('toggleWide').click();
    await expect(page.locator('.tabContent.tab' + tab + '.wide.active')).toBeVisible();
    await page.getByTestId('toggleWide').click();
  }
});
