$(function () {
   
    module("typeahead", {
        setup: function(){
            sfx = $('#qunit-fixture'),
            fx = $('#async-fixture');               
            $.support.transition = false;
        }
    });  

    asyncTest("should load correct value and save new entered text (source as objects)", function () {
        var v = 2, 
          e = $('<a href="#" data-pk="1" data-name="text1" data-type="typeahead" data-value="'+v+'" data-url="post.php"></a>').appendTo(fx).editable({
            source: groups,
            typeahead: {
               items: 5
            }     
          }),
          newText = 'adm';
          
        
        equal(e.text(), groups[v], 'autotext ok');    
        equal(e.data().editable.value, v, 'initial value ok');    

        e.click();
        var p = tip(e), 
           $input = p.find('input[type=text]');
           
        ok(p.is(':visible'), 'popup visible');
        ok($input.length, 'input exists');
        equal($input.val(), groups[v], 'input contain correct text');
        equal($input.data('value'), v, 'input contain correct data-value');
        ok($input.typeahead, 'typeahead applied to input');
        
        $input.val(newText).keyup();
        
        ok(p.find('.typeahead.dropdown-menu').is(':visible'), 'dropdown visible');
        
        //select `Admin`
        v = 5;
        
        ok(p.find('.typeahead.dropdown-menu').find('li').length, 'active item exists');
        p.find('.typeahead.dropdown-menu').find('li').mouseover().click();
        
        equal($input.val(), groups[v], 'input contain correct text');        
        p.find('form').submit(); 
                                 
        setTimeout(function() {
           ok(!p.is(':visible'), 'popup closed');
           equal(e.data('editable').value, v, 'new text saved to value');
           equal(e.text(), groups[v], 'new text shown'); 

           e.click();
           p = tip(e), 
           $input = p.find('input[type=text]');
                      
           $input.val('not_matched_text').keyup();
           ok(!p.find('.typeahead.dropdown-menu').is(':visible'), 'dropdown not visible');

           p.find('form').submit(); 
           setTimeout(function() {
               equal(e.data('editable').value, null, 'null saved to value');
               equal(e.text(), e.data().editable.options.emptytext, 'emptytext shown'); 
           
               e.remove();    
               start();  
           }, timeout);                     
        }, timeout);                     
    });      
    
    
    asyncTest("should load correct value and save new entered text (source as strings)", function () {
        var v = 'a', 
          e = $('<a href="#" data-pk="1" data-name="text1" data-type="typeahead" data-value="'+v+'" data-url="post.php"></a>').appendTo(fx).editable({
            source: ['a', 'ab', 'c']
          });
          
        
        equal(e.text(), v, 'autotext ok');    
        equal(e.data().editable.value, v, 'initial value ok');    

        e.click();
        var p = tip(e), 
           $input = p.find('input[type=text]');
           
        ok(p.is(':visible'), 'popup visible');
        ok($input.length, 'input exists');
        equal($input.val(), v, 'input contain correct text');
        equal($input.data('value'), undefined, 'input not contain data-value');
        ok($input.typeahead, 'typeahead applied to input');
        
        $input.val('b').keyup();
        ok(p.find('.typeahead.dropdown-menu').is(':visible'), 'dropdown visible');
        
        //select `ab`
        v = 'ab';
        p.find('.typeahead.dropdown-menu').find('li').mouseover().click();
        
        equal($input.val(), v, 'input contain correct text');        
        p.find('form').submit(); 
                                 
        setTimeout(function() {
           ok(!p.is(':visible'), 'popup closed');
           equal(e.data('editable').value, v, 'new text saved to value');
           equal(e.text(), v, 'new text shown'); 

           e.click();
           p = tip(e), 
           $input = p.find('input[type=text]');
                      
           v = 'not_matched_text';           
           $input.val(v).keyup();
           ok(!p.find('.typeahead.dropdown-menu').is(':visible'), 'dropdown not visible');

           p.find('form').submit(); 
           setTimeout(function() {
               equal(e.data('editable').value, v, 'new text saved to value');
               equal(e.text(), v, 'new text shown'); 
               e.remove();    
               start();  
           }, timeout);                     
        }, timeout);                     
    });          
    
});        