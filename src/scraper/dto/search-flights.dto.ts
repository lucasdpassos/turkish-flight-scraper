import { IsDateString, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class SearchFlightsDto {
  @IsDateString()
  departureDate: string;

  @IsString()
  @IsNotEmpty()
  departureLocation: string;

  @IsString()
  @IsNotEmpty()
  arrivalLocation: string;

  @IsNumber()
  adults: number;

  @IsNumber()
  children: number;

  @IsNumber()
  infants: number;
}
