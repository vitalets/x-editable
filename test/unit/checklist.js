$(function () {
   
    module("checklist", {
        setup: function(){
            sfx = $('#qunit-fixture'),
            fx = $('#async-fixture'); 
            $.support.transition = false;              
        }
    });  
   
    asyncTest("should load options, set correct value and save new value", function () {
         var sep = '<br>',
             newValue,
             e = $('<a href="#" data-type="checklist" data-url="post-checklist.php"></a>').appendTo(fx).editable({
             pk: 1,
             source: groupsArr,
             value: [2, 3]
        });
           
        equal(e.html().toLowerCase(), (groups[2]+sep+groups[3]).toLowerCase(), 'autotext ok');
        
          $.mockjax({
              url: 'post-checklist.php',
              response: function(settings) {
                 ok($.isArray(settings.data.value), 'value submitted as array');
                 equal(settings.data.value.sort().join(''), [newValue, 3].join(''), 'submitted array correct');
              }
          });         
        
        
        e.click();
        var p = tip(e);
        equal(p.find('input[type="checkbox"]').length, groupsArr.length, 'checkboxes rendered');
        equal(p.find('input[type="checkbox"]:checked').length, 2, 'checked count ok');
        equal(p.find('input[type="checkbox"]:checked').eq(0).val(), 2, '1st checked');
        equal(p.find('input[type="checkbox"]:checked').eq(1).val(), 3, '2nd checked');

        //set new value
        p.find('input[type="checkbox"]:checked').eq(0).click();  //uncheck 2
        p.find('input[type="checkbox"]').first().click(); //check first 
        newValue = p.find('input[type="checkbox"]').first().val();
        
        //submit
        p.find('form').submit(); 
         
         setTimeout(function() {
               ok(!p.is(':visible'), 'popup closed');
               
               equal(e.data('editable').value.join(''), [newValue, 3].join(''), 'new value ok')
               equal(e.html().toLowerCase(), (groups[newValue]+'<br>'+groups[3]).toLowerCase(), 'new text ok');
              
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
    
    test("should show checked for single value", function () {
        var e = $('<a href="#" data-type="checklist" data-value="1"></a>').appendTo('#qunit-fixture').editable({
             pk: 1,
             source: groupsArr
        });
        
        e.click();
        var p = tip(e);
        equal(p.find('input[type="checkbox"]:checked').length, 1, 'checked count ok');        
    });
     
});