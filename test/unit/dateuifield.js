$(function () {         
   
   var f = 'dd.mm.yyyy', mode;
   
   module("dateuifield", {
        setup: function(){
            fx = $('#async-fixture');
            $.support.transition = false;
            
            mode = $.fn.editable.defaults.mode;
            $.fn.editable.defaults.mode = 'inline';
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
     
    asyncTest("container should contain input with value and save new entered date", function () {

        var d = '15.05.1984',
            e = $('<a href="#" data-type="date" data-pk="1" data-url="post-dateuifield.php">'+d+'</a>').appendTo(fx).editable({
                format: f,
                viewformat: f,
                datepicker: {
                   firstDay: 1
                }        
            }),
            nextD = '16.05.1984',
            finalD = '17.05.1984';
        
          $.mockjax({
              url: 'post-dateuifield.php',
              response: function(settings) {
                  equal(settings.data.value, finalD, 'submitted value correct');            
              }
          });
          
        //testing func, run twice!
        var func = function() {
            var df = $.Deferred();           
       
            equal(frmt(e.data('editable').value, 'dd.mm.yyyy'), d, 'value correct');
                
            e.click();
            var p = tip(e);
            ok(p.find('input').is(':visible'), 'input exists');
            
            equal(p.find('input').val(), d, 'date set correct');
            
            //open picker
            p.find('img').click();
            
            equal(p.find('input').length, 1, 'input is single');
            
            var picker = p.find('input').datepicker('widget');
            
            ok(picker.is(':visible'), 'picker shown');
            ok(picker.find('a.ui-state-active').is(':visible'), 'active day is visible');
            equal(picker.find('a.ui-state-active').text(), 15, 'day shown correct');
            equal(picker.find('.ui-datepicker-calendar > thead > tr > th').eq(0).find('span').text(), 'Mo', 'weekStart correct');

            //set new day by picker
            picker.find('a.ui-state-active').parent().next().click();
            ok(!picker.is(':visible'), 'picker closed'); 
            
            equal(p.find('input').val(), nextD, 'next day set correct');
                                                  
            p.find('input').val(finalD).trigger('keyup');
            
            equal(picker.find('a.ui-state-active').text(), 17, 'picker active date updated');
        
            //prevent page reload in case of error
            p.find('form').submit(function(e){
                if(!e.isDefaultPrevented()) {
                    e.preventDefault();
                    ok(false, 'form submit not prevented!');
                }
            })
            
            //submit            
            p.find('form').submit();
        
            setTimeout(function() {  
               ok(!p.is(':visible'), 'popover closed');
               ok(!picker.is(':visible'), 'picker closed');
               equal(frmt(e.data('editable').value, f), finalD, 'new date saved to value');
               equal(e.text(), finalD, 'new text shown');            
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
     
     test("viewformat, init by text", function () {
         
        var dview = '15/05/1984',
            d = '1984-05-15',
            e = $('<a href="#" data-type="date" data-pk="1" data-url="post-date1.php">'+dview+'</a>').appendTo('#qunit-fixture').editable({
                format: 'yyyy-mm-dd',
                viewformat: 'dd/mm/yyyy'
            }),
            nextD = '1984-05-16',
            nextDview = '16/05/1984';
        
          equal(frmt(e.data('editable').value, 'yyyy-mm-dd'), d, 'value correct');
     });       
    
     test("viewformat, init by value", function () {
        var dview = '15/05/1984',
            d = '1984-05-15',
            e = $('<a href="#" data-type="date" data-pk="1" data-format="yyyy-mm-dd" data-viewformat="dd/mm/yyyy"  data-value="'+d+'"></a>').appendTo('#qunit-fixture').editable();
        
        equal(frmt(e.data('editable').value, 'yyyy-mm-dd'), d, 'value correct');
        equal(e.text(), dview, 'text correct');
     });    
    
});