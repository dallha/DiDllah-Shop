import { test, expect } from '@playwright/test';

test.describe('E-commerce Checkout Flow', () => {
  test('La page d\'accueil se charge correctement', async ({ page }) => {
    await page.goto('/');
    
    // Vérifie que le titre correspond à la marque premium
    await expect(page).toHaveTitle(/DiDallah Shop/);
  });
  
  test('Le panier s\'ouvre (Store Zustand persist)', async ({ page }) => {
    await page.goto('/');
    
    // Ceci est un test générique, à adapter en fonction des data-testid du vrai site
    // await page.click('[data-testid="cart-button"]');
    // await expect(page.locator('[data-testid="cart-drawer"]')).toBeVisible();
  });
});
