const { body } = require("express-validator");

exports.createAccountValidator = [
    body("email").notEmpty().withMessage("email is required"),
    body("account_id").notEmpty().withMessage("account_id is required")
];

exports.createDestinationValidator = [
    body("url").notEmpty().withMessage("url is required"),
    body("http_method").notEmpty().withMessage("http_method is required"),
    // body("headers").notEmpty().withMessage("headers is required"),
    body("account_id").notEmpty().withMessage("headers is required"),

    body('headers')
    .custom((value) => {
      if (
        typeof value !== 'object' ||
        Array.isArray(value) ||
        value === null ||
        Object.keys(value).length === 0
      ) {
        throw new Error('headers must be a non-empty object');
      }
      return true;
    }),
];

exports.createAccountMemberValidator = [
    body("account_id").notEmpty().withMessage("account_id is required"),
    body("user_id").notEmpty().withMessage("user_id is required"),
    body("role_id").notEmpty().withMessage("role_id is required")
];




