var _ = require("underscore"),
    fs = require('fs'),
    Handlebars = require('handlebars'), 
   
   output_dir = './',
   tpl_dir = 'generator/templates/',
   pages_dir = tpl_dir + 'pages/',
   layouts_dir = tpl_dir + 'layouts/',
   partials_dir = tpl_dir + 'partials/',
   
   files,
   layouts = {};
   

//helpers   
require('./helpers.js');

//load partials   
files = fs.readdirSync(partials_dir);   
files.forEach(function(item) {
    var name = item.replace('.hbs', ''),
        content = fs.readFileSync(partials_dir+item, 'utf8');
        
    Handlebars.registerPartial(name, content); 
    console.log('partial: '+name);       
});

//load layouts 
files = fs.readdirSync(layouts_dir); 
files.forEach(function(item) {
    var name = item.replace('.hbs', ''),
        content = fs.readFileSync(layouts_dir+item, 'utf8');
    
    layouts[name] = Handlebars.compile(content);    
    console.log('layout: '+name);       
});

//load context
var context = loadContext();
//return;                            

//generate pages
files = fs.readdirSync(pages_dir);
files.forEach(function(item) {
  var page = item.replace('.hbs', ''),
      output_file = output_dir + page + '.html',      
      content = fs.readFileSync(pages_dir+item, 'utf8'),
      layout = layouts['main'],
      html;
      
      Handlebars.registerPartial('layout_content', content);  
      context.page = page;
      html = layout(context);
      fs.writeFileSync(output_file, html);  
      console.log('page: '+ output_file);    
});

console.log('ok');

// ------------------------ functions ---------------------

function loadContext() {
    var context = require('./data/data.json'),
        classes = {};
        
    context.project = require('../../lib/package.json');
    
    //group properties, methods, events
    //added only classes that have at least one property/method/event
    classes = _.chain(context.classitems)
                   .filter(function(item) { return (item.class && item.itemtype); })
                   .groupBy('class')
                   //merge into one object: name, (property, method, event), origina class information
                   .map(function(item, key){
                      return _.extend({name: key}, _.groupBy(item, 'itemtype'), context.classes[key]); 
                   })
                   //.object()
                   .value();
                   
    //convert to object                   
    classes =  _.chain(classes)    
                 .map(function(item){
                     return [item.name, item]; 
                 })
                 .object()
                 .value();
                 
    //merge defaults for main classes
    var exclude = ['editableform', 'editableContainer', 'editable'];
    mergeDefaults(classes.editableContainer, classes.editableform);
    mergeDefaults(classes.editable, classes.editableContainer);

    //merge events from container that are not present in editable()
    _.each(classes.editableContainer.event, function(item){
        if(!_.find(classes.editable.event, function(item1){ return item1.name == item.name; })) {
            classes.editable.event.push(item);
        }
    });
    
    //mark editable() and editableContainer() as 'main' classes
    classes.editable.mainClass = true; 
    classes.editableContainer.mainClass = true; 
    
    //sort alphabetically
    var sf = function(a,b) {return a.name > b.name ? 1 : -1;};
    _.each(['editableContainer', 'editable'], function(k) {
        classes[k].property.sort(sf); 
        classes[k].method.sort(sf); 
        classes[k].event.sort(sf); 
    });    
    
    //inputs
    var inputs = _.chain(classes)
                   //exclude main classes: editableform, etc
                  .filter(function(item, key) {
                      return _.indexOf(exclude, key) === -1;
                  })
                  //sort for correct merging defaults
                  .sortBy(function(item) {
                      if(item.name === 'abstractinput') return 0;
                      //inputs that are parents for others
                      if(item.name === 'list' || item.name === 'text') return 1;
                      return 10;
                  })                  
                  .map(function(item) {
                      if(item.extends) {
                          mergeDefaults(item, classes[item.extends]);
                      }
                      return item;
                  })
                  .filter(function(item, key) {
                      return item.final;
                  })                  
                  .sortBy(function(item) {
                      return -item.name.charCodeAt(0);
                  })
                  
               //   .object()
                  .value();
    
    
    
    context.myClasses = classes;   
    context.inputs = inputs;   
    
    return context;
}

function mergeDefaults(o, parent) {
    if(!o.property) {
        o.property = [];
    }

    _.each(parent.property, function(prop) {
        if(prop.access === 'private') return;
        
        //find property with the same name
        var exist = _.find(o.property, function(p) { return p.name === prop.name; });

        //merge property to original class
        if(exist) {   
            _.extend(exist, _.extend({}, prop, exist));
        } else {
            o.property.push(prop); 
        }
    });
}