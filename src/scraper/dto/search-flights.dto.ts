import {
    IsInt,
    IsOptional,
    IsString,
    IsIn,
    Min,
    Max,
    IsNotEmpty,
  } from 'class-validator';
  
  export class SearchFlightsDto {
    @IsInt()
    @Min(1)
    @Max(31)
    departureDay: number;
  
    @IsInt()
    @Min(1)
    @Max(12)
    departureMonth: number;
  
    @IsInt()
    @Min(2024)
    @Max(2100)
    departureYear: number;
  
    @IsOptional()
    @IsInt()
    @Min(1)
    @Max(31)
    returnDay?: number;
  
    @IsOptional()
    @IsInt()
    @Min(1)
    @Max(12)
    returnMonth?: number;
  
    @IsOptional()
    @IsInt()
    @Min(2024)
    @Max(2100)
    returnYear?: number;
  
    @IsString()
    @IsNotEmpty()
    departureLocation: string;
  
    @IsString()
    @IsNotEmpty()
    arrivalLocation: string;
  
    @IsInt()
    adults: number;
  
    @IsInt()
    children: number;
  
    @IsInt()
    infants: number
    
    @IsInt()
    students: number;

    @IsString()
    @IsIn(['ECONOMY', 'BUSINESS'])
    cabinClass: 'ECONOMY' | 'BUSINESS';
  }
  