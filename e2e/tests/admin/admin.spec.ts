import { test, expect, Page } from '@playwright/test';

const PORT = process.env.PORT ?? '3000';
const url = `http://localhost:${PORT}/yllapito/`;

async function getRandomItemFromList(page: Page, type: string, state: string) {
  const typeFilter = page.getByTestId('resulttype').filter({ hasText: type });
  const stateFilter = page.getByTestId('resultstatus').filter({ hasText: state });
  const rowLocator = page.getByTestId('resultrow').filter({ has: typeFilter }).filter({ has: stateFilter });
  return rowLocator.nth(Math.floor(Math.random() * (await rowLocator.count())));
}

async function clickOnResultsByTypeAndState(page: Page, type: string, state: string) {
  (await getRandomItemFromList(page, type, state)).click();
}

function generateRandomString(length: number = 10) {
  let result = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

async function fillPrimaryIdAndSaveSucceeds(page: Page) {
  await fillFieldWithValue(page, 'primaryId', generateRandomString());
  await save(page, 'Tallennus onnistui');
}

async function fillPrimaryIdAndSaveFails(page: Page) {
  await fillFieldWithValue(page, 'primaryId', generateRandomString());
  await save(page, 'Tallennus epäonnistui');
}

async function fillHarbourNameAndSaveFails(page: Page) {
  await fillFieldWithValue(page, 'harbourNamefi', generateRandomString());
  await fillFieldWithValue(page, 'harbourNamesv', generateRandomString());
  await fillFieldWithValue(page, 'harbourNameen', generateRandomString());
  await save(page, 'Tallennus epäonnistui');
}

async function fillLatLngAndSaveSucceeds(page: Page) {
  await fillFieldWithValue(page, 'lat', '59');
  await fillFieldWithValue(page, 'lon', '20');
  await save(page, 'Tallennus onnistui', true);
}

async function fillFieldWithValue(page: Page, id: string, value: string) {
  const field = page.getByTestId(id);
  await field.click();
  await field.pressSequentially(value);
  await field.press('Tab');
}

async function save(page: Page, expectMessage: string, screenshot: boolean = false) {
  await page.getByTestId('saveButton').first().click();
  await page.waitForTimeout(1000);
  if (screenshot) {
    //await page.screenshot({ path: 'screenshot.png', fullPage: true });
  }
  await expect(page.getByText(expectMessage)).toBeVisible();
  await page.getByRole('button', { name: 'Ok' }).click();
}

async function deleteFairwayCard(page: Page) {
  await deleteItem(page, 'Väyläkortin poisto');
}

async function deleteHarbour(page: Page) {
  await deleteItem(page, 'Sataman poisto');
}

async function deleteItem(page: Page, expectMessage: string) {
  //Click the delete buttoon
  await page.getByRole('button', { name: 'Poista' }).first().click();

  //Check the info in the modal
  await expect(page.getByText(expectMessage)).toBeVisible();

  //Confirm deletion
  await page.getByRole('button', { name: 'Poista' }).first().click();
  await expect(page.getByText('Tallennus onnistui')).toBeVisible();
  await page.getByLabel('Ok', { exact: true }).first().click();
  await expect(page.getByText('Poistettu')).toBeVisible();
}

async function createNewVersonFromPublishedSave(page: Page, type: string) {
  //Get random published element
  await clickOnResultsByTypeAndState(page, type, 'Julkaistu');

  await page.getByRole('button', { name: 'Luo uusi versio' }).click();
  await page.getByRole('button', { name: 'Tallenna' }).click();

  //Click save in the modal
  await page.getByRole('button', { name: 'Tallenna' }).first().click();

  //Check success
  await expect(page.getByText('Tallennus onnistui')).toBeVisible();

  //Close the modal
  await page.getByRole('button', { name: 'Ok' }).click();
}

async function fillTemplate(page: Page, randomname: string) {
  const templateLocator = page.getByTitle('Hae nimellä', { exact: true }).first();
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
}

test.describe('Modify operations for cards and harbors', () => {
  test('should save published harbor', async ({ page }) => {
    await page.goto(url);
    await createNewVersonFromPublishedSave(page, 'Satama');
  });
  test('should save published fairway card', async ({ page }) => {
    await page.goto(url);
    await createNewVersonFromPublishedSave(page, 'Väyläkortti');
  });

  test('should create new fairway card from template', async ({ page }) => {
    await page.goto(url);
    const randomlocator = getRandomItemFromList(page, 'Väyläkortti', 'Julkaistu');
    const randomname = await (await randomlocator).getByTestId('resultname').innerText();
    await page.getByRole('button', { name: 'Luo väyläkortti' }).click();
    await fillTemplate(page, randomname);
    await page.getByRole('button', { name: 'Luo väyläkortti' }).click();
    await fillPrimaryIdAndSaveSucceeds(page);
    await deleteFairwayCard(page);
  });

  test('should create new harbor from template', async ({ page }) => {
    await page.goto(url);
    const randomlocator = getRandomItemFromList(page, 'Satama', 'Julkaistu');
    const randomname = await (await randomlocator).getByTestId('resultname').innerText();
    await page.getByRole('button', { name: 'Luo satama' }).click();
    await fillTemplate(page, randomname);
    await page.getByRole('button', { name: 'Luo satama' }).click();
    await fillPrimaryIdAndSaveSucceeds(page);
    await deleteHarbour(page);
  });

  test('should create new harbor from scratch', async ({ page }) => {
    await page.goto(url);
    await page.getByRole('button', { name: 'Luo satama' }).click();
    //No template selected
    await page.waitForTimeout(1000);
    await page.getByRole('button', { name: 'Luo satama' }).click();
    await fillPrimaryIdAndSaveFails(page);
    await fillHarbourNameAndSaveFails(page);
    await fillLatLngAndSaveSucceeds(page);
    await deleteHarbour(page);
  });

  test('should warn on unsaved harbor', async ({ page }) => {
    await page.goto(url);
    await page.getByRole('button', { name: 'Luo satama' }).click();
    //No template selected
    await page.waitForTimeout(1000);
    await page.getByRole('button', { name: 'Luo satama' }).click();
    await fillFieldWithValue(page, 'primaryId', generateRandomString());
    //Click the cancel
    await page.getByTestId('cancelButton').click();
    //Check success
    await expect(page.getByText('Poistu tallentamatta')).toBeVisible();
    await page.getByRole('button', { name: 'Poistu' }).click();
  });
});