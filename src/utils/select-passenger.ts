import { Page } from '@playwright/test';

export async function selectPassengerCabin(page: Page, cabinClass: 'ECONOMY' | 'BUSINESS') {
  await page.locator('#bookerFlightPaxpicker [role="button"]').click();
  await page.waitForTimeout(1000);

  const isBusiness = cabinClass === 'BUSINESS';

  const cabinRadios = await page.$$('input[name="cabin-type"]');
  for (const radio of cabinRadios) {
    const labelText = await radio.evaluate(el => el.parentElement?.textContent?.toUpperCase() || '');
    if ((isBusiness && labelText.includes('BUSINESS')) || (!isBusiness && labelText.includes('ECONOMY'))) {
      await radio.click();
      break;
    }
  }

  await page.waitForTimeout(1000);
}

async function adjustPassengerCount(
  page: Page,
  type: 'Adult' | 'Child' | 'Infant' | 'Student',
  target: number
) {
  const idBase = `bookerFlightPaxPicker${type}`;
  const spanSelector = `#${idBase} div:nth-child(2) span`;
  const plusButtonSelector = `#bookerFlightPaxPickerPlus${type}`;

  await page.waitForSelector(spanSelector, { timeout: 5000 });

  const current = parseInt(await page.textContent(spanSelector) || '0');
  const diff = target - current;
  if (diff <= 0) return;

  for (let i = 0; i < diff; i++) {
    await page.click(plusButtonSelector);
    await page.waitForTimeout(1000);
  }
}

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
