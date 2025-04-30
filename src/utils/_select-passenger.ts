import { Page } from 'puppeteer';

/**
 * Clica no seletor e escolhe a cabine (ECONOMY ou BUSINESS)
 */
export async function selectPassengerCabin(page: Page, cabinClass: 'ECONOMY' | 'BUSINESS') {
  await page.waitForSelector('#bookerFlightPaxpicker [role="button"]', { timeout: 10000 });
  await page.click('#bookerFlightPaxpicker [role="button"]');
  await page.evaluate(() => new Promise(resolve => setTimeout(resolve, 1000)));

  const isBusiness = cabinClass === 'BUSINESS';

  await page.$$eval('input[name="cabin-type"]', (inputs, business) => {
    inputs.forEach(input => {
      const label = input.parentElement?.textContent?.toUpperCase();
      if (business && label?.includes('BUSINESS')) {
        (input as HTMLInputElement).click();
      } else if (!business && label?.includes('ECONOMY')) {
        (input as HTMLInputElement).click();
      }
    });
  }, isBusiness);

  await page.evaluate(() => new Promise(resolve => setTimeout(resolve, 1000)));
}

/**
 * Ajusta o contador de um tipo de passageiro para o valor desejado
 */
async function adjustPassengerCount(
  page: Page,
  type: 'Adult' | 'Child' | 'Infant' | 'Student',
  target: number
) {
  const idBase = `bookerFlightPaxPicker${type}`;
  const spanSelector = `#${idBase} div:nth-child(2) span`;
  const plusButtonSelector = `#bookerFlightPaxPickerPlus${type}`;

  await page.waitForSelector(spanSelector, { timeout: 5000 });

  const current = await page.$eval(spanSelector, el => parseInt(el.textContent || '0'));
  const diff = target - current;
  if (diff <= 0) return;

  for (let i = 0; i < diff; i++) {
    await page.click(plusButtonSelector);
    await page.evaluate(() => new Promise(resolve => setTimeout(resolve, 1000)));
  }
}

/**
 * Preenche os valores dos passageiros com base no body
 */
export async function selectPassengerCounts(
  page: Page,
  passengers: {
    adults: number;
    children: number;
    infants: number;
    students: number;
  }
) {
  await adjustPassengerCount(page, 'Adult', passengers.adults);
  await adjustPassengerCount(page, 'Child', passengers.children);
  await adjustPassengerCount(page, 'Infant', passengers.infants);
  await adjustPassengerCount(page, 'Student', passengers.students);
}
