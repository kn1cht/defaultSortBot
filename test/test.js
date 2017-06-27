const assert = require('power-assert');
const config = require('config'); // NODE_ENV=test
const nock = require('nock');
const rewire = require('rewire');

const main = require('../main.js');
const main_rewire = rewire('../main.js');


describe('katakanaToHiragana', () => {
  it('convert カタカナ to ひらがな', () => {
    const katakanaToHiragana = main_rewire.__get__('katakanaToHiragana');
    assert(katakanaToHiragana('アットマーク') === 'あっとまーく');
  });
  it('do nothing against not カタカナ character', () => {
    const katakanaToHiragana = main_rewire.__get__('katakanaToHiragana');
    assert(katakanaToHiragana('あAa1!') === 'あAa1!');
  });
});

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

describe('defaultSortBot', () => {
  before(() => {
    nock(config.server).get(config.path).reply(200, {
      "login": {
        "result": "Success",
        "lguserid": 12345,
        "lgusername": fake_username
      }
  });
  beforeEach(() => {
  });
  afterEach(() => {
    //delete require.cache[require.resolve('main.js')];
    //nock.cleanAll();
  });
  it('get mediawiki pages and add proper sort key', () => {
    require('../main.js');
    });
  });
})
