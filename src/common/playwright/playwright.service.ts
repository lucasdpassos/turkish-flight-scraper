import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { chromium, Page, Browser, BrowserContext } from 'playwright';

@Injectable()
export class PlaywrightService implements OnModuleDestroy {
  private browser: Browser;

  private readonly defaultViewports = [
    { width: 1366, height: 768 },
    { width: 1440, height: 900 },
    { width: 1920, height: 1080 },
    { width: 1536, height: 864 },
  ];

  private readonly userAgents = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36',
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/116.0',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.5 Safari/605.1.15',
  ];

  private readonly timezones = [
    'America/New_York',
    'Europe/London',
    'Europe/Paris',
    'Asia/Tokyo',
    'Australia/Sydney',
  ];

  private readonly languages = [
    'en-US,en;q=0.9',
    'en-GB,en;q=0.9',
    'fr-FR,fr;q=0.9,en;q=0.8',
    'de-DE,de;q=0.9,en;q=0.8',
  ];

  private getRandomConfig() {
    const rand = (arr: string[] | any[]) => arr[Math.floor(Math.random() * arr.length)];
    return {
      viewport: rand(this.defaultViewports),
      userAgent: rand(this.userAgents),
      timezone: rand(this.timezones),
      language: rand(this.languages),
    };
  }

  private async applyAntiDetection(context: BrowserContext) {
    await context.addInitScript(() => {
        // Remover webdriver
        Object.defineProperty(navigator, 'webdriver', { get: () => false });
      
        // Plugins mock
        Object.defineProperty(navigator, 'plugins', {
          get: () => [1, 2, 3, 4, 5],
        });
      
        // Idiomas
        Object.defineProperty(navigator, 'languages', {
          get: () => ['en-US', 'en'],
        });
      
        // Mock do objeto chrome
        (window as any).chrome = {
          runtime: {},
        };
      
        // Remover vestígios do Playwright
        try {
          delete (navigator as any).__proto__.webdriver;
        } catch {}
      
        // Corrigir toString com verificação
        const originalToString = Function.prototype.toString;
        const toStringProxy = new Proxy(originalToString, {
          apply: function (target, thisArg, args) {
            if (thisArg === navigator.webdriver) {
              return 'function toString() { [native code] }';
            }
            return Reflect.apply(target, thisArg, args);
          },
        });
        Object.defineProperty(Function.prototype, 'toString', {
          value: toStringProxy,
          writable: false,
          configurable: false,
        });
      });
  }

  async getPage(): Promise<Page> {
    if (!this.browser) {
      this.browser = await chromium.launch({
        headless: false,
        args: ['--no-sandbox', '--disable-blink-features=AutomationControlled'],
      });
    }

    const config = this.getRandomConfig();
    const context = await this.browser.newContext({
      viewport: config.viewport,
      userAgent: config.userAgent,
      timezoneId: config.timezone,
      locale: config.language.split(',')[0],
      colorScheme: Math.random() > 0.5 ? 'light' : 'dark',
      ignoreHTTPSErrors: true,
    });

    await context.setExtraHTTPHeaders({
      'Accept-Language': config.language,
    });

    await this.applyAntiDetection(context);

    const page = await context.newPage();
    await page.setDefaultTimeout(30000);
    await page.setDefaultNavigationTimeout(60000);

    return page;
  }

  async onModuleDestroy(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
    }
  }
}
