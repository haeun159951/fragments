// tests/unit/get.test.js

const request = require('supertest');

const app = require('../../src/app');

describe('GET by Id /v1/fragments/:id', () => {
  // If the request is missing the Authorization header, it should be forbidden
  test('unauthenticated requests are denied', () =>
    request(app).get('/v1/fragments/id').expect(401));

  // If the wrong username/password pair are used (no such user), it should be forbidden
  test('incorrect credentials are denied', () =>
    request(app)
      .get('/v1/fragments/id')
      .auth('invalid@email.com', 'incorrect_password')
      .expect(401));

  // authenticated users get a fragments id after creating a fragment
  test('authenticated users get a fragments id after creating a fragment', async () => {
    const postRes = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .set('Content-type', 'text/plain')
      .send('Fragment 1');
    expect(postRes.statusCode).toBe(201);
    expect(postRes.body.status).toBe('ok');
    const id = postRes.body.fragment.id;

    const res = await request(app).get(`/v1/fragments/${id}`).auth('user1@email.com', 'password1');
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.data).toEqual('Fragment 1');
  });

  // TODO: we'll need to add tests to check the contents of the fragments array later
});
