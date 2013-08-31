function getFiles() {
    //directories  
    var
    lib = 'src/',
    forms = lib+'editable-form/',
    inputs = lib+'inputs/',
    containers = lib+'containers/';  

    //config for different cores of lib 
    var config = {
        bootstrap: {
            form: [forms+'editable-form-bootstrap.js'],
            container: [containers+'editable-popover.js'],
            inputs: [
                inputs+'date/bootstrap-datepicker/js/bootstrap-datepicker.js',
                inputs+'date/date.js', 
                inputs+'date/datefield.js', 
                inputs+'datetime/datetime.js', 
                inputs+'datetime/datetimefield.js',
                //don't build datetime lib, should be included manually 
                //inputs+'datetime/bootstrap-datetimepicker/js/bootstrap-datetimepicker.js',
                inputs+'typeahead.js'
                ], 
            css: [
                inputs+'date/bootstrap-datepicker/css/datepicker.css'
               //don't build datetime lib, should be included manually
               //inputs+'datetime/bootstrap-datetimepicker/css/datetimepicker.css'
                ]
        },  
        jqueryui: {
            form: [forms+'editable-form-jqueryui.js'],
            container: [containers+'editable-tooltip.js'],
            inputs: [
               inputs+'dateui/dateui.js',
               inputs+'dateui/dateuifield.js'
            ], 
            css: []
        },  
        jquery: {
            form: [],
            container: [containers+'editable-poshytip.js'],
            inputs: [
               inputs+'dateui/dateui.js',
               inputs+'dateui/dateuifield.js'
            ],            
            css: []
        }      
    };

    //common js files 
    var js = [
        forms+'editable-form.js',
        forms+'editable-form-utils.js',
        containers+'editable-container.js', 
        containers+'editable-inline.js',
        lib+'element/editable-element.js',
        inputs+'abstract.js',
        inputs+'list.js',
        inputs+'text.js',
        inputs+'textarea.js',
        inputs+'select.js',    
        inputs+'checklist.js',
        inputs+'html5types.js',
        inputs+'select2/select2.js',
        inputs+'combodate/lib/combodate.js', 
        inputs+'combodate/combodate.js'    
    ]; 

    //common css files
    var css = [
        forms+'editable-form.css',
        containers+'editable-container.css', 
        lib+'element/editable-element.css'
    ];

    //create 'concat' and 'uglify' tasks
    var task, folder, dest, concat_files = {}, min_files = {};
    for(var k in config) {
        folder = '<%= dist %>/'+k+'-editable/';

        //js
        task = k+'_js';
        dest = folder+'js/'+k+'-editable'+ (k === 'jquery' ? '-poshytip' : '');
        concat_files[task] = {
            src:  js.concat(config[k].form).concat(config[k].container).concat(config[k].inputs),
            dest: dest+'.js'
        };
        min_files[task] = {
            src: ['<%= concat.'+task+'.dest %>'],
            dest: dest + '.min.js'
        };      

        //css
        concat_files[k+'_css'] = {
            src: css.concat(config[k].css),
            dest: folder+'css/'+k+'-editable.css'
        };
    }  

    return {concat_files: concat_files, min_files: min_files};  

} 

/*global module:false*/
module.exports = function(grunt) {

 grunt.loadNpmTasks('grunt-contrib-clean');
 grunt.loadNpmTasks('grunt-contrib-concat');
 grunt.loadNpmTasks('grunt-contrib-uglify');
 grunt.loadNpmTasks('grunt-contrib-qunit');
 grunt.loadNpmTasks('grunt-contrib-connect');
 grunt.loadNpmTasks('grunt-contrib-jshint');
 grunt.loadNpmTasks('grunt-contrib-copy');
 grunt.loadNpmTasks('grunt-contrib-requirejs');

 //version of jquery-ui datepicker to be copied into dist
 var dp_ui_ver = '1.10.3';
 
 //module for testing
 var module = ''; 
// module = '&module=textarea';
//module = '&module=select';
//module = '&module=text';

//test on several jquery versions
 var qunit_testover = [];
 ['bootstrap', 'jqueryui', 'plain'].forEach(function(f){
     ['popup', 'inline'].forEach(function(c){
         ['1.7.2', '1.8.3', '1.9.1', '1.10.2', '2.0.3'].forEach(function(jqver) {
             qunit_testover.push('http://localhost:8000/test/index.html?f='+f+'&c='+c+'&jquery='+jqver+module); 
         });
     });
 });    

 //get js and css for different builds
 var files = getFiles();
 
 var banner = '/*! <%= pkg.title || pkg.name %> - v<%= pkg.version %> \n' +
        '* <%= pkg.description %>\n' +
        '* <%= pkg.homepage %>\n' +
        '* Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author.name %>;' +
        ' Licensed <%= _.pluck(pkg.licenses, "type").join(", ") %> */\n';
 
 files.concat_files.options = {banner: banner};
 files.min_files.options = {banner: banner};
 
 
 // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    dist: 'dist',
    
    clean: ['<%= dist %>'],
    
    concat: files.concat_files,
    
    uglify: files.min_files,
     
    qunit: {
      bootstrap2: {
          options: {
            urls: [
                  'http://localhost:8000/test/index.html?f=bootstrap&c=popup'+module,
                  'http://localhost:8000/test/index.html?f=bootstrap&c=inline'+module
                 ]
          }
      },
      bootstrap3: {
          options: {
            urls: [
                  'http://localhost:8000/test/index.html?f=bs3&c=popup'+module,
                  'http://localhost:8000/test/index.html?f=bs3&c=inline'+module
                 ]
          }
      },
      jqueryui: {
          options: {
            urls:[
                  'http://localhost:8000/test/index.html?f=jqueryui&c=popup'+module,
                  'http://localhost:8000/test/index.html?f=jqueryui&c=inline'+module
                 ]
          }
      },
      plain: {
          options: {
            urls:[
                  'http://localhost:8000/test/index.html?f=plain&c=popup'+module,
                  'http://localhost:8000/test/index.html?f=plain&c=inline'+module
             ]
          }
      },
      //test all builds under several versions of jquery                                   
      testover: {
          options: {
            urls:qunit_testover
          }
      },          
    },
    
    connect: {
        server: {
            port: 8000,
            base: '.'
        }
    },    
    
    jshint: {
      options: {
        curly: true,
        eqeqeq: true,
        immed: true,
        latedef: true,
        newcap: true,
        noarg: true,
        sub: true,
        undef: true,
        boss: true,
        eqnull: true,
        browser: true,
        evil: false,
        globals: {
            jQuery: true
        },  
      },
      js: [   'Gruntfile.js', 
              'src/editable-form/*.js', 
              'src/containers/*.js', 
              'src/element/*.js', 
              
              'src/inputs/*.js', 
              'src/inputs/date/*.js',
              'src/inputs/dateui/*.js',
              'src/inputs/datetime/*.js',
              'src/inputs/combodate/*.js',
              'src/inputs/select2/*.js',
              
              'src/inputs-ext/address/*.js',
              'src/inputs-ext/wysihtml5/*.js'
          ]
    },
    copy: {
        dist: {
            files: {
                '<%= dist %>/bootstrap-editable/img/' : 'src/img/*',
                '<%= dist %>/jqueryui-editable/img/' : 'src/img/*',
                '<%= dist %>/jquery-editable/img/' : 'src/img/*',
                 //licences
                '<%= dist %>/': ['LICENSE-MIT', 'README.md', 'CHANGELOG.txt']
            },
            options: {
               flatten: true
            }
        },
        inputs_ext: {
            files: {
                '<%= dist %>/inputs-ext/': 'src/inputs-ext/**'
            },
            options: {
               basePath: 'inputs-ext'
            }            
        },
        ui_datepicker: {
            files: {
             //copy jquery ui datepicker
             '<%= dist %>/jquery-editable/jquery-ui-datepicker/js/': 'src/inputs/dateui/jquery-ui-datepicker/js/jquery-ui-'+dp_ui_ver+'.*.js',
             '<%= dist %>/jquery-editable/jquery-ui-datepicker/css/redmond/': 'src/inputs/dateui/jquery-ui-datepicker/css/redmond/jquery-ui-'+dp_ui_ver+'.*.css',
             '<%= dist %>/jquery-editable/jquery-ui-datepicker/css/redmond/images/': 'src/inputs/dateui/jquery-ui-datepicker/css/redmond/images/**'
         }
       }         
    }
  });

  //test task
  grunt.registerTask('test', ['jshint', 'connect', 'qunit:bootstrap2']);
  grunt.registerTask('testall', [
    'jshint', 
    'connect', 
    'qunit:bootstrap2', 
    'qunit:bootstrap3', 
    'qunit:jqueryui', 
    'qunit:plain'
  ]);  
  grunt.registerTask('testover', ['jshint', 'connect', 'qunit:testover']);  
  
  // Default task.
  grunt.registerTask('default', ['clean', 'jshint', 'concat', 'uglify', 'copy']);
  
  
  grunt.registerTask('server', 'connect:server:keepalive');
  
  // build
  grunt.registerTask('build', ['clean', 'jshint', 'concat', 'uglify', 'copy']);
  
 //to run particular task use ":", e.g. copy:libs 
};

