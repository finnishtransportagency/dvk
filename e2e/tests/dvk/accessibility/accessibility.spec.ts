import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const PORT = process.env.PORT ?? '3000';

test.beforeEach(async ({ page }) => {
  await page.goto(`http://localhost:${PORT}/vaylakortti`);
});

test.describe.configure({ mode: 'serial' }); // for faster testing this should be removed

test.describe('DVK Automated accessibility testing', () => {
  test('Main page', async ({ page }) => {
    // check the main page after it has been loaded
    await expect(page.locator('.layerControl')).toBeVisible();
    await expect(page.locator('[data-testid="homeMap"]')).toBeVisible();
    await expect(page.locator('.progress-bar')).toHaveCount(0);
    await expect(page.locator('.bgAlertModal')).toHaveCount(0);

    await test.step('Check main menu', async() => {
      await expect(page.locator('.openSidebarMenuControl')).toBeVisible();
      await page.locator('.openSidebarMenuControl').click();

      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
        .include('.sidebarMenu')
        .analyze();

      expect(accessibilityScanResults.violations).toEqual([]);
      await page.locator('.sidebarMenu [data-testid="closeMenu"]').click(); // close menu
    });

    await test.step('Check layers menu', async() => {
      await expect(page.locator('.layerControlContainer')).toBeVisible();
      await page.locator('.layerControlContainer').click();

      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
        .disableRules(['aria-required-children']) // layers menu is accessible currently -> ignoring this rule
        .include('#layerModalContent')
        .analyze();

      expect(accessibilityScanResults.violations).toEqual([]);
      await page.locator('#layerModalContent [data-testid="closeMenu"]').click(); // close menu
    });
    
    await test.step('Check whole page', async() => {
      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
        .disableRules(['meta-viewport', 'aria-required-children'])
        .analyze();

      expect(accessibilityScanResults.violations).toEqual([]);
    });
  });

  test('Fairway Cards', async ({ page }) => {
    // open navigation
    await expect(page.locator('.openSidebarMenuControl')).toBeVisible();
    await page.locator('.openSidebarMenuControl').click();

    // navigate to fairway cards
    await expect(page.locator('.sidebarMenu')).toBeVisible();
    await page.locator('[data-testid="fairwaysLink"]').click();
    await expect(page.locator('#fairwayCardsContainer')).toBeVisible();
    
    await test.step('Check whole page', async() => {
      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
        .disableRules('meta-viewport')
        .include('#fairwayCardsContainer') // only check through the content area
        .analyze();

      expect(accessibilityScanResults.violations).toEqual([]);
    });
  });

  test('Pilot routes', async ({ page }) => {
    // open navigation
    await expect(page.locator('.openSidebarMenuControl')).toBeVisible();
    await page.locator('.openSidebarMenuControl').click();

    // navigate to pilot routes
    await expect(page.locator('.sidebarMenu')).toBeVisible();
    await page.locator('[data-testid="routesLink"]').click();
    await expect(page.locator('#pilotRouteList .route-table')).toBeVisible();

    await test.step('Check whole page', async() => {
      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
        .disableRules('meta-viewport')
        .include('#fairwayCardsContainer') 
        .analyze();

      expect(accessibilityScanResults.violations).toEqual([]);
    });
  });

  test('Defective Navigation Aids', async ({ page }) => {
    // open navigation
    await expect(page.locator('.openSidebarMenuControl')).toBeVisible();
    await page.locator('.openSidebarMenuControl').click();

    // navigate to defective navigation aids
    await expect(page.locator('.sidebarMenu')).toBeVisible();
    await page.locator('[data-testid="faultsLink"]').click();
    await expect(page.locator('#safetyEquipmentFaultList')).toBeVisible();

    await test.step('Check whole page', async() => {
      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
        .disableRules('meta-viewport') // zoom works as inteded -> ignoring this rule
        .include('#fairwayCardsContainer') 
        .analyze();

      expect(accessibilityScanResults.violations).toEqual([]);
    });
  });

  test('Navigational Warnings', async ({ page }) => {
    // open navigation
    await expect(page.locator('.openSidebarMenuControl')).toBeVisible();
    await page.locator('.openSidebarMenuControl').click();

    // navigate to navigational warnings
    await expect(page.locator('.sidebarMenu')).toBeVisible();
    await page.locator('[data-testid="warningsLink"]').click();
    await expect(page.locator('#marineWarningList')).toBeVisible();

    await test.step('Check whole page', async() => {
      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
        .disableRules('meta-viewport') // zoom works as inteded -> ignoring this rule
        .include('#fairwayCardsContainer') 
        .analyze();

      expect(accessibilityScanResults.violations).toEqual([]);
    });
  });

  test('Squat Calculator', async ({ page }) => {
    // open navigation
    await expect(page.locator('.openSidebarMenuControl')).toBeVisible();
    await page.locator('.openSidebarMenuControl').click();

    // navigate to squat calculator
    await expect(page.locator('.sidebarMenu')).toBeVisible();
    await page.locator('[data-testid="squatLink"]').click();
    await expect(page.locator('#squatCalculatorContainer')).toBeVisible();

    // check empty form
    await test.step('Check whole page, form empty', async() => {
      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
        .disableRules('meta-viewport') // zoom works as inteded -> ignoring this rule
        .include('#fairwayCardsContainer') 
        .analyze();

      expect(accessibilityScanResults.violations).toEqual([]);
    });

    // check filled form
    await test.step('Check whole page, form filled', async() => {
      await page.locator('input[name="lengthBPP"]').pressSequentially('189.90', { delay: 100 })
      await page.locator('input[name="breadth"]').pressSequentially('32.26', { delay: 100 });
      await page.locator('input[name="draught"]').pressSequentially('12.04', { delay: 100 });
      await page.locator('input[name="displacement"]').pressSequentially('55596', { delay: 100 });

      await page.locator('input[name="sweptDepth"]').pressSequentially('12.5', { delay: 100 });
      await page.locator('input[name="waterLevel"]').pressSequentially('10', { delay: 100 });

      await page.locator('input[name="vesselSpeed"]').pressSequentially('10', { delay: 100 });

      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
        .disableRules('meta-viewport') // zoom works as inteded -> ignoring this rule
        .include('#fairwayCardsContainer') 
        .analyze();

      expect(accessibilityScanResults.violations).toEqual([]);
    });
  });

  test('Helsingin väylä - Fairway Card', async ({ page }) => {
    // open navigation
    await expect(page.locator('.openSidebarMenuControl')).toBeVisible();
    await page.locator('.openSidebarMenuControl').click();

    // navigate to Helsinkifairway cards
    await expect(page.locator('.sidebarMenu')).toBeVisible();
    await page.locator('[data-testid="fairwaysLink"]').click();
    await expect(page.locator('#fairwayCardsContainer')).toBeVisible();
    await page.getByText('Helsingin väylä', { exact: true }).click();
    await expect (page.locator('.tabs')).toBeVisible();

    // Fairway Card
    await page.locator('[data-testid="tabButton-1"]').click();
    await expect(page.locator('.tabContent.tab1.active')).toBeVisible();
    await test.step('Check first tab', async() => {
      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
        .disableRules('meta-viewport')
        .include('#fairwayCardsContainer')
        .analyze();

      expect(accessibilityScanResults.violations).toEqual([]);
    });

    // Fairway Harbours
    await page.locator('[data-testid="tabButton-2"]').click();
    await expect(page.locator('.tabContent.tab2.active')).toBeVisible();
    await test.step('Check second tab', async() => {
      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
        .disableRules('meta-viewport')
        .include('.tabContent.tab2')
        .analyze();

      expect(accessibilityScanResults.violations).toEqual([]);
    });

    // Fairway Areas
    await page.locator('[data-testid="tabButton-3"]').click();
    await expect(page.locator('.tabContent.tab3.active')).toBeVisible();
    await test.step('Check third tab', async() => {
      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
        .disableRules('meta-viewport')
        .include('.tabContent.tab3')
        .analyze();

      expect(accessibilityScanResults.violations).toEqual([]);
    });

    // Fairway Pilot Routes
    await page.locator('[data-testid="tabButton-4"]').click();
    await expect(page.locator('.tabContent.tab4.active')).toBeVisible();
    await test.step('Check fourth tab', async() => {
      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
        .disableRules('meta-viewport')
        .include('.tabContent.tab4')
        .analyze();

      expect(accessibilityScanResults.violations).toEqual([]);
    });

    // Fairway Squat Calculator
    await page.locator('[data-testid="tabButton-5"]').click();
    await expect(page.locator('.tabContent.tab5.active')).toBeVisible();
    await test.step('Check fifth tab', async() => {
      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
        .disableRules('meta-viewport')
        .include('.tabContent.tab5')
        .analyze();

      expect(accessibilityScanResults.violations).toEqual([]);
    });

    // Fairway Weather Forecasts
    await page.locator('[data-testid="tabButton-6"]').click();
    await expect(page.locator('.tabContent.tab6.active')).toBeVisible();
    await test.step('Check sixth tab', async() => {
      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
        .disableRules('meta-viewport')
        .include('.tabContent.tab6')
        .analyze();

      expect(accessibilityScanResults.violations).toEqual([]);
    });
  });
});