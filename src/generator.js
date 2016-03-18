'use strict'
const fs = require('fs');
const path = require('path');

const xpath = require('xpath');
const dom = require('xmldom').DOMParser;

const string = require('./string.js');

const INCLUDE = '<!-- @@(.+) -->'; // Optionally surround path with quotes too
const SELECTOR = '#';
const encoding = {encoding: 'utf8' };

class SelectorError extends Error {
  constructor(path, fileName, xml) {
    super();

    this.path = path;
    this.fileName = fileName;
    this.xml = xml;

    Error.captureStackTrace(this);
  }
  get name() {
    return 'SelectorError';
  }
  get message() {
    return `No match at ${this.path} in ${this.fileName}.`;
  }
}

// function parseInclude()

/**
 * Reads the input stream as UTF-8 text.
 * @param [ReadableStream] readStream
 * @return [Promise]
 */
function readInput(readStream) {
  return new Promise(function(resolve, reject) {
    let buffer = '';
    readStream.setEncoding('utf-8');
    readStream.resume();
    readStream.on('data', chunk => buffer += chunk);
    readStream.on('end', () => resolve(buffer));
  })
}

// TODO: Get file should cache, in the case of workspaces
const getFileSync = (function(resolvedPath, selector, encoding) {
  const cache = {};
  return function(resolvedPath, selector, encoding) {
    let cached = cache[`${resolvedPath}`];
    if(cached && !selector) {
      return cached;
    }
    let fileContents = fs.readFileSync(resolvedPath, encoding);
    if(selector) {
      const workspace = new dom().parseFromString(fileContents);
      // Cache DOM, not just string. This means that you can’t include an entire workspace.
      cache[resolvedPath] = workspace;
      const matcher = `/export/workspace/query[@name = "${selector}"]`;
      const nodes = xpath.select(matcher, workspace);
      if(!nodes.length) {
        throw new SelectorError(matcher, resolvedPath, fileContents);
      }
      return nodes[0].firstChild.data;
    } else {
      cache[resolvedPath] = fileContents;
      return fileContents;
    }
  }
})();


/**
 * Processes the template contents synchronously
 *   1. finds the include directives
 *   2. reads the referenced file into a string
 *   3. replaces the the matched directive in-place
 * (Yes, this would probably be better asynchronous for large files.)
 *
 * @param [string] template The text of the template (not its path)
 * @param [WritableStream] out
 * @param [string] wd The working directory against which to resolve relative paths
 * @return [undefined]
 */
function processOutSync(template, out, wd) {
  out.write(
    template.replace(new RegExp(INCLUDE, 'g'),
      (match, include) => {
        const parts = include.split(SELECTOR);
        const file = parts[0];
        const selector = parts[1]; // undefined if no selector

        // Resolves included paths relative to the template
        const resolvedPath = path.resolve(wd, string.stripLeadingTrailingQuotes(file));
        let fileContents = getFileSync(resolvedPath, selector, encoding);
        return fileContents
           .replace(/\&/g, '&amp;')
           .replace(/</g, '&lt;');
      }
    )
  );
}

module.exports = {
  readInput: readInput,
  processOutSync: processOutSync,
  SelectorError: SelectorError
}
