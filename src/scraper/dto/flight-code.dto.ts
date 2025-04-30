import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class FlightCodeDto {
  @ApiProperty()
  airlineCode: string;

  @ApiProperty()
  flightNumber: string;

  @ApiPropertyOptional()
  leaseCode: string | null;
}
