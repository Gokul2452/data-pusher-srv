const rateLimit = require('express-rate-limit');

// Custom key generator per account
const accountRateLimiter = rateLimit({
    windowMs: 1000, // 1 second
    max: 5,         // limit each account to 5 requests per 1 second
    keyGenerator: (req, res) => {
        // Extract account ID from request — adjust this to your logic
        return req.headers["cl-x-token"] || 'anonymous';
    },
    message: 'Too many requests from this account. Please try again later.',
});

module.exports = accountRateLimiter;
