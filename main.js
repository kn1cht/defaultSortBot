// utf-8
'use strict';

const config = require('config');
const japanese = require('japanese');
const nodemw = require('nodemw');
const tokenize = require('kuromojin').tokenize;
const unorm = require('unorm');

/*** mediawiki API bot ***/
const bot = new nodemw({
  server : config.server,
  path   : config.path,
});

module.exports = main;

if (require.main === module) { main(); }

function main() {
  config.namespaces.forEach((ns) => {
    logInPromise(config.username, config.password).then(() => { // login to get permisson
      return getPagesInNamespacePromise(ns.id); // get page data as JSON
    }).then((data) => {
      data.forEach((page) => {
        let pageData = null;
        const pageTitleNoPrefix = (page.title.indexOf(ns.prefix + ':') >= 0) ? page.title.substr(ns.prefix.length + 1) : page.title;
        let editSummary = 'Bot: Add DEFAULTSORT ';

        getArticlePromise(page.title).then((data) => {
          pageData = data;
          if(/\{\{DEFAULTSORT:.*\}\}/.test(pageData)) { return; } // skip if page already have DEFAULTSORT
          else {
            const title = unorm.nfkc(pageTitleNoPrefix); // unicode normalization
            return tokenize(title);
          }
        }).then((tokens) => {
          let reading = getReadingFromTokens(tokens);
          reading = japanese.hiraganize(reading);
          reading = normalizeForDefaultSort(reading);

          pageData += '\n{{DEFAULTSORT: ' + reading + '}}';
          editSummary += reading;
          bot.edit(page.title, pageData, editSummary, (err) => {
            if(err) { console.error(err); }
            console.info('Edited ' + page.title + '/ ' + editSummary);
          });
        }).catch((err) => {
          console.error(err);
        });
      });
    }).catch((err) => {
      console.error(err);
    });
  });
}

function logInPromise(username, password) {
  return new Promise((resolve, reject) => {
    bot.logIn(username, password, (err) => {
      if (err) { reject(err); }
      else { resolve();  }
    });
  });
}

function getPagesInNamespacePromise(namespace) {
  return new Promise((resolve, reject) => {
    bot.getPagesInNamespace(namespace, (err, data) => {
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

function getReadingFromTokens(tokens) {
  return tokens.reduce((res, token) => {
    return (token.reading) ? (res + token.reading) : (res + token.surface_form);
  }, '');
}

function normalizeForDefaultSort(str) {
  const defaultSortDictionary = {
    'ぁ' : 'あ', 'ぃ' : 'い', 'ぅ' : 'う', 'ぇ' : 'え', 'ぉ' : 'お',
    'が' : 'か', 'ぎ' : 'き', 'ぐ' : 'く', 'げ' : 'け', 'ご' : 'こ',
    'ざ' : 'さ', 'じ' : 'し', 'ず' : 'す', 'ぜ' : 'せ', 'ぞ' : 'そ',
    'だ' : 'た', 'ぢ' : 'ち', 'っ' : 'つ', 'づ' : 'つ', 'で' : 'て',
    'ど' : 'と', 'ば' : 'は', 'ぱ' : 'は', 'び' : 'ひ', 'ぴ' : 'ひ',
    'ぶ' : 'ふ', 'ぷ' : 'ふ', 'べ' : 'へ', 'ぺ' : 'へ', 'ぼ' : 'ほ',
    'ぽ' : 'ほ', 'ゃ' : 'や', 'ゅ' : 'ゆ', 'ょ' : 'よ', 'ゎ' : 'わ',
    'ゐ' : 'い', 'ゑ' : 'え', 'ゔ' : 'う'
  };

  const cyoonDictionary = {
    'あ' : ['あ', 'か', 'さ', 'た', 'な', 'は', 'ま', 'や', 'ら', 'わ'],
    'い' : ['い', 'き', 'し', 'ち', 'に', 'ひ', 'み', 'り', 'ゐ'],
    'う' : ['う', 'く', 'す', 'つ', 'ぬ', 'ふ', 'む', 'ゆ', 'る'],
    'え' : ['え', 'け', 'せ', 'て', 'ね', 'へ', 'め', 'れ', 'ゑ'],
    'お' : ['お', 'こ', 'そ', 'と', 'の', 'ほ', 'も', 'よ', 'ろ', 'を']
  };

  Object.keys(defaultSortDictionary).forEach((key) => {
    str = str.replace(new RegExp(key, 'g'), defaultSortDictionary[key]);
  });
  str = str.replace(/.[\u30FC\u2010-\u2015\u2212\uFF70-]/g, (match) => {
    const firstLetter = match.slice(0, 1);
    const result = Object.keys(cyoonDictionary).reduce((res, key)  => {
      return (cyoonDictionary[key].indexOf(firstLetter) >= 0) ? key : res;
    }, null);
    return result ? (firstLetter + result) : match;
  });
  return str;
}
