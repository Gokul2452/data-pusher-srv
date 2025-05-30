
function createAccountDto(data) {
    
    if (!data?.email) throw new Error('Email is required');
    if (!data?.account_name) throw new Error('Account name is required');

    return {
      email: data.email,
      account_name: data.account_name,
      website: data.website,
    };
  }
  
module.exports = { createAccountDto };
  