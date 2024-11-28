import { test, expect, Page } from '@playwright/test';

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
const CREATE_NEW_VERSION = 'Lisää uusi versio';
const SAVE = 'Tallenna';
const OK = 'Ok';
const SEARCH_BY_NAME = 'Hae nimellä';
const PUBLISHED = 'Julkaistu';
const HARBOR = 'Satama';
const FAIRWAY_CARD = 'Väyläkortti';

const NEW_HARBOR_FROM_SCRATCH_ID = 'testadd123';
const FAIRWAY_CARD_FROM_TEMPLATE = 'testmodfc1';
const HARBOR_FROM_TEMPLATE = 'testmodh12';

async function getFirstItemFromList(page: Page, type: string, state: string) {
  const typeFilter = page.getByTestId('resulttype').filter({ hasText: type });
  const stateFilter = page.getByTestId('resultstatus').filter({ hasText: state });
  const rowLocator = page.getByTestId('resultrow').filter({ has: typeFilter }).filter({ has: stateFilter });
  return rowLocator.first();
}

async function clickOnResultsByTypeAndState(page: Page, type: string, state: string) {
  (await getFirstItemFromList(page, type, state)).click();
}

function generateRandomString(length: number = 10) {
  let result = '';
  const characters = 'abcdefghijklmnopqrstuvwxyz0123456789';
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
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

async function fillFieldWithValue(page: Page, id: string, value: string) {
  const field = page.getByTestId(id).locator('input');
  await field.clear();
  await field.click();
  await field.pressSequentially(value, { delay: 100 });
  await field.press('Tab', { delay: 100 });
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
  await fillFieldWithValue(page, 'primaryId', id);
}

test.describe('Modify operations for cards and harbors', () => {
  test('should save published harbor', async ({ page }) => {
    await page.goto(URL);
    await createNewVersionFromPublishedSave(page, HARBOR);
    await deleteHarbour(page);
  });

  test('should save published fairway card', async ({ page }) => {
    await page.goto(URL);
    await createNewVersionFromPublishedSave(page, FAIRWAY_CARD);
    await deleteFairwayCard(page);
  });

  test('should create new fairway card from template', async ({ page }) => {
    await page.goto(URL);
    const selectedname = await (await getFirstItemFromList(page, FAIRWAY_CARD, PUBLISHED)).getByTestId('resultname').innerText();
    await page.getByRole('button', { name: ADD_FAIRWAY_CARD }).click();
    await fillTemplate(page, selectedname, FAIRWAY_CARD_FROM_TEMPLATE);
    await page.getByRole('button', { name: CREATE_FAIRWAY_CARD }).click();
    await save(page, SAVE_SUCCEEDED);
    await deleteFairwayCard(page);
  });

  test('should create new harbor from template', async ({ page }) => {
    await page.goto(URL);
    const selectedname = await (await getFirstItemFromList(page, HARBOR, PUBLISHED)).getByTestId('resultname').innerText();
    await page.getByRole('button', { name: ADD_HARBOR }).click();
    await fillTemplate(page, selectedname, HARBOR_FROM_TEMPLATE);
    await page.getByRole('button', { name: CREATE_HARBOR }).click();
    await save(page, SAVE_SUCCEEDED);
    await deleteHarbour(page);
  });

  test('should create new harbor from scratch', async ({ page }) => {
    await page.goto(URL);
    await page.getByRole('button', { name: ADD_HARBOR }).click();
    //No template selected
    await fillFieldWithValue(page, 'primaryId', NEW_HARBOR_FROM_SCRATCH_ID);
    await page.getByRole('button', { name: CREATE_HARBOR }).click();
    await save(page, SAVE_FAILED);
    await fillHarbourNameAndSaveFails(page);
    await fillLatLngAndSaveSucceeds(page);
    await deleteHarbour(page);
  });

  test.afterEach(async () => {
    console.log('Running afters');
    //await page.close();
  });
});
