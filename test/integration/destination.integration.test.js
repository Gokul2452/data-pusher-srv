// __tests__/integration/account.routes.test.js
const request = require('supertest');
const app = require('../../test.server'); // your express app
const mongoose = require('mongoose');

jest.mock('../../middleware/auth', () => ({
    authGuard: () => (req, res, next) => next(),
    roleGuard: () => (req, res, next) => next(),
}));

describe('POST /destinations', () => {
    it('should return 400 for missing email', async () => {
        const res = await request(app).post('/destinations').send({
            http_method: 'GET'
        });
        expect(res.statusCode).toBe(400);
    });
});
