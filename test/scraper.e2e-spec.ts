import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '../src/app.module';
import { PlaywrightService } from 'src/common/playwright/playwright.service';

describe('ScraperController (e2e)', () => {
  let app: INestApplication;
  let playwrightService: PlaywrightService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    playwrightService = moduleFixture.get<PlaywrightService>(PlaywrightService);
  });

  it(
    'deve abrir corretamente a homepage da Turkish Airlines',
    async () => {
      const page = await playwrightService.getPage();
        
      //Lucas: the T.A endpoint should be in a .env variable, but for now, let's hardcode it to be more easy for the reviewer/recruiter
      const response = await page.goto('https://www.turkishairlines.com/en-int/', {
        waitUntil: 'domcontentloaded',
      });
  
      // Verifica se o status da resposta HTTP está ok (200)
      expect(response?.status()).toBe(200);
  
      // Verifica se o <body> foi renderizado
      const bodyHandle = await page.$('body');
      expect(bodyHandle).not.toBeNull();
    },
    20000

  );
});
