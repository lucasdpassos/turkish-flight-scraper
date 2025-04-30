// dto/flight-segment.dto.ts
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { FlightCodeDto } from './flight-code.dto';
import { CarrierAirlineDto } from './carrier-airline.dto';

export class FlightSegmentDto {
  @ApiProperty()
  departureAirportCode: string;

  @ApiProperty()
  arrivalAirportCode: string;

  @ApiProperty()
  departureDateTime: string;

  @ApiProperty()
  arrivalDateTime: string;

  @ApiProperty({ type: FlightCodeDto })
  flightCode: FlightCodeDto;

  @ApiProperty()
  connected: boolean;

  @ApiProperty()
  rph: string;

  @ApiPropertyOptional()
  codeShareInd: string | null;

  @ApiProperty()
  journeyDurationInMillis: number;

  @ApiProperty()
  groundDuration: number;

  @ApiPropertyOptional()
  codeSharingAirline: any;

  @ApiProperty({ type: CarrierAirlineDto })
  carrierAirline: CarrierAirlineDto;

  @ApiProperty()
  spaFlight: boolean;

  @ApiProperty()
  equipmentCode: string;

  @ApiProperty()
  equipmentName: string;

  @ApiPropertyOptional()
  comment: string | null;

  @ApiProperty()
  stopCount: number;

  @ApiProperty()
  containsTransitVisaRequiredPort: boolean;

  @ApiProperty()
  tourIstanbul: boolean;

  @ApiProperty()
  stopoverHotel: boolean;

  @ApiProperty({ type: [Object] }) 
  technicalStops: object[];
}
