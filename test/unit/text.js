$(function () {
    
    module("text", {
       setup: function() {
           fx = $('#async-fixture');
           $.support.transition = false;
       }
   });
      
     test("option 'placeholder'", function () {
        var  e = $('<a href="#" id="a" data-placeholder="abc"> </a>').appendTo('#qunit-fixture').editable();
            
        e.click();
        var p = tip(e);
        equal(p.find('input[type=text]').attr('placeholder'), 'abc', 'placeholder exists');
        p.find('.editable-cancel').click(); 
        ok(!p.is(':visible'), 'popover was removed');
      });
      
    
     asyncTest("should load correct value and save new entered text (and value)", function () {
        var  v = 'ab<b>"',
             esc_v = $('<div>').text(v).html(),
             e = $('<a href="#" data-pk="1" data-name="text1" data-url="post-text-main.php" data-params="{\'q\': \'w\'}">'+esc_v+'</a>').appendTo(fx).editable({
             success: function(response, newValue) {
                  equal(newValue, newText, 'new value in success correct');
             } 
          }),  
          data,
          newText = 'cd&gt;e>;"';
        
          $.mockjax({
              url: 'post-text-main.php',
              response: function(settings) {
                  data = settings.data;
              }
          });
          

        e.click()
        var p = tip(e);
        ok(p.is(':visible'), 'popover visible');
        ok(p.find('.editableform-loading').length, 'loading class exists');
        ok(!p.find('.editableform-loading').is(':visible'), 'loading class is hidden');
        ok(p.find('input[type=text]').length, 'input exists');
        equal(p.find('input[type=text]').val(), v, 'input contain correct value');
        p.find('input').val(newText);
        p.find('form').submit(); 
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
        var msg = "required\nfield",
           e = $('<a href="#" data-name="text1">abc</a>').appendTo(fx).editable({
              validate: function(value) { 
                  ok(this === e[0], 'scope is ok');
                  if(value == '') return msg; 
              }
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
           equal(p.find('.editable-error-block').text().toLowerCase(), msg.replace('\n', ''), 'error msg shown');   
           equal(p.find('.editable-error-block').html().toLowerCase(), msg.replace('\n', '<br>'), 'newline replaced with br');   
           p.find('.editable-cancel').click(); 
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
        p.find('.editable-cancel').click(); 
        ok(!p.is(':visible'), 'popover was removed');
        
        e = e1;
        e.click();
        var p = tip(e);
        p.find('input').val(newText);
        p.find('form').submit(); 
        ok(p.is(':visible'), 'popover still shown');  
        ok(p.find('.error').length, 'class "error" exists');
        equal(p.find('.editable-error-block').text(), 'required2', 'error msg shown');   
        p.find('.editable-cancel').click(); 
        ok(!p.is(':visible'), 'popover was removed');        
     });        
      */
      
     asyncTest("should show error if success callback returns string", function () {
        var newText = 'cd<e>;"',
            e = $('<a href="#" data-pk="1" data-url="post.php" data-name="text1">abc</a>').appendTo(fx).editable({
             success: function(response, newValue) {
                 ok(this === e[0], 'scope is ok');
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
           p.find('.editable-cancel').click(); 
           ok(!p.is(':visible'), 'popover was removed');
           e.remove();    
           start();  
        }, timeout);             
        
      });  
      
     asyncTest("should show new value if success callback returns object", function () {
        var newText = 'cd<e>;"',
            e = $('<a href="#" data-pk="1" data-url="post.php" data-name="text1">abc</a>').appendTo(fx).editable({
             success: function(response, newValue) {
                 equal(newValue, newText, 'value in success passed correctly');
                 return {newValue: 'xyz'};
             } 
          });  

        e.click()
        var p = tip(e);

        ok(p.find('input[type=text]').length, 'input exists')
        p.find('input').val(newText);
        p.find('form').submit(); 
        
        setTimeout(function() {
           ok(!p.is(':visible'), 'popover closed');  
           equal(p.find('.editable-error-block').text(), '', 'no error msg');   
           equal(e.data('editable').value, 'xyz', 'value ok');   
           equal(e.text(), 'xyz', 'text ok');   
           
           p.find('.editable-cancel').click(); 
           ok(!p.is(':visible'), 'popover was removed');
           e.remove();    
           start();  
        }, timeout);             
        
      }); 
      
      asyncTest("should show custom error if `error` callback returns string", function () {
        var newText = 'cd<e>;"',
            e = $('<a href="#" data-pk="1" data-url="error.php" data-name="text1">abc</a>').appendTo(fx).editable({
             error: function(response, newValue) {
                 ok(this === e[0], 'scope is ok');
                 equal(response.status, 500, 'response status ok');
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
           p.find('.editable-cancel').click(); 
           ok(!p.is(':visible'), 'popover was removed');
           e.remove();    
           start();  
        }, timeout);             
        
      });             
       
              
     asyncTest("ajaxOptions", function () {
        var e = $('<a href="#" data-pk="1" data-url="post-options.php">abc</a>').appendTo(fx).editable({
             name: 'username',
             ajaxOptions: {
                 dataType: 'html'
             } 
          }),  
          newText = 'cd<e>;"'

          $.mockjax({
              url: 'post-options.php',
              response: function(settings) {
                 equal(settings.dataType, 'html', 'dataType key ok');
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
               
               p.find('.editable-cancel').click(); 
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
               
               p.find('.editable-cancel').click(); 
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
            ok(e.hasClass($.fn.editable.defaults.unsavedclass), 'has class editable-unsaved');
      });
      
     test("send = 'never'. if pk defined --> should save new entered text and value, but no ajax", function () {
            var e = $('<a href="#" data-name="text1">abc</a>').appendTo('#qunit-fixture').editable({
               pk: 123, 
               send: 'never',
               unsavedclass: 'qq'
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
            ok(e.hasClass('qq'), 'has class editable-unsaved');
      });  

      test("if name not defined --> should be taken from id", function () {
            delete $.fn.editable.defaults.name;
            var e = $('<a href="#" id="cde">abc</a>').appendTo('#qunit-fixture').editable();
            equal(e.data('editable').options.name, 'cde', 'name is taken from id');
      });   
      
     asyncTest("'display' callback", function () {
        var newText = 'cd<e>;"',
            counter = 0,
            initialVal = 'abc',
            e = $('<a href="#" data-pk="1" data-url="post.php" data-name="text1">123</a>').appendTo(fx).editable({
              ajaxOptions: {
                 dataType: 'json'
              },
              display: function(value, response) {
                 if(counter === 0) {
                     ok(response === undefined, 'initial autotext ok as display is func');
                     $(this).text(initialVal);
                 } else {
                     ok(this === e[0], 'updating, scope is ok');
                     ok(response.success, 'response param ok');
                     $(this).text('qq'+value);
                 }
                 counter++;
              } 
            });  

        equal(e.text(), initialVal, 'initial autotext ok');  
          
        e.click()
        var p = tip(e);

        ok(p.find('input[type=text]').length, 'input exists')
        p.find('input').val(newText);
        p.find('form').submit(); 
        
        setTimeout(function() {
           ok(!p.is(':visible'), 'popover was removed');
           equal(e.text(), 'qq'+newText, 'custom display ok');
           e.remove();    
           start();  
        }, timeout);             
        
      });
      
     asyncTest("display: false", function () {
        var newText = 'cd<e>;"',
            e = $('<a href="#" data-pk="1" data-url="post.php" data-name="text1" data-value="abc"></a>').appendTo(fx).editable({
              display: false
          });  

        ok(!e.text().length, 'element still empty, autotext did not display value');          
          
        e.click()
        var p = tip(e);

        p.find('input').val(newText);
        p.find('form').submit(); 
        
        setTimeout(function() {
           ok(!p.is(':visible'), 'popover was removed');
           ok(!e.text().length, 'element still empty, new value was not displayed');  
           equal(e.data('editable').value, newText, 'new text saved to value');
           ok(!e.hasClass($.fn.editable.defaults.unsavedclass), 'no unsaved css');
           e.remove();    
           start();  
        }, timeout);             
        
    });
    
    test("'display' returning html only (img)", function () {
        var html = '<img src="../src/img/clear.png">',
            e = $('<a href="#" data-pk="1" data-type="text" data-name="text1">0</a>').appendTo('#qunit-fixture').editable({
              display: function(value, response) {
          	      $(this).html(html);
              } 
            });  

        equal(e.html(), html, 'html ok');
        
        c = 1;
 		e.click()
        var p = tip(e);
        p.find('input').val(1);         	
        p.find('form').submit();
        
		equal(e.html(), html, 'html again ok');
    });         

   test("password", function () {
          var v = '123', v1 = '456';
       
          var e = $('<a href="#" data-pk="1" data-name="name" data-value="'+v+'"></a>').appendTo('#qunit-fixture').editable({
                type: 'password',
                url: function(params) {
                   equal(params.value, v1, 'submitted value correct'); 
                }
            });
            
            equal(e.text(), '[hidden]', 'text is hidden');             
            
            e.click()
            var p = tip(e);
            ok(p.is(':visible'), 'popover visible');
            var $input = p.find('input[type="password"]');
            ok($input.length, 'input exists');
            equal($input.val(), v, 'input contains correct value');
            $input.val(v1);
            p.find('form').submit(); 
            
            ok(!p.is(':visible'), 'popover closed');
            equal(e.data('editable').value, v1, 'new value saved to value');
            equal(e.text(), '[hidden]', 'new text shown');             
  });        
      
      
   test("html5 types", function () {
       
        var types = ['email', 'url', 'tel', 'number', 'range'],
            v = '12',
            v1 = '45';
       
        expect(8*types.length);
                             
        for(var i = 0; i< types.length; i++) {
            var e = $('<a href="#" data-pk="1" data-name="name">'+v+'</a>').appendTo('#qunit-fixture').editable({
                type: types[i],
                url: function(params) {
                   equal(params.value, v1, 'submitted value correct'); 
                }
            });
            
            equal(e.data('editable').value, v, 'value correct');
            
            e.click()
            var p = tip(e);
            ok(p.is(':visible'), 'popover visible');
            var $input = p.find('input[type='+types[i]+']');
            ok($input.length, 'input exists');
            equal($input.val(), v, 'input contain correct value');
            $input.val(v1);
            p.find('form').submit(); 
            
            ok(!p.is(':visible'), 'popover closed');
            equal(e.data('editable').value, v1, 'new value saved to value');
            equal(e.text(), v1, 'new text shown');             
        }    
                  
  });   
  
   test("`clear` option", function () {
        var e = $('<a href="#" data-type="text" data-name="text1">abc</a>').appendTo('#qunit-fixture').editable({
          clear: true,
          send: 'never'
        });

        e.click()
        var p = tip(e);
        
        var c = p.find('.editable-clear-x'); 
        ok(c.is(':visible'), 'clear shown');

        //now clear shown with delay..        
        /*
        p.find('input').val('').trigger('keyup');
        ok(!c.is(':visible'), 'clear hidden for empty input');
        p.find('input').val('cde').trigger('keyup');
        ok(c.is(':visible'), 'clear shown on keyboard input');
        */
        c.click();
        ok(!c.is(':visible'), 'clear hidden after click');
        ok(!p.find('input').val(), 'input empty');
        
        p.find('form').submit();
        
        //reopen with empty
        e.click(); 
        ok(!c.is(':visible'), 'clear hidden for empty input');
  });
  
    test("defaultValue", function () {
        var e = $('<a href="#" data-name="text1"></a>').appendTo('#qunit-fixture').editable({
          defaultValue: '123'
        }),
        e1 = $('<a href="#" data-name="text1"></a>').appendTo('#qunit-fixture').editable({
          value: null,  
          defaultValue: '123'
        });
        e2 = $('<a href="#" data-name="text1">qwe</a>').appendTo('#qunit-fixture').editable({
          defaultValue: '123'
        });

        //empty text
        e.click()
        var p = tip(e);
        ok(p.find('input').length, 'input exists');
        equal(p.find('input').val(), '123', 'default text ok');
        
        //empty value from js
        e1.click()
        p = tip(e1);
        ok(p.find('input').length, 'input exists');
        equal(p.find('input').val(), '123', 'default text ok');
        
        //not empty
        e2.click()
        p = tip(e2);
        ok(p.find('input').length, 'input exists');
        equal(p.find('input').val(), 'qwe', 'default text not set as element not empty');
    });
                   
         
});    