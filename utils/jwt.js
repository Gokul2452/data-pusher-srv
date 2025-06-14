const jwt = require("jsonwebtoken");

const generateToken = (user) => {
    return jwt.sign(
        user,
        process.env.JWT_SECRET, // e.g., 'my-secret-key'
        { expiresIn: "1d" }
    );
};

const isValidtoken = (token) => {
    const is_valid_token = jwt.verify(token, process.env.JWT_SECRET)
    return is_valid_token;
}

module.exports = { generateToken, isValidtoken };
