// tests/unit/delete.test.js
const request = require('supertest');

const app = require('../../src/app');

describe('DELETE /v1/fragments/:id', () => {
  // If the request is missing the Authorization header, it should be forbidden
  test('unauthenticated requests are denied', () =>
    request(app).delete('/v1/fragments/333').expect(401));

  // If the wrong username/password pair are used (no such user), it should be forbidden
  test('incorrect credentials are denied', () =>
    request(app)
      .delete('/v1/fragments/323')
      .auth('invalid@email.com', 'incorrect_password')
      .expect(401));

  test('authenticated users can delete fragment successfully', async () => {
    const res = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .set('Content-type', 'text/plain')
      .send('This is text');

    const id = JSON.parse(res.text).fragment.id;

    const deleteRes = await request(app)
      .delete(`/v1/fragments/${id}`)
      .auth('user1@email.com', 'password1');

    expect(deleteRes.statusCode).toBe(200);
    expect(deleteRes.body.status).toBe('ok');
  });

  test('authenticated users cannot delete with the unknown id', async () => {
    const res = await request(app).delete('/v1/fragments/123').auth('user1@email.com', 'password1');
    expect(res.statusCode).toBe(404);
  });
});
