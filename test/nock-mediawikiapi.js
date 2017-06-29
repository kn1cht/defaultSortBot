'use strict';

const assert = require('power-assert');
const config = require('config'); // NODE_ENV=test
const querystring = require('querystring');

const csrftoken = '00112233445566778899aabbccddeeff+\\';

const fakeAPI = {
  server : 'http://' + config.server,
  path   : config.path + '/api.php'
};

fakeAPI.title = {
  0 : {
    nodefaultsort : 'デフォルトソートのないページ'
  },
  14: {
    nodefaultsort : 'カテゴリ:デフォルトソートのないページ'
  }
};

fakeAPI.ans = {
  nodefaultsort: '\n{{DEFAULTSORT: てふおるとそおとのないへえし}}'
};

fakeAPI.login = {
  request : (body) => (
    body.action === 'login' &&
    body.lgname === config.username &&
    body.lgpassword === config.password
  ),
  reply : {
    login : {
      result     : 'Success',
      lguserid   : 12345,
      lgusername : config.username
    }
  }
};

fakeAPI.edit = {
  request : (body) => (body.action === 'edit'),
  reply : function(uri, requestBody) {
    const req = querystring.parse(requestBody);
    //req.title === fakeAPI.title.nodefaultsort
    assert(req.text === fakeAPI.ans.nodefaultsort);
    return { edit : { result : 'Success' } };
  }
};

fakeAPI.query = {
  request: (query) => (query.action === 'query'),
  reply : function() {
    const query = querystring.parse((this.req.path.split('?').slice(-1))[0]);
    if(query.list === 'allpages') {
      return fakeAPI.query.allpages(query);
    }
    else if(query.prop === 'revisions' && query.rvprop === 'content') {
      return fakeAPI.query.revisions();
    }
    else if(query.meta === 'siteinfo' && query.siprop === 'general') {
      return fakeAPI.query.siteinfo();
    }
    else if(query.meta === 'tokens' && query.type === 'csrf') {
      return fakeAPI.query.csrftokens();
    }
  },
  allpages: function(query) {
    const title = fakeAPI.title[query.apnamespace].nodefaultsort;
    return { batchcomplete : '', query : { allpages : [{ title : title }]}};
  },
  revisions: function() {
    return {
      batchcomplete : '', query : { pages : { 1 : {
        ns : 0, title : fakeAPI.title.nodefaultsort, revisions : [{
          contentformat : 'text/x-wiki',
          contentmodel  : 'wikitext',
          '*'           : ''
        }]
      }}}
    };
  },
  siteinfo: function() {
    return { batchcomplete : '', query : { general : { generator : 'MediaWiki 1.27.0' }}};
  },
  csrftokens: function() {
    return  { batchcomplete : '', query : { tokens : { csrftoken : csrftoken }}};
  }
};

module.exports = fakeAPI;
