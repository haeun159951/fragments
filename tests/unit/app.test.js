const request = require('supertest');

const app = require('../../src/app');

describe('404 Error Handler', () => {
  test('This should get HTTP 404 error if requesting unknown route', () =>
    request(app).get('/unknown-route').expect(404));
});
