import { Body, Controller, Post } from '@nestjs/common';
import { ScraperService } from './scraper.service';
import { SearchFlightsDto } from './dto/search-flights.dto';
import { ApiTags, ApiBody, ApiResponse } from '@nestjs/swagger';
import { FlightSegmentDto } from './dto/flight-segment.dto';

@ApiTags('scraper')
@Controller('scraper')
export class ScraperController {
  constructor(private readonly scraperService: ScraperService) {}

  @Post('search')
  @ApiBody({ type: SearchFlightsDto })
  @ApiResponse({
    status: 200,
    description: 'Scraped flight segments',
    type: FlightSegmentDto,
    isArray: true,
  })
  async searchFlights(@Body() body: SearchFlightsDto) {
    return this.scraperService.searchFlights(body);
  }
}
