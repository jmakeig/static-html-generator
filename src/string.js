'use strict';

function escapeForHTML(input) {
  return String(input) // Beware of null, undefined, and NaN
    .replace(/\&/g, '&amp;')
    .replace(/</g, '&lt;');
}

function escapeForXPathString(input) {
  return String(input)
    .replace(/'/g, '&apos;')
    .replace(/"/g, '&quot;');
}

function stripLeadingTrailingQuotes(input) {
  return String(input)
    .replace(/^["']'/, '')
    .replace(/["'']$/, '');
}


module.exports = {
  escapeForHTML: escapeForHTML,
  escapeForXPathString: escapeForXPathString,
  stripLeadingTrailingQuotes: stripLeadingTrailingQuotes
}
