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
            inputs: [inputs+'date/date.js', inputs+'date/bootstrap-datepicker/js/bootstrap-datepicker.js'], 
            css: [inputs+'date/bootstrap-datepicker/css/datepicker.css']
        },  
        jqueryui: {
            form: [forms+'editable-form-jqueryui.js'],
            container: [containers+'editable-tooltip.js'],
            inputs: [inputs+'dateui/dateui.js'], 
            css: []
        },  
        jquery: {
            form: [],
            container: [containers+'editable-poshytip.js'],
            inputs: [inputs+'dateui/dateui.js'],
            css: []
        }      
    };

    var inline = [containers+'editable-inline.js'];

    //common js files 
    var js = [
    '<banner:meta.banner>',
    forms+'editable-form.js',
    forms+'editable-form-utils.js',
    containers+'editable-container.js', 
    lib+'element/editable-element.js',
    inputs+'abstract.js',
    inputs+'list.js',
    inputs+'text.js',
    inputs+'textarea.js',
    inputs+'select.js',    
    inputs+'checklist.js'
    ]; 

    //common css files
    var css = [
    '<banner:meta.banner>',
    forms+'editable-form.css',
    containers+'editable-container.css', 
    lib+'element/editable-element.css'
    ];

    //create 'concat' config
    var task, folder, dest, concat_files = {}, min_files = {};
    for(var k in config) {
        folder = '<%= dist %>/'+k+'-editable/';

        //popup
        task = k+'_popup_js';
        dest = folder+'js/'+k+'-editable'+ (k === 'jquery' ? '-poshytip' : '');
        concat_files[task] = {
            src:  js.concat(config[k].form).concat(config[k].container).concat(config[k].inputs),
            dest: dest+'.js'
        };
        min_files[task] = {
            src: ['<banner:meta.banner>', '<config:concat.'+task+'.dest>'],
            dest: dest + '.min.js'
        };      

        //inline
        task = k+'_inline_js';
        dest = folder+'js/'+k+'-editable-inline';
        concat_files[task] = {
            src: js.concat(config[k].form).concat(inline).concat(config[k].inputs),
            dest: dest+'.js'
        };
        min_files[task] = {
            src: ['<banner:meta.banner>', '<config:concat.'+task+'.dest>'],
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

  grunt.loadNpmTasks('grunt-contrib');

 //module for testing
 var module = ''; 
//module = '&module=textarea';
//module = '&module=select';
//module = '&module=text';

 //get js and css for different builds
 var files = getFiles();
 
 // Project configuration.
  grunt.initConfig({
    pkg: '<json:package.json>',
    dist: 'dist',
    meta: {
      banner: '/*! <%= pkg.title || pkg.name %> - v<%= pkg.version %> \n' +
        '* <%= pkg.description %>\n' +
        '* <%= pkg.homepage %>\n' +
        '* Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author.name %>;' +
        ' Licensed <%= _.pluck(pkg.licenses, "type").join(", ") %> */'
    },
    clean: ['<config:dist>'],
    concat: files.concat_files,
    min: files.min_files,
    qunit: {
      bootstrap: [
                  'http://localhost:8000/test/index.html?f=bootstrap&c=popup'+module,
                  'http://localhost:8000/test/index.html?f=bootstrap&c=inline'+module
                 ],
      jqueryui: [
                  'http://localhost:8000/test/index.html?f=jqueryui&c=popup'+module,
                  'http://localhost:8000/test/index.html?f=jqueryui&c=inline'+module
                 ],
      plain: [
                  'http://localhost:8000/test/index.html?f=plain&c=popup'+module,
                  'http://localhost:8000/test/index.html?f=plain&c=inline'+module
                 ]                                    
//      files: ['test/index.html']
    },
    server: {
        port: 8000,
        base: '.'
    },    
    
    lint: {
     //TODO: lint tests files
     //files: ['grunt.js', 'src/js/*.js', 'test/**/*.js']     
      files: ['grunt.js', 
              'src/editable-form/*.js', 
              'src/containers/*.js', 
              'src/inputs/*.js', 
              'src/element/*.js', 
              'src/inputs/*.js', 
              'src/inputs/date/date.js',
              'src/inputs/dateui/dateui.js'
              ]
    },
    /*
    watch: {
      files: '<config:lint.files>',
      tasks: 'lint qunit'
    },
    */
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
        evil: false  
      },
      globals: {
        jQuery: true
      }
    },
    copy: {
        dist: {
            files: {
                '<%= dist %>/bootstrap-editable/css/img/' : 'src/editable-form/img/*',
                '<%= dist %>/jqueryui-editable/css/img/' : 'src/editable-form/img/*',
                '<%= dist %>/jquery-editable/css/img/' : 'src/editable-form/img/*',
                 //licences
                '<%= dist %>/': ['LICENSE-MIT', 'README.md', 'CHANGELOG.txt']
            },
            options: {
               flatten: true
            }
        },
        ui_datepicker: {
         files: {
             //copy jquery ui datepicker
             '<%= dist %>/jquery-editable/jquery-ui-datepicker/' : 'src/inputs/dateui/jquery-ui-datepicker/**' 
         }
        } 
    },
    yuidoc: {
      compile: {
        name: '<%= pkg.title || pkg.name %>',
        description: '<%= pkg.description %>',
        version: '<%= pkg.version %>',
        url: "<%= pkg.homepage %>",
      //  logo: 'src/editable-form/img/loading.gif',
        options: {
          paths: "src/",
          ignorePaths: ['src/inputs/date/locales'],
          outdir: "../docs/",
//          theme: "simple",
          themedir: "../yuidoc-theme"
          //themedir: "../yuidoc-bootstrap-theme-master"
        }
      }
    },
    
    //compress does not work properly for MAC OS (see https://github.com/vitalets/bootstrap-editable/issues/19)
    //zip will be created manually
    /*
    compress: {
        zip: {
            options: {
                mode: "zip",
                //TODO: unfortunatly here <%= dist_source %> and <config:dist_source> does not work
                basePath: "dist"
               },
            files: {
                "<%= dist %>/bootstrap-editable-v<%= pkg.version %>.zip": ["<%= dist_source %>/ **", "<%= dist %>/libs/ **"]
            }
        },
        tgz: {
            options: {
                mode: "tgz",
                basePath: "dist"
               },
            files: {
                "<%= dist %>/bootstrap-editable-v<%= pkg.version %>.tar.gz": ["<%= dist_source %>/ **", "<%= dist %>/libs/ **"]
            }
        }
    },
    */    
    uglify: {}
  });

  //test task
  grunt.registerTask('test', 'lint server qunit:bootstrap');
  grunt.registerTask('testall', 'lint server qunit');  
  
  // Default task.
//  grunt.registerTask('default', 'lint qunit');
  grunt.registerTask('default', 'clean lint concat min copy');
  
  // build
  grunt.registerTask('build', 'clean lint concat min copy');
  
 //to run particular task use ":", e.g. copy:libs 
};

