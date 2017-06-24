// utf-8
'use strict';

const config = require('config');
const CronJob = require('cron').CronJob
const nodemw = require('nodemw');

let bot = new nodemw({
  server: config.server,
  path: config.path,
});

if (require.main === module) {
  main()
}

function main() {
  logInPromise(config.username, config.password)
    .then(() => {
      return getArticlePromise('Pandoc');
    }).then((data) => {
      console.log(data);
    }).catch((err) => {
      console.error(err);
    });
}

function logInPromise(username, password) {
  return new Promise(function(resolve, reject){
    bot.logIn(username, password, (err) => {
      if (err) {
        reject(err);
        return;
      }
      resolve();
    });
  });
}

function getArticlePromise(title) {
  return new Promise(function(resolve, reject){
    bot.getArticle(title, (err, data) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(data);
    });
  });
}

