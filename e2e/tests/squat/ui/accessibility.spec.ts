import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const PORT = process.env.PORT ?? '3000';

test.describe('Squat Automated accessibility testing', () => {
  test('should not have any automatically detectable accessibility issues', async ({ page }) => {
    await page.goto(`http://localhost:${PORT}/`);

    await test.step('Check header, info accordian and alert box for accessibility', async() => {
      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
        .include('.titlebar, .info-accordian, .infobox')
        .analyze();

      expect(accessibilityScanResults.violations).toEqual([]);
    });

    await test.step('Check Vessel column for accessibility', async() => {
      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
        .include('[data-testid="vessel-column"]')
        .analyze();

      expect(accessibilityScanResults.violations).toEqual([]);
    });

    await test.step('Check Environment column for accessibility', async() => {
      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
        .include('[data-testid="environment-column"]')
        .analyze();

      expect(accessibilityScanResults.violations).toEqual([]);
    });

    await test.step('Check Calculations column for accessibility', async() => {
      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
        .include('[data-testid="calculations-column"]')
        .analyze();

      expect(accessibilityScanResults.violations).toEqual([]);
    });

    await test.step('Check results graph and table for accessibility', async() => {
      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
        .include('.squatChartGrid, .squatDataGrid')
        .analyze();

      expect(accessibilityScanResults.violations).toEqual([]);
    });

    await test.step('Check footer for accessibility', async() => {
      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
        .include('.footer-md')
        .analyze();

      expect(accessibilityScanResults.violations).toEqual([]);
    });

    await test.step('Check whole page', async() => {
      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
        .disableRules('meta-viewport') // zoom works as inteded -> ignoring this rule
        .analyze();

      expect(accessibilityScanResults.violations).toEqual([]);
    });    
  });
});