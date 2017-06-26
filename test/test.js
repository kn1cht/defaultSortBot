const assert = require('chai').assert;
const nock = require('nock');
const mockery = require('mockery');
const rewire = require('rewire');
const main = require('../main.js');

const fake_server = 'fake.server.com';
const fake_username = 'user';
const fake_password = 'pass';

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
  //this.timeout(10000);

  describe('katakana to hiragana converter', () => {
    it('should return あっとまーくAa01 when the value is アットマークAa01', () => {
        const main_rewire = rewire('../main.js');
        const katakanaToHiragana = main_rewire.__get__('katakanaToHiragana');
        assert.strictEqual(katakanaToHiragana('アットマークAa01'), 'あっとまーくAa01');
      });
    });


})
