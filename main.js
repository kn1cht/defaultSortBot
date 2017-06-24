// utf-8
'use strict';

const config = require('config');
const CronJob = require('cron').CronJob
const nodemw = require('nodemw');
const tokenize = require('kuromojin').tokenize;
const unorm = require('unorm');

/*** mediawiki API bot ***/
const bot = new nodemw({
  server: config.server,
  path: config.path,
});

if (require.main === module) { main(); }

function main() {
  logInPromise(config.username, config.password) // login to get permisson
    .then(() => {
      return getAllPagesPromise(); // get all page data as JSON
    }).then((data) => {
      data.forEach((page) => {
        let pageData = null;
        let pageTitle = page.title;
        let editSummary = 'Bot: Add DEFAULTSORT ';
        getArticlePromise(pageTitle)
          .then((data) => {
            pageData = data;
            if(! /\{\{DEFAULTSORT:.*\}\}/.test(pageData)){ // test if page already have DEFAULTSORT
              return tokenize(pageTitle);
            }
            else { return; }
          }).then((tokens) => {
            if(!tokens) { return; }
            let reading = getReadingFromTokens(tokens);
            reading = katakanaToHiragana(reading);
            reading = normalizeForDefaultSort(reading);

            pageData += '\n{{DEFAULTSORT: ' + reading + '}}';
            editSummary += reading;
            bot.edit(pageTitle, pageData, editSummary, (err) => {
              if(err) { console.error(err); }
              console.log('Edited ' + pageTitle + ': ' + editSummary);
            });
          }).catch((err) => {
            console.error(err);
          });
      });
    }).catch((err) => {
      console.error(err);
    });
}

function getReadingFromTokens(tokens){
  let reading = '';
  tokens.forEach((token) => {
    if(token.reading) { reading += token.reading; }
    else { reading += token.surface_form; }
    });
  reading = unorm.nfkc(reading); // unicode normalization
  return reading;
}

function logInPromise(username, password) {
  return new Promise((resolve, reject) => {
    bot.logIn(username, password, (err) => {
      if (err) { reject(err); }
      else { resolve();  }
    });
  });
}

function getAllPagesPromise(title) {
  return new Promise((resolve, reject) => {
    bot.getAllPages((err, data) => {
      if (err) { reject(err); }
      else { resolve(data);  }
    });
  });
}

function getArticlePromise(title) {
  return new Promise((resolve, reject) => {
    bot.getArticle(title, (err, data) => {
      if (err) { reject(err); }
      else { resolve(data);  }
    });
  });
}

function katakanaToHiragana(src) {
  return src.replace(/[\u30a1-\u30f6]/g, (match) => {
    var chr = match.charCodeAt(0) - 0x60;
    return String.fromCharCode(chr);
  });
}

function normalizeForDefaultSort(str){
  const defaultSortDictionary = {
    'ぁ': 'あ', 'ぃ': 'い', 'ぅ': 'う', 'ぇ': 'え', 'ぉ': 'お',
    'が': 'か', 'ぎ': 'き', 'ぐ': 'く', 'げ': 'け', 'ご': 'こ',
    'ざ': 'さ', 'じ': 'し', 'ず': 'す', 'ぜ': 'せ', 'ぞ': 'そ',
    'だ': 'た', 'ぢ': 'ち', 'っ': 'つ', 'づ': 'つ', 'で': 'て',
    'ど': 'と', 'ば': 'は', 'ぱ': 'は', 'び': 'ひ', 'ぴ': 'ひ',
    'ぶ': 'ふ', 'ぷ': 'ふ', 'べ': 'へ', 'ぺ': 'へ', 'ぼ': 'ほ',
    'ぽ': 'ほ', 'ゃ': 'や', 'ゅ': 'ゆ', 'ょ': 'よ', 'ゎ': 'わ',
    'ゐ': 'い', 'ゑ': 'え', 'ゔ': 'う'
  }

  const cyoonDictionary = {
    'あ': ['あ', 'か', 'さ', 'た', 'な', 'は', 'ま', 'や', 'ら', 'わ'],
    'い': ['い', 'き', 'し', 'ち', 'に', 'ひ', 'み', 'り', 'ゐ'],
    'う': ['う', 'く', 'す', 'つ', 'ぬ', 'ふ', 'む', 'ゆ', 'る'],
    'え': ['え', 'け', 'せ', 'て', 'ね', 'へ', 'め', 'れ', 'ゑ'],
    'お': ['お', 'こ', 'そ', 'と', 'の', 'ほ', 'も', 'よ', 'ろ', 'を']
  }

  Object.keys(defaultSortDictionary).forEach((key) => {
    str = str.replace(new RegExp(key, 'g'), defaultSortDictionary[key]);
  });
  str = str.replace(/.[\u30FC\u2010-\u2015\u2212\uFF70-]/g, (match) => {
    const firstLetter = match.slice(0, 1);
    const result = Object.keys(cyoonDictionary).reduce((r, key)  => {
      return (cyoonDictionary[key].indexOf(firstLetter) >= 0) ? key : r;
    }, null);
    return result ? (firstLetter + result) : match;
  });
  return str;
}
