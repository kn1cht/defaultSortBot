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

function main(){

}

function setDefaultSort() {
  logInPromise(config.username, config.password) // login to get permisson
    .then(() => {
      return getAllPagesPromise(); // get all page data as JSON
    }).then((data) => {
      data.forEach((page) => {
        getArticlePromise(page.title).then((data) => {
          if(! /\{\{DEFAULTSORT:.*\}\}/.test(data)){ // test if page already have DEFAULTSORT
            console.log(page.title);
          }
        });
      });
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

function getAllPagesPromise(title) {
  return new Promise(function(resolve, reject){
    bot.getAllPages((err, data) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(data);
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

