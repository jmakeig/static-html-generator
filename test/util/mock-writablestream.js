'use strict';
/**
 * Accumulates a stream in a string.
 */
class MockSyncWritableStream {
  constructor() {
    this._buffer = '';
  }
  get buffer() {
    return this._buffer;
  }
  write(chunk) {
    this._buffer += chunk;
  }
}

module.exports = MockSyncWritableStream;
