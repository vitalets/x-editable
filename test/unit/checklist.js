$(function () {
   
    module("checklist", {
        setup: function(){
            sfx = $('#qunit-fixture'),
            fx = $('#async-fixture');               
            $.support.transition = false;
        }
    });  
   
    asyncTest("should load options, set correct value and save new value", function () {
         var sep = '-',
             newValue,
             e = $('<a href="#" data-type="checklist" data-url="post.php"></a>').appendTo(fx).editable({
             pk: 1,
             source: groupsArr,
             value: [2, 3],
             viewseparator: sep
        });
           
        equal(e.text(), groups[2]+sep+groups[3], 'autotext ok');
        
        e.click();
        var p = tip(e);
        equal(p.find('input[type="checkbox"]').length, groupsArr.length, 'checkboxes rendered');
        equal(p.find('input[type="checkbox"]:checked').length, 2, 'checked count ok');
        equal(p.find('input[type="checkbox"]:checked').eq(0).val(), 2, '1st checked');
        equal(p.find('input[type="checkbox"]:checked').eq(1).val(), 3, '2nd checked');

        //set new value
        p.find('input[type="checkbox"]:checked').eq(0).click(); 
        p.find('input[type="checkbox"]').first().click();
        newValue = p.find('input[type="checkbox"]').first().val();
        
        //submit
        p.find('form').submit(); 
         
         setTimeout(function() {
               ok(!p.is(':visible'), 'popup closed');
               
               equal(e.data('editable').value.join(''), [newValue, 3].join(''), 'new value ok')
               equal(e.text(), groups[newValue]+sep+groups[3], 'new text ok');
              
               // open container again to see what checked
               e.click()
               p = tip(e);
               
               equal(p.find('input[type="checkbox"]').length, groupsArr.length, 'checkboxes rendered');
               equal(p.find('input[type="checkbox"]:checked').length, 2, 'checked count ok');
               equal(p.find('input[type="checkbox"]:checked').eq(0).val(), newValue, '1st checked');
               equal(p.find('input[type="checkbox"]:checked').eq(1).val(), 3, '2nd checked');               
               
               e.remove();    
               start();  
         }, timeout);                              
    });                  
   
     asyncTest("limit option", function () {
         var e = $('<a href="#" data-type="checklist" data-value="2,3" data-url="post.php"></a>').appendTo(fx).editable({
             pk: 1,
             source: groupsArr,
             limit: 1,
             limitText: '{checked} of {count}'
        });
           
        equal(e.text(), '2 of '+groupsArr.length, 'autotext ok');
        
        e.click();
        var p = tip(e);

        equal(p.find('input[type="checkbox"]:checked').length, 2, 'checked count ok');
        equal(p.find('input[type="checkbox"]:checked').eq(0).val(), 2, '1st checked');
        equal(p.find('input[type="checkbox"]:checked').eq(1).val(), 3, '2nd checked');

        //set new value
        p.find('input[type="checkbox"]').first().click();
        newValue = p.find('input[type="checkbox"]').first().val();
        
        //submit
        p.find('form').submit(); 
         
         setTimeout(function() {
               ok(!p.is(':visible'), 'popup closed');
               
               equal(e.text(), '3 of '+groupsArr.length, 'autotext ok');
               
               e.remove();    
               start();  
         }, timeout);                              
    });   
   
     
});