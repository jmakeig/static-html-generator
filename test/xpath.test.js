'use strict';

const test = require('tape-catch');

const xpath = require('xpath');
const dom = require('xmldom').DOMParser;

const workspace = `
<export><workspace name="Workspace 2"><query name="multi-key insert" focus="false" active="true" content-source="as:15722485289718704553:" mode="javascript">declareUpdate();
var json = '{"Id": "0295a89d-de88-4f1f-bec6-35722d6d750c", "Name": "Schlemmer", "Firstname": "Jennifer", "Gender": "female", "City": "Erfurt", "Jobtitle": "Business Development Manager", "Jobtitle": "Business Analyst", "Employer": "Microsoft", "RDFName": "Jennifer_Schlemmer"}';
// var node = xdmp.unquote(json);
// xdmp.documentInsert('/mario.json', node);
JSON.parse(json)['Jobtitle'];</query><query name="Query 1" focus="false" active="true" content-source="as:15722485289718704553:" mode="javascript">'use strict'
xdmp.version(); // 8.0-4
var itr = cts.search(cts.jsonPropertyValueQuery('Jobtitle', 'Business Analyst'));
itr.toArray().map(function(doc) { return doc.root['Jobtitle']; });</query><query name="Query 2" focus="false" active="true" content-source="as:15722485289718704553:" mode="javascript">/**
 * Return a function proxy to invoke a function in another context.
 * The proxy can be called just like the original function, with the
 * same arguments and return types. Example uses: to run the input
 * as another user, against another database, or in a separate
 * transaction.
 *
 * @param fct Function The function to invoke
 * @param options Object The \`xdmp.eval\` options.
 *                       Use \`options.user\` as a shortcut to
 *                       specify a user name (versus an ID)
 * @return Function A function that accepts the same arguments as
 *                  the originally input function. For example,
 *                  \`applyAs(f)(1, false)\`
 */
function applyAs(fct, options, returnType /* 'many', 'one', 'iterable' */) {
  options = options || {};
  return function() {
    var params = Array.prototype.slice.call(arguments);
    // Curry the function to include the params by closure.
    // xdmp.invokeFunction requires that invoked functions have
    // an arity of zero.
    var f = (function() {
       return fct.apply(null, params);
    }).bind(this);
    // Allow passing in user name, rather than id
    if(options.user) { options.userId = xdmp.user(options.user); delete options.user; }
    // Allow the functions themselves to declare their transaction mode
    if(fct.transactionMode &amp;&amp; !(options.transactionMode)) { options.transactionMode = fct.transactionMode; }
    var result = xdmp.invokeFunction(f, options); // xdmp.invokeFunction returns a ValueIterator
    switch(returnType) {
      case 'one':
        // return fn.head(result); // 8.0-5
        return result.next().value;
      case 'many':
        return result.toArray();
      case 'iterable':
      default:
        return result;
    }
  }
}
var out = [xdmp.transaction()];
var transactionSame = applyAs(xdmp.transaction, {isolation: 'same-statement'}, 'one');
var transactionDiff = applyAs(xdmp.transaction, {isolation: 'different-transaction'}, undefined);
out.concat([transactionSame(), transactionDiff()]);


</query><query name="Query 3" focus="false" active="true" content-source="as:15722485289718704553:" mode="javascript">var listOne = 'pat, cat, hat, tat, bat, rat'.split(', ');
var listTwo = 'pat, mat, sat, rat, cat, tat, pat'.split(', ');

var results = listOne
  .reduce(function(prev, current) {
    if(!prev[current]) {
      prev[current] = (prev[current] || 0)
        + listTwo.filter(function(item) { return current === item; }).length;
    }
    return prev;
  }, {});

var htmlStr = Object.keys(results)
  .map(function(key) {
    return '&lt;tr&gt;&lt;td&gt;'+key+'&lt;/td&gt;&lt;td&gt;'+results[key]+'&lt;/td&gt;&lt;/tr&gt;';
  })
  .join('\r');

htmlStr;</query><query name="Query 4" focus="false" active="true" content-source="as:9507046796281876752:" mode="javascript">'use strict';
var admin = require('/MarkLogic/admin');
var config = admin.getConfiguration();
admin.databaseGetRangeElementIndexes(config, xdmp.database());</query><query name="Query 5" focus="false" active="true" content-source="as:9507046796281876752:" mode="javascript">'use strict';
var ALL = 9007199254740991;

var srch = require('/MarkLogic/jsearch');
var drugs = srch.collections('batch-bf0fb3ec-b41f-4ef4-919a-b9216c0eefdd' /* drugs*/);
var effectiveDrugs = drugs
  .values('rate')
  .where(cts.jsonPropertyRangeQuery('rate' /* efficacy */, '&gt;=', 47))
  .slice(0, ALL)
  .result();

var operations = srch.collections('production' /* 'operations' */);
operations
  .documents()
  .where(
    cts.andQuery([
      cts.jsonPropertyWordQuery('description', 'hashtag'),
      cts.jsonPropertyValueQuery('rate' /* drugID */, effectiveDrugs)
    ])
  )
  .result();</query><query name="Query 6" focus="false" active="false" content-source="as:9507046796281876752:" mode="javascript">'use strict';
var ALL = 9007199254740991;

var srch = require('/MarkLogic/jsearch');
var drugs = srch.collections('drugs');

var effectiveDrugs = drugs
  .values('rate')
  .where(cts.jsonPropertyRangeQuery('efficacy', '&gt;=', 0.87))
  .result();

var operations = srch.collections('operations');
operations
  .documents()
  .where(
    cts.andQuery([
      cts.jsonPropertyWordQuery('description', 'hashtag'),
      cts.jsonPropertyValueQuery('drugID', effectiveDrugs)
    ])
  )
  .result();</query><query name="37107: Insert" focus="false" active="true" content-source="as:9507046796281876752:" mode="javascript">'use strict';

var errors = [];
var inputs = {
  '/37107-valid.json': { 'onDate': (new Date()).toISOString(), 'rate': 12345 },
  //'/37107-invalid.json': { 'onDate': 'asdf', 'rate': 'asdf' },
  '/37107-null.json': { 'onDate': null, 'rate': null },
  '/37107-mixed.json': { 'onDate': [ (new Date()).toISOString(), null ], 'rate': 12345 }
};

var insert = applyAs(
  function(uri, value) {
    return xdmp.documentInsert(
      uri,
      value,
      null,
      ['37107']
    );
  },
  { isolation: 'different-transaction', transactionMode: 'update-auto-commit' },
  'one'
);

for(var uri in inputs) {
  try {
    insert(uri, inputs[uri]);
  } catch(err) {
    errors.push({
      uri: uri,
      error: err
    });
  }
}
errors.map(function(err) { return err.uri + ' =&gt; ' + err.error.name + ': ' + err.error.message; });

// &lt;https://gist.github.com/jmakeig/0a331823ad9a458167f6&gt;
function applyAs(e,n,r){return n=n||{},function(){var t=Array.prototype.slice.call(arguments),a=function(){return e.apply(null,t)}.bind(this);n.user&amp;&amp;(n.userId=xdmp.user(n.user),delete n.user),e.transactionMode&amp;&amp;!n.transactionMode&amp;&amp;(n.transactionMode=e.transactionMode);var u=xdmp.invokeFunction(a,n);switch(r){case"one":return u.next().value;case"many":return u.toArray();case"iterable":default:return u}}}

</query><query name="37107: Cast" focus="false" active="true" content-source="as:9507046796281876752:" mode="javascript">'use strict';
var errors = [];
var inputs = [
  (new Date()).toISOString(),
  'asdf',
  null
];

inputs.map(function(d) {
  try {
    var tmp = xs.dateTime(d);
    errors.push(undefined);
    return tmp;
  } catch(err) {
    errors.push(err);
    return undefined;
  }
});
errors.map(function(err) { if(err) { return err.name + ': ' + err.message; }});
</query><query name="37107: Insert" focus="false" active="true" content-source="as:9507046796281876752:" mode="xquery">let $uris := (
  '/37107-valid.xml',
  (:'/37107-invalid.xml',:)
  '/37107-null.xml'
)
let $docs := (
  &lt;bug37107&gt;&lt;onDate&gt;{fn:current-dateTime()}&lt;/onDate&gt;&lt;rate&gt;12345&lt;/rate&gt;&lt;/bug37107&gt;,
  (:&lt;bug37107&gt;&lt;onDate&gt;asdf&lt;/onDate&gt;&lt;rate&gt;asdf&lt;/rate&gt;&lt;/bug37107&gt;,:)
  &lt;bug37107&gt;&lt;onDate xsi:nil="true" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"/&gt;&lt;rate xsi:nil="true" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"/&gt;&lt;/bug37107&gt;
)
return
  for $uri at $i in $uris
  return
    try {
      xdmp:document-insert($uri, $docs[$i], (), ('37107'))
    } catch($err) {
      xdmp:log($err)
    }</query><query name="37107: Query" focus="false" active="true" content-source="as:9507046796281876752:" mode="javascript">'use strict';
var filters = ['filtered', 'unfiltered'];
var operators = ['&gt;', '&gt;=', '&lt;', '&lt;=', '=', '!='];

function search(op, filter) {
  return cts.search(
    cts.andQuery([
      cts.collectionQuery(['37107']) ,
      cts.jsonPropertyRangeQuery('onDate', op, xs.dateTime(new Date())),
      cts.jsonPropertyRangeQuery('rate', op, 55555)
    ]),
    [filter, cts.indexOrder(cts.elementReference(xs.QName('rate'))), cts.indexOrder(cts.elementReference(xs.QName('onDate')))]
  );
}

JSON.stringify(
filters.reduce(
  function(filterResults, filter) {
    filterResults[filter] = operators.reduce(
      function(operatorResults, op) {
        try {
          operatorResults[op] = search(op, filter).toArray().length;
        } catch(err) {
          operatorResults[op] = err.name + ': ' + err.message;
        }
        return operatorResults;
      },
      {}
    );
    return filterResults;
  },
  {}
)
, null, 2);</query><query name="37107: List" focus="false" active="true" content-source="as:9507046796281876752:" mode="javascript">// query
fn.collection('37107')
  .toArray()
  .map(function(doc) { return xdmp.quote(doc); })
  .join(',\r');</query><query name="Query 7" focus="false" active="true" content-source="as:9507046796281876752:" mode="javascript">// query
declareUpdate();
fn.collection('37107').toArray()
  .forEach(function(doc) { xdmp.documentDelete(xdmp.nodeUri(doc)); });</query><query name="Query 8" focus="false" active="true" content-source="as:9507046796281876752:" mode="javascript">cts.uris(null, ['score-random', 'sample=5'], cts.trueQuery())
</query><query name="Query 9" focus="false" active="true" content-source="as:9507046796281876752:" mode="xquery">
xdmp:plan(
  cts:search(fn:collection(), cts:element-word-query(xs:QName("description"), "disrupt"))
)</query><query name="Query 10" focus="true" active="true" content-source="as:9507046796281876752:" mode="javascript">'use strict';
var itr = xdmp.eval('false;'); // Returns a ValueIterator
                               // instance that iterates
                               // over one boolean value
itr instanceof ValueIterator;  // true
1 === itr.count;               // true
false !== itr &amp;&amp; true !== itr; // true
false === fn.boolean(itr);     // true, fn.boolean coerces
                               // singletons to their effective
                               // boolean values
itr.next().value === false;    // true</query></workspace></export>
`;
const doc = new dom().parseFromString(workspace);

test('XPath select query', assert => {
  assert.plan(2);

  const nodes = xpath.select('/export/workspace/query[@name = "37107: List"]', doc);

  assert.equals(nodes.length, 1, 'Selects one query');
  assert.equals(typeof nodes[0].firstChild.data, 'string', 'Node data is string');
});

test('XPath selects nothing', assert => {
    assert.plan(1);
    const nodes = xpath.select('/export/workspace/query[@name = "NOTHING HERE"]', doc);
    assert.equals(nodes.length, 0, 'Intentionally empty selection');
});
