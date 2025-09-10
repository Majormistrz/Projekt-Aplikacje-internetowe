import { test, expect ,request} from '@playwright/test';

test('Użytkownik może się zarejestrować', async ({ page,request }) => {
  await page.goto('http://localhost:3000/signup'); // Twój frontend

  await page.fill('input[placeholder="Imię"]', 'Dawid');
  await page.fill('input[placeholder="Nazwisko"]', 'Nowak');
  await page.fill('input[placeholder="Email"]', 'dawid@example.com');
  await page.fill('input[placeholder="Hasło"]', 'SuperHaslo123!');
  await page.fill('input[placeholder="Potwierdź hasło"]', 'SuperHaslo123!');

  await page.click('button:has-text("Załóż konto")');

  // Oczekuj, że użytkownik zostanie przekierowany na stronę verify-email
  await expect(page).toHaveURL(/\/verify-email/);
  await request.delete(`http://127.0.0.1:5000/api/test/delete-test-user?email=dawid@example.com`);
});
