const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const accountRoutes = require('./routes/account.routes');
const destinationRoutes = require('./routes/destination.routes');
const incomingDataRoutes = require('./routes/incoming.data.routes');
const accountMemberRoutes = require('./routes/account.member.routes');
const logger = require('./routes/logger.routes');
const roleRoutes = require('./routes/roles.routes');
const authRoutes = require('./routes/auth.routes');
const pingRoutes = require('./routes/ping');
const dotenv = require("dotenv");
require('./workers/dataWorker')
const app = express();
app.use(bodyParser.json());

app.use('/accounts', accountRoutes);
app.use('/destinations', destinationRoutes);
app.use('/server', incomingDataRoutes);
app.use('/account/member', accountMemberRoutes);
app.use('/logger', logger);
app.use('/role', roleRoutes);
app.use('/auth', authRoutes);
app.use('/', pingRoutes);

mongoose.connect('mongodb://localhost:27017/data_pusher', { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => app.listen(3000, () => console.log('Server running on port 3000')))
    .catch(err => console.error('MongoDB connection error:', err));

dotenv.config();
