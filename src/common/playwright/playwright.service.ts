import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { chromium, Page, Browser } from 'playwright';
import { ScrapingBrowser } from '@zenrows/browser-sdk';

@Injectable()
export class PlaywrightService implements OnModuleDestroy {
  private browser: Browser;

  async getPage(): Promise<Page> {
    if (!this.browser) {
      const scrapingBrowser = new ScrapingBrowser({
        apiKey: '3549e99b8edc7cb67aba13700095df3c3dbdb7ba',
      });

      const connectionURL = scrapingBrowser.getConnectURL();
      this.browser = await chromium.connectOverCDP(connectionURL);
    }

    const context = await this.browser.newContext({
      viewport: { width: 1280, height: 800 },
    });

    const page = await context.newPage();

    // Opcional: spoofing adicional
    await page.addInitScript(() => {
      Object.defineProperty(navigator, 'webdriver', { get: () => false });
      Object.defineProperty(Function.prototype, 'toString', {
        value: function () {
          return 'function toString() { [native code] }';
        },
        writable: false,
        configurable: false,
      });
      (window as any).chrome = { runtime: {} };
    });

    return page;
  }

  async onModuleDestroy(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
    }
  }
}
