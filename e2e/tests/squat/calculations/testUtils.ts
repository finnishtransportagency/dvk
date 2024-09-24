import { Page, Locator, expect } from '@playwright/test';

export interface TestCase {
    name: string;
    vessel: string;
    additionalSetup: (page: Page) => Promise<void>;
    expectedResults: Record<string, string>;
  }
  
  export interface SectionField {
    name: string;
    value: string;
    clear?: boolean;
  }
  
  export interface Section {
    name: string;
    fields: SectionField[];
  }

  export async function fillForm(page: Page, sections: Section[]) {
    for (const section of sections) {
      for (const field of section.fields) {
        await setLocatorValue(page.getByTestId(field.name).locator('input'), field.value, field.clear);
      }
    }
  }
  
  export async function setLocatorValue(locator: Locator, value: string, clear: boolean = false) {
    if (clear) await locator.clear();
    await locator.fill(value);
    await locator.press('Tab');
  }
  
  export async function checkResults(page: Page, expectedResults: Record<string, string>) {
    for (const [testId, expectedValue] of Object.entries(expectedResults)) {
      await expect(page.getByTestId(testId)).toHaveText(expectedValue);
    }
  }