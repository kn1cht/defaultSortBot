'use strict';

const assert = require('power-assert');
const config = require('config'); // NODE_ENV=test
const url = require('url');
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
  nodefaultsort: "\n{{DEFAULTSORT: てふおるとそおとのないへえし}}"
}

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

fakeAPI.allpages = {
  query : (query) => (
    query.action === 'query' &&
    query.list === 'allpages'
  ),
  reply : function() {
    //const req = url.parse(this.req.path, true);
    const namespace = this.req.path.match(/apnamespace=(.*?)&/)[0].split(/(=|&)/)[2];
    const title = fakeAPI.title[namespace].nodefaultsort;
    console.log('ns: '+namespace+' title: '+title);
    return { batchcomplete : '', query : { allpages : [ { title : title } ] } };
  }
};

fakeAPI.revisions = {
  query : (query) => (
    query.action === 'query' &&
    query.prop === 'revisions' &&
    query.rvprop === 'content'
  ),
  reply : function() {
    return {
      batchcomplete : '',
      query : {
        pages : {
          1 : {
            ns        : 0,
            title     : fakeAPI.title.nodefaultsort,
            revisions : [
              {
                contentformat : 'text/x-wiki',
                contentmodel  : 'wikitext',
                '*'           : ''
              }
            ]
          }
        }
      }
    };
  }
};

fakeAPI.siteinfo = {
  query : (query) => (
    query.action === 'query' &&
    query.meta === 'siteinfo' &&
    query.siprop === 'general'
  ),
  reply : {
    batchcomplete : '',
    query         : { general : { generator : 'MediaWiki 1.27.0' } }
  }
};

fakeAPI.csrftokens = {
  query : (query) => (
    query.action === 'query' &&
    query.meta === 'tokens' &&
    query.type === 'csrf'
  ),
  reply : {
    batchcomplete : '',
    query         : { tokens : { csrftoken : csrftoken } }
  }
};

module.exports = fakeAPI;
