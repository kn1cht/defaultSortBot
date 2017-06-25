'use strict';

const cron = require('node-cron');
const main = require('./main');

/* schedule to run every day */
cron.schedule('0 0 * * *', () => { main(); });
