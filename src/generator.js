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


const doc =
`
Replaces placeholders of the form <!-- @@path/to/file.js --> with the contents
of the refernced file. Paths are resolved relative to the input file or the
current working directory in the case of stdin.

Usage:
  generate [<input>] [(--output <file> | --stdout)] [--validate]
  generate <input> --output <file> [--watch <dir>] [--validate]
  generate [--help]

Options:
  <input>                        Input file
  -o <file>, --output <file>     Send output to a file
  --stdout                       Send to standard out
  -v, --validate                 Validate
  --watch <dir>                  Watch a directory
  -h, --help                     Help

`;

const opts = require('docopt').docopt(doc);
// console.dir(opts);
// process.exit(1);

const cwd = process.cwd();

let outputStream = process.stdout;
let outputPath = null;
if(opts['--output']) {
  outputStream = fs.createWriteStream(path.resolve(cwd, opts['--output']));
  outputPath = path.resolve(cwd, opts['--output'])
}

let inputStream = process.stdin;
// Use the current working directory, not the script location
// to resolve relative paths in the template if input is stdin (default)
let wd = cwd;
if(opts['<input>']) {
  inputStream = fs.createReadStream(path.resolve(cwd, opts['<input>']));
  wd = path.dirname(path.resolve(cwd, opts['<input>']));
}

readInput(inputStream)
  .then(input => processOutSync(input, outputStream, wd))
  .catch(function(err) {
    console.error('Unhandled error: %s', err);
    process.exit(1);
  });

if(opts['--watch']) {
  const watch = require('node-watch');
  watch(path.resolve(cwd, opts['--watch']), function(filename) {
    if(filename !== outputPath) {
      console.log(`Detected change to ${path.relative(cwd, filename)} ➞  Updating ${path.relative(cwd, outputPath)}`);
      readInput(inputStream)
        .then(input => processOutSync(input, outputStream, wd))
        .catch(function(err) {
          console.error('Unhandled error: %s', err);
          process.exit(1);
        });
    }
  });
  console.log(`Watching ${path.resolve(cwd, opts['--watch'])}…`);
}
