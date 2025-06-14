const Queue = require('bull');

const dataQueue = new Queue('data-forward-queue', {
  redis: { host: '127.0.0.1', port: 6379 }
});

module.exports = dataQueue;
