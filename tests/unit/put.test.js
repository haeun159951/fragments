// test/unit/put.test.js

const request = require('supertest');

const app = require('../../src/app');

describe('PUT /v1/fragments', () => {
  // If the request is missing the Authorization header, it should be forbidden
  test('unauthenticated requests are denied', () =>
    request(app).put('/v1/fragments/123').expect(401));

  // If the wrong username/password pair are used (no such user), it should be forbidden
  test('incorrect credentials are denied', () =>
    request(app)
      .put('/v1/fragments/123')
      .auth('invalid@email.com', 'incorrect_password')
      .expect(401));

  // authenticated users can update a fragment successfully
  test('authenticated users can update a fragment successfully', async () => {
    const postRes = await request(app)
      .post('/v1/fragments')
      .auth('user2@email.com', 'password2')
      .set('Content-Type', 'text/plain')
      .send('This is fragment');
    const id = JSON.parse(postRes.text).fragment.id;

    const putRes = await request(app)
      .put(`/v1/fragments/${id}`)
      .auth('user2@email.com', 'password2')
      .set('Content-Type', 'text/plain')
      .send('This is fragment with update');

    const body = JSON.parse(putRes.text);

    expect(putRes.statusCode).toBe(201);
    expect(body.status).toBe('ok');

    const fragment = JSON.parse(putRes.text).fragment;

    const getRes = await request(app)
      .get(`/v1/fragments/${id}/info`)
      .auth('user2@email.com', 'password2');

    expect(getRes.statusCode).toBe(200);
    expect(getRes.body.status).toBe('ok');
    expect(getRes.body.fragment).toEqual(fragment);
  });

  // If no such fragment exists with the given id, returns an HTTP 404 with an appropriate error message.
  test('authenticated user cannot try to update a fragment with the known id', async () => {
    const res = await request(app)
      .put('/v1/fragments/123')
      .auth('user1@email.com', 'password1')
      .set('Content-Type', 'text/plain')
      .send('This is fragment with update');

    expect(res.statusCode).toBe(404);
  });
});
