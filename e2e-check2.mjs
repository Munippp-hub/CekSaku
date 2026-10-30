import { chromium } from 'playwright-core';

const browser = await chromium.launch({
  executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  headless: true,
});
const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
const page = await context.newPage();
page.setDefaultTimeout(60000);
const errors = [];
page.on('pageerror', (error) => errors.push(`pageerror: ${error.message}`));
page.on('console', (message) => {
  if (message.type() === 'error') errors.push(`console: ${message.text()}`);
});

const step = async (name, fn) => {
  try {
    await fn();
    console.log(`PASS ${name}`);
  } catch (error) {
    console.log(`FAIL ${name}: ${error.message.split('\n')[0]}`);
    await page.screenshot({ path: 'fail2.png' }).catch(() => {});
    console.log('URL:', page.url());
    console.log('BODY:', (await page.locator('body').innerText().catch(() => '')).slice(0, 1200));
    throw error;
  }
};

await page.goto('http://localhost:8081/', { waitUntil: 'domcontentloaded', timeout: 180000 });
await page.waitForTimeout(9000);

await step('onboarding', async () => {
  await page.getByRole('button', { name: 'Get Started' }).click();
  await page.getByPlaceholder('Contoh: Putra Rinjani').fill('Sari Dewi');
  await page.getByRole('checkbox').click();
  await page.getByText('Buat profil', { exact: true }).click();
  await page.getByText('Selamat datang kembali,').waitFor({ timeout: 10000 });
});

await step('empty notifications screen', async () => {
  await page.getByRole('button', { name: 'Notifikasi' }).click();
  await page.getByText('Belum ada notifikasi').waitFor({ timeout: 8000 });
  await page.getByRole('button', { name: 'Kembali' }).click();
  await page.getByText('Selamat datang kembali,').waitFor({ timeout: 8000 });
});

await step('add custom category', async () => {
  await page.getByText('+ tambah kategori').click();
  await page.getByText('Kategori baru').first().waitFor();
  await page.getByPlaceholder('Contoh: Donasi').fill('Donasi');
  await page.getByText('Tambah kategori', { exact: true }).click();
  await page.getByText('Kategori ditambahkan.').waitFor({ timeout: 8000 });
  await page.getByText('Donasi', { exact: true }).waitFor();
});

await step('custom category survives reload', async () => {
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(3500);
  await page.getByText('Kategori pengeluaran').first().waitFor({ timeout: 10000 });
  await page.getByText('Donasi', { exact: true }).waitFor({ timeout: 8000 });
  await page.getByRole('button', { name: 'Kembali' }).click();
  await page.getByRole('tab', { name: 'Home' }).click();
});

await step('expense form with date picker and new category', async () => {
  await page.getByRole('button', { name: '− Tambah pengeluaran' }).click();
  await page.getByText('Simpan pengeluaran', { exact: true }).waitFor();
  await page.locator('input[aria-label="Nominal"]').fill('75000');
  await page.getByText('Donasi', { exact: true }).click();
  await page.getByRole('button', { name: 'Pilih tanggal' }).click();
  await page.getByText('Simpan', { exact: true }).click();
  await page.getByPlaceholder('Contoh: Makan siang').fill('Donasi bulanan');
  await page.getByText('Simpan pengeluaran', { exact: true }).click();
  await page.getByText('Pengeluaran berhasil disimpan.').waitFor({ timeout: 8000 });
  await page.getByText('Rp 75.000').first().waitFor();
});

await step('notification from spending increase warning', async () => {
  await page.evaluate(() => {
    const key = 'ceksaku:state:v1';
    const state = JSON.parse(localStorage.getItem(key));
    const now = Date.now();
    const mk = (id, amount, daysAgo, description) => ({
      id,
      userId: state.profile.id,
      type: 'expense',
      amount,
      categoryId: 'expense-shopping',
      description,
      transactionDate: new Date(now - daysAgo * 86400000).toISOString(),
      createdAt: new Date(now - daysAgo * 86400000).toISOString(),
      updatedAt: new Date(now - daysAgo * 86400000).toISOString(),
    });
    state.transactions = [
      mk('seed-1', 100000, 0, 'Belanja minggu ini 1'),
      mk('seed-2', 100000, 1, 'Belanja minggu ini 2'),
      mk('seed-3', 100000, 2, 'Belanja minggu ini 3'),
      mk('seed-4', 40000, 7, 'Belanja minggu lalu 1'),
      mk('seed-5', 40000, 8, 'Belanja minggu lalu 2'),
      mk('seed-6', 40000, 9, 'Belanja minggu lalu 3'),
    ];
    localStorage.setItem(key, JSON.stringify(state));
  });
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(3500);
  await page.getByRole('button', { name: 'Notifikasi' }).click();
  const warning = page.getByText('Hati-hati! Pengeluaran naik').last();
  await warning.waitFor({ timeout: 10000 });
  await warning.click();
  await page.getByText('Detail insight', { exact: true }).waitFor({ timeout: 8000 });
  await page.getByText('Saran tindakan').waitFor();
  await page.screenshot({ path: 'e2e-insight.png' });
});

await step('personal information update', async () => {
  await page.getByRole('button', { name: 'Kembali' }).click();
  await page.getByRole('button', { name: 'Kembali' }).click();
  await page.getByRole('tab', { name: 'Pengaturan' }).click();
  await page.getByText('Informasi pribadi', { exact: true }).click();
  await page.getByPlaceholder('Contoh: Putra Rinjani').fill('Sari Dewi Putri');
  await page.getByText('Simpan profil', { exact: true }).click();
  await page.getByText('Profil diperbarui.').waitFor({ timeout: 8000 });
  await page.getByRole('button', { name: 'Kembali' }).click();
  await page.getByText('Sari Dewi Putri').first().waitFor({ timeout: 8000 });
});

await step('linked accounts screen', async () => {
  await page.getByText('Akun tertaut', { exact: true }).click();
  await page.getByText('Bank BCA').waitFor({ timeout: 8000 });
  await page.getByText('Segera hadir').first().waitFor();
  await page.getByRole('button', { name: 'Kembali' }).click();
});

await step('wrong PIN shows error then correct PIN unlocks', async () => {
  await page.getByText('Ubah PIN', { exact: true }).click();
  await page.getByText('Buat PIN baru (6 angka)').waitFor();
  for (const digit of '123456') await page.getByRole('button', { name: digit, exact: true }).click();
  await page.getByText('Ulangi PIN baru').waitFor({ timeout: 5000 });
  for (const digit of '123456') await page.getByRole('button', { name: digit, exact: true }).click();
  await page.getByText('PIN berhasil disimpan.').waitFor({ timeout: 8000 });
  await page.waitForTimeout(900);
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(3500);
  await page.getByText('Masukkan PIN').waitFor({ timeout: 12000 });
  for (const digit of '000000') await page.getByRole('button', { name: digit, exact: true }).click();
  await page.getByText('PIN salah.').waitFor({ timeout: 8000 });
  for (const digit of '123456') await page.getByRole('button', { name: digit, exact: true }).click();
  await page.getByText('Selamat datang kembali,').waitFor({ timeout: 10000 });
});

await step('logout returns to welcome and keeps data', async () => {
  await page.getByRole('tab', { name: 'Pengaturan' }).click();
  await page.getByText('Keluar', { exact: true }).click();
  await page.getByText('Keluar dari Montrack?').waitFor();
  await page.getByText('Ya, keluar', { exact: true }).click();
  await page.getByRole('button', { name: 'Lanjutkan ke dashboard' }).waitFor({ timeout: 10000 });
  await page.screenshot({ path: 'e2e-logout.png' });
});

console.log('ERRORS:', errors.length ? JSON.stringify(errors.slice(0, 8), null, 1) : 'none');
await browser.close();
