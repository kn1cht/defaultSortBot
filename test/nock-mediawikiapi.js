'use strict';

const config = require('config'); // NODE_ENV=test

//const token = '00112233445566778899aabbccddeeff',
const csrftoken = '00112233445566778899aabbccddeeff+\\';
const title = {
  nodefaultsort: 'デフォルトソートのないページ'
};

const fakeAPI = {
  server: 'http://' + config.server,
  path: config.path + '/api.php'
};

fakeAPI.login = {
  request: (body) => (
    body.action == 'login' &&
    body.lgname == config.username &&
    body.lgpassword == config.password
  ),
  reply: {
    login: {
      result: 'Success',
      lguserid: 12345,
      lgusername: config.username
    }
  }
};

fakeAPI.edit = {
  request: (body) => (
    body.action == 'edit' &&
    body.title == title.nodefaultsort &&
    body.text.match(/{{DEFAULTSORT: てふおるとそおとのないへえし}}/)
  ),
  reply: {
    edit: { result: 'Success' }
  }
}

fakeAPI.allpages = {
  query: (query) => (
    query.action == 'query' &&
    query.list == 'allpages' &&
    query.apnamespace == 0
  ),
  reply: {
    batchcomplete: '',
    query: { allpages: [ { title: title.nodefaultsort } ] }
  }
};

fakeAPI.revisions = {
  query: (query) => (
    query.action == 'query' &&
    query.prop == 'revisions' &&
    query.rvprop == 'content' &&
    query.titles == title.nodefaultsort
  ),
  reply: {
    batchcomplete: '',
    query: {
      pages: {
        1: {
          pageid: 1,
          ns: 0,
          title: title.nodefaultsort,
          revisions: [
            {
              contentformat: 'text/x-wiki',
              contentmodel: 'wikitext',
              '*': ''
            }
          ]
        }
      }
    }
  }
};

fakeAPI.siteinfo = {
  query: (query) => (
    query.action == 'query' &&
    query.meta == 'siteinfo' &&
    query.siprop == 'general'
  ),
  reply: {
    batchcomplete: '',
    query: { general: { generator: 'MediaWiki 1.27.0' } }
  }
};

fakeAPI.csrftokens = {
  query: (query) => (
    query.action == 'query' &&
    query.meta == 'tokens' &&
    query.type == 'csrf'
  ),
  reply: {
    batchcomplete: '', query: { tokens: { csrftoken: csrftoken } }
  }
};

module.exports = fakeAPI;
