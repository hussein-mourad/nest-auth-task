import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { MongoMemoryServer } from 'mongodb-memory-server';
import request from 'supertest';
import { App } from 'supertest/types';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { AppModule } from '../src/app.module.js';
import { setupApp } from '../src/setup-app.js';

describe('Auth (e2e)', () => {
  let app: INestApplication<App>;
  let mongo: MongoMemoryServer;

  const user = { email: 'test@example.com', name: 'Test User', password: 'Password1!' };

  beforeAll(async () => {
    mongo = await MongoMemoryServer.create();
    process.env.MONGODB_URI = mongo.getUri();
    process.env.JWT_SECRET = 'test-secret';

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    setupApp(app);
    await app.init();
  });

  afterAll(async () => {
    await app.close();
    await mongo.stop();
  });

  it('signs up a user and sets a session cookie', async () => {
    const res = await request(app.getHttpServer()).post('/api/auth/signup').send(user).expect(201);

    expect(res.body.user).toMatchObject({ email: user.email, name: user.name });
    expect(res.body.user).not.toHaveProperty('passwordHash');

    const cookies = res.headers['set-cookie'] as unknown as string[];
    expect(cookies.some((cookie) => cookie.startsWith('access_token='))).toBe(true);
  });

  it('rejects a duplicate signup', async () => {
    await request(app.getHttpServer()).post('/api/auth/signup').send(user).expect(409);
  });

  it('rejects an invalid signup payload', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/auth/signup')
      .send({ email: 'not-an-email', name: 'ab', password: 'short' })
      .expect(400);

    expect(res.body.message).toBeTruthy();
  });

  it('signs in and accesses the protected endpoint', async () => {
    const signIn = await request(app.getHttpServer())
      .post('/api/auth/signin')
      .send({ email: user.email, password: user.password })
      .expect(200);

    const cookies = signIn.headers['set-cookie'] as unknown as string[];
    const sessionCookie = cookies.find((cookie) => cookie.startsWith('access_token='));
    expect(sessionCookie).toBeDefined();

    await request(app.getHttpServer())
      .get('/api/users/me')
      .set('Cookie', sessionCookie)
      .expect(200)
      .expect((res) => {
        expect(res.body).toMatchObject({ email: user.email, name: user.name });
      });
  });

  it('rejects the protected endpoint without a session cookie', async () => {
    await request(app.getHttpServer()).get('/api/users/me').expect(401);
  });

  it('rejects sign in with a wrong password', async () => {
    await request(app.getHttpServer())
      .post('/api/auth/signin')
      .send({ email: user.email, password: 'WrongPass1!' })
      .expect(401);
  });

  it('signs out and clears the session cookie', async () => {
    const signIn = await request(app.getHttpServer())
      .post('/api/auth/signin')
      .send({ email: user.email, password: user.password })
      .expect(200);

    const cookies = signIn.headers['set-cookie'] as unknown as string[];
    const sessionCookie = cookies.find((cookie) => cookie.startsWith('access_token='));

    await request(app.getHttpServer())
      .post('/api/auth/signout')
      .set('Cookie', sessionCookie)
      .expect(200);
  });
});
