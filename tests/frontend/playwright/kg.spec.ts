
import { test, expect } from '@playwright/test';

test('kg page renders and returns rows', async ({ page }) => {
  // 1. Navigate to the local frontend Knowledge Graph page
  await page.goto('http://localhost:3000/kg');

  // 2. Identify the interactive form components
  const queryInput = page.locator('input[placeholder*="Enter Cypher or semantic lookup"]');
  const executeButton = page.locator('button[type="submit"]');

  // Assert layout readiness
  await expect(queryInput).toBeVisible();
  await expect(executeButton).toBeVisible();

  // 3. Populate a query target (e.g., retrieving recipe data structural matches)
  await queryInput.fill('MATCH (r:Recipe)-[:USES]->(i:Ingredient) RETURN r, i LIMIT 5');

  // 4. Trigger graph payload evaluation
  await executeButton.click();

  // 5. Verify the structural display containers resolve successfully
  const nodesHeader = page.locator('h4:has-text("Nodes Extracted")');
  const edgesHeader = page.locator('h4:has-text("Discovered Edges")');

  // Extend the timeout budget slightly to accommodate graph network round-trips
  await expect(nodesHeader).toBeVisible({ timeout: 10000 });
  await expect(edgesHeader).toBeVisible({ timeout: 10000 });

  // 6. Assert that list blocks contain actual generated content nodes
  const listItems = page.locator('ul > li');
  await expect(listItems.first()).toBeVisible();
});