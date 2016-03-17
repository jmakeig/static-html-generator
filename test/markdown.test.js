'use strict';

const test = require('tape-catch');

const path = require('path');
const generator = require('../src/generator.js')

const MockSyncWritableStream = require('./util/mock-writablestream.js');

test('Markdown generation', assert => {
  const input = `
* Here is an example of some code:
    <!-- @@markdown.js -->
* And more
  `;

  let output = new MockSyncWritableStream();

  generator.processOutSync(input, output, path.resolve(process.cwd(), './test'));
  // assert.comment(output.buffer);
  assert.equals(false, (/1 \< 2/g).test(output.buffer), 'Not unescaped');
  assert.equals(true, (/1 &lt; 2/g).test(output.buffer), 'Escaped');
  assert.equals(false, (/2 && 3/g).test(output.buffer), 'Not unescaped');
  assert.equals(true, (/2 &amp;&amp; 3/g).test(output.buffer), 'Escaped');
  assert.equals(8, output.buffer.split(/[\r\n]/).length, 'Total lines');
  assert.end();
});
