$(function () {
   
    module("select2", {
        setup: function(){
            sfx = $('#qunit-fixture'),
            fx = $('#async-fixture');               
            $.support.transition = false;
        }
    });  
    
     asyncTest("data (single)", function () {
        var s = 2, text = 'text2',
            e = $('<a href="#" data-type="select2" data-name="select2" data-value="'+s+'"></a>').appendTo(fx).editable({
            source: [{id: 1, text: 'text1'}, {id: s, text: text}, {id: 3, text: 'text3'}],
            select2: {}
        });

        //autotext
        equal(e.data('editable').value, s, 'initial value ok');
        equal(e.text(), text, 'intial text ok'); 
        
        e.click();
        var p = tip(e);
        
        ok(p.is(':visible'), 'popover visible');
        var $input = p.find('input[type="hidden"]');
        ok($input.length, 'input exists');
        ok($input.select2, 'select2 applied');
        equal($input.val(), e.data('editable').value, 'selected value correct');        
        equal(p.find('.select2-choice span').text(), text, 'selected text correct');        
        
        //select new value
        s = 1; 
        text = 'text1';
        $input.select2('val', s);

        equal($input.val(), s, 'new value ok');        
        equal(p.find('.select2-choice span').text(), text, 'new text ok');

        p.find('form').submit();
        
        setTimeout(function() {
            ok(!p.is(':visible'), 'popover closed');
            equal(e.data('editable').value, s, 'new value ok');
            equal(e.text(), text, 'new text ok');             
            
            e.remove();
            start();
        }, timeout);
     });  
     
     asyncTest("data (multiple)", function () {
        var s = '2,3', text = 'text2, text3',
            e = $('<a href="#" data-type="select2" data-name="select2" data-value="'+s+'"></a>').appendTo(fx).editable({
            source: [{id: 1, text: 'text1'}, {id: 2, text: 'text2'}, {id: 3, text: 'text3'}],
            viewseparator: ', ',
            select2: {
                multiple: true
            }
        });

        //autotext
        equal(e.data('editable').value.join(','), s, 'initial value ok');
        equal(e.text(), text, 'intial text ok'); 
        
        e.click();
        var p = tip(e);
        
        ok(p.is(':visible'), 'popover visible');
        var $input = p.find('input[type="hidden"]');
        ok($input.length, 'input exists');
        ok($input.select2, 'select2 applied');
        equal($input.val(), s, 'selected value ok');        
        equal(p.find('.select2-search-choice > div').length, 2, 'selected text ok');        
        equal(p.find('.select2-search-choice > div').eq(0).text(), 'text2', 'text2 ok');        
        equal(p.find('.select2-search-choice > div').eq(1).text(), 'text3', 'text3 ok');        
        
        //select new value
        s = '1,2'; 
        text = 'text1, text2';
        $input.select2('val', [1, 2]);

        equal($input.val(), s, 'new value ok');        
        equal(p.find('.select2-search-choice > div').length, 2, 'new text ok');        
        equal(p.find('.select2-search-choice > div').eq(0).text(), 'text1', 'text1 ok');        
        equal(p.find('.select2-search-choice > div').eq(1).text(), 'text2', 'text2 ok');  

        p.find('form').submit();
        
        setTimeout(function() {
            ok(!p.is(':visible'), 'popover closed');
            equal(e.data('editable').value, s, 'new value ok');
            equal(e.text(), text, 'new text ok');             
            
            e.remove();
            start();
        }, timeout);
     });       
   
    asyncTest("tags", function () {
        var s = 'text2,abc', text = 'text2, abc',
            e = $('<a href="#" data-type="select2" data-name="select2">'+text+'</a>').appendTo(fx).editable({
            viewseparator: ', ',
            select2: {
                tags: ['text1', 'text2']
            }
        });

        equal(e.data('editable').value.join(','), s, 'initial value ok');
        
        e.click();
        var p = tip(e);
        
        ok(p.is(':visible'), 'popover visible');
        var $input = p.find('input[type="hidden"]');
        ok($input.length, 'input exists');
        ok($input.select2, 'select2 applied');
        equal($input.val(), s, 'selected value ok');        
        equal(p.find('.select2-search-choice > div').length, 2, 'selected text ok');        
        equal(p.find('.select2-search-choice > div').eq(0).text(), 'text2', 'text2 ok');        
        equal(p.find('.select2-search-choice > div').eq(1).text(), 'abc', 'abc ok');        
        
        //select new value
        s = 'text1,cde'; 
        text = 'text1, cde';
        $input.select2('val', ['text1', 'cde']);

        equal($input.val(), s, 'new value ok');        
        equal(p.find('.select2-search-choice > div').length, 2, 'new text ok');        
        equal(p.find('.select2-search-choice > div').eq(0).text(), 'text1', 'text1 ok');        
        equal(p.find('.select2-search-choice > div').eq(1).text(), 'cde', 'cde ok');   

        p.find('form').submit();
        
        setTimeout(function() {
            ok(!p.is(':visible'), 'popover closed');
            equal(e.data('editable').value, s, 'new value ok');
            equal(e.text(), text, 'new text ok');             
            
            e.remove();
            start();
        }, timeout);
     });          
     
    
});