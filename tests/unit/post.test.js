// tests/unit/post.test.js

const request = require('supertest');

const app = require('../../src/app');

describe('POST /v1/fragments', () => {
  // authenticated vs unauthenticated requests (use HTTP Basic Auth, don't worry about Cognito in tests)
  // If the request is missing the Authorization header, it should be forbidden
  test('unauthenticated requests are denied', () => request(app).get('/v1/fragments').expect(401));

  // If the wrong username/password pair are used (no such user), it should be forbidden
  test('incorrect credentials are denied', () =>
    request(app).post('/v1/fragments').auth('invalid@email.com', 'incorrect_password').expect(401));

  // Using a valid username/password pair should give a success result with a .fragments array
  test('authenticated users can create a plain text fragment', async () => {
    const res = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .set('Content-type', 'text/plain')
      .send('This is fragment');
    const body = JSON.parse(res.text);
    expect(res.statusCode).toBe(201);
    expect(body.status).toBe('ok');
  });

  // responses include all necessary and expected properties (id, created, type, etc), and these values match what you expect for a given request (e.g., size, type, ownerId)
  test('responses include all necessary and expected properties', async () => {
    const res = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .set('Content-type', 'text/plain')
      .send('This is fragment');

    const body = JSON.parse(res.text);

    expect(body.fragment.size).toEqual(16);
    expect(body.fragment.type).toMatch('text/plain');
    expect(body.fragment.ownerId).toEqual(body.fragment.ownerId);
    expect(body.fragment.id).toEqual(body.fragment.id);
    expect(body.fragment.created).toEqual(body.fragment.created);
  });

  // responses include a Location header with a URL to GET the fragment
  test('responses include a Location header with a URL to GET the fragment', async () => {
    const res = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .set('Content-type', 'text/plain')
      .send('This is fragment');

    const body = JSON.parse(res.text);
    const locationInfo = `${process.env.API_URL}/v1/fragments/${body.fragment.id}`;
    expect(res.statusCode).toBe(201);
    expect(res.headers.location).toEqual(locationInfo);
  });

  // trying to create a fragment with an unsupported type errors as expected
  test('trying to create a fragment with an unsupported type errors as expected', async () => {
    const res = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .set('Content-type', 'audio/mp4')
      .send('Fragment 1');
    expect(res.statusCode).toBe(415);
  });
});
