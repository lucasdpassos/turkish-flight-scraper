import { Injectable } from '@nestjs/common';
import { SearchFlightsDto } from './dto/search-flights.dto';
import { selectAirlinesDate, selectArrivalDate } from '../utils/select-airlines-date';
import { selectPassengerCabin, selectPassengerCounts } from '../utils/select-passenger';
import { PlaywrightService } from '../common/playwright/playwright.service';
import { Page } from 'playwright';

@Injectable()
export class ScraperService {
  constructor(private readonly browserService: PlaywrightService) {}

  async searchFlights(params: SearchFlightsDto): Promise<void> {
    const page: Page = await this.browserService.getPage();

    try {
      let challengePayload: any = null;

      await page.route('**/availability', async (route, request) => {
        console.log('🛑 Interceptado /availability');
        console.log('🔸 Método:', request.method());
        console.log('🔸 URL:', request.url());
        console.log('🔸 Cabeçalhos:', request.headers());
        console.log('🔸 Corpo da requisição:', request.postData());
        await route.continue();
      });

      page.on('response', async (response) => {
        if (response.url().includes('/availability')) {
          console.log('\n📩 Resposta recebida de /availability');
          console.log('🔹 Status:', response.status());
          const headers = response.headers();
          console.log('🔹 Headers:', headers);

          if (response.status() === 428 && headers['sec-cp-challenge'] === 'true') {
            const bodyText = await response.text();
            try {
              const json = JSON.parse(bodyText);
              console.log('🔐 Challenge Payload:', json);
              challengePayload = json;
            } catch {
              console.warn('⚠️ Erro ao parsear body da challenge');
            }
          }
        }
      });

      // Navegação inicial
      await page.goto('https://www.turkishairlines.com/en-int/', {
        waitUntil: 'load',
        timeout: 60000,
      });

      // Simula movimento humano
      await page.mouse.move(100, 100);
      await page.mouse.click(100, 100);
      await page.evaluate(() => window.scrollBy(0, 500));
      await page.waitForTimeout(2000 + Math.random() * 3000);

      // Extração de headers de sessão
      const cId = await page.evaluate(() => {
        const url = new URL(window.location.href);
        const cid = url.searchParams.get('cId');
        if (cid) {
          sessionStorage.setItem('X-conversation-Id', cid);
        }
        return cid;
      });

      const bfp = await page.evaluate(() => localStorage.getItem('bfp'));
      const clientId = await page.evaluate(() => localStorage.getItem('clientId'));
      const conversationId = await page.evaluate(() => sessionStorage.getItem('X-conversation-Id'));

      console.log('✅ cId extraído da URL e salvo como X-Conversation-Id:', cId);
      console.log('🧩 Headers capturados para debug:', { clientId, bfp, conversationId });

      await page.waitForTimeout(2000);

      // Aceita cookies
      await page.waitForSelector('#allowCookiesButton', { timeout: 10000 });
      await page.waitForTimeout(3000);
      await page.click('#allowCookiesButton');

      // Origem
      await page.waitForSelector('#fromPort');
      await page.waitForTimeout(1000);
      await page.fill('#fromPort', params.departureLocation);
      await page.keyboard.press('ArrowDown');
      await page.waitForTimeout(1000);
      await page.keyboard.press('Enter');

      // Destino
      await page.waitForSelector('#toPort');
      await page.fill('#toPort', params.arrivalLocation);
      await page.keyboard.press('ArrowDown');
      await page.waitForTimeout(1000);
      await page.keyboard.press('Enter');
      await page.waitForTimeout(1000);

      // Datas
      await selectAirlinesDate(page, params.departureDay, params.departureMonth, params.departureYear);
      if (params.returnDay && params.returnMonth && params.returnYear) {
        await selectArrivalDate(page, {
          day: params.returnDay,
          month: params.returnMonth,
          year: params.returnYear,
        });
      }

      await page.waitForTimeout(1000);

      // Passageiros
      await selectPassengerCabin(page, params.cabinClass);
      await page.waitForTimeout(1000);
      await selectPassengerCounts(page, {
        adults: params.adults,
        children: params.children,
        infants: params.infants,
        students: params.students,
      });

      await page.waitForTimeout(2000);

      // Clicar no botão de busca
      const searchButtonSelector = '.hm__style_thy-button__ZfnOU.hm__RoundAndOneWayTab_searchButton__vpLcA';
      await page.waitForSelector(searchButtonSelector, { timeout: 10000 });
      await page.locator(searchButtonSelector).scrollIntoViewIfNeeded();
      await page.waitForTimeout(1000);
      await page.click(searchButtonSelector);

      await page.waitForTimeout(20000);
    } catch (err) {
      console.error('❌ Erro durante scraping:', err);
      throw err;
    } finally {
      console.log('✅ Fechando a página...');
    }
  }
}
