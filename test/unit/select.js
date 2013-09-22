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
        p.find('.editable-cancel').click(); 
        ok(!p.is(':visible'), 'popover was removed');        
      })  
    
     asyncTest("load options from server", function () {
        var e = $('<a href="#" data-type="select" data-name="load-srv" data-value="2" data-source="groups.php">customer</a>').appendTo(fx).editable({
            //need to disable cache to force request
            sourceCache: false
        });

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
            p.find('.editable-cancel').click(); 
            ok(!p.is(':visible'), 'popover was removed');
            
            //open second time: items should not dublicate
            e.click();
            p = tip(e);
            setTimeout(function() {            
                ok(p.find('select').length, 'select exists');
                equal(p.find('select').find('option').length, size, 'options loaded');
                equal(p.find('select').val(), e.data('editable').value, 'selected value correct') ;

                e.remove();    
                start();  
            }, timeout);                
        }, timeout);                     
    });      
    
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
        p.find('.editable-cancel').click(); 
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
        
        p.find('.editable-cancel').click(); 
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
        p.find('.editable-cancel').click(); 
        ok(!p.is(':visible'), 'popover was removed');  
    }); 
    
     test("load options from function returning array", function () {
         var counter = 0,
             e = $('<a href="#" data-type="select" data-value="2" data-url="post.php">customer</a>').appendTo('#qunit-fixture').editable({
             pk: 1,
             prepend: function() {
                equal(this, e[0], 'prepend scope is element');
                return 'prepend'; 
             },
             source: function() {
                equal(this, e[0], 'source scope is element');
                return counter ? groupsArr.concat([{10: 'test'}]) : groupsArr; 
             }
          });

        function t() {  
            e.click()
            var p = tip(e);
            ok(p.is(':visible'), 'popover visible');
            ok(p.find('select').length, 'select exists');
            equal(p.find('select').find('option').length, size+1+counter, 'options loaded');
            equal(p.find('select').val(), e.data('editable').value, 'selected value correct') ;
            p.find('.editable-cancel').click(); 
            ok(!p.is(':visible'), 'popover was removed');
        }
        
        //first run
        t();
        //second time
        counter = 1;
        t();  
    });    
    
     asyncTest("load options from function returning URL", function () {
         var e = $('<a href="#" data-type="select" data-value="2" data-url="post.php">customer</a>').appendTo(fx).editable({
             pk: 1,
             //need to disable cache to force request
             sourceCache: false,             
             source: function() {
                equal(this, e[0], 'source scope is element');
                return 'groups.php'; 
             }
          });

        e.click();
        var p = tip(e); 
        
        setTimeout(function() {
            ok(p.is(':visible'), 'popover visible');
            ok(p.find('select').length, 'select exists');
            equal(p.find('select').find('option').length, size, 'options loaded');
            equal(p.find('select').val(), e.data('editable').value, 'selected value correct') ;
            p.find('.editable-cancel').click(); 
            ok(!p.is(':visible'), 'popover was removed');
            
            //open second time: items should not dublicate
            e.click();
            p = tip(e);
            setTimeout(function() {
                ok(p.find('select').length, 'select exists');
                equal(p.find('select option').length, size, 'options loaded');
                equal(p.find('select').val(), e.data('editable').value, 'selected value correct') ;
                              
                e.remove();
                start();
            }, timeout);  
        }, timeout);  
    });      
    
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
        p.find('.editable-cancel').click(); 
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
        p.find('.editable-cancel').click(); 
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

        p.find('.editable-cancel').click(); 
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
            p.find('.editable-cancel').click(); 
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
        $(document).removeData('groups.php');         
                                 
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
            
            p.find('.editable-cancel').click(); 
            ok(!p.is(':visible'), 'popover was removed');  
            
            //click second
            e1.click();
            p = tip(e1);
            
            setTimeout(function() {
                ok(p.is(':visible'), 'popover2 visible');
                equal(p.find('select').find('option').length, size, 'options loaded');
                equal(req, 1, 'no extra request, options taken from cache');
                
                p.find('.editable-cancel').click(); 
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
        $(document).removeData('groups-cache-sim.php');          
        
        var req = 0;
        $.mockjax({
                url: 'groups-cache-sim.php',
                responseTime: 50,
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
        $(document).removeData('groups-cache-sim-err.php');           
        
        var req = 0;
        $.mockjax({
                url: 'groups-cache-sim-err.php',
                responseTime: 200,
                status: 500,
                response: function() {
                    req++;
                }
         });  

         var e = $('<a href="#" data-type="select" data-pk="1" data-name="name1" data-value="1" data-autotext="always" data-url="post.php" data-source="groups-cache-sim-err.php">11</a>').appendTo(fx).editable(),
             e1 = $('<a href="#" data-type="select" data-pk="1" data-name="name1" data-value="2" data-autotext="always" data-url="post.php" data-source="groups-cache-sim-err.php">22</a>').appendTo(fx).editable(),
             e2 = $('<a href="#" data-type="select" data-pk="1" data-name="name1" data-value="3" data-autotext="always" data-url="post.php" data-source="groups-cache-sim-err.php"></a>').appendTo(fx).editable();
           
          setTimeout(function() {

                equal(req, 1, 'one request');
                equal(e.text(), '11', 'text1 correct');
                equal(e1.text(), '22', 'text2 correct');
                equal(e2.text(), $.fn.editable.defaults.emptytext, 'text3 correct');
                
                e.remove();    
                e1.remove();    
                e2.remove();    
                start();  
           }, 300);
        
     });     
     
     //since 1.4.5 sourceCache is more strong: it forces load sourceData on every click     
    asyncTest("sourceCache: false", function () {
        
         $.mockjax({
                url: 'groups-cache-false.php',
                response: function() {
                    req++;
                    this.responseText = groups;
                }
         });    
        
         var req = 0, 
           e = $('<a href="#" data-type="select" data-pk="1" data-name="name1" data-value="2" data-url="post.php" data-source="groups-cache-false.php"></a>').appendTo(fx).editable({
              sourceCache: false
           }),
           e1 = $('<a href="#" data-type="select" data-pk="1" id="name1" data-value="2" data-url="post.php" data-source="groups-cache-false.php">customer</a>').appendTo(fx).editable({
              sourceCache: false                 
           });
        
        setTimeout(function() {
            //autotext for first only!
            equal(req, 1, 'autotext request performed');
               
            //click first
            e.click();
            
            setTimeout(function() {
            
                var p = tip(e);            
                
                ok(p.is(':visible'), 'popover visible');
                equal(p.find('select').find('option').length, size, 'options loaded');
                equal(req, 2, 'additional request performed (allthough loaded on autotext)');
                
                p.find('.editable-cancel').click(); 
                ok(!p.is(':visible'), 'popover was removed');  
                
                //click second
                e1.click();
                p = tip(e1);
                
                setTimeout(function() {
                    ok(p.is(':visible'), 'popover2 visible');
                    equal(p.find('select').find('option').length, size, 'options loaded');
                    equal(req, 3, 'second request performed');
                    
                    p.find('.editable-cancel').click(); 
                    ok(!p.is(':visible'), 'popover was removed');                  
                    
                    e.remove();    
                    e1.remove();    
                    start(); 
                     
                }, timeout);
            }, timeout);                 
        }, timeout);  
        
     });       
     
     
     asyncTest("autotext: auto", function () {
         expect(3);
         
         //auto, text->empty, source->array
         var e = $('<a href="#" data-type="select" data-value="3">  </a>').appendTo(sfx).editable({
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
        p.find('.editable-cancel').click(); 
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
            p.find('.editable-cancel').click(); 
            ok(!p.is(':visible'), 'popover was removed');  
            e.remove();    
            start();   
         }, timeout);                              
    });                       
    
     asyncTest("autosubmit when showbuttons=false", function () {
         expect(4);
         var e = $('<a href="#" data-type="select" data-value="2" data-url="post.php">customer</a>').appendTo(fx).editable({
             pk: 1,
             source: groups,
             showbuttons: false
        }),
        selected = 3;

        e.click();
        var p = tip(e);
        equal(p.find('select').val(), e.data('editable').value, 'selected value correct'); 

        p.find('select').val(selected);
        p.find('select').trigger('change');
         
         setTimeout(function() {
               ok(!p.is(':visible'), 'popover closed');
               equal(e.data('editable').value, selected, 'new value saved')
               equal(e.text(), groups[selected], 'text shown correctly') 
               e.remove();    
               start();  
         }, timeout);   
     });   
     
     asyncTest("'display' callback", function () {
         var req = 0, 
             e = $('<a href="#" data-type="select" data-value="2" data-url="post.php">123</a>').appendTo(fx).editable({
             pk: 1,
             source: groups,
             ajaxOptions: {
                dataType: 'json'
             },             
             display: function(value, sourceData, response) {
                var els = $.grep(sourceData, function(o) {return o.value == value;});  
                $(this).text('qq' + els[0].text);
                if(req == 0) {
                    ok(response === undefined, 'response param undefined on first request');
                    req++;
                } else {
                    ok(response.success, 'response param ok on second request');
                }
             }
        }),
        selected = 3;

        equal(e.text(), 'qq'+groups[2], 'autotext display ok'); 
        
        e.click();
        var p = tip(e);

        p.find('select').val(selected);
        p.find('form').submit();
         
         setTimeout(function() {
               ok(!p.is(':visible'), 'popover closed');
               equal(e.data('editable').value, selected, 'new value saved')
               equal(e.text(), 'qq'+groups[selected], 'text shown correctly') 
               e.remove();    
               start();  
         }, timeout);   
     });   
     
     asyncTest("submit by enter", function () {
         var e = $('<a href="#" data-type="select" data-value="2" data-url="post.php"></a>').appendTo(fx).editable({
             pk: 1,
             source: groups
        }),
        selected = 3;
             
        e.click();
        var p = tip(e);
        p.find('select').val(selected);
        
        var event = jQuery.Event("keydown");
        event.which = 13;
       
        p.find('select').trigger(event);
        
        setTimeout(function() {
           ok(!p.is(':visible'), 'popover closed');
           equal(e.data('editable').value, selected, 'new value saved')
           equal(e.text(), groups[selected], 'text shown correctly') 
           e.remove();    
           start(); 
        }, timeout);           
    });
    
    
    asyncTest("set value to null should not trigger source load", function () {
        var req = 0;
        $.mockjax({
                url: 'groups-null.php',
                response: function() {
                    req++;
                }
         });  

        var e = $('<a href="#" data-type="select" data-pk="1" data-name="name1" data-value="1" data-url="post.php" data-source="groups-null.php">11</a>').appendTo(fx).editable(),
            d = e.data('editable');
        
        e.editable('setValue', null);
           
      setTimeout(function() {
            equal(req, 0, 'no request');
            equal(e.text(), d.options.emptytext, 'text correct');
            equal(d.value, null, 'value correct');
            
            e.remove();    
            start();  
       }, timeout);
        
     });     
     
    
    asyncTest("change source", function () {
        var e = $('<a href="#" data-type="select" data-name="load-srv" data-value="2" data-source="groups.php">customer</a>').appendTo(fx).editable({
            sourceCache: true
        });
                 
        e.click();
        var p = tip(e); 
       
        setTimeout(function() {
            equal(p.find('select').find('option').length, size, 'options loaded');
            equal(p.find('select').val(), e.data('editable').value, 'selected value correct') ;       
            
            p.find('.editable-cancel').click(); 
            ok(!p.is(':visible'), 'popover was closed');
            
            $.mockjax({
                url: 'groups-changed.php',
                responseText: [{value: 'a', text: 1}, {value: 'b', text: 2}]
            });        
                    
            //set new source
            e.editable('option', 'source', 'groups-changed.php');
            e.click();
         
            setTimeout(function() {
                p = tip(e); 
                ok(p.find('select').length, 'select exists');
                equal(p.find('select').find('option').length, 2, 'new options loaded');
                
                //disable below test as in ie select.val() return null
                // equal(p.find('select').val(), 'a', 'selected value correct') ;
                p.find('.editable-cancel').click(); 
                ok(!p.is(':visible'), 'popover was closed');
                
                e.remove();    
                start();  
            }, timeout);
         }, timeout);                
    });  
    
    asyncTest("optgroup", function () {
         var
         selected = 2, 
         e = $('<a href="#" data-type="select" data-value="'+selected+'" data-url="post.php"></a>').appendTo(fx).editable({
             pk: 1,
             source: [
                 {text: 'groups', children: groups},
                 {value: 'v1', text: 't1', children: ['a', 'b', 'c']},
                 {value: 'v2', text: 't2'}
             ]
        });

        equal(e.text(), groups[selected], 'text shown'); 
                                  
        e.click();
        var p = tip(e);
        ok(p.is(':visible'), 'container visible');
        ok(p.find('select').length, 'select exists');
        equal(p.find('select').find('option').length, size + 3 + 1, 'options loaded');
        equal(p.find('select').val(), e.data('editable').value, 'selected value correct');

        equal(p.find('select').find('optgroup').length, 2, 'optgroup loaded');
        equal(p.find('select').find('optgroup').eq(0).children().length, size, 'optgroup items ok');
        
        selected = 'a';
        p.find('select').val(selected);
        p.find('form').submit(); 
         
         setTimeout(function() {
               ok(!p.is(':visible'), 'popover closed')
               equal(e.data('editable').value, selected, 'new value saved')
               equal(e.text(), 'a', 'new text shown') 
               e.remove();    
               start();  
         }, timeout);                              
    }); 
    
    test("defaultValue", function () {
        var e = $('<a href="#" data-type="select"></a>').appendTo('#qunit-fixture').editable({
            source: groups,
            defaultValue: 3 
        });

        e.click();
        var p = tip(e);
        ok(p.find('select').length, 'select exists')
        equal(p.find('select').val(), 3, 'selected value correct');
    });                
    
    test("`escape` option", function () {
        var e = $('<a href="#" data-type="select"></a>').appendTo('#qunit-fixture').editable({
            source: [{value: 'a', text: '<b>hello</b>'}],
            value: 'a',
            escape: true
        }),
        e1 = $('<a href="#" data-type="select"></a>').appendTo('#qunit-fixture').editable({
            source: [{value: 'a', text: '<b>hello</b>'}],
            value: 'a',
            escape: false
        });
 
        equal(e.html(), '&lt;b&gt;hello&lt;/b&gt;', 'html escaped');
        equal(e1.html(), '<b>hello</b>', 'html not escaped');
    });    
    
   asyncTest("sourceOptions", function () {
        expect(3);
        var e = $('<a href="#" data-type="select" data-value="2" data-source="sourceOptions">customer</a>').appendTo(fx).editable({
            sourceOptions: {
                type: 'post',
                data: {
                    a: 1
                }
            }
        });

        $.mockjax({
            url: 'sourceOptions',
            type: 'post',
            response: function(settings) {
                equal(settings.data.a, 1, 'params sent!');
                this.responseText = groups;
            }
        });
                 
        e.click();
        var p = tip(e); 
       
        setTimeout(function() {
            equal(p.find('select').find('option').length, size, 'options loaded');
            equal(p.find('select').val(), e.data('editable').value, 'selected value correct') ;       
            
            e.remove();    
            start();  
        }, timeout);                
    });  
});
