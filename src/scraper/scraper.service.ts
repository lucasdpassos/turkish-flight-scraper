import { Injectable } from '@nestjs/common';
import * as puppeteer from 'puppeteer';
import { SearchFlightsDto } from './dto/search-flights.dto';
import { FlightResult } from './interfaces/flight-result.interface';

@Injectable()
export class ScraperService {
  async searchFlights(params: SearchFlightsDto): Promise<FlightResult[]> {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    try {
      await page.goto('https://www.turkishairlines.com/', { waitUntil: 'networkidle0' });

      // Lógica de preenchimento dos campos + envio
      // Exemplo fictício:
      await page.type('#departure', params.departureLocation);
      await page.type('#arrival', params.arrivalLocation);
      await page.type('#departureDate', params.departureDate);
      await page.click('#searchFlightsButton');

      await page.waitForSelector('.flight-list');

      const flights = await page.evaluate(() => {
        const results: FlightResult[] = [];
        const flightElements = document.querySelectorAll('.flight-item');

        flightElements.forEach((flight) => {
          results.push({
            flightCode: flight.querySelector('.flight-code')?.textContent || '',
            departureAirport: flight.querySelector('.departure-airport')?.textContent || '',
            arrivalAirport: flight.querySelector('.arrival-airport')?.textContent || '',
            departureTime: flight.querySelector('.departure-time')?.textContent || '',
            arrivalTime: flight.querySelector('.arrival-time')?.textContent || '',
            price: flight.querySelector('.price')?.textContent || '',
            airline: 'Turkish Airlines',
          });
        });

        return results;
      });

      return flights;
    } finally {
      await browser.close();
    }
  }
}
