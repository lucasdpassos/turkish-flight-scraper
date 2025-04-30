import { Page } from 'playwright';

export interface FlightData {
  id: string;
  departureTime: string;
  arrivalTime: string;
  totalDuration: string;
  price: string;
  cabinClass: string;
}

export async function extractFlightData(page: Page): Promise<FlightData[]> {
    await page.waitForTimeout(5000); 

  const flights = await page.$$eval('#av_FlightPanel_flightList_gpmKf > div[data-testid]', (nodes) => {
    return nodes.map((node) => {
      const id = node.getAttribute('data-testid') || '';
      const timeText = node.querySelector('[aria-label*="Itinerary details"]')?.getAttribute('aria-label') || '';
      const [departureTime = '', arrivalTime = ''] = timeText.split(' - ').map(t => t.trim());

      const duration = node.querySelector('div[class*="FlightList_duration_"]')?.textContent?.trim() || '';
      const price = node.querySelector('div[class*="price-cabin-container_"] div[class*="price_"]')?.textContent?.trim() || '';
      const cabinClass = 'Business'; // fixo por ora, pode ser extraído se tiver selector dinâmico
     
      return {
        id,
        departureTime,
        arrivalTime,
        totalDuration: duration,
        price,
        cabinClass,
      };
    });
  });

  return flights;
}
