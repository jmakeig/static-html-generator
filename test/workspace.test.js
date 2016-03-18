'use strict';

const test = require('tape-catch');

const path = require('path');
const generator = require('../src/generator.js')

const MockSyncWritableStream = require('./util/mock-writablestream.js');

const SelectorError = generator.SelectorError;

test('Workspace', assert => {
  const input = `
* Here is an example of some code:
    <!-- @@workspace.xml#37107: Query -->
* And more
  `;

  const output = new MockSyncWritableStream();
  generator.processOutSync(input, output, path.resolve(process.cwd(), './test'));
  const lines = output.buffer.split(/[\r\n]/);
// assert.comment(output.buffer);
  assert.equals(4 /* template */ + 34 /* example */,
    lines.length, 'Total lines');
  assert.equals(lines[4], `var operators = ['>', '>=', '&lt;', '&lt;=', '=', '!=', '&amp;&amp;'];`);
  assert.end();
});

test('Workspace not found', assert => {
  const input = `
* Here is an example of some code:
    <!-- @@workspace.xml#XXXXXXXX -->
* And more
  `;
  const output = new MockSyncWritableStream();
  assert.throws(function() {
    generator.processOutSync(input, output, path.resolve(process.cwd(), './test'));
  }, SelectorError, 'Throws a SelectorError');
  assert.end();
});

test('Multiple workspaces', assert => {
  const input = `
* Here is an example of some code:
    <!-- @@workspace.xml#37107: Query -->
* Another example
    <!-- @@workspace.xml#Query 7 -->
* And more
  `;
  const output = new MockSyncWritableStream();
  generator.processOutSync(input, output, path.resolve(process.cwd(), './test'));
  const lines = output.buffer.split(/[\r\n]/);
  // assert.comment(output.buffer);
  assert.equals(lines.length,
    7 /* template */ + 34 /* 37107: Query */ + 3 /* Query 7 */ - 1 /* ? */,
    'Total lines across template and two examples');
  assert.end();
});
