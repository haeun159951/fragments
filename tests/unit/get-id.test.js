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
    console.log(res.body);
  });

  //authenticated user cannot get the fragment with wrong id
  test('authenticated user cannot get the fragment with wrong id', async () => {
    const postRes2 = await request(app)
      .post('/v1/fragments')
      .auth('user2@email.com', 'password2')
      .set('Content-type', 'text/plain')
      .send('Fragment 1');
    expect(postRes2.statusCode).toBe(201);
    expect(postRes2.body.status).toBe('ok');
    const id2 = postRes2.body.fragment.id;

    const get = await request(app).get(`/v1/fragments/${id2}`).auth('user1@email.com', 'password1');
    expect(get.statusCode).toBe(404);
  });

  // TODO: we'll need to add tests to check the contents of the fragments array later
});
