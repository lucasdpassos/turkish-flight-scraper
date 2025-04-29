import { Module } from '@nestjs/common';
import { ScraperController } from './scraper.controller';
import { ScraperService } from './scraper.service';
import { PuppeteerModule } from '../common/puppeteer/puppeteer.module';

@Module({
  imports: [PuppeteerModule],
  controllers: [ScraperController],
  providers: [ScraperService]
})
export class ScraperModule {}
