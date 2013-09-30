$(function () {
   
    module("typeaheadjs", {
        setup: function(){
            sfx = $('#qunit-fixture'),
            fx = $('#async-fixture');               
            $.support.transition = false;
        }
    });  

    asyncTest("should load correct value and save new entered text ", function () {
        var v = 'ru', 
          e = $('<a href="#" data-pk="1" data-name="text1" data-type="typeaheadjs" data-url="post.php"></a>').appendTo(fx).editable({
            value: v,
            typeahead: {
                name: 'country',
                local: [
                    {value: 'ru', tokens: ['Russia']}, 
                    {value: 'gb', tokens: ['Great Britain']}, 
                    {value: 'us', tokens: ['United States']}
                ],
                template: function(item) {
                    return item.tokens[0] + ' (' + item.value + ')'; 
                } 
            }   
          }),
          nv = 'gb',
          newText = 'G';
          
        equal(e.data().editable.value, v, 'initial value ok');    

        e.click();
        var p = tip(e), 
           $input = p.find('input.tt-query');
           
        ok(p.is(':visible'), 'popup visible');
        ok($input.length, 'input exists');
        equal($input.val(), v, 'input contains correct text');
        ok($input.typeahead, 'typeahead applied to input');
        
        // can`t find way to trigger dropdown menu of typeahead
        var ev = jQuery.Event( "keydown.tt", { keyCode: 64 } );
        $input.val(nv).trigger('queryChanged');
                   
        /*
        ok(p.find('.tt-dropdown-menu').is(':visible'), 'dropdown visible');
        equal(p.find('tt-suggestion').length, 1, 'suggestion exists');
        p.find('tt-suggestion:eq(0)').mouseover().click();
        equal($input.val(), nv, 'input contain correct text');
        */
                
        p.find('form').submit(); 
   
                                 
        setTimeout(function() {
           ok(!p.is(':visible'), 'popup closed');
           equal(e.data('editable').value, nv, 'new text saved to value');
           equal(e.text(), nv, 'new text shown'); 

           e.remove();    
           start();                     
        }, timeout);                     
    });      
    
    
});