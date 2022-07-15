// tests/unit/get.test.js
const request = require('supertest');
const app = require('../../src/app');

describe('GET by Id /v1/fragments/:id/info', () => {
  // If the request is missing the Authorization header, it should be forbidden
  test('unauthenticated requests are denied', () =>
    request(app).get('/v1/fragments/id/info').expect(401));

  // If the wrong username/password pair are used (no such user), it should be forbidden
  test('incorrect credentials are denied', () =>
    request(app)
      .get('/v1/fragments/id/info')
      .auth('invalid@email.com', 'incorrect_password')
      .expect(401));

  test('authenticated user get a fragment with id info', () =>
    request(app)
      .get('/v1/fragments/id/info')
      .auth('invalid@email.com', 'incorrect_password')
      .expect(401));

  // Using a valid username/password pair should give a success result with fragment data with given id
  test('authenticated user fragment data  with the given id.', async () => {
    const post = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .set('Content-Type', 'text/plain')
      .send('This is fragment');

    const body = JSON.parse(post.text);
    const id = body.fragment.id;
    const fragment = body.fragment;

    const get = await request(app)
      .get(`/v1/fragments/${id}/info`)
      .auth('user1@email.com', 'password1');

    expect(get.statusCode).toBe(200);
    expect(get.body.status).toBe('ok');
    expect(get.body.fragment.id).toEqual(id);
    expect(get.body.fragment).toEqual(fragment);
  });

  test('authenticated user fragment data with the wrong id', async () => {
    const post = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .set('Content-Type', 'text/plain')
      .send('This is fragment');

    const body = JSON.parse(post.text);
    const id = body.fragment.id;
    console.log(id);

    const get = await request(app)
      .get(`/v1/fragments/3334545/info`)
      .auth('user1@email.com', 'password1');

    expect(get.statusCode).toBe(404);
  });
});
