import { Injectable } from '@nestjs/common';
import { PuppeteerService } from '../common/puppeteer/puppeteer.service'; // ajuste conforme o path real
import { SearchFlightsDto } from './dto/search-flights.dto';
import { FlightResult } from './interfaces/flight-result.interface';
import { selectAirlinesDate, selectArrivalDate } from '../utils/select-airlines-date';
import { selectPassengerCabin, selectPassengerCounts } from '../utils/select-passenger';
import { transferSessionToNewPage } from 'src/utils/transferSessionToNewPage';
import { ensureClientId } from 'src/utils/ensureClientId';


@Injectable()
export class ScraperService {
  constructor(private readonly puppeteerService: PuppeteerService) {}
  async searchFlights(params: SearchFlightsDto): Promise<any> {
    const page = await this.puppeteerService.getPage();

    try {
        await page.goto('https://www.turkishairlines.com/', {
            waitUntil: 'load', // aguarda o evento 'load' da window
            timeout: 60000     // timeout generoso para sites pesados
          });
          // Garante que localStorage e afins sejam configurados o mais cedo possível
await page.evaluateOnNewDocument(() => {
    localStorage.setItem('clientId', '3f208142-f801-4c39-a1f6-1a75db85159a');
    localStorage.setItem('bfp', 'e5cba3a5b19bbe2e8551a762b3cc6d0b');
    localStorage.setItem('app.ibs/libs/bookertabtype', '2');
    localStorage.setItem('app.ibs/libs/presearchbookings_language', 'en');
    localStorage.setItem('app.ibs/libs/presearchbookings', JSON.stringify([
      {
        originFly: { city: "Rio De Janeiro", code: "SDU", country: "Brazil", countryCode: "BR" },
      }
    ]));
    sessionStorage.setItem('X-Conversation-Id', '643218f6-51a2-49d8-a095-470dcf57ceb5'); // opcional, se capturado
  });
          await ensureClientId(page);
          await page.waitForSelector('#allowCookiesButton', { timeout: 10000 });
          await page.evaluate(() => new Promise(resolve => setTimeout(resolve, 3000)));
          // Clica no botão de aceitar todos os cookies
        await page.click('#allowCookiesButton');

        // Lucas: From port filling:
        await page.evaluate(() => new Promise(resolve => setTimeout(resolve, 1000)));
        await page.waitForSelector('#fromPort', { timeout: 10000 });
        await page.click('#fromPort', { clickCount: 3 })
        await page.evaluate(() => new Promise(resolve => setTimeout(resolve, 1000)));
        await page.type('#fromPort', params.departureLocation, { delay: 100 });
        await page.keyboard.press('ArrowDown');
        await page.evaluate(() => new Promise(resolve => setTimeout(resolve, 1000)));
        await page.keyboard.press('Enter');
        await page.evaluate(() => new Promise(resolve => setTimeout(resolve, 1000)));

        // Lucas: To port filling:
        await page.waitForSelector('#toPort', { timeout: 10000 });
        await page.click('#toPort', { clickCount: 3 })
        await page.evaluate(() => new Promise(resolve => setTimeout(resolve, 1000)));
        await page.type('#toPort', params.arrivalLocation, { delay: 100 });
        await page.keyboard.press('ArrowDown');
        await page.evaluate(() => new Promise(resolve => setTimeout(resolve, 1000)));
        await page.keyboard.press('Enter');
        await page.evaluate(() => new Promise(resolve => setTimeout(resolve, 1000)));

        // Lucas: Departure date filling:

        await selectAirlinesDate(
            page,
            params.departureDay,
            params.departureMonth,
            params.departureYear
        );

        if (params.returnDay && params.returnMonth && params.returnYear) {
            await selectArrivalDate(page, {
              day: params.returnDay,
              month: params.returnMonth,
              year: params.returnYear,
            });
          }
          await page.evaluate(() => new Promise(resolve => setTimeout(resolve, 1000)));
       
          // Lucas: Passengers filling:
          await selectPassengerCabin(page, params.cabinClass);
          await selectPassengerCounts(page, {
            adults: params.adults,
            children: params.children,
            infants: params.infants,
            students: params.students,
          });
          await page.evaluate(() => new Promise(resolve => setTimeout(resolve, 2000)));
            // Lucas: Clica no botão de pesquisa
          const buttons = await page.$$eval('button', btns =>
            btns.map(btn => ({
              text: btn.textContent?.trim(),
              class: btn.className,
              visible: !!(btn.offsetWidth || btn.offsetHeight || btn.getClientRects().length),
            }))
          );
          
          console.log('Botões encontrados:', buttons);

          const searchButtonSelector = '.hm__style_thy-button__ZfnOU.hm__RoundAndOneWayTab_searchButton__vpLcA';

await page.waitForSelector(searchButtonSelector, { timeout: 10000 });

const cookies = await page.cookies();
const storageData = await page.evaluate(() => ({
  local: Object.entries(localStorage),
  session: Object.entries(sessionStorage),
}));

await page.setCookie({
    name: 'clientID',
    value: "3f208142-f801-4c39-a1f6-1a75db85159a",
    domain: '.turkishairlines.com',
    path: '/',
  });

// Garante visibilidade na viewport
await page.evaluate((selector) => {
  const btn = document.querySelector(selector);
  if (btn) btn.scrollIntoView({ behavior: 'auto', block: 'center' });
}, searchButtonSelector);




// Clica no botão
await page.click(searchButtonSelector);
await page.evaluate(() => {
    localStorage.setItem('clientId', '3f208142-f801-4c39-a1f6-1a75db85159a');
    localStorage.setItem('bfp', 'e5cba3a5b19bbe2e8551a762b3cc6d0b');
    localStorage.setItem('app.ibs/libs/bookertabtype', '2');
    localStorage.setItem('app.ibs/libs/presearchbookings_language', 'en');
    localStorage.setItem('app.ibs/libs/presearchbookings', JSON.stringify([{
      originFly: { city: 'Rio De Janeiro', code: 'SDU', country: 'Brazil', countryCode: 'BR' }
    }]));
    sessionStorage.setItem('x-conversation-id', '3f208142-f801-4c39-a1f6-1a75db85159a');
  });
await page.evaluate(() => new Promise(resolve => setTimeout(resolve, 20000)));

} catch (err) {
    console.error('Erro durante scraping:', err);
    throw err;

    } finally {
      console.log(  'Fechando a página...');
    }
  }
}
