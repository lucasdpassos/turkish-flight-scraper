import { Injectable, Logger } from '@nestjs/common';
import { SearchFlightsDto } from './dto/search-flights.dto';
import { FlightSegment } from './interfaces/flight-segment.interface';
import { selectAirlinesDate, selectArrivalDate } from '../utils/select-airlines-date';
import { selectPassengerCabin, selectPassengerCounts } from '../utils/select-passenger';
import { PlaywrightService } from '../common/playwright/playwright.service';
import { Page } from 'playwright';

@Injectable()
export class ScraperService {
  private readonly logger = new Logger(ScraperService.name);
  constructor(private readonly browserService: PlaywrightService) {}

  private async simulateHumanInteraction(page: Page) {
    // Lucas: Random mouse movements
    const viewport = page.viewportSize();
    if (viewport) {
      await page.mouse.move(viewport.width * 0.3, viewport.height * 0.3);
      await page.waitForTimeout(300 + Math.random() * 500);
      await page.mouse.move(viewport.width * 0.5, viewport.height * 0.5, { steps: 10 });
      await page.waitForTimeout(200 + Math.random() * 300);
    }

    // Lucas: Smooth scrolling
    // Scroll down a random distance to simulate human scrolling
    await page.evaluate(async () => {
      await new Promise<void>((resolve) => {
        let totalScrolled = 0;
        const distance = 300 + Math.random() * 700;
        const step = distance / 20;
        
        const scrollInterval = setInterval(() => {
          window.scrollBy(0, step);
          totalScrolled += step;
          
          if (totalScrolled >= distance) {
            clearInterval(scrollInterval);
            resolve();
          }
        }, 50 + Math.random() * 100);
      });
    });

    // Lucas: Variable waiting time to simulate human behavior
    await page.waitForTimeout(1000 + Math.random() * 2000);
  }

  // Lucas: The humanClick function simulates human clicking with variable speed and random errors
  private async humanClick(page: Page, selector: string) {
    const element = await page.waitForSelector(selector);
    await element.scrollIntoViewIfNeeded();
    
    const box = await element.boundingBox();
    if (box) {
      // Lucas: Not linear mouse movements
      await page.mouse.move(box.x + box.width * 0.2, box.y + box.height * 0.2);
      await page.waitForTimeout(200 + Math.random() * 300);
      await page.mouse.move(box.x + box.width * 0.5, box.y + box.height * 0.5, { steps: 5 });
      await page.waitForTimeout(100 + Math.random() * 200);
      
      // Lucas: variavle press and release time
      await page.mouse.down();
      await page.waitForTimeout(50 + Math.random() * 100);
      await page.mouse.up();
    }
  }

  // Lucas: The humanType function simulates human typing with variable speed and random errors
  private async humanType(page: Page, selector: string, text: string) {
    await page.waitForSelector(selector);
    await page.click(selector, { delay: 100 + Math.random() * 100 });
    await page.waitForTimeout(200 + Math.random() * 300);

    for (const char of text) {
      await page.keyboard.press(char, { delay: 50 + Math.random() * 150 });
      if (Math.random() > 0.9) { // 10% of chance to simulate a typing error (suficient to bypass the akamai anti-bot)
        await page.keyboard.press('Backspace');
        await page.waitForTimeout(100 + Math.random() * 200);
        await page.keyboard.press(char);
      }
    }
  }

  async searchFlights(params: SearchFlightsDto): Promise<FlightSegment[]> {
    const page: Page = await this.browserService.getPage();

    // Lucas: The capturedSegments variable is used to store the segments captured in the /availability endpoint interception
    let capturedSegments: FlightSegment[] = [];

    try {
      // Lucas: simplified interception for the /availability endpoint
      await page.route('**/availability', async (route) => {
        this.logger.log('Intercepted **/availability');
        await route.continue();
      });
      

      page.on('response', async (response) => {
        if (response.url().includes('/availability') && response.status() === 428) {
          this.logger.log('Akamai anti-bot Challenge fired');
        }
      }); 

      const segmentsPromise = new Promise<FlightSegment[]>((resolve) => {
      page.on('response', async (response) => {
        const url = response.url();
      
        if (url.includes('/api/v1/availability')) {
          try {
            const json = await response.json();
            this.logger.log('Intercepted /api/v1/availability');
            const segments: FlightSegment[] = [];
      
            json?.data?.originDestinationInformationList?.forEach((info: any) => {
              info.originDestinationOptionList?.forEach((option: any) => {
                if (Array.isArray(option.segmentList)) {
                  segments.push(...option.segmentList);
                }
              });
            });
            // Lucas: The /availability endpoint returns multiple times with different data,
            // so we need to check if the segments are already captured
            if(segments.length > 0) {
              this.logger.log('Segments:', segments);
              capturedSegments = segments;
              resolve(segments);
            }
          } catch (err) {
            this.logger.error('Failed to process turkish airlines json', err);
          }
        }
      })
    })
      
      // Lucas: The turkish airlines endpoint should be in the .env variavles, but for now i'm hardcoding it to facilitate the recruiter testing.
      // const endpoint = process.env.TURKISH_AIRLINES_ENDPOINT;
      await page.goto('https://www.turkishairlines.com/en-int/', {
        waitUntil: 'load',
        timeout: 60000,
      });
      await page.waitForTimeout(3000); 
      await page.waitForLoadState('load'); 
      
      await this.simulateHumanInteraction(page); // agora é seguro avaliar scripts na página

      // Lucas: This is where we can check the session data, it was crucial to find the akamai-ghost anti-bot challenge on the turkish airlines page.
      // i'm leaving commented out for now, but we can uncomment it if needed for further purposes.
/*       const sessionData = await page.evaluate(() => ({
        cId: new URL(window.location.href).searchParams.get('cId'),
        bfp: localStorage.getItem('bfp'),
        clientId: localStorage.getItem('clientId')
      }));
      console.log('Session data:', sessionData); */
      await page.waitForTimeout(2000); 
      // Lucas: Accept cookies button
      try {
        await this.humanClick(page, '#allowCookiesButton');
      } catch {
        this.logger.log('');
      }

      // Lucas: Search for flights + human interaction to select the departure and arrival locations
      // the human interaction is important to avoid detection
      // sometimes it types wrongly the departure and arrival locations (then corrects), and randomly moves the mouse to avoid being detected
      await this.humanType(page, '#fromPort', params.departureLocation);
      await page.keyboard.press('ArrowDown');
      await page.waitForTimeout(5000); 
      await page.keyboard.press('Enter');
      await this.simulateHumanInteraction(page);

      await this.humanType(page, '#toPort', params.arrivalLocation);
      await page.keyboard.press('ArrowDown');
      await page.waitForTimeout(2000); 
      await page.keyboard.press('Enter');
      await this.simulateHumanInteraction(page);

      // Lucas: Select Airlines Date
      await selectAirlinesDate(page, params.departureDay, params.departureMonth, params.departureYear);
      if (params.returnDay && params.returnMonth && params.returnYear) {
        await this.simulateHumanInteraction(page);
        await selectArrivalDate(page, {
          day: params.returnDay,
          month: params.returnMonth,
          year: params.returnYear,
        });
      }
      await this.simulateHumanInteraction(page);

      // Lucas: Select Passenger Cabin and Number of Passengers
      // Important remember: For the Turkish Airlines, the number of adult passengers is always equals the number of infants,
      // so is a good practice to set the number of adults and infants to the same value.
      await selectPassengerCabin(page, params.cabinClass);
      await selectPassengerCounts(page, {
        adults: params.adults,
        children: params.children,
        infants: params.infants,
        students: params.students,
      });
      await this.simulateHumanInteraction(page);

      // Lucas: Search button interaction
      const searchButtonSelector = '.hm__style_thy-button__ZfnOU.hm__RoundAndOneWayTab_searchButton__vpLcA';
      await this.humanClick(page, searchButtonSelector);

      // Lucas: Wait for the page to load and the network to be idle
      await page.waitForLoadState('networkidle', { timeout: 3000 });
      await page.waitForTimeout(5000); 

      // Lucas: Returns the availability JSON captured in the /availability endpoint interception
      return capturedSegments
    } catch (err) {
      this.logger.error('An error ocurred while scraping', err);
      throw err;
    } finally {
      this.logger.log('Finished Scraping');
    }
  }
}