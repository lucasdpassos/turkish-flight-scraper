// src/scraper/dto/flight-result.dto.ts

export class AirportInfo {
    time: string;
    city: string;
    airport: string;
  }
  
  export class FlightSegment {
    airline: string;
    flightNumber: string;
    aircraft: string;
    duration: string;
    from: AirportInfo;
    to: AirportInfo;
  }
  
  export class FlightResult {
    segments: FlightSegment[];
  }
  