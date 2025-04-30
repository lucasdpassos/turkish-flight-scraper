import { ApiPropertyOptional } from '@nestjs/swagger';

export class CarrierAirlineDto {
  @ApiPropertyOptional()
  airlineName: string | null;

  @ApiPropertyOptional()
  airlineCode: string;
}
