import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { setupApp } from './../src/setup-app';

describe('Authentication System', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    setupApp(app);
    await app.init();
  });

  it('Handles a signup request', () => {
    const email = 'asd12@email.com';
    return request(app.getHttpServer())
      .post('/auth/signup')
      .send({ email, password: '1234as' })
      .expect(201)
      .then((res) => {
        const { id, email } = res.body;
        expect(id).toBeDefined();
        expect(email).toBe('asd12@email.com');
      });
  });

  it('Sign up as a new user then get the currently logged in user', () => {
    const email = 'asdf@asdf.com';
    request(app.getHttpServer())
      .post('/auth/signup')
      .send({ email, password: 'asdf' })
      .expect(201);
  });
});
