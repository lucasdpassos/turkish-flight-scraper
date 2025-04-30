import { Module } from '@nestjs/common';
import { ScraperController } from './scraper.controller';
import { ScraperService } from './scraper.service';
import { PlaywrightService } from 'src/common/playwright/playwright.service';

@Module({
  controllers: [ScraperController],
  providers: [ScraperService, PlaywrightService]
})
export class ScraperModule {}
