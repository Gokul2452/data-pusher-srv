// __tests__/dto/accounts.dto.test.js
const { createDestinationDto } = require('../../dto/destination.dto');

describe('createDestinationDto', () => {
  it('should map input correctly', () => {
    const input = {
      account_id: '123',
      headers: { api_key: "API123"},
      http_method: 'GET',
      url: 'https://example.com',
    };
    const result = createDestinationDto(input);
    expect(result).toEqual(input);
  });
});
