const assert = require('power-assert');
const nock = require('nock');
const mockery = require('mockery');
const rewire = require('rewire');

const main = require('../main.js');
const main_rewire = rewire('../main.js');

const fake_server = 'fake.server.com';
const fake_username = 'user';
const fake_password = 'pass';

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
    mockery.registerMock('../config/default.yaml', {
      server: fake_server,
      path: '/wiki',
      username: fake_username,
      password: fake_password,
      namespaces: [
        {id: 0, prefix: ''},
        {id: 0, prefix: 'カテゴリ'},
      ]
    });
  });
  beforeEach(() => {
    return mockery.enable({ warnOnUnregistered: false });
  });
  afterEach(() => {
    //delete require.cache[require.resolve('main.js')];
    //nock.cleanAll();
    //return mockery.disable();
  });
  it('get mediawiki pages and add proper sort key');
})
