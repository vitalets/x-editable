$(function () {
   
    module("select", {
        setup: function(){
            sfx = $('#qunit-fixture'),
            fx = $('#async-fixture');               
            $.support.transition = false;
        }
    });  

    test("popover should contain SELECT even if value & source not defined", function () {
        var  e = $('<a href="#" data-type="select">w</a>').appendTo('#qunit-fixture').editable();

        e.click();
        var p = tip(e);
        ok(p.find('select').length, 'select exists')
        p.find('button[type=button]').click(); 
        ok(!p.is(':visible'), 'popover was removed');        
      })  
    
     asyncTest("load options from server", function () {
        var e = $('<a href="#" data-type="select" data-name="load-srv" data-value="2" data-source="groups.php">customer</a>').appendTo(fx).editable();

        e.click();
        var p = tip(e); 
        ok(p.find('.editableform-loading').length, 'loading class exists');   
        ok(p.find('.editableform-loading').is(':visible'), 'loading class is visible');
        
        setTimeout(function() {
            ok(p.is(':visible'), 'popover visible');
            ok(p.find('.editableform-loading').length, 'loading class exists');
            ok(!p.find('.editableform-loading').is(':visible'), 'loading class is hidden');
            ok(p.find('select').length, 'select exists');
            equal(p.find('select').find('option').length, size, 'options loaded');
            equal(p.find('select').val(), e.data('editable').value, 'selected value correct') ;
            p.find('button[type=button]').click(); 
            ok(!p.is(':visible'), 'popover was removed');  
            e.remove();    
            start();  
        }, timeout);                     
    })      
    
     test("load options from json", function () {
         var e = $('<a href="#" data-type="select" data-value="2" data-url="post.php">customer</a>').appendTo('#qunit-fixture').editable({
             pk: 1,
             source: groups
          });

        e.click()
        var p = tip(e);
        ok(p.is(':visible'), 'popover visible')
        ok(p.find('.editableform-loading').length, 'loading class exists')
        ok(!p.find('.editableform-loading').is(':visible'), 'loading class is hidden')
        ok(p.find('select').length, 'select exists')
        equal(p.find('select').find('option').length, size, 'options loaded')
        equal(p.find('select').val(), e.data('editable').value, 'selected value correct') 
        p.find('button[type=button]').click(); 
        ok(!p.is(':visible'), 'popover was removed');  
    });
    
     test("load options from normal array", function () {
         var e = $('<a href="#" data-type="select" data-value="2" data-url="post.php">customer</a>').appendTo('#qunit-fixture').editable({
             pk: 1,
             source: groupsArr,
             placement: 'right'
          });

        e.click()
        var p = tip(e);
        ok(p.is(':visible'), 'popover visible');
        ok(p.find('select').length, 'select exists');
        equal(p.find('select').find('option').length, groupsArr.length, 'options loaded');
        equal(p.find('select').val(), e.data('editable').value, 'selected value correct');
        
        p.find('button[type=button]').click(); 
        ok(!p.is(':visible'), 'popover was removed');  
    });    
    
    test("load options from simple array", function () {
         var arr = ['q', 'w', 'x'],
             e = $('<a href="#" data-type="select" data-value="x" data-url="post.php">customer</a>').appendTo('#qunit-fixture').editable({
             pk: 1,
             autotext: true,
             source: arr
          });

        e.click()
        var p = tip(e);
        ok(p.is(':visible'), 'popover visible')
        ok(p.find('select').length, 'select exists')
        equal(p.find('select').find('option').length, arr.length, 'options loaded')
        equal(p.find('select').val(), 'x', 'selected value correct') 
        p.find('button[type=button]').click(); 
        ok(!p.is(':visible'), 'popover was removed');  
    }) 
    
     test("load options from html (single quotes)", function () {
         var e = $('<a href="#" data-type="select" data-value="M" data-source=\'{"L":"Low", "": "None", "M": "Medium", "H": "High"}\'>customer</a>').appendTo('#qunit-fixture').editable({
             pk: 1
          }),
         size = 4;

        e.click()
        var p = tip(e);
        ok(p.is(':visible'), 'popover visible');
        ok(p.find('select').length, 'select exists');
        equal(p.find('select').find('option').length, size, 'options loaded');
        equal(p.find('select').val(), e.data('editable').value, 'selected value correct') ;
        p.find('button[type=button]').click(); 
        ok(!p.is(':visible'), 'popover was removed');  
    })       
    
     test("load options from html (double quotes)", function () {
         var e = $('<a href="#" data-type="select" data-value="M" data-source="{\'L\':\'Low\', \'\': \'None\', \'M\': \'Medium\', \'H\': \'High\'}">customer</a>').appendTo('#qunit-fixture').editable({
             pk: 1
          }),
         size = 4;

        e.click()
        var p = tip(e);
        ok(p.is(':visible'), 'popover visible');
        ok(p.find('select').length, 'select exists');
        equal(p.find('select').find('option').length, size, 'options loaded');
        equal(p.find('select').val(), e.data('editable').value, 'selected value correct') ;
        p.find('button[type=button]').click(); 
        ok(!p.is(':visible'), 'popover was removed');  
    })      
         
     test("load options from html (json syntax error)", function () {
         var e = $('<a href="#" data-type="select" data-value="M" data-source=\'{L :Low, "": "None", "M": "Medium", "H": "High"}\'>customer</a>').appendTo('#qunit-fixture').editable({
             pk: 1,
             sourceError: 'error'
          }),
         size = 4;

        e.click()
        var p = tip(e);
        ok(p.is(':visible'), 'popover visible');
        ok(p.find('select').length, 'select exists');
        equal(p.find('select').find('option').length, 0, 'options not loaded');
        equal(p.find('.editable-error-block').text(), 'error', 'sourceError message shown');

        p.find('button[type=button]').click(); 
        ok(!p.is(':visible'), 'popover was removed');  
    })           
         
                    
     asyncTest("should show error if options cant be loaded", function () {
        var e = $('<a href="#" data-type="select" data-value="2" data-source="groups-error.php">customer</a>').appendTo(fx).editable();

        e.click();
        var p = tip(e);    
        
        setTimeout(function() {
            ok(p.is(':visible'), 'popover visible')
            ok(p.find('select:disabled').length, 'select disabled')   
            ok(!p.find('select').find('option').length, 'options not loaded')   
            ok(p.find('button[type=submit]:disabled').length, 'submit-btn disabled')
            ok(p.find('.editable-error-block').text().length, 'error shown')              
            p.find('button[type=button]').click(); 
            ok(!p.is(':visible'), 'popover was removed');  
            e.remove();    
            start();  
        }, timeout);                     
    })           
   
    asyncTest("should save new selected value", function () {
         var e = $('<a href="#" data-type="select" data-value="2" data-url="post.php">customer</a>').appendTo(fx).editable({
             pk: 1,
             source: groups
        }),
        selected = 3;

        e.click()
        var p = tip(e);
        ok(p.is(':visible'), 'popover visible');
        ok(p.find('select').length, 'select exists');
        equal(p.find('select').find('option').length, size, 'options loaded');
        equal(p.find('select').val(), e.data('editable').value, 'selected value correct');

        p.find('select').val(selected);
        p.find('form').submit(); 
        ok(p.find('.editableform-loading').is(':visible'), 'loading class is visible');
         
         setTimeout(function() {
               ok(!p.is(':visible'), 'popover closed')
               equal(e.data('editable').value, selected, 'new value saved')
               equal(e.text(), groups[selected], 'new text shown') 
               e.remove();    
               start();  
         }, timeout);                              
    });    
    
     asyncTest("if new text is empty --> show emptytext on save", function () {
        var e = $('<a href="#" data-type="select" data-value="2" data-url="post.php">customer</a>').appendTo(fx).editable({
             pk: 1,
             source: groups
        }),
        selected = 6;

        e.click()
        var p = tip(e);
        ok(p.is(':visible'), 'popover visible')
        ok(p.find('select').length, 'select exists')
        equal(p.find('select').find('option').length, size, 'options loaded')
        equal(p.find('select').val(), e.data('editable').value, 'selected value correct') 

        p.find('select').val(selected);
        p.find('form').submit(); 
         
         setTimeout(function() {
               ok(!p.is(':visible'), 'popover closed')
               equal(e.data('editable').value, selected, 'new value saved')
               equal(e.text(), e.data('editable').options.emptytext, 'emptytext shown') 
               e.remove();    
               start();  
         }, timeout);     
     })                        
   
   
     asyncTest("if new value is empty --> show work correct", function () {
         var e = $('<a href="#" data-type="select" data-value="2" data-url="post.php">customer</a>').appendTo(fx).editable({
             pk: 1,
             source: groups
        }),
        selected = '';

        e.click()
        var p = tip(e);
        ok(p.is(':visible'), 'popover visible')
        ok(p.find('select').length, 'select exists')
        equal(p.find('select').find('option').length, size, 'options loaded')
        equal(p.find('select').val(), e.data('editable').value, 'selected value correct') 

        p.find('select').val(selected);
        p.find('form').submit(); 
         
         setTimeout(function() {
               ok(!p.is(':visible'), 'popover closed')
               equal(e.data('editable').value, selected, 'new value saved')
               equal(e.text(), groups[selected], 'text shown correctly') 
               e.remove();    
               start();  
         }, timeout);   
     });
     
     asyncTest("cache request for same selects", function () {
        //clear cache
        $(document).removeData('groups.php-name1');         
                                 
         var e = $('<a href="#" data-type="select" data-pk="1" data-name="name1" data-value="2" data-url="post.php" data-source="groups-cache.php">customer</a>').appendTo(fx).editable(),
             e1 = $('<a href="#" data-type="select" data-pk="1" id="name1" data-value="2" data-url="post.php" data-source="groups-cache.php">customer</a>').appendTo(fx).editable(),
             req = 0;

        $.mockjax({
                url: 'groups-cache.php',
                response: function() {
                    req++;
                    this.responseText = groups;
                }
         });             
             
        e.click();
        var p = tip(e);
        
        setTimeout(function() {
            ok(p.is(':visible'), 'popover visible');
            equal(p.find('select').find('option').length, size, 'options loaded');
            equal(req, 1, 'one request performed');
            
            p.find('button[type=button]').click(); 
            ok(!p.is(':visible'), 'popover was removed');  
            
            //click second
            e1.click();
            p = tip(e1);
            
            setTimeout(function() {
                ok(p.is(':visible'), 'popover2 visible');
                equal(p.find('select').find('option').length, size, 'options loaded');
                equal(req, 1, 'no extra request, options taken from cache');
                
                p.find('button[type=button]').click(); 
                ok(!p.is(':visible'), 'popover was removed');                  
                
                e.remove();    
                e1.remove();    
                start();  
            }, timeout);
        }, timeout);  
        
     });  
     
    asyncTest("cache simultaneous requests", function () {
        expect(4);
        
        //clear cache
        $(document).removeData('groups.php-name1');          
        
        var req = 0;
        $.mockjax({
                url: 'groups-cache-sim.php',
                responseTime: 200,
                response: function() {
                    req++;
                    this.responseText = groups;
                }
         });  

         var e = $('<a href="#" data-type="select" data-pk="1" data-name="name1" data-value="1" data-url="post.php" data-source="groups-cache-sim.php"></a>').appendTo(fx).editable(),
             e1 = $('<a href="#" data-type="select" data-pk="1" data-name="name1" data-value="2" data-url="post.php" data-source="groups-cache-sim.php"></a>').appendTo(fx).editable(),
             e2 = $('<a href="#" data-type="select" data-pk="1" data-name="name1" data-value="3" data-url="post.php" data-source="groups-cache-sim.php"></a>').appendTo(fx).editable();
           
          setTimeout(function() {

                equal(req, 1, 'one request');
                equal(e.text(), groups[1], 'text1 correct');
                equal(e1.text(), groups[2], 'text2 correct');
                equal(e2.text(), groups[3], 'text3 correct');
                
                e.remove();    
                e1.remove();    
                e2.remove();    
                start();  
           }, 300);
        
     });   
     
    asyncTest("cache simultaneous requests (loading error)", function () {
        expect(4);
        
        //clear cache
        $(document).removeData('groups.php-name1');           
        
        var req = 0;
        $.mockjax({
                url: 'groups-cache-sim-err.php',
                responseTime: 200,
                status: 500,
                response: function() {
                    req++;
                }
         });  

         var e = $('<a href="#" data-type="select" data-pk="1" data-name="name1" data-value="1" data-autotext="always" data-url="post.php" data-source="groups-cache-sim-err.php">35</a>').appendTo(fx).editable(),
             e1 = $('<a href="#" data-type="select" data-pk="1" data-name="name1" data-value="2" data-autotext="always" data-url="post.php" data-source="groups-cache-sim-err.php">35</a>').appendTo(fx).editable(),
             e2 = $('<a href="#" data-type="select" data-pk="1" data-name="name1" data-value="3" data-autotext="always" data-url="post.php" data-source="groups-cache-sim-err.php">6456</a>').appendTo(fx).editable(),
             errText = $.fn.editableform.types.select.defaults.sourceError;
           
          setTimeout(function() {

                equal(req, 1, 'one request');
                equal(e.text(), errText, 'text1 correct');
                equal(e1.text(), errText, 'text2 correct');
                equal(e2.text(), errText, 'text3 correct');
                
                e.remove();    
                e1.remove();    
                e2.remove();    
                start();  
           }, 300);
        
     });     
     
     
     
     asyncTest("autotext: auto", function () {
         expect(3);
         
         //auto, text->empty, source->array
         var e = $('<a href="#" data-type="select" data-value="3"></a>').appendTo(sfx).editable({
                source: groups,
                autotext: 'auto'
             }),   
             //auto, text->not empty, source->array
             e1 = $('<a href="#" data-type="select" data-value="3">blabla</a>').appendTo(sfx).editable({
                 source: groups,
                 autotext: 'auto'
             }),
             //auto, text->empty, source->url
             e2 = $('<a href="#" data-type="select" data-value="3" data-source="groups.php"></a>').appendTo(fx).editable({
                 autotext: 'auto'
             });          
          
         equal(e.text(), groups[3], 'text set ok');
         equal(e1.text(), 'blabla', 'text1 not changed');
         
        setTimeout(function() {
              equal(e2.text(), groups[3], 'text2 set ok');
              e2.remove();    
              start();  
         }, timeout);          
    });    
    
     asyncTest("autotext: always (source = url)", function () {
         expect(1);
         var e = $('<a href="#" data-type="select" data-value="3" data-source="groups.php">blabla</a>').appendTo(fx).editable({
               autotext: 'always'  
             });             
          
        setTimeout(function() {
              equal(e.text(), groups[3], 'text setup ok');
              e.remove();    
              start();  
         }, timeout);   
    });  
    
     test("autotext: never", function () {
         var e = $('<a href="#" data-type="select" data-value="3"></a>').appendTo(sfx).editable({
                source: groups,
                autotext: 'never'
             });   
             
         equal(e.text(), e.data('editable').options.emptytext, 'text set to emptytext');
    });        
     
     asyncTest("test prepend option (sync & async)", function () {
        //sync
         var e = $('<a href="#" data-type="select" data-name="prepend-test-sync" data-value="" data-url="post.php">customer</a>').appendTo('#qunit-fixture').editable({
             pk: 1,
             source: {q: 'qq', w: 'ww'},             
             prepend: 'empty'
         });

        e.click()
        var p = tip(e);
        ok(p.is(':visible'), 'popover visible');
        equal(p.find('select').find('option').length, 3, 'options prepended (sync)');
        equal(p.find('select').val(), '', 'selected value correct');
        p.find('button[type=button]').click(); 
        ok(!p.is(':visible'), 'popover was removed');   
        
        //async
         e = $('<a href="#" data-type="select" data-name="prepend-test-async" data-value="r" data-url="post.php">customer</a>').appendTo(fx).editable({
             pk: 1,
             source: 'groups.php',
             prepend: {r: 'abc'}
        });
        
        e.click()
        p = tip(e);
         
         setTimeout(function() {
            ok(p.is(':visible'), 'popover visible');
            equal(p.find('select').find('option').length, size+1, 'options prepended (async)');
            equal(p.find('select').val(), 'r', 'selected value correct'); 
            p.find('button[type=button]').click(); 
            ok(!p.is(':visible'), 'popover was removed');  
            e.remove();    
            start();   
         }, timeout);                              
    });                       
     
});