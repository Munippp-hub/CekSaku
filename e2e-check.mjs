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
    await page.screenshot({ path: 'fail.png' }).catch(() => {});
    console.log('URL:', page.url());
    console.log('BODY:', (await page.locator('body').innerText().catch(() => '')).slice(0, 1500));
    throw error;
  }
};

await page.goto('http://localhost:8081/', { waitUntil: 'domcontentloaded', timeout: 180000 });
await page.waitForTimeout(9000);

await step('splash/welcome visible', async () => {
  await page.getByText('solution for your money tracking').waitFor({ timeout: 120000 });
});

await step('open profile setup', async () => {
  await page.getByRole('button', { name: 'Get Started' }).click();
  await page.getByText('Buat profil kamu').waitFor({ timeout: 8000 });
});

await step('create profile', async () => {
  await page.getByPlaceholder('Contoh: Putra Rinjani').fill('Putra Rinjani');
  await page.getByRole('checkbox').click();
  await page.getByText('Buat profil', { exact: true }).click();
  await page.getByText('Selamat datang kembali,').waitFor({ timeout: 10000 });
});

await step('empty dashboard state', async () => {
  await page.getByText('Belum ada transaksi', { exact: true }).first().waitFor();
});

await step('add income', async () => {
  await page.getByRole('button', { name: '+ Tambah pemasukan' }).click();
  await page.getByText('Simpan pemasukan', { exact: true }).waitFor();
  await page.locator('input[aria-label="Nominal"]').fill('1000000');
  await page.getByText('Gaji', { exact: true }).click();
  await page.getByPlaceholder('Contoh: Gaji bulan Oktober').fill('Gaji Oktober');
  await page.getByText('Simpan pemasukan', { exact: true }).click();
  await page.getByText('Pemasukan berhasil disimpan.').waitFor({ timeout: 8000 });
});

await step('dashboard reflects income', async () => {
  await page.getByText('Rp 1.000.000').first().waitFor({ timeout: 8000 });
});

await step('add expense', async () => {
  await page.getByRole('button', { name: '− Tambah pengeluaran' }).click();
  await page.getByText('Simpan pengeluaran', { exact: true }).waitFor();
  await page.locator('input[aria-label="Nominal"]').fill('125000');
  await page.getByText('Makanan & minuman', { exact: true }).click();
  await page.getByPlaceholder('Contoh: Makan siang').fill('Makan siang');
  await page.getByText('Simpan pengeluaran', { exact: true }).click();
  await page.getByText('Pengeluaran berhasil disimpan.').waitFor({ timeout: 8000 });
});

await step('weekly chart and category show data', async () => {
  await page.getByText('Pengeluaran mingguan').waitFor();
  await page.getByText('Makanan & minuman', { exact: true }).first().waitFor();
  await page.getByText('Rp 125.000').first().waitFor();
});

await step('insight generated from data', async () => {
  await page.getByRole('tab', { name: 'Insight' }).click();
  await page.getByText('Insight keuangan', { exact: true }).waitFor();
  const cards = page.getByText(/Data belum cukup|Kategori terbesar|Konsisten mencatat/);
  await cards.first().waitFor({ timeout: 8000 });
});

await step('history lists transactions', async () => {
  await page.getByRole('tab', { name: 'Riwayat' }).click();
  await page.getByText('Riwayat transaksi', { exact: true }).waitFor();
  await page.getByText('Gaji Oktober').first().waitFor();
  await page.getByText('Makan siang').first().waitFor();
});

await step('open transaction detail', async () => {
  await page.getByText('Makan siang').first().click();
  await page.getByText('Detail transaksi', { exact: true }).waitFor();
  await page.getByText('−Rp 125.000').last().waitFor();
});

await step('edit transaction', async () => {
  await page.getByText('Edit', { exact: true }).click();
  await page.getByText('Edit pengeluaran', { exact: true }).waitFor();
  await page.locator('input[aria-label="Nominal"]').fill('175000');
  await page.getByText('Simpan perubahan', { exact: true }).click();
  await page.getByText('Transaksi berhasil diperbarui.').waitFor({ timeout: 8000 });
  await page.getByText('−Rp 175.000').last().waitFor({ timeout: 8000 });
});

await step('delete transaction', async () => {
  await page.getByText('Hapus', { exact: true }).first().click();
  await page.getByText('Hapus transaksi?').waitFor();
  await page.getByRole('button').filter({ hasText: /^Hapus$/ }).last().click();
  await page.getByText('Transaksi dihapus.').waitFor({ timeout: 8000 });
  await page.getByText('Makan siang').waitFor({ state: 'detached', timeout: 5000 }).catch(() => {});
});

await step('reload keeps session and data', async () => {
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(3500);
  await page.getByRole('tab', { name: 'Riwayat' }).click();
  await page.getByText('Gaji Oktober').first().waitFor({ timeout: 120000 });
  await page.getByRole('tab', { name: 'Home' }).click();
  await page.getByText('Selamat datang kembali,').waitFor({ timeout: 10000 });
});

await step('toggle setting persists', async () => {
  await page.getByRole('tab', { name: 'Pengaturan' }).click();
  await page.getByRole('switch', { name: 'AI Insight' }).click();
  await page.waitForTimeout(700);
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(3500);
  await page.getByRole('tab', { name: 'Home' }).click();
  await page
    .getByText('Insight dinonaktifkan. Aktifkan di Pengaturan > Preferensi.')
    .waitFor({ timeout: 10000 });
  await page.getByRole('tab', { name: 'Pengaturan' }).click();
  await page.getByRole('switch', { name: 'AI Insight' }).click();
  await page.waitForTimeout(500);
});

await step('switch language to English', async () => {
  await page.getByText('Bahasa & mata uang', { exact: true }).click();
  await page.getByRole('radio').filter({ hasText: 'EN' }).click();
  await page.getByText('Language & Currency', { exact: true }).last().waitFor();
});

await step('English persists after reload', async () => {
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(3500);
  await page.getByText('Currency', { exact: true }).waitFor({ timeout: 10000 });
  await page.getByRole('button', { name: 'Back' }).click();
  await page.getByText('Preferences', { exact: true }).waitFor({ timeout: 10000 });
  await page.getByText('Account', { exact: true }).waitFor();
});

await step('set PIN', async () => {
  await page.getByText('Change PIN', { exact: true }).click();
  await page.getByText('Create a new 6-digit PIN').waitFor();
  for (const digit of '123456') {
    await page.getByRole('button', { name: digit, exact: true }).click();
  }
  await page.getByText('Repeat new PIN').waitFor({ timeout: 5000 });
  for (const digit of '123456') {
    await page.getByRole('button', { name: digit, exact: true }).click();
  }
  await page.getByText('PIN saved.').waitFor({ timeout: 8000 });
});

await step('lock screen after reload', async () => {
  await page.waitForTimeout(1200);
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(3500);
  await page.getByText('Enter PIN').waitFor({ timeout: 120000 });
});

await step('unlock with PIN', async () => {
  for (const digit of '123456') {
    await page.getByRole('button', { name: digit, exact: true }).click();
  }
  await page.getByText('Welcome back,').waitFor({ timeout: 10000 });
});

await step('responsive mobile layout has no horizontal overflow', async () => {
  const overflow = await page.evaluate(() => {
    return document.documentElement.scrollWidth - document.documentElement.clientWidth;
  });
  if (overflow > 2) throw new Error(`horizontal overflow ${overflow}px`);
});

console.log('ERRORS:', errors.length ? JSON.stringify(errors.slice(0, 8), null, 1) : 'none');
await page.screenshot({ path: 'e2e-home.png', fullPage: false });
await browser.close();
