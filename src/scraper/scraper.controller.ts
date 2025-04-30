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

  // Lucas: the ping endpoint is used to check if the server is reachable and running
  @Get('ping') 
  getPing() {
    return 'pong';
  }
}
