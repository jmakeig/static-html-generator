'use strict';

const test = require('tape-catch');

const str = require('../src/string.js')

test('escapeForHTML', assert => {
  assert.equals(str.escapeForHTML('&&'), '&amp;&amp;');
  assert.equals(str.escapeForHTML('asdf&asdf'), 'asdf&amp;asdf');
  assert.equals(str.escapeForHTML('Here <em>is</em> text'), 'Here &lt;em>is&lt;/em> text');

  assert.end();
});
