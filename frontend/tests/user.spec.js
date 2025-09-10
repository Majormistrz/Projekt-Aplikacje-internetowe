import { test, expect } from '@playwright/test';
import path from "path";

test.describe('UserPanel E2E', () => {
  const testUser = { email: 'test_user@example.com', password: 'Test123!' };
  let userId;
  let offerId;
  let sellerId;

  test.beforeAll(async ({ request }) => {
    const res = await request.post('http://127.0.0.1:5000/api/test/create-test-user');
    const data = await res.json();
    userId = data.id;
    
    const sellerRes = await request.post('http://127.0.0.1:5000/api/test/create-seller', {
      data: {
        email: 'panel_seller@example.com',
        password: 'Test123!',
        is_verified: true,
      },
    });
    const sellerData = await sellerRes.json();
    sellerId = sellerData.id;

    await request.post('http://127.0.0.1:5000/api/test/create-category', {
      data: { name: 'PanelTestCategory', description: 'Kategoria testowa dla panelu' },
    });

    const offerRes = await request.post('http://127.0.0.1:5000/api/test/create-offer', {
      data: {
  name: 'Oferta panelowa',
  description: 'Opis oferty dla testu panelu',
  entry_price: 20,
  price_per_day: 10,
  available_quantity: 3,
}
,
    });
    const offerData = await offerRes.json();
    offerId = offerData.id;
    
  });

  test.afterAll(async ({ request }) => {
    
    const rentalsRes = await request.get(`http://127.0.0.1:5000/api/test/rentals-by-offer?id=${offerId}`);
    const rentals = await rentalsRes.json();

    for (const rental of rentals) {
        await request.delete(`http://127.0.0.1:5000/api/test/delete-rental?id=${rental.id}`);
    }


    
    await request.delete(`http://127.0.0.1:5000/api/test/delete-offer?id=${offerId}`);

    
    await request.delete(`http://127.0.0.1:5000/api/test/delete-test-user?email=${testUser.email}`);
    await request.delete(`http://127.0.0.1:5000/api/test/delete-test-user?email=test_seller@example.com`);
    });


  test('renders UserPanel and updates name/surname', async ({ page }) => {
    await page.goto('http://localhost:3000/login');
    await page.fill('input[placeholder="Email"]', testUser.email);
    await page.fill('input[placeholder="Hasło"]', testUser.password);
    await page.click('button:has-text("Zaloguj się")');

    await expect(page).toHaveURL(/\/user-panel|\/$/);

    await page.goto('http://localhost:3000/user-panel');

    await page.click('button:has-text("✏️ Edytuj dane")');
    await page.fill('input[name="name"]', 'NoweImie');
    await page.fill('input[name="surname"]', 'NoweNazwisko');
    await page.click('button:has-text("💾 Zapisz imię i nazwisko")');

    await page.waitForTimeout(2000);
    await expect(
        page.locator('div.alert.alert-info:has-text("✅ Imię i nazwisko zaktualizowane")')
    ).toBeVisible();
  });


  test('renders rentals and notifications', async ({ page }) => {
  await page.goto('http://localhost:3000/login');
  await page.fill('input[placeholder="Email"]', testUser.email);
  await page.fill('input[placeholder="Hasło"]', testUser.password);
  await page.click('button:has-text("Zaloguj się")');

  

  await expect(page.locator('text=📋 Panel użytkownika')).toBeVisible();

  await expect(page.locator('text=📦 Aktywne wypożyczenia')).toBeVisible();

  await expect(page.locator('text=Historia wypożyczeń')).toBeVisible();

  await expect(page.locator('text=🔔 Twoje przypomnienia')).toBeVisible();
});

test('logs out the user and redirects to home', async ({ page }) => {
  await page.goto('http://localhost:3000/login');
  await page.fill('input[placeholder="Email"]', testUser.email);
  await page.fill('input[placeholder="Hasło"]', testUser.password);
  await page.click('button:has-text("Zaloguj się")');

  await expect(page.locator('text=📋 Panel użytkownika')).toBeVisible();

  await page.locator('button.btn-outline-danger:has-text("Wyloguj")').click();

  
  await expect(page).toHaveURL('http://localhost:3000/', { timeout: 7000}); 


  const localToken = await page.evaluate(() => localStorage.getItem('token'));
  const sessionToken = await page.evaluate(() => sessionStorage.getItem('token'));
  expect(localToken).toBeNull();
  expect(sessionToken).toBeNull();
});


test('User rents an offer and sees it in active rentals', async ({ page }) => {
    await page.goto('http://localhost:3000/login');
    await page.fill('input[placeholder="Email"]', testUser.email);
    await page.fill('input[placeholder="Hasło"]', testUser.password);
    await page.click('button:has-text("Zaloguj się")');

    
    await expect(page).toHaveURL(/\/user-panel|\/$/, { timeout: 10000 });

    
    await page.goto(`http://localhost:3000/offer/${offerId}`);

    await page.locator('button.btn.btn-success.flex-fill:has-text("Dodaj do koszyka")').click({ timeout: 2000 });

    await page.goto('http://localhost:3000/cart');
    


    await page.click('button:has-text("Podsumowanie")');
    await page.waitForTimeout(2000);

    await page.click('button.btn.btn-primary.w-100.mt-3:has-text("Wynajmuję")', { timeout: 2000 });
    await page.waitForTimeout(5000);


    await page.goto('http://localhost:3000/user-panel');
    await expect(page.locator('text=📦 Aktywne wypożyczenia')).toBeVisible();
    await expect(
    page.locator('text=Oferta panelowa').first()
    ).toBeVisible( { timeout: 10000 });
  });

test('User can request return', async ({ page, request }) => {
  await page.goto('http://localhost:3000/login');
  await page.fill('input[placeholder="Email"]', testUser.email);
  await page.fill('input[placeholder="Hasło"]', testUser.password);
  await page.click('button:has-text("Zaloguj się")');

  await page.goto(`http://localhost:3000/offer/${offerId}`);

  await page.locator('button.btn.btn-success.flex-fill:has-text("Dodaj do koszyka")').click({ timeout: 2000 });

  await page.goto('http://localhost:3000/cart');
    


  await page.click('button:has-text("Podsumowanie")');
  await page.waitForTimeout(2000);

  await page.click('button.btn.btn-primary.w-100.mt-3:has-text("Wynajmuję")', { timeout: 2000 });
  await page.waitForTimeout(5000);
  

  await page.goto('http://localhost:3000/user-panel');
  await page.waitForTimeout(2000);
  await page.locator('button.btn.btn-sm.btn-outline-primary:has-text("Szczegóły")').click({ timeout: 5000 });

  await expect(page.locator('text=📦 Szczegóły wypożyczenia')).toBeVisible({ timeout: 2000 });

  
  await page.waitForSelector('button:has-text("Zgłoś zwrot")', { state: 'visible', timeout: 5000 });
  await page.waitForTimeout(500);

  await page.evaluate(() => {
    window.confirm = () => true;
  });

  const button = page.locator('button:has-text("Zgłoś zwrot")');
  await expect(button).toBeVisible();
  await button.click({ force: true });

  await page.waitForTimeout(1000);


  await page.goto('http://localhost:3000/user-panel');

});

test('renders notifications in user panel', async ({ page }) => {
    await page.goto('http://localhost:3000/login');
    await page.fill('input[placeholder="Email"]', testUser.email);
    await page.fill('input[placeholder="Hasło"]', testUser.password);
    await page.click('button:has-text("Zaloguj się")');

    await page.goto('http://localhost:3000/user-panel');

    await expect(page.locator('text=🔔 Twoje przypomnienia')).toBeVisible();

    const notifications = page.locator('.list-group-item');
    const count = await notifications.count();
    console.log(`Liczba powiadomień: ${count}`);
    if (count > 0) {
    await expect(notifications.first()).toBeVisible();
    }

  });

test('User rents an offer and sets a reminder', async ({ page }) => {
  await page.goto('http://localhost:3000/login');
  await page.fill('input[placeholder="Email"]', testUser.email);
  await page.fill('input[placeholder="Hasło"]', testUser.password);
  await page.click('button:has-text("Zaloguj się")');

    
  await expect(page).toHaveURL(/\/user-panel|\/$/, { timeout: 10000 });

    
  await page.goto(`http://localhost:3000/offer/${offerId}`);

  await page.locator('button.btn.btn-success.flex-fill:has-text("Dodaj do koszyka")').click({ timeout: 2000 });

  await page.goto('http://localhost:3000/cart');
    


  await page.click('button:has-text("Podsumowanie")');
  await page.waitForTimeout(2000);

  await page.click('button.btn.btn-primary.w-100.mt-3:has-text("Wynajmuję")', { timeout: 2000 });
  await page.waitForTimeout(5000);


  await page.goto('http://localhost:3000/user-panel');
  await expect(page.locator('text=📦 Aktywne wypożyczenia')).toBeVisible({ timeout: 10000 });


  const activeRental = page.locator('text=Oferta panelowa').first();
  await expect(activeRental).toBeVisible({ timeout: 10000 });
  const reminderButton = page.locator('li:has-text("Oferta panelowa") >> button:has-text("⏰ Przypomnienie")').first();
  await reminderButton.click();

  const modal = page.locator('.modal.show');
  await expect(modal).toBeVisible({ timeout: 5000 });

  await modal.locator('button:has-text("Za 5 godzin")').click();

  await modal.locator('button:has-text("Ustaw przypomnienie")').click();

  const successMessage = modal.locator('text=Przypomnienie zapisane!');
  await expect(successMessage).toBeVisible({ timeout: 5000 });


  await modal.locator('button:has-text("Anuluj")').click();
  await expect(modal).not.toBeVisible({ timeout: 5000 });
});



test('Seller creates, edits, and deletes an offer', async ({ page }) => {
  const sellerEmail = "test_seller@example.com";
  const sellerPassword = "Test123!";

  await page.goto("http://localhost:3000/login");
  await page.fill('input[placeholder="Email"]', sellerEmail);
  await page.fill('input[placeholder="Hasło"]', sellerPassword);
  await page.click('button:has-text("Zaloguj się")');
  await expect(page).toHaveURL(/\/seller-panel|\/$/);

  await page.click('button:has-text("➕ Dodaj ofertę")');
  await expect(page.locator('h4:has-text("Nowa oferta")')).toBeVisible();

  const offerName = `Testowa oferta ${Date.now()}`;
  await page.fill('input[name="name"]', offerName);
  await page.fill('textarea[name="description"]', "Opis testowej oferty");
  await page.fill('input[name="entry_price"]', "10");
  await page.fill('input[name="price_per_day"]', "5");
  await page.fill('input[name="available_quantity"]', "3");
  await page.selectOption('select[name="category_id"]', { index: 1 }); 

  const filePath = path.resolve(__dirname, "../../uploads/kot.jpg");
  await page.setInputFiles('input[name="image"]', filePath);

  await page.click('button:has-text("Dodaj ofertę")');

  const newOfferRow = page.locator(`tr:has-text("${offerName}")`);
  await expect(newOfferRow).toBeVisible();

  await newOfferRow.locator('button:has-text("Edytuj")').click();
  await expect(page.locator('h4:has-text("Edytuj ofertę")')).toBeVisible();
  await page.fill('input[name="name"]', `${offerName} - edytowana`);
  await page.click('button:has-text("Zapisz zmiany")');

  
  const editedOfferRow = page.locator(`tr:has-text("${offerName} - edytowana")`);
  await expect(editedOfferRow).toBeVisible();


  page.on('dialog', async (dialog) => {
    console.log('Dialog message:', dialog.message());
    await dialog.accept(); 
  });

  const deleteButton = page.locator('button.btn-danger:has-text("Usuń")').first();
  await deleteButton.scrollIntoViewIfNeeded();
  await deleteButton.waitFor({ state: 'visible' });
  await deleteButton.click();

  const deletedOffer = page.locator('td:has-text("Oferta Testowa - Edytowana")');
  await expect(deletedOffer).toHaveCount(0);
});


test('seler can accept return', async ({ page, request }) => {
  
  await page.goto('http://localhost:3000/login');
  await page.fill('input[placeholder="Email"]', testUser.email);
  await page.fill('input[placeholder="Hasło"]', testUser.password);
  await page.click('button:has-text("Zaloguj się")');

  
  await page.goto(`http://localhost:3000/offer/${offerId}`);

  await page.locator('button.btn.btn-success.flex-fill:has-text("Dodaj do koszyka")').click({ timeout: 2000 });

  await page.goto('http://localhost:3000/cart');
    
  await page.click('button:has-text("Podsumowanie")');
  await page.waitForTimeout(2000);

  await page.click('button.btn.btn-primary.w-100.mt-3:has-text("Wynajmuję")', { timeout: 2000 });
  await page.waitForTimeout(5000);
  
  await page.goto('http://localhost:3000/user-panel');
  await page.waitForTimeout(2000);
  await page.locator('button.btn.btn-sm.btn-outline-primary:has-text("Szczegóły")').click({ timeout: 5000 });

  await expect(page.locator('text=📦 Szczegóły wypożyczenia')).toBeVisible({ timeout: 2000 });

  
  await page.waitForSelector('button:has-text("Zgłoś zwrot")', { state: 'visible', timeout: 5000 });
  await page.waitForTimeout(500);

  await page.evaluate(() => {
    window.confirm = () => true;
  });

  const button = page.locator('button:has-text("Zgłoś zwrot")');
  await expect(button).toBeVisible();
  await button.click({ force: true });

  await page.waitForTimeout(1000);


  await page.goto('http://localhost:3000/user-panel');

  await page.locator('button.btn-outline-danger:has-text("Wyloguj")').click();

  await expect(page).toHaveURL('http://localhost:3000/', { timeout: 7000}); 

  const sellerEmail = "test_seller@example.com";
  const sellerPassword = "Test123!";

  await page.goto("http://localhost:3000/login");
  await page.fill('input[placeholder="Email"]', sellerEmail);
  await page.fill('input[placeholder="Hasło"]', sellerPassword);
  await page.click('button:has-text("Zaloguj się")');
  await expect(page).toHaveURL(/\/seller-panel|\/$/, { timeout: 5000 });

  await page.locator('table').nth(2).scrollIntoViewIfNeeded(); 

  await page.waitForSelector('button.btn-outline-success:has-text("Przyjmij zwrot")', { timeout: 5000 });

  await page.locator('button.btn-outline-success:has-text("Przyjmij zwrot")').first().click();

  await page.waitForSelector('text=Podsumowanie zwrotu', { timeout: 5000 });

  await page.locator('button.btn.btn-success:has-text("Potwierdź zwrot")').click();

  await expect(page.locator('text=zwrócone')).toBeVisible({ timeout: 5000 });


});

  



});
