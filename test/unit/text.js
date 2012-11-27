$(function () {
    
    module("text", {
       setup: function() {
           fx = $('#async-fixture');
           $.support.transition = false;
       }
   });
      
     test("if element originally empty: emptytext should be shown and input should contain ''", function () {
        var  emptytext = 'empty!',
             e = $('<a href="#" id="a">  </a>').appendTo('#qunit-fixture').editable({emptytext: emptytext});
       
        equal(e.text(), emptytext, 'emptytext shown on init');
             
        e.click();
        var p = tip(e);
        equal(p.find('input[type=text]').val(), '', 'input val is empty string')
        p.find('button[type=button]').click(); 
        ok(!p.is(':visible'), 'popover was removed')    
     })   
      
     test("option 'placeholder'", function () {
        var  e = $('<a href="#" id="a" data-placeholder="abc"> </a>').appendTo('#qunit-fixture').editable();
            
        e.click();
        var p = tip(e);
        equal(p.find('input[type=text]').attr('placeholder'), 'abc', 'placeholder exists');
        p.find('button[type=button]').click(); 
        ok(!p.is(':visible'), 'popover was removed');
      });   
      
     test("option 'inputclass'", function () {
        var  e = $('<a href="#" id="a" data-inputclass="span4"> </a>').appendTo('#qunit-fixture').editable();
            
        e.click();
        var p = tip(e);
        ok(p.find('input[type=text]').hasClass('span4'), 'class set correctly');
        p.find('button[type=button]').click(); 
        ok(!p.is(':visible'), 'popover was removed');
      });           
      
     test("option 'toggle' = manual", function () {
        var e = $('<a href="#" id="a"></a>').appendTo('#qunit-fixture').editable({
            toggle: 'manual'
        });
        
        e.click();                       
        ok(!e.data().editableContainer, 'popover not visible after click');
        e.editable('show'); 
        var p = tip(e);
        ok(p.is(':visible'), 'shown manually');
     });    
     
     asyncTest("should load correct value and save new entered text (and value)", function () {
        var  v = 'ab<b>"',
             esc_v = $('<div>').text(v).html(),
             e = $('<a href="#" data-pk="1" data-name="text1" data-url="post-text.php" data-params="{\'q\': \'w\'}">'+esc_v+'</a>').appendTo(fx).editable({
             success: function(data) {
                 return false;
             } 
          }),  
          data,
          newText = 'cd<e>;"';
        
          $.mockjax({
              url: 'post-text.php',
              response: function(settings) {
                  data = settings.data;
              }
          });
          

        e.click()
        var p = tip(e);
        ok(p.is(':visible'), 'popover visible')
        ok(p.find('.editableform-loading').length, 'loading class exists')
        ok(!p.find('.editableform-loading').is(':visible'), 'loading class is hidden')
        ok(p.find('input[type=text]').length, 'input exists')
        equal(p.find('input[type=text]').val(), v, 'input contain correct value')
        p.find('input').val(newText);
        p.find('button[type=submit]').click(); 
        ok(p.find('.editableform-loading').is(':visible'), 'loading class is visible');
        
        setTimeout(function() {
           ok(!p.is(':visible'), 'popover closed');
           equal(e.data('editable').value, newText, 'new text saved to value');
           equal(e.text(), newText, 'new text shown'); 
           ok(data, 'ajax performed');
           equal(data.name, 'text1', 'name sent');
           equal(data.pk, 1, 'pk sent');
           equal(data.value, newText, 'value sent');
           equal(data.q, 'w', 'params sent');
           
           e.remove();    
           start();  
        }, timeout);                     
      });     
      
     asyncTest("should show error on server validation", function () {
        var msg = 'required',
           e = $('<a href="#" data-name="text1">abc</a>').appendTo(fx).editable({
              validate: function(value) { if(value == '') return msg; }
          }),
          newText = '';

        e.click();
        var p = tip(e); 
        ok(p.is(':visible'), 'popover shown');
        p.find('input').val(newText);
        p.find('form').submit(); 
        
        setTimeout(function() {
           ok(p.is(':visible'), 'popover still shown');  
           ok(p.find('.editable-error-block').length, 'class "editable-error-block" exists');
           equal(p.find('.editable-error-block').text(), 'required', 'error msg shown');   
           p.find('button[type=button]').click(); 
           ok(!p.is(':visible'), 'popover was removed');
           e.remove();    
           start();   
        }, timeout);                     
     });      
     
     /*
     test("test validation map", function () {
        var e = $('<a href="#" class="map" data-name="e" data-name="text1">abc</a>').appendTo('#qunit-fixture'),
            e1 = $('<a href="#" class="map" data-name="e1" data-name="text1">abc</a>').appendTo('#qunit-fixture'),
            newText = '';
            
            $('.map').editable({
                validate: {
                    e: function(value) { if(value == '') return 'required1'; 
                    },
                    e1:function(value) { if(value == '') return 'required2'; 
                    },
                    e2: 'qwerty' //this should not throw error  
                }
            });
         

        e.click();
        var p = tip(e);
        p.find('input').val(newText);
        p.find('form').submit(); 
        ok(p.is(':visible'), 'popover still shown');  
        ok(p.find('.error').length, 'class "error" exists');
        equal(p.find('.editable-error-block').text(), 'required1', 'error msg shown');   
        p.find('button[type=button]').click(); 
        ok(!p.is(':visible'), 'popover was removed');
        
        e = e1;
        e.click();
        var p = tip(e);
        p.find('input').val(newText);
        p.find('form').submit(); 
        ok(p.is(':visible'), 'popover still shown');  
        ok(p.find('.error').length, 'class "error" exists');
        equal(p.find('.editable-error-block').text(), 'required2', 'error msg shown');   
        p.find('button[type=button]').click(); 
        ok(!p.is(':visible'), 'popover was removed');        
     });        
      */
      
      asyncTest("should not perform request if value not changed", function () {
        var e = $('<a href="#" data-pk="1" data-url="post-no.php" data-name="text1">abc</a>').appendTo(fx).editable(),
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
        p.find('button[type=submit]').click(); 
                
        setTimeout(function() {
           ok(!p.is(':visible'), 'popover closed');
           equal(req, 0, 'request was not performed');
           e.remove();    
           start();  
        }, timeout);                     
      });       
      
     asyncTest("should show error if success callback returns string", function () {
        var newText = 'cd<e>;"',
            e = $('<a href="#" data-pk="1" data-url="post.php" data-name="text1">abc</a>').appendTo(fx).editable({
             success: function(response, newValue) {
                 equal(newValue, newText, 'value in success passed correctly');
                 return 'error';
             } 
          });  

        e.click()
        var p = tip(e);

        ok(p.find('input[type=text]').length, 'input exists')
        p.find('input').val(newText);
        p.find('form').submit(); 
        
        setTimeout(function() {
           ok(p.is(':visible'), 'popover still shown');  
           ok(p.find('.editable-error-block').length, 'class "editable-error-block" exists');
           equal(p.find('.editable-error-block').text(), 'error', 'error msg shown');   
           p.find('button[type=button]').click(); 
           ok(!p.is(':visible'), 'popover was removed');
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
        var e = $('<a href="#" data-pk="1" data-url="post-resp.php">abc</a>').appendTo(fx).editable({
             name: 'username',
             params: function(params) {
                 equal(params.pk, 1, 'params in func already have values (pk)');
                 return { q: 2, pk: 3 };
             },
             success: function(resp) {   
                 equal(resp.dataType, 'json', 'dataType ok');
                 equal(resp.data.pk, 3, 'pk ok');
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
      
      
     asyncTest("submit to url defined as function", function () {
        expect(3);
        var newText = 'qwe',
            //should be called even without pk!
            e = $('<a href="#" data-pk1="1" id="a"></a>').appendTo(fx).editable({
            url: function(params) {
               ok(params.value, newText, 'new text passed in users function');
               var d = new $.Deferred;
               return d.reject('my error');
            }
        });
        
        e.click();                       
        var p = tip(e);

        ok(p.find('input[type=text]').length, 'input exists')
        p.find('input').val(newText);
        p.find('form').submit();
        
        setTimeout(function() {
           equal(p.find('.editable-error-block').text(), 'my error', 'error shown correctly');                  
           e.remove();    
           start();  
        }, timeout);           
        
     });  
     
     asyncTest("should show emptytext if entered text is empty", function () {
            var emptytext = 'blabla',
                e = $('<a href="#" data-pk="1" data-url="post.php" data-name="text1" data-emptytext="'+emptytext+'">abc</a>').appendTo(fx).editable(),
                newText = ' ';

            e.click()
            var p = tip(e);
            ok(p.find('input').length, 'input exists')
            p.find('input').val(newText);
            p.find('form').submit(); 
            
            setTimeout(function() {
               ok(!p.is(':visible'), 'popover closed')
               equal(e.data('editable').value, newText, 'value is empty')
               equal(e.text(), emptytext, 'emptytext shown')                 
               e.remove();    
               start();  
            }, timeout);            
      });  
     
     asyncTest("should show responseText on response != 200", function () {
            var e = $('<a href="#" data-pk="1" data-name="text1">abc</a>').appendTo(fx).editable({
              url: 'error.php'
            }),
            newText = 'cde';

            e.click()
            var p = tip(e);
            ok(p.find('input').length, 'input exists')
            p.find('input').val(newText);
            p.find('form').submit(); 
            
            setTimeout(function() {
               ok(p.is(':visible'), 'popover visible')
               ok(p.find('.editable-error-block').length, 'class "error" exists')
               equal(p.find('.editable-error-block').text(), 'customtext', 'error shown')               
               
               p.find('button[type=button]').click(); 
               ok(!p.is(':visible'), 'popover was removed')
               
               e.remove();  
               start();  
            }, timeout);    
      });       
    
    //error callback deprecated in 2.0
    /*   
     asyncTest("'error' callback on response != 200", function () {
            var e = $('<a href="#" data-pk="1" data-name="text1">abc</a>').appendTo(fx).editable({
              url: 'error.php',
              error: function(xhr) {
                  if(xhr.status == 500) return 'Internal server error';
              }  
            }),
            newText = 'cde';

            e.click()
            var p = tip(e);
            ok(p.find('input').length, 'input exists')
            p.find('input').val(newText);
            p.find('form').submit(); 
            
            setTimeout(function() {
               ok(p.is(':visible'), 'popover visible')
               ok(p.find('.error').length, 'class "error" exists')
               equal(p.find('.editable-error-block').text(), 'Internal server error', 'error shown')               
               
               p.find('button[type=button]').click(); 
               ok(!p.is(':visible'), 'popover was removed')
               
               e.remove();  
               start();  
            }, timeout);    
      });
     */ 
                                  

     test("send: 'auto'. if pk = null --> should save new entered text and value, but no ajax", function () {
            var e = $('<a href="#" data-name="text1">abc</a>').appendTo('#qunit-fixture').editable({
              send: 'auto'
            }),
            newText = 'cde';

            e.click()
            var p = tip(e);
            ok(p.find('input').length, 'input exists');
            p.find('input').val(newText);
            p.find('form').submit(); 
            
            ok(!p.is(':visible'), 'popover was removed');
            equal(e.data('editable').value, newText, 'new text saved to value');
            equal(e.text(), newText, 'new text shown');
            ok(e.hasClass('editable-unsaved'), 'has class editable-unsaved');
      });
      
     test("send = 'never'. if pk defined --> should save new entered text and value, but no ajax", function () {
            var e = $('<a href="#" data-name="text1">abc</a>').appendTo('#qunit-fixture').editable({
               pk: 123, 
               send: 'never'
            }),
            newText = 'cde';

            e.click()
            var p = tip(e);
            ok(p.find('input').length, 'input exists');
            p.find('input').val(newText);
            p.find('form').submit(); 
            
            ok(!p.is(':visible'), 'popover was removed');
            equal(e.data('editable').value, newText, 'new text saved to value');
            equal(e.text(), newText, 'new text shown');
            ok(e.hasClass('editable-unsaved'), 'has class editable-unsaved');
      });  

      test("if name not defined --> should be taken from id", function () {
            delete $.fn.editable.defaults.name;
            var e = $('<a href="#" id="cde">abc</a>').appendTo('#qunit-fixture').editable();
            equal(e.data('editable').options.name, 'cde', 'name is taken from id');
      });      
         
});    