import { test, expect, Page, Locator } from '@playwright/test';

const PORT = process.env.PORT ?? '3000';
const URL = `http://localhost:${PORT}/yllapito/`;
const HARBOR_NAME = { fi: 'fi_testHarbor', sv: 'sv_testHarbor', en: 'en_testHarbor' };
const SAVE_FAILED = 'Tallennus epäonnistui';
const SAVE_SUCCEEDED = 'Tallennus onnistui';
const FAIRWAY_CARD_REMOVAL = 'Väyläkortin poisto';
const HARBOR_REMOVAL = 'Sataman poisto';
const ADD_HARBOR = 'Lisää satama';
const CREATE_HARBOR = 'Luo satama';
const ADD_FAIRWAY_CARD = 'Lisää väyläkortti';
const CREATE_FAIRWAY_CARD = 'Luo väyläkortti';
const DELETED = 'Poistettu';
const DELETE = 'Poista';
const CANCEL = 'Peruuta';
const CREATE_NEW_VERSION = 'Lisää uusi versio';
const SAVE = 'Tallenna';
const OK = 'Ok';
const SEARCH_BY_NAME = 'Hae nimellä';
const SEARCH_BY_NAME_OR_ID = 'Hae nimellä tai tunnisteella';
const PUBLISHED = 'Julkaistu';
const HARBOR = 'Satama';
const FAIRWAY_CARD = 'Väyläkortti';

const E2E_TEST_PREFIX = 'e2etest';
const NEW_HARBOR_FROM_SCRATCH_ID = E2E_TEST_PREFIX + 'nh' + generateRandomNumberAsString();
const FAIRWAY_CARD_FROM_TEMPLATE = E2E_TEST_PREFIX + 'modfc' + generateRandomNumberAsString();
const HARBOR_FROM_TEMPLATE = E2E_TEST_PREFIX + 'modh' + generateRandomNumberAsString();

const ID_INPUT_LAG = 3000;

async function openPage(page: Page) {
  await page.goto(URL);
  let pageLoaded = false;
  while (!pageLoaded) {
    await page.waitForTimeout(1000);
    const link = await getFirstItemFromList(page);
    pageLoaded = await link.isVisible();
  }
}

async function getFirstItemFromList(page: Page, type?: string, state?: string) {
  let searchLocator = page.getByTestId('resultrow');
  if (type) {
    const typeFilter = page.getByTestId('resulttype').filter({ hasText: type });
    searchLocator = searchLocator.filter({ has: typeFilter });
  }
  if (state) {
    const stateFilter = page.getByTestId('resultstatus').filter({ hasText: state });
    searchLocator = searchLocator.filter({ has: stateFilter });
  }
  return searchLocator.first();
}

async function clickOnResultsByTypeAndState(page: Page, type: string, state: string) {
  (await getFirstItemFromList(page, type, state)).click();
}

function generateRandomNumberAsString(length: number = 5) {
  const randomNumber = Math.floor(Math.pow(10, length) * Math.random());
  return ('' + randomNumber).padStart(length, '0');
}

async function fillHarbourNameAndSaveFails(page: Page) {
  await fillFieldWithValue(page, 'harbourNamefi', HARBOR_NAME.fi);
  await fillFieldWithValue(page, 'harbourNamesv', HARBOR_NAME.sv);
  await fillFieldWithValue(page, 'harbourNameen', HARBOR_NAME.en);
  await save(page, SAVE_FAILED);
}

async function fillLatLngAndSaveSucceeds(page: Page) {
  await fillFieldWithValue(page, 'lat', '59');
  await fillFieldWithValue(page, 'lon', '20');
  await save(page, SAVE_SUCCEEDED);
}

async function fillFieldWithValue(page: Page, id: string | Locator, value: string, wait: number = 1000) {
  //Need to wait otherwise text not input correctly
  await page.waitForTimeout(wait);
  const field = typeof id === 'string' ? page.getByTestId(id).locator('input') : id.locator('input');
  await field.clear();
  await field.click();
  await field.pressSequentially(value, { delay: 20 });
  await field.press('Tab', { delay: 20 });
}

async function save(page: Page, expectMessage: string) {
  await page.getByTestId('saveButton').click();
  await expect(page.getByText(expectMessage)).toBeVisible();
  await page.getByRole('button', { name: OK }).click();
}

async function deleteFairwayCard(page: Page) {
  await deleteItem(page, FAIRWAY_CARD_REMOVAL);
}

async function deleteHarbour(page: Page) {
  await deleteItem(page, HARBOR_REMOVAL);
}

async function deleteItem(page: Page, expectMessage: string) {
  //Click the delete buttoon
  await page.getByRole('button', { name: DELETE }).first().click();

  //Check the info in the modal
  await expect(page.getByText(expectMessage)).toBeVisible();

  //Confirm deletion
  await page.getByRole('button', { name: DELETE }).first().click();
  await expect(page.getByText(SAVE_SUCCEEDED)).toBeVisible();
  await page.getByLabel(OK, { exact: true }).first().click();
  await expect(page.getByText(DELETED)).toBeVisible();
}

async function createNewVersionFromPublishedSave(page: Page, type: string) {
  //Get first published element
  await clickOnResultsByTypeAndState(page, type, PUBLISHED);
  await page.getByRole('button', { name: CREATE_NEW_VERSION }).click();
  //Click save in the modal
  await page.getByRole('button', { name: SAVE }).click();
  //Click save on the main page
  await page.getByTestId('saveButton').locator('button').click();
  //Check success
  await expect(page.getByText(SAVE_SUCCEEDED)).toBeVisible();
  //Close the modal
  await page.getByRole('button', { name: OK }).click();
}

async function fillTemplate(page: Page, randomname: string, id: string) {
  const templateLocator = page.getByTitle(SEARCH_BY_NAME, { exact: true }).first();
  await templateLocator.click();

  //Type search in and select first from list
  await templateLocator.pressSequentially(randomname, { delay: 100 });
  await templateLocator.press('ArrowDown');
  await templateLocator.press('Enter');

  //Get the version select dropdown
  const versionLocator = page.getByTestId('versionselect');
  await versionLocator.click();
  //Select the first
  await page.getByRole('radio').first().click();
  //Fill in random id
  await fillFieldWithValue(page, 'primaryId', id, ID_INPUT_LAG);
}

test.describe('Modify operations for cards and harbors', () => {
  test.skip('should save published harbor', async ({ page }) => {
    await openPage(page);
    await createNewVersionFromPublishedSave(page, HARBOR);
  });

  test.skip('should save published fairway card', async ({ page }) => {
    await openPage(page);
    await createNewVersionFromPublishedSave(page, FAIRWAY_CARD);
  });

  test('should create new fairway card from template', async ({ page }) => {
    await openPage(page);
    const selectedname = await (await getFirstItemFromList(page, FAIRWAY_CARD, PUBLISHED)).getByTestId('resultname').innerText();
    await page.getByRole('button', { name: ADD_FAIRWAY_CARD }).click();
    await fillTemplate(page, selectedname, FAIRWAY_CARD_FROM_TEMPLATE);
    await page.getByRole('button', { name: CREATE_FAIRWAY_CARD }).click();
    await save(page, SAVE_SUCCEEDED);
    await deleteFairwayCard(page);
  });

  test('should create new harbor from template', async ({ page }) => {
    await openPage(page);
    const selectedname = await (await getFirstItemFromList(page, HARBOR, PUBLISHED)).getByTestId('resultname').innerText();
    await page.getByRole('button', { name: ADD_HARBOR }).click();
    await fillTemplate(page, selectedname, HARBOR_FROM_TEMPLATE);
    await page.getByRole('button', { name: CREATE_HARBOR }).click();
    await save(page, SAVE_SUCCEEDED);
    await deleteHarbour(page);
  });

  test('should create new harbor from scratch', async ({ page }) => {
    await openPage(page);
    await getFirstItemFromList(page);
    await page.getByRole('button', { name: ADD_HARBOR }).click();
    //No template selected
    await fillFieldWithValue(page, 'primaryId', NEW_HARBOR_FROM_SCRATCH_ID, ID_INPUT_LAG);
    await page.getByRole('button', { name: CREATE_HARBOR }).click();
    await save(page, SAVE_FAILED);
    await fillHarbourNameAndSaveFails(page);
    await fillLatLngAndSaveSucceeds(page);
    await deleteHarbour(page);
  });

  test.afterAll(async ({ browser }) => {
    //Cleanup all test data
    const page = await browser.newPage();
    await openPage(page);
    let cont = true;
    while (cont) {
      const templateLocator = page.getByTitle(SEARCH_BY_NAME_OR_ID, { exact: true }).first();
      await fillFieldWithValue(page, templateLocator, E2E_TEST_PREFIX);
      const link = await getFirstItemFromList(page);
      if (await link.isVisible()) {
        await link.click();
        //Main page delete
        await page.getByRole('button', { name: DELETE }).first().click();
        //Modal delete
        await page.getByRole('button', { name: DELETE }).first().click();
        //Close confirmation dialog
        await page.getByLabel(OK, { exact: true }).first().click();
        //Return to search results
        await page.getByRole('button', { name: CANCEL }).first().click();
      } else {
        cont = false;
      }
    }
  });
});
