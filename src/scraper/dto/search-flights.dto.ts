import {
    IsInt,
    IsString,
    IsIn,
    Min,
    Max,
    IsNotEmpty,
  } from 'class-validator';
  import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
  
  export class SearchFlightsDto {
    @ApiProperty({ example: 4, minimum: 1, maximum: 31, description: 'Departure day (1-31)' })
    @IsInt()
    @Min(1)
    @Max(31)
    departureDay: number;
  
    @ApiProperty({ example: 8, minimum: 1, maximum: 12, description: 'Departure month (1-12)' })
    @IsInt()
    @Min(1)
    @Max(12)
    departureMonth: number;
  
    @ApiProperty({ example: 2025, minimum: 2024, maximum: 2100, description: 'Departure year' })
    @IsInt()
    @Min(2024)
    @Max(2100)
    departureYear: number;
  
    @ApiPropertyOptional({ example: 10, minimum: 1, maximum: 31, description: 'Day of arrival (1-31)' })
    @IsInt()
    @Min(1)
    @Max(31)
    returnDay?: number;
  
    @ApiPropertyOptional({ example: 10, minimum: 1, maximum: 12, description: 'Month of arrival (1-12)' })
    @IsInt()
    @Min(1)
    @Max(12)
    returnMonth?: number;
  
    @ApiPropertyOptional({ example: 2025, minimum: 2024, maximum: 2100, description: 'Year of arrival' })

    @IsInt()
    @Min(2024)
    @Max(2100)
    returnYear?: number;
  
    @ApiProperty({ example: 'Sao Paulo', description: 'Departure Airport Code or Departure City' })
    @IsString()
    @IsNotEmpty()
    departureLocation: string;
  
    @ApiProperty({ example: 'DXB', description: 'Destiny Airport Code or destiny city' })
    @IsString()
    @IsNotEmpty()
    arrivalLocation: string;
  
    @ApiProperty({ example: 2, minimum: 1, description: 'Adults' })
    @IsInt()
    adults: number;
  
    @ApiProperty({ example: 0, description: 'Children' })
    @IsInt()
    children: number;
  
    @ApiProperty({ example: 1, description: 'Infants' })
    @IsInt()
    infants: number;
  
    @ApiProperty({ example: 0, description: 'Students' })
    @IsInt()
    students: number;
  
    @ApiProperty({
      example: 'BUSINESS',
      enum: ['ECONOMY', 'BUSINESS'],
      description: 'Cabin class (ECONOMY or BUSINESS)',
    })
    @IsString()
    @IsIn(['ECONOMY', 'BUSINESS'])
    cabinClass: 'ECONOMY' | 'BUSINESS';
  }
  