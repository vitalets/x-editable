$(function () {         

   module("wysihtml5", {
        setup: function(){
            fx = $('#async-fixture');
            $.support.transition = false;
        }
    });

    //skip test for ie7 as it is not supported by wysihtml5
    var msieOld = /msie\s*(7|6)/i.test(navigator.userAgent); 
    
    //note: sometimes it throws 'nativeSelection is null' error
     
    asyncTest("should load correct value and save new entered value", function () {

        if(msieOld) {
           expect(0);
           start();  
           return;
        } 
        
        var v1 = '<h1>qq</h1><br>qwerty',
            v2 = '11<h2>werqwr</h2>4353',
            e = $('<a href="#" data-pk="1" data-url="post.php">'+v1+'</a>').appendTo(fx).editable({
            type: 'wysihtml5',
            success: function(response, newvalue) {
                // construction replace(/\s*\n(?!\r)/g, "") required to clear newlines added in ie8
                equal(newvalue.toLowerCase().replace(/\s*\n(?!\r)/g, ""), v2, 'value in success ok');         
            } 
        });

        //testing func, run twice!
        var func = function() {
            var df = $.Deferred();        
        
            e.click();

            setTimeout(function() {

                var p = tip(e);
                ok(p.is(':visible'), 'container visible');
                ok(p.find('textarea').is(':hidden'), 'textarea hidden');
                equal(p.find('iframe').length, 1, 'iframe single');
                ok(p.find('.wysihtml5-toolbar').length, 'toolbar shown');

                var iframe = document.querySelectorAll('.wysihtml5-sandbox'),
                    $c = $(iframe[0]).contents().find('body');
               
                ok($(iframe[0]).width() > 0, 'iframe has width');
                ok($(iframe[0]).height() > 0, 'iframe has height');
                
                equal($c.html().toLowerCase(), v1.toLowerCase(), 'content correct');         

                //set new value, should wait async while it render to iframe
                $c.html(v2);
                setTimeout(function() {
                    p.find('form').submit();
                    setTimeout(function() {
                        ok(!p.is(':visible'), 'popover closed');
                        equal(e.data('editable').value.toLowerCase().replace(/\s*\n(?!\r)/g, ""), v2, 'new text saved to value');
                        equal(e.html().toLowerCase().replace(/\s*\n(?!\r)/g, ""), v2.toLowerCase(), 'new text shown'); 
                        df.resolve();  
                    }, timeout);                       
                }, 500);
            }, 500);  
            
            return df.promise();
        };
        
        $.when(func()).then(function() {
           e.editable('setValue', v1, true);
           $.when(func()).then(function() {
              e.remove();    
              start();  
           });
        });               

    });
    
    asyncTest("empty value", function () {

        if(msieOld) {
           expect(0);
           start();  
           return;
        } 

        var v1 = '<p></p><br>',
            e = $('<a href="#" data-pk="1" data-url="post.php">'+v1+'</a>').appendTo(fx).editable({
            type: 'wysihtml5'
        }); 
        
        setTimeout(function() {
             equal(e.html(), 'Empty', '`Empty` shown');
             e.remove();    
             start();            
        }, timeout);       
        
    });
   
});