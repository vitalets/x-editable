$(function () {         
    
   module("validation-promise", {
        setup: function(){
            fx = $('#async-fixture');
            $.support.transition = false;
        }
    });


      asyncTest("'validate' with promise - resolved with undefined", function () {
        var dfd = new $.Deferred();
        var e = $('<a href="#" data-type="text" data-url="validate-change-error" data-name="text">abc</a>').appendTo(fx).editable({
                validate: function(value) {
                    return dfd.promise();
                }
            });

       
        //change value to pass client side validation
        e.click();
        var p = tip(e);
        p.find('input[type=text]').val('cde');
        p.find('button[type=submit]').click(); 
       
        setTimeout(function() {
            start();
            dfd.resolve();
        }, timeout);

        setTimeout(function() {
            ok(!p.is(':visible'), 'popover closed');
            equal(p.find('input[type=text]').val(), 'cde', 'new value is set');

            e.remove();    
            
        }, timeout+10);                 
       
     }); 
    
     asyncTest("'validate' with promise - resolved with error string", function () {
        var dfd = new $.Deferred();
        var e = $('<a href="#" data-type="text" data-url="validate-change-error" data-name="text">abc</a>').appendTo(fx).editable({
                validate: function(value) {
                    return dfd.promise();
                }
            });

       
        //change value to pass client side validation
        e.click();
        var p = tip(e);
        p.find('input[type=text]').val('cde');
        p.find('button[type=submit]').click(); 
       
        setTimeout(function() {
            start();
            dfd.resolve('This Is Error!');
        }, timeout);

        setTimeout(function() {
            ok(p.is(':visible'), 'popover visible');
            equal(e.data('editable').value, 'abc', 'old value stayed');
            equal(p.find('.editable-error-block').text(), 'This Is Error!', 'error message');
            e.remove();    
            
        }, timeout+10);                 
       
     }); 
    
     asyncTest("'validate' with promise - rejected with undefined", function () {
        var dfd = new $.Deferred();
        var e = $('<a href="#" data-type="text" data-url="validate-change-error" data-name="text">abc</a>').appendTo(fx).editable({
                validate: function(value) {
                    return dfd.promise();
                }
            });

       
        //change value to pass client side validation
        e.click();
        var p = tip(e);
        p.find('input[type=text]').val('cde');
        p.find('button[type=submit]').click(); 
       
        setTimeout(function() {
            start();
            dfd.reject();
        }, timeout);

        setTimeout(function() {
            ok(p.is(':visible'), 'popover visible');
            equal(e.data('editable').value, 'abc', 'old value stayed');
            equal(p.find('.editable-error-block').text(), 'Validation error!', 'default error message');
            e.remove();    
            
        }, timeout+10);                 
       
     }); 
     
     asyncTest("'validate' with promise - rejected with error string", function () {
        var dfd = new $.Deferred();
        var e = $('<a href="#" data-type="text" data-url="validate-change-error" data-name="text">abc</a>').appendTo(fx).editable({
                validate: function(value) {
                    return dfd.promise();
                }
            });

       
        //change value to pass client side validation
        e.click();
        var p = tip(e);
        p.find('input[type=text]').val('cde');
        p.find('button[type=submit]').click(); 
       
        setTimeout(function() {
            start();
            dfd.reject("Custom Error!");
        }, timeout);

        setTimeout(function() {
            ok(p.is(':visible'), 'popover visible');
            equal(e.data('editable').value, 'abc', 'old value stayed');
            equal(p.find('.editable-error-block').text(), 'Custom Error!', 'custom error message');
            e.remove();    
            
        }, timeout+10);                 
       
     }); 
});            
