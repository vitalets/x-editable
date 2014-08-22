$(function () {         
   
   var dpg, mode;
   
   module("dateui", {
        setup: function(){
            fx = $('#async-fixture');
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
       format = format.replace('yyyy', 'yy');
       return $.datepicker.formatDate(format, date);  
    }
    
    asyncTest("container should contain datepicker with value and save new entered date", function () {
        var d = '15.05.1984',
            dview = '15/05/1984',
            e = $('<a href="#" data-type="date" data-pk="1" data-url="post-dateui.php">'+dview+'</a>').appendTo(fx).editable({
                format: 'dd.mm.yyyy',
                viewformat: 'dd/mm/yyyy',
                datepicker: {
                   firstDay: 1
                }
            }),
            nextD = '16.05.1984',
            nextDview = '16/05/1984';
        
          $.mockjax({
              url: 'post-dateui.php',
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
            ok(p.find('.ui-datepicker').is(':visible'), 'datepicker exists');
            equal(p.find('.ui-datepicker').length, 1, 'datepicker single');
            
            equal(p.find('a.ui-state-active').text(), 15, 'day shown correct');
            equal(p.find('.ui-datepicker-calendar > thead > tr > th').eq(0).find('span').text(), 'Mo', 'weekStart correct');

            //set new day
            p.find('a.ui-state-active').parent().next().click();
            p.find('form').submit();
        
            setTimeout(function() {          
               ok(!p.is(':visible'), 'popover closed');
               equal(frmt(e.data('editable').value, 'dd.mm.yyyy'), nextD, 'new date saved to value');
               equal(e.text(), nextDview, 'new text shown');            
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
     
     
     test("viewformat, init by value", function () {
        var dview = '15/05/1984',
            d = '1984-05-15', 
            e = $('<a href="#" data-type="date" data-pk="1" data-weekstart="1" data-value="'+d+'"></a>').appendTo('#qunit-fixture').editable({
                format: 'yyyy-mm-dd',
                viewformat: 'dd/mm/yyyy'
            });
        
        equal(frmt(e.data('editable').value, 'yyyy-mm-dd'), d, 'value correct');
        equal(e.text(), dview, 'text correct');
     }); 
     
     test("input should contain today if element is empty", function () {
        var e = $('<a href="#" data-type="date"></a>').appendTo('#qunit-fixture').editable();
        e.click();
        var p = tip(e),
            today = new Date();
        
        equal(p.find('a.ui-state-active').text(), today.getDate(), 'day shown correct');
        
        p.find('.editable-cancel').click();
        ok(!p.is(':visible'), 'popover closed');      
      }); 
      
     asyncTest("clear button", function () {
        var d = '15.05.1984',
            f = 'dd.mm.yyyy',
            e = $('<a href="#" data-type="date" data-pk="1" data-url="post-date-clear.php">'+d+'</a>').appendTo(fx).editable({
                format: f,
                clear: 'abc'
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
        ok(p.find('.ui-datepicker').is(':visible'), 'datepicker exists');
        
        equal(frmt(e.data('editable').value, f), d, 'day set correct');
        equal(p.find('a.ui-state-active').text(), 15, 'day shown correct');

        var clear = p.find('.editable-clear a');
        equal(clear.text(), 'abc', 'clear link shown');

        //click clear
        clear.click();
        p.find('form').submit();
    
        setTimeout(function() {          
           ok(!p.is(':visible'), 'popover closed');
           equal(e.data('editable').value, null, 'null saved to value');
           equal(e.text(), e.data('editable').options.emptytext, 'empty text shown');
           e.remove();    
           start();  
        }, 500); 
        
     });


    asyncTest("clear button in no-buttons mode", function () {
        var d = '15.05.1984',
            f = 'dd.mm.yyyy',
            e = $('<a href="#" data-type="date" data-pk="1" data-url="post-date-clear-no-buttons">'+d+'</a>').appendTo(fx).editable({
                format: f,
                showbuttons: false
            });
                       
          $.mockjax({
              url: 'post-date-clear-no-buttons',
              response: function(settings) {
                  equal(settings.data.value, '', 'submitted value correct');            
              }
          });
       
        equal(frmt(e.data('editable').value, 'dd.mm.yyyy'), d, 'value correct');

        e.click();
        var p = tip(e);
        ok(p.find('.ui-datepicker').is(':visible'), 'datepicker exists');
        
        equal(frmt(e.data('editable').value, f), d, 'day set correct');
        equal(p.find('a.ui-state-active').text(), 15, 'day shown correct');

        var clear = p.find('.editable-clear a:visible');
        ok(clear.length, 'clear link shown');

        //click clear
        clear.click();
            
        setTimeout(function() {          
           ok(!p.is(':visible'), 'popover closed');
           equal(e.data('editable').value, null, 'null saved to value');
           equal(e.text(), e.data('editable').options.emptytext, 'empty text shown');
           e.remove();    
           start();  
        }, 500); 
        
     });

    
});    