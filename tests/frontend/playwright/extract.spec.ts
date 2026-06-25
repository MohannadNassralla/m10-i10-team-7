
import { test, expect } from '@playwright/test';

test('extract page renders and returns entities', async ({ page }) => {
  // 1. Navigate to the frontend extraction page
  await page.goto('http://localhost:3000/extract');

  // 2. Verify critical structural layout nodes exist
  const textarea = page.locator('textarea[placeholder*="Paste unstructured recipe text"]');
  const submitButton = page.locator('button[type="submit"]');
  
  await expect(textarea).toBeVisible();
  await expect(submitButton).toBeVisible();

  // 3. Inject mock unstructured textual content into field
  const sampleRecipeText = 'Mince 5g of fresh ginger and mix with 2 tablespoons of Sichuan peppercorns.';
  await textarea.fill(sampleRecipeText);

  // 4. Fire network processing request
  await submitButton.click();

  // 5. Await loading mutation state resolution and check table header rendering
  const entityTable = page.locator('table');
  await expect(entityTable).toBeVisible({ timeout: 10000 });

  // 6. Assert specific semantic entity values map into rows cleanly
  const nameColumnCell = page.locator('td:has-text("ginger")');
  const typeColumnCell = page.locator('td:has-text("Sichuan peppercorns")');

  // Validate extracted text structures exist within the resulting DOM tree
  await expect(nameColumnCell.first()).toBeVisible();
  await expect(typeColumnCell.first()).toBeVisible();
});