(function () {
   
   var dpg, f = 'dd.mm.yyyy', mode;
   
   module("date-inline", {
        setup: function(){
            fx = $('#async-fixture');
            dpg = $.fn.bdatepicker.DPGlobal;
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
       return dpg.formatDate(date, dpg.parseFormat(format), 'en');  
    }
     
    asyncTest("container should contain input with value and save new entered date", function () {

        var d = '15.05.1984',
            e = $('<a href="#" data-type="date" data-pk="1" data-url="post-datefield.php">'+d+'</a>').appendTo(fx).editable({
                format: f,
                viewformat: f,
                datepicker: {
                   weekStart: 1 
                }        
            }),
            nextD = '16.05.1984',
            finalD = '17.05.1984';
        
          $.mockjax({
              url: 'post-datefield.php',
              response: function(settings) {
                  equal(settings.data.value, finalD, 'submitted value correct');            
              }
          });
       
        equal(frmt(e.data('editable').value, 'dd.mm.yyyy'), d, 'value correct');

        e.click();
        var p = tip(e);
        ok(p.find('input').is(':visible'), 'input exists');
        
        equal(p.find('input').val(), d, 'date set correct');
        
        //open picker

        p.find('span.add-on').click();
        var picker = p.find('span.add-on').parent().data().datepicker.picker;

        ok(picker.is(':visible'), 'picker shown');
        ok(picker.find('td.day.active').is(':visible'), 'active day is visible');
        equal(picker.find('td.day.active').text(), 15, 'day shown correct');
        equal(picker.find('th.dow').eq(0).text(), 'Mo', 'weekStart correct');

        //set new day by picker
        picker.find('td.day.active').next().click();
        ok(!picker.is(':visible'), 'picker closed');

        equal(p.find('input').val(), nextD, 'next day set correct');

        p.find('input').val(finalD).trigger('keyup');

        equal(picker.find('td.day.active').text(), 17, 'picker active date updated');

        //submit
        p.find('form').submit();

        setTimeout(function() {
           ok(!p.is(':visible'), 'popover closed');
           ok(!picker.is(':visible'), 'picker closed');
           equal(frmt(e.data('editable').value, f), finalD, 'new date saved to value');
           equal(e.text(), finalD, 'new text shown');
           e.remove();
           start();
        }, timeout);
        
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
    
    
 	test("incorrect date", function () {
        var d = '15.05.1984',
            e = $('<a href="#" data-type="date" data-pk="1">'+d+'</a>').appendTo('#qunit-fixture').editable({
                format: f,
                viewformat: f
            }),
            nextD = '16.05.1984';
        
        equal(frmt(e.data('editable').value, 'dd.mm.yyyy'), d, 'value correct');
            
        e.click();
        var p = tip(e);
        ok(p.find('input').is(':visible'), 'input exists');
        
        equal(p.find('input').val(), d, 'date set correct');
        
        //enter incorrect date
		p.find('input').val('abcde');
    
        //submit
        p.find('form').submit();
         
        ok(!p.is(':visible'), 'popover closed');
        equal(e.data('editable').value, null, 'date set to null');
        equal(e.text(), $.fn.editable.defaults.emptytext , 'emptytext shown');            
     });     
})();