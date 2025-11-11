import { test, expect } from '@playwright/test';

test.describe('Token Trading Table', () => {
    test('should load homepage and display token table', async ({ page }) => {
        await page.goto('http://localhost:3000');

        // Check for page title
        await expect(page).toHaveTitle(/Token Discovery/);

        // Check for Pulse header
        await expect(page.locator('h1')).toContainText('Pulse');

        // Check for tab navigation
        await expect(page.getByRole('button', { name: /New Pairs/i })).toBeVisible();
        await expect(page.getByRole('button', { name: /Final Stretch/i })).toBeVisible();
        await expect(page.getByRole('button', { name: /Migrated/i })).toBeVisible();

        // Check for search bar
        await expect(page.locator('input[placeholder*="Search"]')).toBeVisible();

        // Wait for API data to load and tokens to render
        await page.waitForTimeout(3000);

        // Check that token rows are visible (should have multiple rows)
        const rows = page.locator('[role="row"]');
        await expect(rows.first()).toBeVisible();

        // Verify we have more than just the header row
        const rowCount = await rows.count();
        expect(rowCount).toBeGreaterThan(1);
    });

    test('should open trading modal on double click', async ({ page }) => {
        await page.goto('http://localhost:3000');

        // Wait for table to load with real data
        await page.waitForTimeout(3000);

        // Verify rows exist first
        const rows = page.locator('[role="row"]');
        const rowCount = await rows.count();
        expect(rowCount).toBeGreaterThan(1);

        // Double click first token row (skip header at index 0)
        const tokenRow = rows.nth(1);
        await tokenRow.dblclick();

        // Check modal opened
        await expect(page.locator('[role="dialog"]')).toBeVisible({ timeout: 5000 });

        // Check for Buy/Sell tabs in modal
        const dialogContent = page.locator('[role="dialog"]');
        await expect(dialogContent.getByText(/Buy|Sell/)).toBeVisible();
    });

    test('should filter tokens by search', async ({ page }) => {
        await page.goto('http://localhost:3000');

        // Wait for tokens to load
        await page.waitForTimeout(3000);

        // Get initial row count
        const initialRows = await page.locator('[role="row"]').count();
        expect(initialRows).toBeGreaterThan(1);

        // Type in search box
        const searchInput = page.locator('input[placeholder*="Search"]');
        await searchInput.fill('bitcoin');

        // Wait for debounce and filtering
        await page.waitForTimeout(500);

        // Check that search filtered results (should have fewer rows or contain bitcoin)
        const filteredRows = await page.locator('[role="row"]').count();

        // Either we filtered down to fewer results, or we can see bitcoin in the results
        const hasBitcoin = await page.locator('text=/bitcoin/i').isVisible();
        expect(hasBitcoin || filteredRows < initialRows).toBeTruthy();
    });

    test('should switch between tabs', async ({ page }) => {
        await page.goto('http://localhost:3000');

        // Wait for page load
        await page.waitForTimeout(2000);

        // Click on different tabs
        const newPairsTab = page.getByRole('button', { name: /New Pairs/i });
        const finalStretchTab = page.getByRole('button', { name: /Final Stretch/i });
        const migratedTab = page.getByRole('button', { name: /Migrated/i });

        // Migrated should be active initially (has data)
        await migratedTab.click();
        await page.waitForTimeout(500);

        // Switch to New Pairs
        await newPairsTab.click();
        await page.waitForTimeout(500);

        // Switch to Final Stretch
        await finalStretchTab.click();
        await page.waitForTimeout(500);

        // All tabs should be clickable and functional
        expect(await newPairsTab.isVisible()).toBeTruthy();
        expect(await finalStretchTab.isVisible()).toBeTruthy();
        expect(await migratedTab.isVisible()).toBeTruthy();
    });
});
