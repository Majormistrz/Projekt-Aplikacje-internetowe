import { test, expect } from '@playwright/test';

test.describe('OfferDetails E2E', () => {
  let sellerId;
  let offerId;

  test.beforeAll(async ({ request }) => {
    // -----------------------------
    // 1️⃣ Tworzymy kategorię testową
    // -----------------------------
    await request.post('http://127.0.0.1:5000/api/test/create-category', {
      data: { name: 'Test Category', description: 'Opis kategorii testowej' },
    });

    // -----------------------------
    // 2️⃣ Tworzymy użytkownika testowego sprzedawcę
    // -----------------------------
    const sellerRes = await request.post('http://127.0.0.1:5000/api/test/create-seller', {
      data: {
        email: 'test_seller@example.com',
        password: 'Test123!',
        is_verified: true
      },
    });
    const sellerData = await sellerRes.json();
    sellerId = sellerData.id;

    // -----------------------------
    // 3️⃣ Tworzymy ofertę testową
    // -----------------------------
    const offerRes = await request.post('http://127.0.0.1:5000/api/test/create-offer', {
      data: {
        name: 'Oferta testowa',
        description: 'Opis testowej oferty',
        entry_price: 10,
        price_per_day: 5,
        category_name: 'Test Category', // endpoint powinien użyć istniejącej kategorii
        seller_id: sellerId,
        available_quantity: 5,
        image: null
      },
    });
    const offerData = await offerRes.json();
    offerId = offerData.id;
  });

  test.afterAll(async ({ request }) => {
    // -----------------------------
    // Sprzątanie po teście
    // -----------------------------
    await request.delete(`http://127.0.0.1:5000/api/test/delete-offer?id=${offerId}`);
    await request.delete(`http://127.0.0.1:5000/api/test/delete-test-user?email=test_seller@example.com`);
  });

  test('renders offer details correctly', async ({ page }) => {
    await page.goto(`http://localhost:3000/offer/${offerId}`);

    await expect(page.locator('h2')).toHaveText(/Oferta testowa/);
    await expect(page.locator('span:has-text("Cena startowa")')).toBeVisible();
    await expect(page.locator('span:has-text("Cena za dzień")')).toBeVisible();
    await expect(page.locator('span:has-text("Dostępna ilość")')).toBeVisible();
    await expect(page.locator('h4:has-text("Opis oferty")')).toBeVisible();
    await expect(page.locator('text=10.00 zł')).toBeVisible();
    await expect(page.locator('text=5.00 zł')).toBeVisible();
    await expect(page.locator('text=Opis testowej oferty')).toBeVisible();
  });

  
  
});
