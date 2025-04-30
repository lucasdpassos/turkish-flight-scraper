import { Injectable } from '@nestjs/common';
import { SearchFlightsDto } from './dto/search-flights.dto';
import { selectAirlinesDate, selectArrivalDate } from '../utils/select-airlines-date';
import { selectPassengerCabin, selectPassengerCounts } from '../utils/select-passenger';
import { PlaywrightService } from '../common/playwright/playwright.service';
import { Page } from '@playwright/test';

@Injectable()
export class ScraperService {
  constructor(private readonly browserService: PlaywrightService) {}

  async searchFlights(params: SearchFlightsDto): Promise<void> {
    const page: Page = await this.browserService.getPage();

    let headersFromStorage = {
      clientId: '',
      bfp: '',
      conversationId: '',
    };

    // Intercepta request e loga tudo
    await page.route('**/availability', async (route, request) => {
      console.log('\n🛑 Interceptado /api/availability');
      console.log('🔸 Método:', request.method());
      console.log('🔸 URL:', request.url());
      console.log('🔸 Cabeçalhos:', request.headers());
      console.log('🔸 Corpo da requisição:', request.postData());
      await route.continue();
    });

    page.on('response', async (response) => {
      if (response.url().includes('/availability')) {
        console.log('\n📩 Resposta recebida de /api/availability');
        console.log('🔹 Status:', response.status());
        const headers = response.headers();
        const body = await response.text();
        console.log('🔹 Headers:', headers);
        console.log('🔹 Body:', body);
      }
    });

    await page.goto('https://www.turkishairlines.com/en-int/', {
      waitUntil: 'load',
      timeout: 60000,
    });

    await page.waitForSelector('#allowCookiesButton', { timeout: 10000 });
    await page.waitForTimeout(2000);
    await page.click('#allowCookiesButton');

    // Preenche origem
    await page.waitForSelector('#fromPort');
    await page.click('#fromPort', { clickCount: 3 });
    await page.fill('#fromPort', params.departureLocation);
    await page.keyboard.press('ArrowDown');
    await page.waitForTimeout(1000);
    await page.keyboard.press('Enter');

    // Preenche destino
    await page.click('#toPort', { clickCount: 3 });
    await page.fill('#toPort', params.arrivalLocation);
    await page.keyboard.press('ArrowDown');
    await page.waitForTimeout(1000);
    await page.keyboard.press('Enter');

    // Seleciona datas
    await selectAirlinesDate(page, params.departureDay, params.departureMonth, params.departureYear);
    await page.waitForTimeout(1000);
    if (params.returnDay && params.returnMonth && params.returnYear) {
      await selectArrivalDate(page, {
        day: params.returnDay,
        month: params.returnMonth,
        year: params.returnYear,
      });
    }

    // Passageiros
    await selectPassengerCabin(page, params.cabinClass);
    await page.waitForTimeout(1000);
    await selectPassengerCounts(page, {
      adults: params.adults,
      children: params.children,
      infants: params.infants,
      students: params.students,
    });

    await page.waitForTimeout(1500);

    const searchButtonSelector = '.hm__style_thy-button__ZfnOU.hm__RoundAndOneWayTab_searchButton__vpLcA';
    await page.waitForSelector(searchButtonSelector);
    await page.locator(searchButtonSelector).scrollIntoViewIfNeeded();
    await page.waitForTimeout(1000);
    await page.click(searchButtonSelector);

    await page.waitForTimeout(3000);

    // Extrai cId da URL e salva em sessionStorage
    const cId = new URL(page.url()).searchParams.get('cId');
    if (cId) {
      await page.evaluate((id) => {
        sessionStorage.setItem('X-Conversation-Id', id);
      }, cId);
      headersFromStorage.conversationId = cId;
      console.log('✅ cId extraído da URL e salvo como X-Conversation-Id:', cId);
    }

    // Captura clientId e bfp diretamente do localStorage
    const storageValues = await page.evaluate(() => {
      return {
        clientId: localStorage.getItem('clientId'),
        bfp: localStorage.getItem('bfp'),
        conversationId: sessionStorage.getItem('X-Conversation-Id'),
      };
    });

    headersFromStorage = { ...headersFromStorage, ...storageValues };

    console.log('\n🧩 Headers capturados para debug:');
    console.log(headersFromStorage);

    // Aguarda a chamada ser feita com os headers configurados
    await page.waitForTimeout(10000);
  }
}
