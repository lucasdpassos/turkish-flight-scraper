// src/utils/select-departure-date.ts
import { Page } from 'puppeteer';

export async function selectArrivalDate(page: Page, dateParts: {
  day: number;
  month: number;
  year: number;
}) {
  const desiredLabel = new Date(dateParts.year, dateParts.month - 1).toLocaleString('en-US', {
    month: 'long',
    year: 'numeric',
  }); // ex: "October 2025"

  const rightMonthSelector = '#bookerDatepicker div[class*=monthLabels] div:last-child';
  const nextButtonXPath = '//*[@id="bookerDatepicker"]/div/div/div/div/div[2]/div[2]/div[1]/button[2]';

  // Loop até o mês certo aparecer no lado direito
  for (let i = 0; i < 12; i++) {
    const currentRightMonth = await page.$eval(rightMonthSelector, el => (el as HTMLElement).innerText.trim());

    if (currentRightMonth === desiredLabel) break;

    const nextButton = await page.evaluateHandle((xpath) => {
      const result = document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null);
      return result.singleNodeValue as HTMLElement | null;
    }, nextButtonXPath);
    if (!nextButton) throw new Error('Botão para avançar o mês não encontrado');
    await page.evaluate(() => new Promise(resolve => setTimeout(resolve, 1000)));
    console.log(`🧭 Esperado: ${desiredLabel} | Visível: ${currentRightMonth}`);
    await nextButton.click();
  }
  await page.evaluate(() => new Promise(resolve => setTimeout(resolve, 1000)));
  // Agora que o mês está visível, clique no dia
  const date = new Date(dateParts.year, dateParts.month - 1, dateParts.day);
  const weekday = date.toLocaleString('en-US', { weekday: 'short' });
  const month = date.toLocaleString('en-US', { month: 'short' });
  const day = String(date.getDate()).padStart(2, '0');
  const year = date.getFullYear();
  const ariaLabel = `${weekday} ${month} ${day} ${year}`;

  await page.waitForSelector(`#bookerDatepicker [aria-label="${ariaLabel}"]`, { timeout: 10000 });
  await page.evaluate(() => new Promise(resolve => setTimeout(resolve, 1000)));
  await page.evaluate((label) => {
    const span = document.querySelector(`[aria-label="${label}"]`);
    if (span && span.parentElement?.tagName === 'BUTTON') {
      (span.parentElement as HTMLElement).click();
    }
  }, ariaLabel);

}

export async function selectAirlinesDate(
  page: Page,
  departureDay: number,
  departureMonth: number,
  departureYear: number,
): Promise<void> {
  // Aguarda e abre o dropdown de meses
  await page.waitForSelector(
    '.hm__style_thy-button__ZfnOU.hm__style_button__QxvpK.hm__style_monthDropdownButton__0cyac',
    { timeout: 10000 }
  );
  await page.click(
    '.hm__style_thy-button__ZfnOU.hm__style_button__QxvpK.hm__style_monthDropdownButton__0cyac'
  );

  // Gera o label correto do mês ("August 2025")
  const targetMonthLabel = new Date(departureYear, departureMonth - 1).toLocaleString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  // Espera dropdown abrir e seleciona o mês correto
  await page.waitForSelector(
    '.hm__style_dropdownContent__L7K6y.hm__style_start__WMD_R.hm__style_monthDropdownContent__7NNhL',
    { timeout: 10000 }
  );
  await page.$$eval(
    '.hm__style_dropdownContent__L7K6y.hm__style_start__WMD_R.hm__style_monthDropdownContent__7NNhL button',
    (buttons, label) => {
      const target = buttons.find(btn => btn.textContent?.trim() === label);
      if (target) (target as HTMLElement).click();
    },
    targetMonthLabel
  );

  // Monta o label do dia ("Mon Aug 04 2025")
  const date = new Date(departureYear, departureMonth - 1, departureDay);
  const weekday = date.toLocaleString('en-US', { weekday: 'short' });
  const month = date.toLocaleString('en-US', { month: 'short' });
  const day = String(date.getDate()).padStart(2, '0');
  const year = date.getFullYear();
  const ariaLabel = `${weekday} ${month} ${day} ${year}`;

  await page.waitForSelector(`#bookerDatepicker [aria-label="${ariaLabel}"]`, { timeout: 10000 });

  // Clica no <span> com o aria-label e propaga para o <button>
  await page.evaluate((label) => {
    const span = document.querySelector(`[aria-label="${label}"]`);
    if (span && span.parentElement?.tagName === 'BUTTON') {
      (span.parentElement as HTMLElement).click();
    }
  }, ariaLabel);

}
