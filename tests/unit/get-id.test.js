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
    const data = Buffer.from('This is fragment');
    const postRes = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .set('Content-Type', 'text/plain')
      .send(data);

    const body = JSON.parse(postRes.text);
    console.log(body.fragment.id);

    const id = body.fragment.id;

    const getRes = await request(app)
      .get(`/v1/fragments/${id}`)
      .auth('user1@email.com', 'password1');
    expect(getRes.statusCode).toBe(200);
    expect(getRes.text).toBe(data.toString());
  });

  //authenticated user cannot get the fragment with wrong id
  test('authenticated user cannot get the fragment with wrong id', async () => {
    const postRes = await request(app)
      .post('/v1/fragments')
      .auth('user2@email.com', 'password2')
      .set('Content-type', 'text/plain')
      .send('Fragment 1');

    const body = JSON.parse(postRes.text);

    expect(postRes.statusCode).toBe(201);
    expect(body.status).toBe('ok');
    const id = body.fragment.id;

    const get = await request(app).get(`/v1/fragments/${id}`).auth('user1@email.com', 'password1');
    expect(get.statusCode).toBe(404);
  });

  // .md to .html conversion test
  test('authenticated user can convert .md to .html', async () => {
    const postRes = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .set('Content-type', 'text/markdown')
      .send('This is markdown');

    const body = JSON.parse(postRes.text);
    expect(postRes.statusCode).toBe(201);
    expect(body.status).toBe('ok');
    const id = body.fragment.id;

    const getRes = await request(app)
      .get(`/v1/fragments/${id}.html`)
      .auth('user1@email.com', 'password1');
    expect(getRes.statusCode).toBe(200);
    expect(getRes.headers['content-type']).toEqual('text/html; charset=utf-8');
    expect(getRes.text).toEqual('<p>This is markdown</p>\n');
  });

  test('authenticated user cannot convert to unsupported type and it returns error 415', async () => {
    const postRes = await request(app)
      .post('/v1/fragments')
      .auth('user2@email.com', 'password2')
      .set('Content-Type', 'text/plain')
      .send('This is fragment');

    const body = JSON.parse(postRes.text);
    expect(postRes.statusCode).toBe(201);
    expect(body.status).toBe('ok');
    const id = body.fragment.id;

    const getRes = await request(app)
      .get(`/v1/fragments/${id}.png`)
      .auth('user2@email.com', 'password2');

    expect(getRes.statusCode).toBe(415);
  });
});
