import { chromium } from 'playwright-core';

const browser = await chromium.launch({
  executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  headless: true,
});
const context = await browser.newContext({
  viewport: { width: 390, height: 844 },
  deviceScaleFactor: 2,
});
const page = await context.newPage();

await page.goto('http://localhost:8081/', { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(3000);

const seed = () => {
  const now = Date.now();
  const iso = (days, hours = 12) => {
    const date = new Date(now - days * 86400000);
    date.setHours(hours, 0, 0, 0);
    return date.toISOString();
  };
  const tx = (id, type, amount, categoryId, description, days) => ({
    id,
    userId: 'user-demo',
    type,
    amount,
    categoryId,
    description,
    transactionDate: iso(days),
    createdAt: iso(days),
    updatedAt: iso(days),
  });
  const state = {
    profile: {
      id: 'user-demo',
      name: 'Putra Rinjani',
      email: 'putra@email.com',
      avatarColor: '#1684C7',
      createdAt: iso(40),
      updatedAt: iso(0),
    },
    transactions: [
      tx('t1', 'income', 3500000, 'income-salary', 'Gaji Oktober', 3),
      tx('t2', 'income', 750000, 'income-freelance', 'Proyek desain', 2),
      tx('t3', 'expense', 85000, 'expense-food', 'Makan malam', 0),
      tx('t4', 'expense', 45000, 'expense-transport', 'Ojek online', 0),
      tx('t5', 'expense', 240000, 'expense-shopping', 'Beli sepatu', 1),
      tx('t6', 'expense', 68000, 'expense-food', 'Makan siang', 1),
      tx('t7', 'expense', 150000, 'expense-bills', 'Tagihan listrik', 2),
      tx('t8', 'expense', 55000, 'expense-entertainment', 'Nonton bioskop', 3),
      tx('t9', 'expense', 320000, 'expense-food', 'Makan minggu lalu', 8),
      tx('t10', 'expense', 120000, 'expense-transport', 'Bensin', 9),
    ],
    customCategories: [],
    settings: {
      language: 'id',
      currency: 'IDR',
      spendingAlertEnabled: true,
      aiInsightEnabled: true,
      biometricEnabled: false,
      pinEnabled: false,
    },
    onboardingCompleted: true,
    sessionActive: true,
    readInsightIds: [],
    dismissedInsightIds: [],
  };
  localStorage.setItem('ceksaku:state:v1', JSON.stringify(state));
};

await page.evaluate(seed);
await page.reload({ waitUntil: 'domcontentloaded' });
await page.waitForTimeout(3500);
await page.screenshot({ path: 'shot-home.png' });

await page.mouse.wheel(0, 800);
await page.waitForTimeout(600);
await page.screenshot({ path: 'shot-home-bottom.png' });

await page.setViewportSize({ width: 360, height: 780 });
await page.reload({ waitUntil: 'domcontentloaded' });
await page.waitForTimeout(3000);
await page.screenshot({ path: 'shot-home-360.png' });

await page.setViewportSize({ width: 390, height: 844 });
await page.reload({ waitUntil: 'domcontentloaded' });
await page.waitForTimeout(3000);
await page.getByRole('tab', { name: 'Riwayat' }).click();
await page.waitForTimeout(700);
await page.screenshot({ path: 'shot-history.png' });

await page.getByRole('tab', { name: 'Pengaturan' }).click();
await page.waitForTimeout(700);
await page.mouse.wheel(0, 700);
await page.waitForTimeout(500);
await page.screenshot({ path: 'shot-settings-bottom.png' });

await page.getByRole('tab', { name: 'Insight' }).click();
await page.waitForTimeout(700);
await page.getByText('Konsisten mencatat').first().click();
await page.waitForTimeout(700);
await page.screenshot({ path: 'shot-insight-detail.png' });

await page.getByRole('button', { name: 'Kembali' }).click();
await page.getByRole('tab', { name: 'Home' }).click();
await page.waitForTimeout(500);
await page.getByRole('button', { name: '− Tambah pengeluaran' }).click();
await page.waitForTimeout(800);
await page.screenshot({ path: 'shot-form.png' });

await browser.close();
