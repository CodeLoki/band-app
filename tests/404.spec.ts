import { expect, test } from '@playwright/test';

/**
 * 404 Flow E2E Test
 *
 * Tests the 404 route.
 *
 * Run locally with: pnpm test:e2e
 * Skipped in CI - requires Firebase auth.
 */

const isCI = !!process.env.CI;

test.describe('Navigation Flow', () => {
    test.skip(isCI, 'Skipping E2E tests in CI');

    test('404 page displays correctly and allows navigation home', async ({ page }) => {
        // Go directly to a non-existent route
        await page.goto('/non-existent-page');

        // Verify 404 page elements
        await expect(page.locator('h2')).toContainText('404');
        await expect(page.locator('text=Page not found')).toBeVisible();
        await expect(page.locator('text=The page you are looking for does not exist')).toBeVisible();

        // Verify Go Home button works
        const goHomeButton = page.locator('a.btn-primary:has-text("Go Home")');
        await goHomeButton.click();

        // Should be back at home
        await expect(page).toHaveURL('/');
    });
});
