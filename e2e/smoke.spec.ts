import { _electron as electron } from 'playwright';
import { test, expect } from '@playwright/test';
import path from 'path';

test('App starts and shows login screen', async () => {
  const electronApp = await electron.launch({ args: ['.'] });
  const isPackaged = await electronApp.evaluate(async ({ app }) => {
    return app.isPackaged;
  });
  
  electronApp.on('window', async (page) => {
    page.on('console', msg => console.log('Browser:', msg.text()));
    page.on('pageerror', err => console.log('Browser Error:', err));
  });

  const window = await electronApp.firstWindow();
  await window.waitForLoadState('domcontentloaded');
  
  // App should start on login screen
  const title = await window.title();
  expect(title).toContain('nuNox_servis');
  
  // Check if login form is present
  const usernameInput = window.locator('input[type="text"]');
  const passwordInput = window.locator('input[type="password"]');
  const loginButton = window.locator('button[type="submit"]');
  
  await expect(usernameInput).toBeVisible();
  await expect(passwordInput).toBeVisible();
  await expect(loginButton).toBeVisible();
  
  await electronApp.close();
});
