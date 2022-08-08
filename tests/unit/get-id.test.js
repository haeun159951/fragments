// tests/unit/get.test.js
const request = require('supertest');
const app = require('../../src/app');
const fs = require('fs');

describe('GET by Id /v1/fragments/:id', () => {
  //If the request is missing the Authorization header, it should be forbidden
  test('unauthenticated requests are denied', () =>
    request(app).get('/v1/fragments/id').expect(401));

  // If the wrong username/password pair are used (no such user), it should be forbidden
  test('incorrect credentials are denied', () =>
    request(app)
      .get('/v1/fragments/id')
      .auth('invalid@email.com', 'incorrect_password')
      .expect(401));

  // User creating a new Text fragment (e.g., text, HTML, Markdown)
  test('authenticated users create a text fragment', async () => {
    const data = 'This is fragment';
    const postRes = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .set('Content-Type', 'text/plain')
      .send(data);

    const body = JSON.parse(postRes.text);
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
      .send('This is fragment');

    const body = JSON.parse(postRes.text);
    expect(postRes.statusCode).toBe(201);
    expect(body.status).toBe('ok');

    const id = body.fragment.id;

    const getRes = await request(app)
      .get(`/v1/fragments/${id}`)
      .auth('user1@email.com', 'password1');
    expect(getRes.statusCode).toBe(404);
  });

  //.md to .html conversion test
  test('authenticated user can convert .md to .html', async () => {
    const postRes = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .set('Content-type', 'text/markdown')
      .send('# This is a markdown');

    const body = JSON.parse(postRes.text);
    const id = body.fragment.id;

    expect(postRes.statusCode).toBe(201);
    expect(body.status).toBe('ok');

    const getRes = await request(app)
      .get(`/v1/fragments/${id}.html`)
      .auth('user1@email.com', 'password1');
    expect(getRes.statusCode).toBe(200);
    expect(getRes.headers['content-type']).toEqual('text/html; charset=utf-8');
    expect(getRes.text).toEqual('<h1>This is a markdown</h1>\n');
  });

  //html to text conversion test
  test('authenticated user can convert .html to .txt', async () => {
    const postRes = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .set('Content-type', 'text/html')
      .send('<h1>This is html</h1>');

    const body = JSON.parse(postRes.text);
    const id = body.fragment.id;

    expect(postRes.statusCode).toBe(201);
    expect(body.status).toBe('ok');

    const getRes = await request(app)
      .get(`/v1/fragments/${id}.txt`)
      .auth('user1@email.com', 'password1');
    expect(getRes.statusCode).toBe(200);
    expect(getRes.headers['content-type']).toEqual('text/plain; charset=utf-8');
    expect(getRes.text).toEqual('<h1>This is html</h1>');
  });

  // User creating a new JSON fragment
  test('authenticated user can create a new JSON fragment', async () => {
    const data = { number: 123 };
    const postRes = await request(app)
      .post('/v1/fragments/')
      .auth('user1@email.com', 'password1')
      .set('Content-type', 'application/json')
      .send(data);

    expect(postRes.statusCode).toBe(201);

    const body = JSON.parse(postRes.text);
    const id = body.fragment.id;

    const getRes = await request(app)
      .get(`/v1/fragments/${id}`)
      .auth('user1@email.com', 'password1');

    expect(getRes.statusCode).toBe(200);
    expect(getRes.text).toEqual(JSON.stringify(data));
    expect(getRes.headers['content-type']).toEqual('application/json; charset=utf-8');
  });

  // User creating a new Image fragment
  test('authenticated user can create a new image fragment', async () => {
    const postRes = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .set('Content-Type', 'image/jpeg')
      .send(fs.readFileSync(`${__dirname}/testfile/dog.jpeg`));

    expect(postRes.statusCode).toBe(201);
    const id = JSON.parse(postRes.body).fragment.id;

    const getRes = await request(app)
      .get(`/v1/fragments/${id}`)
      .auth('user1@email.com', 'password1');

    expect(getRes.statusCode).toBe(200);
  });

  // // converting between image fragment types
  test('authenticated user can convert the jpeg content type to png', async () => {
    const postRes = await request(app)
      .post('/v1/fragments')
      .auth('user2@email.com', 'password2')
      .set('Content-Type', 'image/jpeg')
      .send(fs.readFileSync(`${__dirname}/testfile/dog.jpeg`));

    const id = JSON.parse(postRes.body).fragment.id;

    const getPng = await request(app)
      .get(`/v1/fragments/${id}.png`)
      .auth('user2@email.com', 'password2');

    expect(getPng.type).toEqual('image/png');
    expect(getPng.statusCode).toBe(200);
  });

  test('authenticated user can convert the jpeg content type to gif', async () => {
    const postRes = await request(app)
      .post('/v1/fragments/')
      .auth('user2@email.com', 'password2')
      .set('Content-type', 'image/jpeg')
      .send(fs.readFileSync(`${__dirname}/testfile/dog.jpeg`));
    expect(postRes.status).toBe(201);
    const id = JSON.parse(postRes.body).fragment.id;

    const getRes = await request(app)
      .get(`/v1/fragments/${id}.gif`)
      .auth('user2@email.com', 'password2');
    expect(getRes.type).toEqual('image/gif');
    expect(getRes.statusCode).toBe(200);
  });

  test('authenticated user can convert the jpeg content type to webp', async () => {
    const postRes = await request(app)
      .post('/v1/fragments/')
      .auth('user1@email.com', 'password1')
      .set('Content-type', 'image/jpeg')
      .send(fs.readFileSync(`${__dirname}/testfile/dog.jpeg`));
    expect(postRes.status).toBe(201);
    const id = JSON.parse(postRes.body).fragment.id;

    const res = await request(app)
      .get(`/v1/fragments/${id}.webp`)
      .auth('user1@email.com', 'password1');
    expect(res.type).toEqual('image/webp');
    expect(res.statusCode).toBe(200);
  });

  test('authenticate user cannot convert unsupported type: text/plain to .webp', async () => {
    const postRes = await request(app)
      .post('/v1/fragments')
      .auth('user2@email.com', 'password2')
      .set('Content-Type', 'text/plain')
      .send('This is fragment');
    const id = JSON.parse(postRes.text).fragment.id;

    const getRes = await request(app)
      .get(`/v1/fragments/${id}.webp`)
      .auth('user2@email.com', 'password2');
    expect(getRes.statusCode).toBe(415);
  });
});
