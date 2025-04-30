import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ScraperModule } from './scraper/scraper.module';
import { LoggerModule } from './logger/logger.module'

@Module({
  imports: [ScraperModule, LoggerModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
