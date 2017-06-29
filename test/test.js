'use strict';

const assert = require('power-assert');
const nock = require('nock');
const rewire = require('rewire');

const fakeAPI = require('./nock-mediawikiapi.js');
const main = rewire('../main.js');

describe('normalizeForDefaultSort', () => {
  const normalizeForDefaultSort = main.__get__('normalizeForDefaultSort');
  it('convert 濁音 to 清音', () => {
    assert(normalizeForDefaultSort('ゔがぎぐげござじずぜぞだぢづでどばびぶべぼ') === 'うかきくけこさしすせそたちつてとはひふへほ');
  });
  it('convert 半濁音 to 清音', () => {
    assert(normalizeForDefaultSort('ぱぴぷぺぽ') === 'はひふへほ');
  });
  it('convert 拗音 to 直音', () => {
    assert(normalizeForDefaultSort('きゃきゅきょ') === 'きやきゆきよ');
  });
  it('convert 促音 to 直音', () => {
    assert(normalizeForDefaultSort('きっとかっと') === 'きつとかつと');
  });
  it('convert 長音 to 母音', () => {
    assert(normalizeForDefaultSort('あーきーすーつーのー') === 'ああきいすうつうのお');
  });
  it('do nothing against not ひらがな character', () => {
    assert(normalizeForDefaultSort('Abc123"#$') === 'Abc123"#$');
  });
});

describe('defaultSortBot', function() {
  this.timeout(10000);
  let editReq;
  beforeEach(() => {
    nock(fakeAPI.server).persist()
      .post(fakeAPI.path, fakeAPI.login.request)
      .reply(200, fakeAPI.login.reply)
      .get(fakeAPI.path).query(fakeAPI.allpages.query)
      .reply(200, fakeAPI.allpages.reply)
      .get(fakeAPI.path).query(fakeAPI.revisions.query)
      .reply(200, fakeAPI.revisions.reply)
      .get(fakeAPI.path).query(fakeAPI.siteinfo.query)
      .reply(200, fakeAPI.siteinfo.reply)
      .get(fakeAPI.path).query(fakeAPI.csrftokens.query)
      .reply(200, fakeAPI.csrftokens.reply);

    editReq = nock(fakeAPI.server).persist()
      .post(fakeAPI.path, fakeAPI.edit.request)
      .reply(200, fakeAPI.edit.reply);
  });
  afterEach(() => {
    delete require.cache[require.resolve('../main.js')];
    nock.cleanAll();
  });
  it('find page without sort key and add proper sort key', (done) => {
    main.__get__('main')();
    setInterval(() => {
      if(editReq.isDone() === true) {
        editReq.done(); // nock assertion
        done();
      }
    }, 100);
  });
});
