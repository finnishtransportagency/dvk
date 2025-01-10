import { test, expect, Page, Locator } from '@playwright/test';

const PORT = process.env.PORT ?? '3000';
const URL = `http://localhost:${PORT}/yllapito/`;
const HARBOR_NAME = { fi: 'fi_testHarbor', sv: 'sv_testHarbor', en: 'en_testHarbor' };
const SQUAT_PLACE = { fi: 'fi_Squat template Finnish', sv: 'sv_Squat template Swedish', en: 'en_Squat template English' };
const SQUAT_ADD_INFO = { fi: 'fi_Squat add info', sv: 'sv_Squat add info', en: 'en_Squat add info' };
const SAVE_FAILED = 'Tallennus epäonnistui';
const SAVE_SUCCEEDED = 'Tallennus onnistui';
const FAIRWAY_CARD_REMOVAL = 'Väyläkortin poisto';
const HARBOR_REMOVAL = 'Sataman poisto';
const ADD_HARBOR = 'Lisää satama';
const CREATE_HARBOR = 'Lisää satama';
const ADD_FAIRWAY_CARD = 'Lisää väyläkortti';
const CREATE_FAIRWAY_CARD = 'Lisää väyläkortti';
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

async function getFirstItemFromList(page: Page, type?: string, state?: string, isN2000: boolean = false) {
  let searchLocator = page.getByTestId('resultrow');
  if (type) {
    const typeFilter = page.getByTestId('resulttype').filter({ hasText: type });
    searchLocator = searchLocator.filter({ has: typeFilter });
  }
  if (state) {
    const stateFilter = page.getByTestId('resultstatus').filter({ hasText: state });
    searchLocator = searchLocator.filter({ has: stateFilter });
  }
  if (isN2000) {
    const n2000Filter = page.getByTestId('n2000').filter({ hasText: 'N2000' });
    searchLocator = searchLocator.filter({ has: n2000Filter });
  }
  return searchLocator.first();
}

async function clickOnResultsByTypeAndState(page: Page, type: string, state: string, isN2000: boolean) {
  (await getFirstItemFromList(page, type, state, isN2000)).click();
}

function generateRandomNumberAsString(length: number = 5) {
  const randomNumber = Math.floor(Math.pow(10, length) * Math.random()); // NOSONAR - ignore security issue with random number as it's only a test
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

async function fillSquatTemplateAndSaveSucceeds(page: Page) {
  const addNewButton = page.getByTestId('addNewCalcSection');
  await addNewButton.click();
  const newId = await page.getByTestId('squatCalculationPlacefi').count();
  await fillFieldWithValue(page, 'squatCalculationPlacefi', SQUAT_PLACE.fi);
  await fillFieldWithValue(page, 'squatCalculationPlacesv', SQUAT_PLACE.sv);
  await fillFieldWithValue(page, 'squatCalculationPlaceen', SQUAT_PLACE.en);
  await selectItemFromSelectWithCustomDropdown(page, 'squatTargetFairwayIdsSelect');
  await selectItemFromSelectWithCustomDropdown(page, 'squatSuitableFairwayAreaIdsSelect');
  await fillFieldWithValue(page, 'squatCalculationEstimatedWaterDepth-' + (newId - 1), '50');
  await selectItemFromSelectInput(page, 'squatCalculationFairwayFormSelect');
  await fillFieldWithValue(page, 'squatCalculationAdditionalInformationfi', SQUAT_ADD_INFO.fi);
  await fillFieldWithValue(page, 'squatCalculationAdditionalInformationsv', SQUAT_ADD_INFO.sv);
  await fillFieldWithValue(page, 'squatCalculationAdditionalInformationen', SQUAT_ADD_INFO.en);

  await save(page, SAVE_SUCCEEDED);
}

async function selectItemFromSelectInput(page: Page, id: string, index: number = 0) {
  await selectItemFromDropdown(page, id, 'radio', index);
}

async function selectItemFromSelectWithCustomDropdown(page: Page, id: string, index: number = 0) {
  //Checkboxes here are images
  await selectItemFromDropdown(page, id, 'checkbox', index);
}

async function selectItemFromDropdown(page: Page, id: string, type: 'checkbox' | 'radio', index: number) {
  //Get the last element of this test id on the page to account for multiple section elements
  const select = page.getByTestId(id).last();
  await select.click();

  //For custom dropdown checkbox is actually an img
  if (type === 'checkbox') {
    await page.locator('ion-checkbox').getByRole('img').nth(index).click();
    page.getByRole('checkbox').first().press('Escape');
  } else {
    await page.getByRole(type).nth(index).click();
  }
}

async function fillFieldWithValue(page: Page, id: string | Locator, value: string, wait: number = 1000) {
  //Need to wait otherwise text not input correctly
  await page.waitForTimeout(wait);
  const field = typeof id === 'string' ? page.getByTestId(id).locator('input').last() : id.locator('input').last();
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
  await expect(page.getByText(DELETED, { exact: true }).first()).toBeVisible();
}

async function createNewVersionFromPublishedSave(page: Page, type: string, isN2000: boolean = false) {
  //Get first published element
  await clickOnResultsByTypeAndState(page, type, PUBLISHED, isN2000);
  await page.getByRole('button', { name: CREATE_NEW_VERSION }).click();
  //Click save in the modal
  await page.getByRole('button', { name: SAVE }).click();
  await page.waitForTimeout(3000);
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
  test.beforeEach(async () => {
    test.setTimeout(60000);
  });
  test.skip('should save published harbor', async ({ page }) => {
    await openPage(page);
    await createNewVersionFromPublishedSave(page, HARBOR);
    await save(page, SAVE_SUCCEEDED);
    await deleteHarbour(page);
  });

  test.skip('should save published fairway card', async ({ page }) => {
    await openPage(page);
    await createNewVersionFromPublishedSave(page, FAIRWAY_CARD);
    await save(page, SAVE_SUCCEEDED);
    await deleteHarbour(page);
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

  test('should add squat calculation template', async ({ page }) => {
    await openPage(page);
    await createNewVersionFromPublishedSave(page, FAIRWAY_CARD, true);
    await fillSquatTemplateAndSaveSucceeds(page);
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
});
