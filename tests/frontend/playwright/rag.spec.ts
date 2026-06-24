import { test, expect } from '@playwright/test';

test.describe('RAG Page End-to-End Smoke Test', () => {
  test('should render answers and bracketed citations upon query submission', async ({ page }) => {
    // Navigate to local Next.js instance
    await page.goto('http://localhost:3000/rag');

    // Confirm form elements exist
    const searchInput = page.locator('input[placeholder*="Find Sichuan recipes"]');
    const submitButton = page.locator('button[type="submit"]');
    
    await expect(searchInput).toBeVisible();

    // Emulate typing a valid seeded query
    await searchInput.fill('Find Sichuan recipes that use ginger');
    await submitButton.click();

    // Await API state resolution
    const answerContainer = page.locator('p:has-text("Ginger")');
    await expect(answerContainer).toBeVisible({ timeout: 15000 });

    // Assert explicit [1] style bracketed token presence inside answer block
    const bracketCitation = page.locator('text=/\\[\\d+\\]/');
    await expect(bracketCitation.first()).toBeVisible();
  });
});