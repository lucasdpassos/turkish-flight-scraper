export interface FlightSegment {
    departureAirportCode: string;
    arrivalAirportCode: string;
    departureDateTime: string;
    arrivalDateTime: string;
    flightCode: {
      airlineCode: string;
      flightNumber: string;
      leaseCode: string | null;
    };
    connected: boolean;
    rph: string;
    codeShareInd: string | null;
    journeyDurationInMillis: number;
    groundDuration: number;
    codeSharingAirline: any | null;
    carrierAirline: {
      airlineName: string | null;
      airlineCode: string;
    };
    spaFlight: boolean;
    equipmentCode: string;
    equipmentName: string;
    comment: string | null;
    stopCount: number;
    containsTransitVisaRequiredPort: boolean;
    tourIstanbul: boolean;
    stopoverHotel: boolean;
    technicalStops: any[];
  }
  