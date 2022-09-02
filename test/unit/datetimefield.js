$(function () {         
   
   var dpg, f = 'dd.mm.yyyy hh:ii', mode;
   
   module("datetimefield", {
        setup: function(){
            fx = $('#async-fixture');
            dpg = $.fn.datetimepicker.DPGlobal;
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
        //convert to utc
        date = $.fn.editabletypes.datetime.prototype.toUTC(date); 
        return dpg.formatDate(date, dpg.parseFormat(format, 'standard'), 'en', 'standard');  
    }
     
    asyncTest("container should contain datetimepicker with value and save new entered date", function () {
        $.fn.editabletypes.datetimefield.defaults.datetimepicker.weekStart = 1;
        
        var d = '15.05.1984 20:30',
            e = $('<a href="#" data-type="datetime" data-pk="1" data-url="post-datetimefield">'+d+'</a>').appendTo(fx).editable({
                format: f,
                datetimepicker: {
                    
                }        
            }),
            nextD = '16.05.1984 21:35';
        
          $.mockjax({
              url: 'post-datetimefield',
              response: function(settings) {
                  equal(settings.data.value, nextD, 'submitted value correct');            
              }
          });

        //testing func, run twice!
        var func = function() {
            var df = $.Deferred();
            equal(frmt(e.data('editable').value, 'dd.mm.yyyy hh:ii'), d, 'value correct');
                
            e.click();
            var cont = tip(e);
            //check input
            ok(cont.find('input[type="text"]').is(':visible'), 'input exists');
            equal(cont.find('input').val(), d, 'value set correct');
               
            //open picker
            cont.find('span.add-on').click();
            var p = cont.find('span.add-on').parent().data().datetimepicker.picker;
            
            //check date in picker
            ok(p.is(':visible'), 'datetimepicker exists');
            equal(p.length, 1, 'datetimepicker single');
            ok(p.find('.datetimepicker-days').is(':visible'), 'datetimepicker days visible');        
            
            equal(frmt(e.data('editable').value, f), d, 'day set correct');
            ok(p.find('td.day.active').is(':visible'), 'active day is visible');
            equal(p.find('td.day.active').text(), 15, 'day shown correct');
            equal(p.find('th.dow').eq(0).text(), 'Mo', 'weekStart correct');

            //set new day
            p.find('.day.active').next().click();
            
            //hours appeared?
            ok(p.find('.datetimepicker-hours').is(':visible'), 'datetimepicker hours visible');
            //set hours 21
            p.find('.hour.active').next().click();

            //minutes appeared?
            ok(p.find('.datetimepicker-minutes').is(':visible'), 'datetimepicker minutes visible');
            //set minutes 21:35
            p.find('.minute.active').next().click();

            //submit
            cont.find('form').submit();
        
            setTimeout(function() {          
               ok(!cont.is(':visible'), 'popover closed');
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
   
     test("viewformat, init by text", function () {
        var dview = '15/05/1984 11:50',
            d = '1984-05-15 11:50',
            e = $('<a href="#" data-type="datetime" data-pk="1">'+dview+'</a>').appendTo('#qunit-fixture').editable({
                format: 'yyyy-mm-dd hh:ii',
                viewformat: 'dd/mm/yyyy hh:ii',
                datetimepicker: {
                    
                }
            });
        
          equal(frmt(e.data('editable').value, 'yyyy-mm-dd hh:ii'), d, 'value correct');
     });       
  
     test("viewformat, init by value", function () {
        var dview = '15/05/1984 15:45',
            d = '1984-05-15 15:45',
            e = $('<a href="#" data-type="datetime" data-pk="1" data-format="yyyy-mm-dd hh:ii" data-viewformat="dd/mm/yyyy hh:ii"  data-value="'+d+'"></a>').appendTo('#qunit-fixture').editable();
        
        equal(frmt(e.data('editable').value, 'yyyy-mm-dd hh:ii'), d, 'value correct');
        equal(e.text(), dview, 'text correct');
     });    
   
 	test("incorrect datetime", function () {
        var dview = '15/05/1984 15:45',
            d = '1984-05-15 15:45',
            e = $('<a href="#" data-type="datetime" data-pk="1" data-format="yyyy-mm-dd hh:ii" data-viewformat="dd/mm/yyyy hh:ii"  data-value="'+d+'"></a>').appendTo('#qunit-fixture').editable();
        
        e.click();
        var p = tip(e);
        ok(p.find('input').is(':visible'), 'input exists');
        
        //enter incorrect date
		p.find('input').val('abcde');
    
        //submit
        p.find('form').submit();
         
        ok(!p.is(':visible'), 'popover closed');
        equal(e.data('editable').value, null, 'date set to null');
        equal(e.text(), $.fn.editable.defaults.emptytext , 'emptytext shown');            
     });   
   
});