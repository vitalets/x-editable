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

//markdown block
Handlebars.registerHelper('mdb', function(options) {
    return new Handlebars.SafeString(marked(options.fn(this).trim()));
});

//source
Handlebars.registerHelper('source', function(options) {
  var out = '<pre class="prettyprint linenums">' + (Handlebars.Utils.escapeExpression(options.fn(this))).trim() + '</pre>';
  return new Handlebars.SafeString(out);
});

//since
Handlebars.registerHelper('since', function() {
    if(this.since) {
       return new Handlebars.SafeString('<div style="text-align: right"><span class="muted" style="font-size: 0.8em">since '+ this.since +'</span></div>');
    }
});

//new
Handlebars.registerHelper('new', function(ver) {
    if(this.since == ver) {
       return new Handlebars.SafeString(' <sup><span class="label label-success">new</span></sup>');
    }
});


//allows to pass parameters into partial
Handlebars.registerHelper('include', function(templatename, options){  
    var partial = Handlebars.partials[templatename];
    if (typeof partial === "string") {
        partial = Handlebars.compile(partial);
    }  
    var context = this;
    for(var k in options.hash) { context[k]=options.hash[k]; }
    return new Handlebars.SafeString(partial(context));
});