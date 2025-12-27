import { expect, test } from '@playwright/test';

/**
 * Navigation Flow E2E Test
 *
 * Tests a complete user journey through the app:
 * 1. Home route - shows list of gigs
 * 2. Navigate to a gig/setlist
 * 3. Use ActionSelector to change to Rehearse mode and click a song
 * 4. Navigate to a non-existent route to see 404 page
 *
 * Run locally with: pnpm test:e2e
 * Skipped in CI - requires Firebase auth.
 */

const isCI = !!process.env.CI;

test.describe('Navigation Flow', () => {
    test.skip(isCI, 'Skipping E2E tests in CI');

    test('complete navigation flow: home → gig → rehearse → songs', async ({ page }) => {
        // Start at home route with power user specified.
        await page.goto('/?u=z');

        // Verify that default band is selected.
        const bandName = page.locator('[data-testid="band-name"]');
        await expect(bandName).toBeVisible({ timeout: 10000 });
        await expect(bandName).toHaveText(/convertible JERK/);

        // Look for gig cards.
        const gigCards = page.locator('a[data-gig-id]');
        await expect(gigCards.first()).toBeVisible({ timeout: 10000 });

        const firstGigLink = gigCards.first();

        // Get the gig ID from the href
        const gigId = await firstGigLink.getAttribute('data-gig-id');
        const venue = await firstGigLink.locator('h2').innerText();

        // Click on the first gig to navigate to gig page
        await firstGigLink.click();

        // Verify we navigated to the correct gig page
        await expect(page).toHaveURL(new RegExp(`/gig/${gigId}`));

        const gigHeader = page.locator('h2');
        await expect(gigHeader).toBeVisible({ timeout: 10000 });
        await expect(gigHeader).toHaveText(new RegExp(venue));

        // Now look for song cards in the setlist to test rehearse navigation
        const songButton = page.locator('button[data-song-card-id]').first();
        const songId = await songButton.getAttribute('data-song-card-id');

        // Use ActionSelector to change to Practice mode
        const fabButton = page.locator('.fab > div[role="button"]');
        await fabButton.click();

        // Switch to Rehearse mode first
        const rehearseButton = page.locator('[data-tip="Rehearse"] button');
        await rehearseButton.click();

        // Now click the song to navigate to rehearse page
        await songButton.click();

        // Verify we're on the rehearse page
        await expect(page).toHaveURL(new RegExp(`/rehearse/${songId}`));

        // Rehearse page should have an iframe for tablature
        const iframe = page.locator('iframe[title="Tablature"]');
        await expect(iframe).toBeVisible({ timeout: 10000 });

        // Go back to continue the test
        const exitButton = page.locator('button[data-testid="rehearse-back-button"]');
        await exitButton.click();
        await expect(page).toHaveURL(new RegExp(`/gig/${gigId}`));

        // Navigate to songs page via navbar link
        const songsButton = page.getByRole('link', { name: 'Songs' }).first();
        await expect(songsButton).toBeVisible({ timeout: 10000 });
        await songsButton.click();

        // Verify we're on the songs page without filter param
        await expect(page).toHaveURL(/\/songs/);
        expect(page.url()).not.toContain('filter=');

        async function filterSongs(value: string, clearFilter = true) {
            const btn = page.locator(`input[type="radio"][value="${value}"]`);
            await btn.click();

            await expect(page).toHaveURL(new RegExp(`filter=${value}`));

            if (clearFilter) {
                const btnAll = page.locator('input[type="radio"][value="all"]');
                await btnAll.click();
                await expect(page).toHaveURL(/filter=all/);
            }
        }

        await filterSongs('orphans');
        await filterSongs('others');
        await filterSongs('practice', false);

        const cards = page.locator('button[data-song-card-id]');
        const cardCount = await cards.count();

        const indicators = page.locator('.indicator-item');
        const indicatorCount = await indicators.count();

        expect(indicatorCount).toBe(cardCount);
    });

    test('non-default band with no gigs', async ({ page }) => {
        // Start at home route with power user specified and non-default band.
        await page.goto('/?b=HnHyYrrIItDGdjlLZUVb&u=z');

        // Verify that non-default band is selected.
        const bandName = page.locator('[data-testid="band-name"]');
        await expect(bandName).toBeVisible({ timeout: 10000 });
        await expect(bandName).toHaveText(/Bastards of Old/);

        // Verify there are no gig cards.
        const gigCards = page.locator('.card-body');
        expect(await gigCards.count()).toBe(0);

        // Verify the "No gigs scheduled" message is shown.
        const noGigsMessage = page.locator('text=No gigs scheduled');
        expect(await noGigsMessage.count()).toBe(1);
    });

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

    test('anonymous user: no FAB on gig route, no FAB or filters on songs route', async ({ page }) => {
        // Start at home route without user specified
        await page.goto('/');

        // Wait for page to load
        const bandName = page.locator('[data-testid="band-name"]');
        await expect(bandName).toBeVisible({ timeout: 10000 });

        // Navigate to a gig
        const gigCards = page.locator('a[data-gig-id]');
        await expect(gigCards.first()).toBeVisible({ timeout: 10000 });
        await gigCards.first().click();

        // Verify we're on the gig page
        await expect(page).toHaveURL(/\/gig\//);

        // Verify FAB does not appear on gig route
        const fab = page.locator('.fab');
        await expect(fab).not.toBeVisible();

        // Navigate to songs page via navbar link
        const songsButton = page.getByRole('link', { name: 'Songs' }).first();
        await expect(songsButton).toBeVisible({ timeout: 10000 });
        await songsButton.click();

        // Verify we're on the songs page
        await expect(page).toHaveURL(/\/songs/);

        // Verify FAB does not appear on songs route
        await expect(fab).not.toBeVisible();

        // Verify filtering buttons do not appear
        const filterRadios = page.locator('input[type="radio"][name="filter"]');
        expect(await filterRadios.count()).toBe(0);
    });
});
