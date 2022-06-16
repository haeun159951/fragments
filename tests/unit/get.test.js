// tests/unit/get.test.js

const request = require('supertest');

const app = require('../../src/app');

describe('GET /v1/fragments', () => {
  // If the request is missing the Authorization header, it should be forbidden
  test('unauthenticated requests are denied', () => request(app).get('/v1/fragments').expect(401));

  // If the wrong username/password pair are used (no such user), it should be forbidden
  test('incorrect credentials are denied', () =>
    request(app).get('/v1/fragments').auth('invalid@email.com', 'incorrect_password').expect(401));

  // authenticated users get a fragments array without creating any data
  test('authenticated users get a empty fragments array', async () => {
    const res = await request(app).get('/v1/fragments').auth('user1@email.com', 'password1');
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('ok');
    const emptyArray = res.body.fragments;
    expect(emptyArray).toEqual([]);
  });

  //authenticated users get a fragments array after creating 2 fragments
  test('authenticated users get a fragments array after creating 2 fragments', async () => {
    const postRes = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .set('Content-type', 'text/plain')
      .send('Fragment 1');
    expect(postRes.statusCode).toBe(201);
    expect(postRes.body.status).toBe('ok');

    const postRes2 = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .set('Content-type', 'text/plain')
      .send('Fragment 1-1');
    expect(postRes2.statusCode).toBe(201);
    expect(postRes2.body.status).toBe('ok');

    const get = await request(app).get('/v1/fragments').auth('user1@email.com', 'password1');
    expect(get.statusCode).toBe(200);
    expect(get.body.status).toBe('ok');
    expect(get.body.fragments.length).toBe(2);
    expect(['Fragment 1', 'Fragment 1-1']).not.toEqual(
      expect.arrayContaining(['Fragment2', 'Fragment2-2'])
    );
    expect(Array.isArray(get.body.fragments)).toBe(true);
  });

  // TODO: we'll need to add tests to check the contents of the fragments array later

  test('authenticated current user get all fragments which is expanded to include a full representations of the fragments metadata ', async () => {
    const post1 = await request(app)
      .post('/v1/fragments')
      .auth('user2@email.com', 'password2')
      .set('Content-type', 'text/plain')
      .send('This is fragment 1');

    const post2 = await request(app)
      .post('/v1/fragments')
      .auth('user2@email.com', 'password2')
      .set('Content-type', 'text/plain')
      .send('This is fragment 1-1');

    const get = await request(app)
      .get('/v1/fragments/?expand=1')
      .auth('user2@email.com', 'password2');

    expect(get.statusCode).toBe(200);
    expect(get.body.status).toBe('ok');
    expect(Array.isArray(get.body.fragments)).toBe(true);

    expect(get.body.fragments).toEqual([post1.body.fragment, post2.body.fragment]);
  });
});
