'use strict'
const fs = require('fs');
const path = require('path');

const INCLUDE = '<!-- @@(.+) -->'; // Optionally surround path with quotes too
const encoding = {encoding: 'utf8' };

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
  function stripQuotes(str) {
    return str.replace(/^"/, '')
              .replace(/"$/, '');
  }
  out.write(
    template.replace(new RegExp(INCLUDE, 'g'),
      (match, file) => {
        // Resolves included paths relative to the template
        const resolvedPath = path.resolve(wd, stripQuotes(file));
        try {
          let fileContents = fs.readFileSync(resolvedPath, encoding);
          return fileContents
                  // TODO: Assumes HTML encoding
                   .replace(/\&/g, '&amp;')
                   .replace(/</g, '&lt;');
        } catch(err) {
          process.stderr.write(`Could not include ${match} becuase the file, '${resolvedPath}', resolved relative to '${wd}', could not be opened.\n`);
          process.exit(1);
        }
      }
    )
  );
}

module.exports = {
  readInput: readInput,
  processOutSync: processOutSync
}
