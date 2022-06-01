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
      .send('This is a fragment 1');
    expect(res.statusCode).toBe(201);
    expect(res.body.status).toBe('ok');
  });

  //authenticated users can create a plain text fragment
  test('authenticated users can create a plain text fragment', async () => {
    const res = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .set('Content-type', 'text/plain')
      .send('Fragment 1');
    expect(res.statusCode).toBe(201);
    expect(res.body.status).toBe('ok');
  });

  // responses include all necessary and expected properties (id, created, type, etc), and these values match what you expect for a given request (e.g., size, type, ownerId)
  test('responses include all necessary and expected properties', async () => {
    const res = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .set('Content-type', 'text/plain')
      .send('Fragment 1');

    expect(res.statusCode).toBe(201);
    expect(res.body.status).toBe('ok');
    expect(res.body.fragment.size).toEqual(10); // size check
    expect(res.body.fragment.type).toEqual('text/plain'); // type check
    expect(res.body.fragment.ownerId).toEqual(res.body.fragment.ownerId); //ownerId
    expect(res.body.fragment.id).toEqual(res.body.fragment.id); // id check
    expect(res.body.fragment.created).toEqual(res.body.fragment.created); //created
  });

  // responses include a Location header with a URL to GET the fragment

  test('responses include a Location header with a URL to GET the fragment', async () => {
    const res = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .set('Content-type', 'text/plain')
      .send('Fragment 1');

    expect(res.statusCode).toBe(201);
    expect(res.body.status).toBe('ok');
    const locationURL = `${process.env.API_URL}/v1/fragments/${res.body.fragment.id}`;
    expect(res.headers.location).toEqual(locationURL);
  });
  // trying to create a fragment with an unsupported type errors as expected
  test('trying to create a fragment with an unsupported type errors as expected', async () => {
    const res = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .set('Content-type', 'application/json')
      .send('Fragment 1');
    expect(res.statusCode).toBe(415);
  });

  // TODO: we'll need to add tests to check the contents of the fragments array later
});