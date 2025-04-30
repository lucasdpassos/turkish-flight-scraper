import { Injectable, OnModuleDestroy } from '@nestjs/common';
import puppeteer from 'puppeteer-extra';
const StealthPlugin = require('puppeteer-extra-plugin-stealth'); 
import { Browser, Page } from 'puppeteer';

const stealth = StealthPlugin();
stealth.enabledEvasions.delete('iframe.contentWindow');
stealth.enabledEvasions.delete('media.codecs');
puppeteer.use(require('puppeteer-extra-plugin-anonymize-ua')());
puppeteer.use(require('puppeteer-extra-plugin-font-size')());
puppeteer.use(stealth); // fora de qualquer método/classe

@Injectable()
export class PuppeteerService implements OnModuleDestroy {
  private browser: Browser;
  private readonly ua =
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/69.0.3497.100 Safari/537.36';

  async getBrowser(): Promise<Browser> {
    if (!this.browser) {
      this.browser = await puppeteer.launch({
        headless: false,
        //userDataDir: './tmp-user-data',
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--enable-features=SameSiteByDefaultCookies,CookiesWithoutSameSiteMustBeSecure',
          ],
      });
    }
    return this.browser;
  }

  async getPage(): Promise<Page> {
    const browser = await this.getBrowser();
    const page = await browser.newPage();
    // Lucas: O site da Turkish Airlines usa detecção de bots sofisticada, baseada em inspeções profundas de métodos nativos JavaScript, como Function.prototype.toString.
    // Portanto, é necessário desativar a detecção de bots.
    // Lucas: A solução abaixo é temporária, pois o site pode mudar a qualquer momento.
    // Lucas: A solução ideal a longo prazo seria usar um proxy rotativo.
    await page.setUserAgent(this.ua);
    await page.evaluateOnNewDocument(() => {
        delete Function.prototype.toString
    })
    await page.setJavaScriptEnabled(true);
    await page.setBypassCSP(false); // Lucas: Adicionei o bypassCSP só por garantia
    await page.setViewport({ width: 1280, height: 800 });
/*     await page.setExtraHTTPHeaders({
        'X-clientId': '3f208142-f801-4c39-a1f6-1a75db85159a',
        'X-requestId': '<algum-uuid-válido>',
        'X-bfp': 'e5cba3a5b19bbe2e8551a762b3cc6d0b',
        'X-country': 'BR',
        'X-token': 'AgQQAPNkF-RO0rJK3XbHeB088mP3dpdHf4fvYNhe7w',
        'X-conversation-id': '3f208142-f801-4c39-a1f6-1a75db85159a',
      }); */
    return page;
  }

  async closeBrowser(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }

  async onModuleDestroy(): Promise<void> {
    await this.closeBrowser();
  }
}
