var Handlebars = require('handlebars'),
    marked = require( "marked" );
    
//equal helper
Handlebars.registerHelper('if_eq', function(v1, v2, options) {
  if(v1 == v2) {
    return options.fn(this);
  }
  return options.inverse(this);
});   

//each property helper
Handlebars.registerHelper('eachProperty', function(context, options) {
    var ret = "";
    for(var key in context) {
        ret = ret + options.fn({key: key, value: context[key]});
    }
    return ret;
});

//markdown
Handlebars.registerHelper('md', function(string) {
    return new Handlebars.SafeString(marked(string));
});

//source
Handlebars.registerHelper('source', function(options) {
  var out = '<pre class="prettyprint linenums">' + (Handlebars.Utils.escapeExpression(options.fn(this))).trim() + '</pre>';
  return new Handlebars.SafeString(out);
});