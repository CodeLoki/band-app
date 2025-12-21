import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

/**
 * Accessibility (a11y) Tests
 *
 * Uses axe-core to check for WCAG 2.0 Level A & AA violations.
 * Only runs in Chromium since results are browser-independent.
 *
 * Run locally with: pnpm test:e2e
 * Skipped in CI - requires Firebase auth.
 */

const isCI = !!process.env.CI;

test.describe('Accessibility', () => {
    test.skip(isCI, 'Skipping E2E tests in CI');
    test.skip(({ browserName }) => browserName !== 'chromium', 'Accessibility tests only run in Chromium');

    test('home page has no accessibility violations', async ({ page }) => {
        await page.goto('/?u=z');

        // Wait for content to load
        const bandName = page.locator('[data-testid="band-name"]');
        await expect(bandName).toBeVisible({ timeout: 10000 });

        const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze();

        expect(results.violations).toEqual([]);
    });

    test('gig page has no accessibility violations', async ({ page }) => {
        await page.goto('/?u=z');

        // Navigate to a gig
        const gigLink = page.locator('a[data-gig-id]').first();
        await expect(gigLink).toBeVisible({ timeout: 10000 });
        await gigLink.click();

        await expect(page).toHaveURL(/\/gig\//);

        // Wait for gig content to load
        const gigHeader = page.locator('h2');
        await expect(gigHeader).toBeVisible({ timeout: 10000 });

        const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze();

        expect(results.violations).toEqual([]);
    });

    test('songs page has no accessibility violations', async ({ page }) => {
        await page.goto('/songs?u=z');

        // Wait for content to load
        const content = page.locator('button[data-song-card-id]').first();
        await expect(content).toBeVisible({ timeout: 10000 });

        const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze();

        expect(results.violations).toEqual([]);
    });

    test('404 page has no accessibility violations', async ({ page }) => {
        await page.goto('/non-existent-page');

        // Wait for 404 content
        await expect(page.locator('h2')).toContainText('404');

        const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze();

        expect(results.violations).toEqual([]);
    });

    test('anonymous user view has no accessibility violations', async ({ page }) => {
        // Test without user param - different UI state
        await page.goto('/');

        const bandName = page.locator('[data-testid="band-name"]');
        await expect(bandName).toBeVisible({ timeout: 10000 });

        const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze();

        expect(results.violations).toEqual([]);
    });
});
