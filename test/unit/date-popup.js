(function () {
   
   var dpg, f = 'dd.mm.yyyy', mode;
   
   module("date-popup", {
        setup: function(){
            fx = $('#async-fixture');
            dpg = $.fn.bdatepicker.DPGlobal;
            $.support.transition = false;
            mode = $.fn.editable.defaults.mode;
            $.fn.editable.defaults.mode = 'popup';
        },
        teardown: function() {
            //restore mode
            $.fn.editable.defaults.mode = mode;
        }        
    });
    
    function frmt(date, format) {
       return dpg.formatDate(date, dpg.parseFormat(format), 'en');  
    }
     
    asyncTest("container should contain datepicker with value and save new entered date", function () {
        $.fn.editabletypes.date.defaults.datepicker.weekStart = 1;
        
        var d = '15.05.1984',
            e = $('<a href="#" data-type="date" data-pk="1" data-url="post-date.php">'+d+'</a>').appendTo(fx).editable({
                format: f,
                datepicker: {
                    
                }        
            }),
            nextD = '16.05.1984';
        
          $.mockjax({
              url: 'post-date.php',
              response: function(settings) {
                  equal(settings.data.value, nextD, 'submitted value correct');            
              }
          });

        //testing func, run twice!
        var func = function() {
            var df = $.Deferred();
            equal(frmt(e.data('editable').value, 'dd.mm.yyyy'), d, 'value correct');
                
            e.click();
            var p = tip(e);
            ok(p.find('.datepicker').is(':visible'), 'datepicker exists');
            equal(p.find('.datepicker').length, 1, 'datepicker single');
            ok(p.find('.datepicker').find('.datepicker-days').is(':visible'), 'datepicker days visible');        
            
            equal(frmt(e.data('editable').value, f), d, 'day set correct');
            ok(p.find('td.day.active').is(':visible'), 'active day is visible');
            equal(p.find('td.day.active').text(), 15, 'day shown correct');
            equal(p.find('th.dow').eq(0).text(), 'Mo', 'weekStart correct');

            //set new day
            p.find('td.day.active').next().click();
            p.find('form').submit();
        
            setTimeout(function() {          
               ok(!p.is(':visible'), 'popover closed');
               equal(frmt(e.data('editable').value, f), nextD, 'new date saved to value');
               equal(e.text(), nextD, 'new text shown');
               df.resolve();            
            }, timeout);
            
            return df.promise();
        };
        
        $.when(func()).then(function() {
           e.editable('setValue', d, true);
           $.when(func()).then(function() {
              e.remove();    
              start();  
           });
        });
        
     });  
     
     asyncTest("viewformat, init by text", function () {
         
        $.fn.editabletypes.date.defaults.datepicker.weekStart = 1;
         
        var dview = '15/05/1984',
            d = '1984-05-15',
            e = $('<a href="#" data-type="date" data-pk="1" data-url="post-date1.php">'+dview+'</a>').appendTo(fx).editable({
                format: 'yyyy-mm-dd',
                viewformat: 'dd/mm/yyyy',
                datepicker: {
                    
                }
            }),
            nextD = '1984-05-16',
            nextDview = '16/05/1984';
        
          equal(frmt(e.data('editable').value, 'yyyy-mm-dd'), d, 'value correct');
                        
          $.mockjax({
              url: 'post-date1.php',
              response: function(settings) {
                  equal(settings.data.value, nextD, 'submitted value correct');            
              }
          });
                        
        e.click();
        var p = tip(e);
        ok(p.find('.datepicker').is(':visible'), 'datepicker exists');
        
        equal(frmt(e.data('editable').value, 'yyyy-mm-dd'), d, 'day set correct');
        equal(p.find('td.day.active').text(), 15, 'day shown correct');
        equal(p.find('th.dow').eq(0).text(), 'Mo', 'weekStart correct');

        //set new day
        p.find('td.day.active').next().click();
        p.find('form').submit();
    
        setTimeout(function() {          
           ok(!p.is(':visible'), 'popover closed')
           equal(frmt(e.data('editable').value, 'yyyy-mm-dd'), nextD, 'new date saved to value')
           equal(e.text(), nextDview, 'new text shown in correct format')            
           e.remove();    
           start();  
        }, timeout); 
        
     });       
    
     test("viewformat, init by value", function () {
        var dview = '15/05/1984',
            d = '1984-05-15',
            e = $('<a href="#" data-type="date" data-pk="1" data-format="yyyy-mm-dd" data-viewformat="dd/mm/yyyy"  data-value="'+d+'"></a>').appendTo('#qunit-fixture').editable();
        
        equal(frmt(e.data('editable').value, 'yyyy-mm-dd'), d, 'value correct');
        equal(e.text(), dview, 'text correct');
     });
     
    test("datepicker options can be defined in data-datepicker string", function () {
        var  e = $('<a href="#" data-type="date" data-datepicker="{weekStart: 2}" data-pk="1" data-url="/post"></a>').appendTo('#qunit-fixture').editable({
            });
       
        equal(e.data('editable').input.options.datepicker.weekStart, 2, 'options applied correct');
    });    
     
     
     test("input should contain today if element is empty", function () {
        var e = $('<a href="#" data-type="date"></a>').appendTo('#qunit-fixture').editable();
        e.click();
        var p = tip(e),
            today = new Date();
        
        equal(p.find('td.day.active').text(), today.getDate(), 'day shown correct');
        
        p.find('.editable-cancel').click();
        ok(!p.is(':visible'), 'popover closed');      
      });
      
    asyncTest("clear button (showbuttons: true)", function () {
        var d = '15.05.1984',
            e = $('<a href="#" data-type="date" data-pk="1" data-url="post-date-clear.php">'+d+'</a>').appendTo(fx).editable({
                format: f,
                clear: 'abc',
                showbuttons: true
            });
                       
          $.mockjax({
              url: 'post-date-clear.php',
              response: function(settings) {
                  equal(settings.data.value, '', 'submitted value correct');            
              }
          });
       
        equal(frmt(e.data('editable').value, 'dd.mm.yyyy'), d, 'value correct');
            
        e.click();
        var p = tip(e);
        ok(p.find('.datepicker').is(':visible'), 'datepicker exists');
        
        equal(frmt(e.data('editable').value, f), d, 'day set correct');
        equal(p.find('td.day.active').text(), 15, 'day shown correct');

        var clear = p.find('.editable-clear a');
        equal(clear.text(), 'abc', 'clear link shown');

        //click clear
        clear.click();
        ok(!p.find('td.day.active').length, 'no active day');
        ok(p.find('.datepicker').is(':visible'), 'datepicker still visible');

        p.find('form').submit();
    
        setTimeout(function() {          
           ok(!p.is(':visible'), 'popover closed');
           equal(e.data('editable').value, null, 'null saved to value');
           equal(e.text(), e.data('editable').options.emptytext, 'empty text shown');
           e.remove();    
           start();  
        }, timeout); 
        
     });        


    asyncTest("clear button (showbuttons: false)", function () {
        var d = '15.05.1984',
            e = $('<a href="#" data-type="date" data-pk="1" data-url="post-date-clear1.php">'+d+'</a>').appendTo(fx).editable({
                format: f,
                clear: 'abc',
                showbuttons: false
            });
                       
          $.mockjax({
              url: 'post-date-clear1.php',
              response: function(settings) {
                  equal(settings.data.value, '', 'submitted value correct');            
              }
          });
       
        equal(frmt(e.data('editable').value, 'dd.mm.yyyy'), d, 'value correct');
            
        e.click();
        var p = tip(e);
        ok(p.find('.datepicker').is(':visible'), 'datepicker exists');
        
        equal(frmt(e.data('editable').value, f), d, 'day set correct');
        equal(p.find('td.day.active').text(), 15, 'day shown correct');

        var clear = p.find('.editable-clear a');
        equal(clear.text(), 'abc', 'clear link shown');

        //click clear
        clear.click();
    
        setTimeout(function() {          
           ok(!p.is(':visible'), 'popover closed');
           equal(e.data('editable').value, null, 'null saved to value');
           equal(e.text(), e.data('editable').options.emptytext, 'empty text shown');
           e.remove();    
           start();  
        }, timeout); 
        
     });        
   
})();