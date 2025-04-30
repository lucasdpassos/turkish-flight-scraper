import { Body, Controller, Post, Get } from '@nestjs/common';
import { ScraperService } from './scraper.service';
import { SearchFlightsDto } from './dto/search-flights.dto';

@Controller('scraper')
export class ScraperController {
  constructor(private readonly scraperService: ScraperService) {}

  @Post('search')
  async searchFlights(@Body() body: SearchFlightsDto) {
    return this.scraperService.searchFlights(body);
  }
}
