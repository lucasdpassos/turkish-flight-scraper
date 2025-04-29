import { Browser, Page } from 'puppeteer';

export async function transferSessionToNewPage(originalPage: Page, browser: Browser, targetUrl: string): Promise<Page> {
  // 1. Extrai os cookies da página original (sessão ativa)
  const cookies = await originalPage.cookies();

  // 2. Cria nova aba
  const newPage = await browser.newPage();

  // 3. Copia User-Agent (opcional, mas recomendado)
  const ua = await originalPage.evaluate(() => navigator.userAgent);
  await newPage.setUserAgent(ua);

  // 4. Define os cookies no novo contexto
  await newPage.setCookie(...cookies);

  // 5. Navega para a nova URL com os cookies já injetados
  await newPage.goto(targetUrl, {
    waitUntil: 'networkidle2',
    timeout: 30000,
  });

  // 6. Retorna a página pronta para scraping
  return newPage;
}
