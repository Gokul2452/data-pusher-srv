// app.js
const express = require('express');
const bodyParser = require('body-parser');
const dotenv = require("dotenv");

dotenv.config();

const app = express();
app.use(bodyParser.json());

// Routes
const accountRoutes = require('./routes/account.routes');
app.use('/accounts', accountRoutes);

// Export app for tests
module.exports = app;
