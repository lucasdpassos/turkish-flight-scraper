# Turkish Airlines Flight Scraper

Human-like flight scraping with anti-bot bypass and structured data extraction from Turkish Airlines.
Developed with a focus on technical testing, Swagger integration, Jest coverage, and advanced Playwright usage.

Attention! Since this is a technical assessment, scrapping will run with headless: false to make debugging more user-friendly for the recruiter.

![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white&style=for-the-badge)
![NestJS](https://img.shields.io/badge/NestJS-E0234E?logo=nestjs&logoColor=white&style=for-the-badge)
![Playwright](https://img.shields.io/badge/Playwright-2EAD33?logo=playwright&logoColor=white&style=for-the-badge)
![Jest](https://img.shields.io/badge/Jest-C21325?logo=jest&logoColor=white&style=for-the-badge)
![Swagger](https://img.shields.io/badge/Swagger-85EA2D?logo=swagger&logoColor=black&style=for-the-badge)
![Winston](https://img.shields.io/badge/Winston-000000?style=for-the-badge&logo=logstash&logoColor=white)

---

## Key Features
Realistic scraping with non-linear mouse movements, dynamic delays, and human-like typing

Interception of Turkish Airlines API responses at /api/v1/availability

Bypass of Akamai Ghost protection (HTTP 428 proof-of-work challenge)

Automated form filling for round-trip dates and passenger counts

Support for both economy and business class simulations

Structured logging with Winston + NestJS Logger

API documentation via Swagger at /api

Automated testing with Jest + Supertest + Playwright

---

##  Demonstration

###  Insomnia Request (POST /scraper/search)

<img src="https://i.ibb.co/QvW26v9t/Captura-de-Tela-2025-04-30-a-s-17-16-17.png" alt="Exemplo de resposta no Insomnia" width="700"/>

###  Expected JSON Response

```json
[
  {
    "departureAirportCode": "GRU",
    "arrivalAirportCode": "IST",
    "departureDateTime": "04-08-2025 04:10",
    "arrivalDateTime": "04-08-2025 22:55",
    "flightCode": {
      "airlineCode": "TK",
      "flightNumber": "16",
      "leaseCode": null
    },
    "equipmentName": "Airbus A350-900",
    "carrierAirline": {
      "airlineName": null,
      "airlineCode": "TK"
    }
  }
]
```

---

##  Technologies Used

| Tecnology    | Description                                      |
|---------------|------------------------------------------------|
| **TypeScript**| Strongly typed JavaScript superset        |
| **NestJS**    | Scalable Node.js API framework         |
| **Playwright**| Browser automation with stealth support   |
| **Jest**      | Unit, integration, and end-to-end testing          |
| **Winston**   | Structured and persistent logging              |
| **Swagger**   | Interactive RESTful API documentation  |

---

## ▶Getting Started

### 1. Clone repository and install dependencies
```bash
git clone https://github.com/seu-usuario/turkish-flight-scraper.git
cd turkish-flight-scraper
npm install --legacy-peer-deps
```

### 2. Run the application
```bash
npm run start:dev
```

### 3. Access API documentation
- [http://localhost:49123/api](http://localhost:49123/api)

### 4. Execute a scraping request
```bash
curl --request POST http://localhost:49123/scraper/search \
  --header 'Content-Type: application/json' \
  --data '{
    "departureLocation": "Sao Paulo",
    "arrivalLocation": "Dubai",
    "departureDay": 4,
    "departureMonth": 8,
    "departureYear": 2025,
    "returnDay": 10,
    "returnMonth": 10,
    "returnYear": 2025,
    "adults": 2,
    "children": 0,
    "infants": 1,
    "students": 0,
    "cabinClass": "BUSINESS"
  }'
```

### 5. Run E2E tests
```bash
npm run test:e2e
```

---

## ⚠️ Disclaimer

This project was developed exclusively for technical demonstration purposes.
Not intended for commercial use or production environments.
Turkish Airlines and its systems should be respected according to their Terms of Service and Privacy Policy.

---

## 🤝 Contact

Technical project developed by Lucas Passos
For interview or academic purposes: contact for technical details.