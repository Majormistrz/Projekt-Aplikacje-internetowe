import { test, expect, request } from '@playwright/test';

test('logowanie działa dla zweryfikowanego usera', async ({ page, request }) => {
  const email = 'test_user@example.com';
  const password = 'Test123!';

  await request.post('http://127.0.0.1:5000/api/test/create-test-user');
  await page.goto('http://localhost:3000/login');
  await page.fill('input[placeholder="Email"]', email);
  await page.fill('input[placeholder="Hasło"]', password);
  await page.click('button:has-text("Zaloguj się")');

  await expect(page).toHaveURL(/\/user-panel/);

  await request.delete(`http://127.0.0.1:5000/api/test/delete-test-user?email=${email}`);
});