// __tests__/dto/accounts.dto.test.js
const { createAccountDto } = require('../../dto/accounts.dto');

describe('createAccountDto', () => {
  it('should map input correctly', () => {
    const input = {
      account_id: '123',
      email: 'test@example.com',
      account_name: 'Test Account',
      website: 'https://example.com',
    };
    const result = createAccountDto(input);
    expect(result).toEqual(input);
  });
});
