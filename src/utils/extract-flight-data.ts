// src/utils/extract-flight-data.ts
import { Page } from 'playwright';
import { FlightResult, FlightSegment } from '../scraper/dto/flight-result-dto';

export async function extractFlightData(page: Page): Promise<FlightResult[]> {
  const results: FlightResult[] = [];

  // Aguarda todos os blocos de voo principais
  await page.waitForSelector('[id^="flightItem_recommendedOrder"]', { timeout: 20000 });
  const flightBlocks = await page.locator('[id^="flightItem_recommendedOrder"]').elementHandles();

  for (const block of flightBlocks) {
    try {
      const segments: FlightSegment[] = [];

      const detailSegments = await block.$$('div.av__style_segment__AW9Zh');

      for (const segment of detailSegments) {
        const duration = await segment.$eval(
          '.av__style_duration__hBjhX',
          el => (el as HTMLElement).innerText.trim()
        );

        const fromTime = await segment.$eval(
          '.av__style_departure-information__MD5Ui span.av__style_date__zutq0',
          el => (el as HTMLElement).innerText.trim()
        );

        const fromCity = await segment.$eval(
          '.av__style_departure-information__MD5Ui span.av__style_code__Czwhr',
          el => (el as HTMLElement).innerText.trim()
        );

        const fromAirport = await segment.$eval(
          '.av__style_name__IDpLN:nth-of-type(1)',
          el => (el as HTMLElement).innerText.trim()
        );

        const airlineFull = await segment.$eval(
          '.av__style_carrier__eYot3',
          el => (el as HTMLElement).innerText.trim()
        );
        const [airline, flightNumber] = airlineFull.split(' - ').map(s => s.trim());

        const aircraft = await segment.$eval(
          '.av__style_plane-type__OBB_l',
          el => (el as HTMLElement).innerText.trim()
        );

        const toTime = await segment.$$eval(
          'div > span.av__style_date__zutq0',
          spans => spans.map(s => s.textContent?.trim()).pop() || ''
        );

        const toCity = await segment.$$eval(
          'div > span.av__style_code__Czwhr',
          spans => spans.map(s => s.textContent?.trim()).pop() || ''
        );

        const toAirport = await segment.$eval(
          '.av__style_name__IDpLN:last-of-type',
          el => (el as HTMLElement).innerText.trim()
        );

        segments.push({
          airline,
          flightNumber,
          aircraft,
          duration,
          from: {
            time: fromTime,
            city: fromCity,
            airport: fromAirport,
          },
          to: {
            time: toTime,
            city: toCity,
            airport: toAirport,
          },
        });
      }

      results.push({ segments });
    } catch (err) {
      console.warn('⚠️ Erro ao extrair voo completo:', err.message);
    }
  }

  return results;
}
