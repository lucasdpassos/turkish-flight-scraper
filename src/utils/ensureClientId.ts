import { Page } from 'puppeteer';

export async function ensureClientId(page: Page) {
  const clientIdExists = await page.evaluate(() => localStorage.getItem('clientId'));

  if (!clientIdExists) {
    const generated = cryptoRandomUUID(); // Simula UUID legítimo
    await page.evaluate((uuid) => {
      localStorage.setItem('clientId', uuid);
    }, generated);

    console.log(`[Scraper] clientId was missing and has been injected: ${generated}`);
  } else {
    console.log(`[Scraper] Existing clientId found: ${clientIdExists}`);
  }
}

// Simulador UUID (caso não use crypto):
function cryptoRandomUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}
