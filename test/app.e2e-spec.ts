import { INestApplication } from "@nestjs/common";
import { AppModule } from "../src/app.module";
import { Test } from "@nestjs/testing";


describe('App e2e', () => {
  let app : INestApplication;
  beforeAll(
    async () => {
      const moduleRef = await Test.createTestingModule({
        imports: [AppModule],
      }).compile();

      app = moduleRef.createNestApplication();

      await app.init();
    })
  afterAll(async () => {
    await app.close();
    });
    
  it.todo('should display welcome message');
} );