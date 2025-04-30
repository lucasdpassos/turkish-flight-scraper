import { Page } from 'playwright';

export async function selectArrivalDate(page: Page, dateParts: {
  day: number;
  month: number;
  year: number;
}) {
  const desiredLabel = new Date(dateParts.year, dateParts.month - 1).toLocaleString('en-US', {
    month: 'long',
    year: 'numeric',
  }); // ex: "October 2025"

  const nextButton = page.locator('xpath=//*[@id="bookerDatepicker"]/div/div/div/div/div[2]/div[2]/div[1]/button[2]');
  const rightMonth = page.locator('#bookerDatepicker div.hm__style_monthLabel__7gHka').last();

  // Lucas: Navigate calendar until target month appears in right panel
  for (let i = 0; i < 12; i++) {
    const current = await rightMonth.textContent();
    const trimmed = current?.trim();
    console.log(`🧭 Esperado: ${desiredLabel} | Visível: ${trimmed}`);

    if (trimmed === desiredLabel) break;

    await nextButton.click();
    await page.waitForTimeout(1000); // Brief pause between navigation attempts
  }

  /// Lucas: Generate aria-label format for date selection (e.g., "Fri Oct 25 2024")
  const date = new Date(dateParts.year, dateParts.month - 1, dateParts.day);
  const weekday = date.toLocaleString('en-US', { weekday: 'short' });
  const month = date.toLocaleString('en-US', { month: 'short' });
  const day = String(date.getDate()).padStart(2, '0');
  const year = date.getFullYear();
  const ariaLabel = `${weekday} ${month} ${day} ${year}`;

  await page.waitForSelector(`#bookerDatepicker [aria-label="${ariaLabel}"]`, { timeout: 10000 });

  // Lucas: Select target date in calendar
  await page.locator(`#bookerDatepicker [aria-label="${ariaLabel}"]`).click();
}

export async function selectAirlinesDate(
  page: Page,
  departureDay: number,
  departureMonth: number,
  departureYear: number,
): Promise<void> {
   // Lucas: Open month selection dropdown
  const monthDropdown = page.locator(
    '.hm__style_thy-button__ZfnOU.hm__style_button__QxvpK.hm__style_monthDropdownButton__0cyac'
  );
  await monthDropdown.waitFor({ timeout: 10000 });
  await monthDropdown.click();

  const targetMonthLabel = new Date(departureYear, departureMonth - 1).toLocaleString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  const monthButtons = page.locator(
    '.hm__style_dropdownContent__L7K6y.hm__style_start__WMD_R.hm__style_monthDropdownContent__7NNhL button'
  );
  const count = await monthButtons.count();
  for (let i = 0; i < count; i++) {
    const button = monthButtons.nth(i);
    const text = await button.textContent();
    if (text?.trim() === targetMonthLabel) {
      await button.click();
      break;
    }
  }

  //Lucas: Generate and select target date using aria-label format
  const date = new Date(departureYear, departureMonth - 1, departureDay);
  const weekday = date.toLocaleString('en-US', { weekday: 'short' });
  const month = date.toLocaleString('en-US', { month: 'short' });
  const day = String(date.getDate()).padStart(2, '0');
  const year = date.getFullYear();
  const ariaLabel = `${weekday} ${month} ${day} ${year}`;

  await page.waitForSelector(`#bookerDatepicker [aria-label="${ariaLabel}"]`, { timeout: 10000 });
  await page.locator(`#bookerDatepicker [aria-label="${ariaLabel}"]`).click();
}
