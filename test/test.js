'use strict';

const assert = require('power-assert');
const config = require('config'); // NODE_ENV=test
const nock = require('nock');
const rewire = require('rewire');

const fakeAPI = require('./nock-mediawikiapi.js');
const main_rewire = rewire('../main.js');

describe('normalizeForDefaultSort', () => {
  it('convert 濁音 to 清音', () => {
    const normalizeForDefaultSort = main_rewire.__get__('normalizeForDefaultSort');
    assert(normalizeForDefaultSort('ゔがぎぐげござじずぜぞだぢづでどばびぶべぼ') === 'うかきくけこさしすせそたちつてとはひふへほ');
  });
  it('convert 半濁音 to 清音', () => {
    const normalizeForDefaultSort = main_rewire.__get__('normalizeForDefaultSort');
    assert(normalizeForDefaultSort('ぱぴぷぺぽ') === 'はひふへほ');
  });
  it('convert 拗音 to 直音', () => {
    const normalizeForDefaultSort = main_rewire.__get__('normalizeForDefaultSort');
    assert(normalizeForDefaultSort('きゃきゅきょ') === 'きやきゆきよ');
  });
  it('convert 促音 to 直音', () => {
    const normalizeForDefaultSort = main_rewire.__get__('normalizeForDefaultSort');
    assert(normalizeForDefaultSort('きっとかっと') === 'きつとかつと');
  });
  it('convert 長音 to 母音', () => {
    const normalizeForDefaultSort = main_rewire.__get__('normalizeForDefaultSort');
    assert(normalizeForDefaultSort('あーきーすーつーのー') === 'ああきいすうつうのお');
  });
  it('do nothing against not ひらがな character', () => {
    const normalizeForDefaultSort = main_rewire.__get__('normalizeForDefaultSort');
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
  it('get mediawiki pages and add proper sort key', (done) => {
    main_rewire.__get__('main')();
    setInterval(() => {
      if(editReq.isDone() == true) {
        editReq.done(); // nock assertion
        done();
      }
    }, 100);
  });
})
