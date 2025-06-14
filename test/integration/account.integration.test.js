// __tests__/integration/account.routes.test.js
const request = require('supertest');
const app = require('../../test.server'); // your express app

jest.mock('../../middleware/auth', () => ({
  authGuard: () => (req, res, next) => next(),
  roleGuard: () => (req, res, next) => next(),
}));

describe('POST /accounts', () => {
  it('should return 400 for missing email', async () => {
    const res = await request(app).post('/accounts').send({
      account_id: 'acc123',
      account_name: 'Test Account',
    });
    expect(res.statusCode).toBe(400);
  });
});

