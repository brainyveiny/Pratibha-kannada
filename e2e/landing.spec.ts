import { test, expect } from '@playwright/test';

test.describe('Landing Page', () => {
  test('loads and shows key elements', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Pratibha Kannada/i);
    await expect(page.locator('h1')).toContainText('ಪ್ರತಿಭಾ ಕನ್ನಡ');
    await expect(page.locator('#cta-browse-resources')).toBeVisible();
    await expect(page.locator('#cta-create-account')).toBeVisible();
    await expect(page.locator('#hero-search-input')).toBeVisible();
  });

  test('navigates to resources page', async ({ page }) => {
    await page.goto('/');
    await page.click('#cta-browse-resources');
    await expect(page).toHaveURL(/\/resources/);
  });

  test('navigates to register page', async ({ page }) => {
    await page.goto('/');
    await page.click('#nav-register');
    await expect(page).toHaveURL(/\/register/);
  });

  test('navigates to login page', async ({ page }) => {
    await page.goto('/');
    await page.click('#nav-login');
    await expect(page).toHaveURL(/\/login/);
  });
});

test.describe('Register Page', () => {
  test('shows registration form', async ({ page }) => {
    await page.goto('/register');
    await expect(page.locator('#register-name')).toBeVisible();
    await expect(page.locator('#register-email')).toBeVisible();
    await expect(page.locator('#register-password')).toBeVisible();
    await expect(page.locator('#register-grade')).toBeVisible();
    await expect(page.locator('#register-submit')).toBeVisible();
  });
});

test.describe('Login Page', () => {
  test('shows login form', async ({ page }) => {
    await page.goto('/login');
    await expect(page.locator('#login-email')).toBeVisible();
    await expect(page.locator('#login-password')).toBeVisible();
    await expect(page.locator('#login-submit')).toBeVisible();
  });
});

test.describe('Resources Page', () => {
  test('shows search and category filters', async ({ page }) => {
    await page.goto('/resources');
    await expect(page.locator('#resources-search-input')).toBeVisible();
    await expect(page.locator('#filter-class-10')).toBeVisible();
    await expect(page.locator('#category-notes')).toBeVisible();
    await expect(page.locator('#category-grammar')).toBeVisible();
  });

  test('search navigation works', async ({ page }) => {
    await page.goto('/resources');
    await page.fill('#resources-search-input', 'ಸಂಧಿ');
    await page.click('#resources-search-btn');
    await expect(page).toHaveURL(/q=%E0%B2%B8%E0%B2%82%E0%B2%A7%E0%B2%BF/);
  });
});
