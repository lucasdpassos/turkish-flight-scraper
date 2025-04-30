import { Injectable } from '@nestjs/common';
import { SearchFlightsDto } from './dto/search-flights.dto';
import { selectAirlinesDate, selectArrivalDate } from '../utils/select-airlines-date';
import { selectPassengerCabin, selectPassengerCounts } from '../utils/select-passenger';
import { PlaywrightService } from '../common/playwright/playwright.service';
import { extractFlightData } from '../utils/extract-flight-data';
import { Page } from 'playwright';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class ScraperService {
  constructor(private readonly browserService: PlaywrightService) {}

  private async simulateHumanInteraction(page: Page) {
    // Movimentos de mouse mais naturais com curva
    const viewport = page.viewportSize();
    if (viewport) {
      await page.mouse.move(viewport.width * 0.3, viewport.height * 0.3);
      await page.waitForTimeout(300 + Math.random() * 500);
      await page.mouse.move(viewport.width * 0.5, viewport.height * 0.5, { steps: 10 });
      await page.waitForTimeout(200 + Math.random() * 300);
    }

    // Rolagem suave com variação
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

    // Tempo de espera variável
    await page.waitForTimeout(1000 + Math.random() * 2000);
  }

  private async humanClick(page: Page, selector: string) {
    const element = await page.waitForSelector(selector);
    await element.scrollIntoViewIfNeeded();
    
    const box = await element.boundingBox();
    if (box) {
      // Movimento não linear para o elemento
      await page.mouse.move(box.x + box.width * 0.2, box.y + box.height * 0.2);
      await page.waitForTimeout(200 + Math.random() * 300);
      await page.mouse.move(box.x + box.width * 0.5, box.y + box.height * 0.5, { steps: 5 });
      await page.waitForTimeout(100 + Math.random() * 200);
      
      // Clique com pressão variável
      await page.mouse.down();
      await page.waitForTimeout(50 + Math.random() * 100);
      await page.mouse.up();
    }
  }

  private async humanType(page: Page, selector: string, text: string) {
    await page.waitForSelector(selector);
    await page.click(selector, { delay: 100 + Math.random() * 100 });
    await page.waitForTimeout(200 + Math.random() * 300);
    
    // Digitação com velocidade variável e possíveis erros
    for (const char of text) {
      await page.keyboard.press(char, { delay: 50 + Math.random() * 150 });
      if (Math.random() > 0.9) { // 10% de chance de "errar" e corrigir
        await page.keyboard.press('Backspace');
        await page.waitForTimeout(100 + Math.random() * 200);
        await page.keyboard.press(char);
      }
    }
  }

  async searchFlights(params: SearchFlightsDto): Promise<any[]> {
    const page: Page = await this.browserService.getPage();
    let capturedSegments: any[] = [];
    try {
      // Interceptação simplificada para logs
      await page.route('**/availability', async (route) => {
        console.log('🛑 Interceptado /availability');
        await route.continue();
      });
      

/*       page.on('response', async (response) => {
        if (response.url().includes('/availability') && response.status() === 428) {
          console.log('🔐 Challenge detectado');
        }
      }); */

      let availabilityJson: any = null;

      page.on('response', async (response) => {
        const url = response.url();
      
        if (url.includes('/api/v1/availability')) {
          try {
            const json = await response.json();
      
            console.log('📄 JSON original da Turkish capturado com sucesso');
      
            const segments: any[] = [];
      
            json?.data?.originDestinationInformationList?.forEach((info: any) => {
              info.originDestinationOptionList?.forEach((option: any) => {
                if (Array.isArray(option.segmentList)) {
                  segments.push(...option.segmentList);
                }
              });
            });
      
            console.log('✈️ Segmentos extraídos:', segments.length);
            if(segments.length > 0) {
              console.log('✈️ Segmentos:', segments);
            capturedSegments = segments;
            }
          } catch (err) {
            console.error('⚠️ Falha ao processar JSON da Turkish:', err);
          }
        }
      });
      

      await page.goto('https://www.turkishairlines.com/en-int/', {
        waitUntil: 'load',
        timeout: 60000,
      });
      await page.waitForTimeout(3000); // Espera adicional
      await page.waitForLoadState('load'); // garante que o contexto estável esteja pronto
      
      await this.simulateHumanInteraction(page); // agora é seguro avaliar scripts na página

      // Extração de sessão simplificada
      const sessionData = await page.evaluate(() => ({
        cId: new URL(window.location.href).searchParams.get('cId'),
        bfp: localStorage.getItem('bfp'),
        clientId: localStorage.getItem('clientId')
      }));
      console.log('✅ Dados de sessão:', sessionData);
      await page.waitForTimeout(2000); // Espera adicional
      // Aceitar cookies (se existir)
      try {
        await this.humanClick(page, '#allowCookiesButton');
      } catch {
        console.log('⚠️ Botão de cookies não encontrado');
      }

      // Preenchimento dos campos com interação humana
      await this.humanType(page, '#fromPort', params.departureLocation);
      await page.keyboard.press('ArrowDown');
      await page.waitForTimeout(5000); // Espera adicional
      await page.keyboard.press('Enter');
      await this.simulateHumanInteraction(page);

      await this.humanType(page, '#toPort', params.arrivalLocation);
      await page.keyboard.press('ArrowDown');
      await page.waitForTimeout(2000); // Espera adicional
      await page.keyboard.press('Enter');
      await this.simulateHumanInteraction(page);

      // Datas
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

      // Passageiros
      await selectPassengerCabin(page, params.cabinClass);
      await selectPassengerCounts(page, {
        adults: params.adults,
        children: params.children,
        infants: params.infants,
        students: params.students,
      });
      await this.simulateHumanInteraction(page);

      // Busca
      const searchButtonSelector = '.hm__style_thy-button__ZfnOU.hm__RoundAndOneWayTab_searchButton__vpLcA';
      await this.humanClick(page, searchButtonSelector);

      // Espera inteligente para resultados
      await page.waitForLoadState('networkidle', { timeout: 3000 });
      await page.waitForTimeout(5000); // Espera adicional
      const results = await extractFlightData(page);
console.log('🧾 Voos encontrados:', results);
if (availabilityJson) {
    console.log('📄 JSON original da Turkish capturado com sucesso');
  } else {
    console.warn('⚠️ JSON de /availability não foi retornado');
  }
return capturedSegments
    } catch (err) {
      console.error('❌ Erro durante scraping:', err);
      throw err;
    } finally {
      console.log('✅ Página fechada');
    }
  }
}