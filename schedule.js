'use strict';

const cron = require('node-cron');
const main = require('./main');

cron.schedule('0 0 * * *', () => { main(); });
