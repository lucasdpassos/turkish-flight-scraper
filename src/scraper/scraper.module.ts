import { Module } from '@nestjs/common';
import { ScraperController } from './scraper.controller';
import { ScraperService } from './scraper.service';
import { PuppeteerModule } from '../common/puppeteer/puppeteer.module';
import { PlaywrightService } from 'src/common/playwright/playwright.service';

@Module({
  imports: [PuppeteerModule],
  controllers: [ScraperController],
  providers: [ScraperService, PlaywrightService]
})
export class ScraperModule {}
