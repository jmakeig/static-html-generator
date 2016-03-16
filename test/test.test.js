'use strict';

const test = require('tape-catch');

const stream  = require('stream');
const generator = require('../src/generator.js')


test('canary', function (assert) {
  assert.plan(1);

  const input = `<p>hello</p>`;

  let output = {
    buffer: '',
    write: function(string) {
      this.buffer += string;
    }
  };

  generator.processOutSync(input, output);
  assert.equals(output.buffer, input, 'Indentity transform should be the same');

});
