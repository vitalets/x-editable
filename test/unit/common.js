(function($) {
 
   module("common", {
       setup: function() {
           fx = $('#async-fixture');
           $.support.transition = false;
       }
  });
    
      test("should be defined on jquery object", function () {
        var div = $("<div id='modal-test'></div>")
        ok(div.editable, 'editable method is defined')
      });
      
      test("should return element", function () {
        var div = $('<div id="a"></div>');
        ok(div.editable() == div, 'element returned');
      });  
      
      test("should expose defaults var for settings", function () {
        ok($.fn.editable.defaults, 'default object exposed');
      });    
      
      test("should store editable instance in data object", function () {
        var editable = $('<a href="#" id="a">link</a>').editable();
        ok(!!editable.data('editable'), 'editable instance exists');
      });      
      
      test("should add 'editable' class when applied", function () {
        var editable = $('<a href="#" id="a">link</a>').appendTo('#qunit-fixture').editable();
        ok($('.editable').length, 'editable class exists');
      });
      
     test("container should be close when element is removed from dom", function () {
        var e = $('<a href="#" data-pk="1" data-url="post.php" data-name="text1">abc</a>').appendTo('#qunit-fixture').editable(),
            e1 = $('<a href="#" data-pk="1" data-url="post.php" data-name="text2">abc</a>').appendTo('#qunit-fixture').editable().wrap('<div>');
        
        e.click();
        var p = tip(e);
        ok(p.is(':visible'), 'popover shown');
        e.remove();
        ok(!p.is(':visible'), 'popover closed');
     });       
      
//      test("should store name and value and lastSavedValue", function () {
      test("should store name and value", function () {
        var v = 'abr><"&<b>e</b>',
            visible_v = 'abr><"&e',
            esc_v = $('<div>').text(v).html(),
            e = $('<a href="#123" data-name="abc" data-value="123">qwe</a>').appendTo('#qunit-fixture').editable(),
            e2 = $('<a href="#" id="a2">'+v+'</a>').appendTo('#qunit-fixture').editable(),
            e3 = $('<a href="#" id="a3">'+esc_v+'</a>').appendTo('#qunit-fixture').editable();
       
        equal(e.data('editable').options.name, 'abc', 'name exists');
        equal(e.data('editable').value, '123', 'value exists');
//        equal(e.data('editable').lastSavedValue, '123', 'lastSavedValue exists');
        
        equal(e2.data('editable').value, visible_v, 'value taken from elem content correctly');     
//        equal(e2.data('editable').lastSavedValue, visible_v, 'lastSavedValue taken from text correctly');  
        
        equal(e3.data('editable').value, v, 'value taken from elem content correctly (escaped)');     
//        equal(e3.data('editable').lastSavedValue, v, 'lastSavedValue taken from text correctly (escaped)');             
      }); 
      
      test("container's title and placement from json options", function () {
        //do not test inline  
        if($.fn.editable.defaults.mode === 'inline') {
            expect(0);
            return;
        }
        
        var title = 'abc',
        //add to fx because qunit-fixture has wrong positioning
        e = $('<a href="#" id="a"></a>').appendTo(fx).editable({
              placement: 'top',
              title: title
        });

        e.click();
        var p = tip(e); 
        ok(p.is(':visible'), 'popover shown');   

        //todo: for jqueryui phantomjs calcs wrong position. Skip this test..
        if(!/phantom/i.test(navigator.userAgent) && e.data('editableContainer').containerName !== 'tooltip') {
            ok(p.offset().top < e.offset().top, 'placement ok');
        }
        
        //check title
        ok(p.find(':contains("'+title+'")').length, 'title ok');
        e.remove();
      });

    test("popup placement `auto` (BS3 only)", function () {
        //do not test inline  
        if($.fn.editable.defaults.mode === 'inline' || $.fn.editableform.engine !== 'bs3') {
            expect(0);
            return;
        }
        
        var title = 'abc',
        //add to fx because qunit-fixture has wrong positioning
        e = $('<a href="#" id="a" style="position: absolute; top: 50px; left: 10px"></a>').appendTo(fx).editable({
              placement: 'auto',
              title: title
        });

        e.click();
        var p = tip(e); 
        ok(p.is(':visible'), 'popover shown');   

        ok(p.offset().left < e.offset().left, 'placement X ok');
        ok(p.offset().top > e.offset().top, 'placement Y ok');

        e.remove();
      });     
      
      test("onblur: cancel", function () {
        var oldValue = 'abc',
            newValue = 'cde',
            e = $('<a href="#" data-type="text" data-pk="1" data-url="post.php" id="a">'+oldValue+'</a>').appendTo('#qunit-fixture').editable({
               onblur: 'cancel',
               url: function() {}
            }),  
            e2 = $('<a href="#" data-type="text" data-pk="1" data-url="post.php" id="b">abcd</a>').appendTo('#qunit-fixture').editable();  
       
        //click inside                                                              
        e.click();
        var p = tip(e);
        ok(p.is(':visible'), 'popover1 visible');
        p.find('input').val(newValue);
        p.click();
        p.find('input').click();
        ok(p.is(':visible'), 'popover1 still visible');
                                      
        //click outside                                                              
        p.find('input').val(newValue);
        $('#qunit-fixture').click();
        ok(!p.is(':visible'), 'popover1 closed');
        equal(e.data('editable').value, oldValue, 'old value exists');
        
        //click on another editable                                                              
        e.click();
        p = tip(e);
        ok(p.is(':visible'), 'popover1 visible');
        p.find('input').val(newValue);
        e2.click();
        var p2 = tip(e2);
        ok(!p.is(':visible'), 'popover1 closed');
        ok(p2.is(':visible'), 'popover2 visible');
        equal(e.data('editable').value, oldValue, 'old value exists'); 
        e2.editable('hide');
        ok(!p2.is(':visible'), 'popover2 closed');    
        
        //call show method of another editable, closeAll = true (default)                                                              
        e.click();
        p = tip(e);
        ok(p.is(':visible'), 'popover1 visible');
        p.find('input').val(newValue);
        e2.editable('show');
        p2 = tip(e2);
        ok(!p.is(':visible'), 'popover1 closed');
        ok(p2.is(':visible'), 'popover2 visible');
        equal(e.data('editable').value, oldValue, 'old value exists');  
        e2.editable('hide');
        ok(!p2.is(':visible'), 'popover2 closed');         
        
        //call show method of another editable, closeAll = false
        e.click();
        p = tip(e);
        ok(p.is(':visible'), 'popover1 visible');
        p.find('input').val(newValue);
        e2.editable('show', false);
        p2 = tip(e2);
        ok(p.is(':visible'), 'popover1 visible');
        ok(p2.is(':visible'), 'popover2 visible');

        e.editable('hide');
        e2.editable('hide');
        ok(!p.is(':visible'), 'popover1 closed');
        ok(!p2.is(':visible'), 'popover2 closed');
     });  
    
     test("onblur: submit", function () {
        var oldValue = 'abc',
            newValue = 'cde',
            e = $('<a href="#" data-type="text" data-pk="1" id="a">'+oldValue+'</a>').appendTo('#qunit-fixture').editable({
               onblur: 'submit',
               send: 'never'
            }),  
            e2 = $('<a href="#" data-type="text" data-pk="1" data-url="post.php" id="b">abcd</a>').appendTo('#qunit-fixture').editable();  
        
        //click inside                                                              
        e.click();
        var p = tip(e);
        ok(p.is(':visible'), 'popover1 visible');
        p.find('input').val(newValue);
        p.click();
        p.find('input').click();
        ok(p.is(':visible'), 'popover1 still visible');        
        
        //click outside                                                              
        p.find('input').val(newValue);
        $('#qunit-fixture').click();
        ok(!p.is(':visible'), 'popover1 closed');
        equal(e.data('editable').value, newValue, 'new value saved');

        //click on another editable                                                              
        e.click();
        p = tip(e);
        ok(p.is(':visible'), 'popover1 visible');
        p.find('input').val(oldValue);
        e2.click();
        var p2 = tip(e2);
        ok(!p.is(':visible'), 'popover1 closed');
        ok(p2.is(':visible'), 'popover2 visible');
        equal(e.data('editable').value, oldValue, 'old value re-saved'); 
        e2.editable('hide');
        ok(!p2.is(':visible'), 'popover2 closed');    
        
        //call show method of another editable, closeAll = true (default)                                                              
        e.click();
        p = tip(e);
        ok(p.is(':visible'), 'popover1 visible');
        p.find('input').val(newValue);
        e2.editable('show');
        p2 = tip(e2);
        ok(!p.is(':visible'), 'popover1 closed');
        ok(p2.is(':visible'), 'popover2 visible');
        equal(e.data('editable').value, newValue, 'new value saved');  
        e2.editable('hide');
        ok(!p2.is(':visible'), 'popover2 closed');         
        
        //call show method of another editable, closeAll = false
        e.click();
        p = tip(e);
        ok(p.is(':visible'), 'popover1 visible');
        p.find('input').val(oldValue);
        e2.editable('show', false);
        p2 = tip(e2);
        ok(p.is(':visible'), 'popover1 visible');
        ok(p2.is(':visible'), 'popover2 visible');

        e.editable('hide');
        e2.editable('hide');
        ok(!p.is(':visible'), 'popover1 closed');
        ok(!p2.is(':visible'), 'popover2 closed');
     });         
      
     test("onblur: ignore", function () {
        var oldValue = 'abc',
            newValue = 'cde',
            e = $('<a href="#" data-type="text" data-pk="1" data-url="post.php" id="a">'+oldValue+'</a>').appendTo('#qunit-fixture').editable({
               onblur: 'ignore',
               url: function() {}
            }),  
            e2 = $('<a href="#" data-type="text" data-pk="1" data-url="post.php" id="b">abcd</a>').appendTo('#qunit-fixture').editable();  
        
        //click inside                                                              
        e.click();
        var p = tip(e);
        ok(p.is(':visible'), 'popover1 visible');
        p.find('input').val(newValue);
        p.click();
        p.find('input').click();
        ok(p.is(':visible'), 'popover1 still visible');        
        
        //click outside                                                              
        p.find('input').val(newValue);
        $('#qunit-fixture').click();
        ok(p.is(':visible'), 'popover1 still visible'); 
        
        //click on another editable                                                              
        e2.click();
        var p2 = tip(e2);
        ok(p.is(':visible'), 'popover1 still visible'); 
        ok(p2.is(':visible'), 'popover2 visible');
        e2.editable('hide');
        ok(!p2.is(':visible'), 'popover2 closed');    
        
        //call show method of another editable, closeAll = true (default)
        e2.editable('show');
        p2 = tip(e2);
        ok(p.is(':visible'), 'popover1 still visible'); 
        ok(p2.is(':visible'), 'popover2 visible');
        e2.editable('hide');
        ok(!p2.is(':visible'), 'popover2 closed'); 
        
        //call show method of another editable, closeAll = false                                                              
        e2.editable('show', false);
        p2 = tip(e2);
        ok(p.is(':visible'), 'popover1 still visible'); 
        ok(p2.is(':visible'), 'popover2 visible');
        e2.editable('hide');
        ok(!p2.is(':visible'), 'popover2 closed'); 

        e.editable('hide');
        ok(!p.is(':visible'), 'popover1 closed');
     });           
     
      
     test("should not wrap buttons when parent has position:absolute (except ie7)", function () {
        
        //skip this for: ie7 + bootstrap + popup
        var msieOld = /msie\s*(8|7|6)/i.test(navigator.userAgent);  
        if(msieOld && $.fn.editable.defaults.mode === 'popup' && $.fn.editableContainer.Popup.prototype.containerName === 'popover') {
           expect(0);
           return;
        } 
         
        var  d = $('<div style="position: absolute; top: 200px">').appendTo(fx),
             e = $('<a href="#" data-pk="1" data-url="post.php" data-name="text1">abc</a>').appendTo(d).editable({
                 showbuttons: true
             });
            
        e.click();
        var p = tip(e);
        ok(p.find('button').offset().top < p.find('.editable-input').offset().top + p.find('.editable-input').height(), 'buttons top ok');
        ok(p.find('button').offset().left > p.find('.editable-input').offset().left + p.find('.editable-input').width(), 'buttons left ok');
       
        d.remove();
     });   
     
      test("toggle: manual", function () {
        var e = $('<a href="#" id="a"></a>').appendTo('#qunit-fixture').editable({
            toggle: 'manual'
        });
        
        e.click();                       
        ok(!e.data('editableContainer'), 'popover not visible after click');
        e.editable('show'); 
        var p = tip(e);
        ok(p.is(':visible'), 'shown manually');
     });    
     
      test("toggle: dblclick", function () {
        var e = $('<a href="#" id="a"></a>').appendTo('#qunit-fixture').editable({
            toggle: 'dblclick'
        }),
        p, p2,
        e2 = $('<a href="#" data-type="text" data-pk="1" data-url="post.php" id="b">abcd</a>').appendTo('#qunit-fixture').editable();
        
        e.click();
        ok(!e.data('editableContainer'), 'popover not visible after click');

        e2.click();
        p2 = tip(e2);                     
        ok(p2.is(':visible'), 'popover2 visible');         
        
        e.dblclick();
        p = tip(e);                     
        ok(p.is(':visible'), 'popover1 visible');         
        ok(!p2.is(':visible'), 'popover2 closed');         
     });    
     
      test("toggle: mouseenter", function () {
        var e = $('<a href="#" id="a"></a>').appendTo('#qunit-fixture').editable({
            toggle: 'mouseenter'
        }),
        p, p2,
        e2 = $('<a href="#" data-type="text" data-pk="1" data-url="post.php" id="b">abcd</a>').appendTo('#qunit-fixture').editable();
        
        e.click();
        ok(!e.data('editableContainer'), 'popover not visible after click');
        
        e.dblclick();
        ok(!e.data('editableContainer'), 'popover not visible after dblclick');

        e2.click();   
        p2 = tip(e2);                     
        ok(p2.is(':visible'), 'popover2 visible');         
        
        e.mouseenter();
        ok(e.data('editableContainer'), 'container defined');
        p = tip(e);                     
        ok(p.is(':visible'), 'popover1 visible');         
        ok(!p2.is(':visible'), 'popover2 closed'); 
        
        //hover once again --> container should stay open
        e.hover();
        p = tip(e);
        ok(p.is(':visible'), 'popover1 visible after second hover');                                      
     }); 
     
      test("showbuttons: false", function () {
        var e = $('<a href="#" id="a" data-type="text"></a>').appendTo('#qunit-fixture').editable({
            showbuttons: false
        });
        
        e.click();                       
        var p = tip(e);                     
        ok(p.is(':visible'), 'popover visible');   
        ok(!p.find('.editable-submit').length, 'submit not rendered');   
        ok(!p.find('.editable-cancel').length, 'cancel not rendered');   
        ok(!p.find('.editable-buttons').length, '.editable-buttons block not rendered'); 
     });            
      
      asyncTest("composite pk defined as json in data-pk attribute", function () {
        var e = $('<a href="#" data-pk="{a: 1, b: 2}" data-url="post-pk.php">abc</a>').appendTo(fx).editable({
             name: 'username'
          }),  
          newText = 'cd<e>;"'

          $.mockjax({
              url: 'post-pk.php',
              response: function(settings) {
                 equal(settings.data.pk.a, 1, 'first part ok');
                 equal(settings.data.pk.b, 2, 'second part ok');
              }
          });          
          
        e.click()
        var p = tip(e);

        ok(p.find('input[type=text]').length, 'input exists')
        p.find('input').val(newText);
        p.find('form').submit(); 
        
        setTimeout(function() {
           e.remove();    
           start();  
        }, timeout);             
        
    });        
     
      asyncTest("savenochange: false", function () {
        var v = 'abc',
            e = $('<a href="#" data-type="text" data-pk="1" data-url="post-no.php" data-name="text1">'+v+'</a>').appendTo(fx).editable({
            savenochange: false
        }),
            req = 0;

         $.mockjax({
                url: 'post-no.php',
                response: function() {
                    req++;
                }
         });          
        
        e.click();
        var p = tip(e);
        ok(p.is(':visible'), 'popover visible');
        p.find('input[type="text"]').val(v); 
        p.find('form').submit(); 
                
        setTimeout(function() {
           ok(!p.is(':visible'), 'popover closed');
           equal(req, 0, 'request was not performed');
           e.remove();    
           start();  
        }, timeout);                     
      });    
      
      asyncTest("savenochange: true", function () {
        var v = 'abc',
            e = $('<a href="#" data-type="text" data-pk="1" data-url="post-yes.php" data-name="text1">'+v+'</a>').appendTo(fx).editable({
            savenochange: true
        }),
            req = 0;

         $.mockjax({
                url: 'post-yes.php',
                response: function() {
                    req++;
                }
         });          
        
        e.click();
        var p = tip(e);
        ok(p.is(':visible'), 'popover visible');
        p.find('input[type="text"]').val(v); 
        p.find('form').submit(); 
                
        setTimeout(function() {
           ok(!p.is(':visible'), 'popover closed');
           equal(req, 1, 'request was performed');
           e.remove();    
           start();  
        }, timeout);                     
      });   
      
      
    asyncTest("should submit all required params", function () {
        var e = $('<a href="#" data-pk="1" data-url="post-resp.php">abc</a>').appendTo(fx).editable({
             name: 'username',
             params: {
                q: 2 
             },
             ajaxOptions: {
                dataType: 'json'  
             },
             success: function(resp) {   
                 equal(resp.dataType, 'json', 'dataType ok');
                 equal(resp.data.pk, 1, 'pk ok');
                 equal(resp.data.name, 'username', 'name ok');
                 equal(resp.data.value, newText, 'value ok');
                 equal(resp.data.q, 2, 'additional params ok');
             } 
          }),  
          newText = 'cd<e>;"'

        e.click()
        var p = tip(e);

        ok(p.find('input[type=text]').length, 'input exists')
        p.find('input').val(newText);
        p.find('form').submit(); 
        
        setTimeout(function() {
           e.remove();    
           start();  
        }, timeout);             
        
      });
      
    asyncTest("params as function", function () {
        var e = $('<a href="#" data-pk="1" data-url="post-params-func.php">abc</a>').appendTo(fx).editable({
             name: 'username',
             params: function(params) {
                 ok(this === e[0], 'scope is ok');
                 equal(params.pk, 1, 'params in func already have values (pk)');
                 return $.extend(params, {q: 2, pk: 3});
             },
             ajaxOptions: {
                 headers: {"myHeader": "123"}
             } 
          }),  
          newText = 'cd<e>;"'

          $.mockjax({
              url: 'post-params-func.php',
              response: function(settings) {
                 equal(settings.dataType, undefined, 'dataType undefined (correct)');
                 equal(settings.data.pk, 3, 'pk ok');
                 equal(settings.data.name, 'username', 'name ok');
                 equal(settings.data.value, newText, 'value ok');
                 equal(settings.data.q, 2, 'additional params ok');
              }
          });         
          
          
        e.click()
        var p = tip(e);

        ok(p.find('input[type=text]').length, 'input exists')
        p.find('input').val(newText);
        p.find('form').submit(); 
        
        setTimeout(function() {
           e.remove();    
           start();  
        }, timeout);             
        
      });          
           
     test("mode: popup / inline", function () {
        var e = $('<a href="#" id="a"></a>').appendTo('#qunit-fixture').editable({
            mode: 'popup'
        }),
        e1 = $('<a href="#" id="a1"></a>').appendTo('#qunit-fixture').editable({
            mode: 'inline'
        });        
        
        e.click(); 
        var p = tip(e);                       
        ok(p.is(':visible'), 'popup visible');
        ok(!p.hasClass('editable-inline'), 'no inline class');

        e1.click(); 
        p = tip(e1);                       
        ok(p.is(':visible'), 'inline visible visible');
        ok(p.hasClass('editable-inline'), 'has inline class');
    }); 
    
     test("option 'inputclass'", function () {
        var  e = $('<a href="#" id="a" data-inputclass="span4"> </a>').appendTo('#qunit-fixture').editable();
            
        e.click();
        var p = tip(e);
        ok(p.find('input[type=text]').hasClass('span4'), 'class set correctly');
        p.find('.editable-cancel').click(); 
        ok(!p.is(':visible'), 'popover was removed');
      });      
    
     test("emptytext, emptyclass", function () {
        var  emptytext = 'empty!',
             emptyclass = 'abc',
             e = $('<a href="#" id="a">  </a>').appendTo('#qunit-fixture').editable({
                 emptytext: emptytext,
                 emptyclass: emptyclass,
                 send: 'never'
             });
       
        equal(e.text(), emptytext, 'emptytext shown on init');
        ok(e.hasClass(emptyclass), 'emptyclass added');
             
        e.click();
        var p = tip(e);
        equal(p.find('input[type="text"]').val(), '', 'input val is empty string');
//        p.find('.editable-cancel').click();
        //set non-empty value  
        p.find('input[type="text"]').val('abc');
        p.find('form').submit();
        
        ok(!p.is(':visible'), 'popover was removed');
        ok(e.text() != emptytext, 'emptytext not shown');
        ok(!e.hasClass(emptyclass), 'emptyclass removed');
        
        e.click();
        p = tip(e);
        p.find('input[type="text"]').val('');
        p.find('form').submit();
        
        ok(!p.is(':visible'), 'popover was removed');
        equal(e.text(), emptytext, 'emptytext shown');
        ok(e.hasClass(emptyclass), 'emptyclass added');
        
        e.editable('disable');
        equal(e.text(), '', 'emptytext removed');
        ok(!e.hasClass(emptyclass), 'emptyclass removed');
        
        e.editable('enable');            
        e.editable('enable');
         
        equal(e.text(), emptytext, 'emptytext shown');
        ok(e.hasClass(emptyclass), 'emptyclass added');                     
   });  
   
    asyncTest("submit to url defined as function", function () {
        expect(10);
        var newText = 'qwe',
            pass = false;
            //should be called even without pk!
            e = $('<a href="#" data-pk1="1" id="a"></a>').appendTo(fx).editable({
            url: function(params) {
               ok(this === e[0], 'scope is ok');
               ok(params.value, newText, 'new text passed in users function');
               if(!pass) {
                   var d = new $.Deferred;
                   return d.reject('my error');
               }
            }
        });
        
        e.click();                       
        var p = tip(e);

        ok(p.find('input[type=text]').length, 'input exists')
        p.find('input').val(newText);
        p.find('form').submit();
        
        setTimeout(function() {
           ok(p.is(':visible'), 'popover visible');
           equal(p.find('.editable-error-block').text(), 'my error', 'error shown correctly');  
             
           pass = true;
           newText = 'dfgd';
           p.find('input').val(newText);
           p.find('form').submit();           
           
           setTimeout(function() {  
               ok(!p.is(':visible'), 'popover closed');
               equal(e.text(), newText, 'element text ok');
               ok(!e.hasClass($.fn.editable.defaults.unsavedclass), 'no unsaved class');
                       
               e.remove();    
               start();
           }, timeout);                 
        }, timeout);           
        
   });     
    
     test("`selector` option", function () {
        var parent = $('<div><a href="#" id="a" data-type="text">123</a></div>').appendTo('#qunit-fixture').editable({
            selector: '#a',
            url: 'post.php'
        }),
        b = $('<a href="#" id="b" data-type="select" data-value="1"></a>'),
        e = $('#a'),
        selected = 2;
        
        //apply delegated editable second time
        parent.editable({
           selector: '#b', 
           url: 'post.php',
           source: groups
        });
       
        ok(!e.hasClass('editable'), 'no editable class applied');
       
        e.click();                       
        var p = tip(e); 
        
        ok(e.hasClass('editable'), 'editable class applied');                    
        ok(e.data('editable'), 'data(editable) ok');                    
        ok(!e.data('editable').selector, 'selector cleared');
        equal(e.data('editable').options.url, 'post.php', 'url ok');
        equal(e.data('editable').options.type, 'text', 'type text ok');
                            
        ok(p.is(':visible'), 'popover visible');
        ok(p.find('input[type=text]').length, 'input exists');
        equal(p.find('input[type=text]').val(), '123', 'input contain correct value');

        //dynamically add second element
        b.appendTo(parent);
        e = b; 
               
        e.click();
        ok(!p.is(':visible'), 'first popover closed');
        
        ok(e.data('editable'), 'data(editable) ok');                    
        ok(!e.data('editable').selector, 'selector cleared');
        equal(e.data('editable').options.url, 'post.php', 'url ok');
        equal(e.data('editable').options.type, 'select', 'type select ok');        
        
        p = tip(e); 
        ok(p.is(':visible'), 'second popover visible');
        
        ok(p.find('select').length, 'select exists');
        equal(p.find('select').find('option').length, size, 'options loaded');
        equal(p.find('select').val(), e.data('editable').value, 'selected value correct');        
        
        p.find('select').val(selected);
        p.find('form').submit(); 

        ok(!p.is(':visible'), 'popover closed');
        equal(e.data('editable').value, selected, 'new value saved');
        equal(e.text(), groups[selected], 'new text shown'); 
    });    
   
          
}(jQuery));  