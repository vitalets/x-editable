(function($) {
 
   module("common", {
       setup: function() {
           fx = $('#async-fixture');
           $.support.transition = false;
       }
  });
    
      test("should be defined on jquery object", function () {
        var div = $("<div id='modal-test'></div>")
        ok(div.editable, 'editable method is defined')
      });
      
      test("should return element", function () {
        var div = $('<div id="a"></div>');
        ok(div.editable() == div, 'element returned');
      });  
      
      test("should expose defaults var for settings", function () {
        ok($.fn.editable.defaults, 'default object exposed');
      });    
      
      test("should store editable instance in data object", function () {
        var editable = $('<a href="#" id="a">link</a>').editable();
        ok(!!editable.data('editable'), 'editable instance exists');
      });      
      
      test("should add 'editable' class when applied", function () {
        var editable = $('<a href="#" id="a">link</a>').appendTo('#qunit-fixture').editable();
        ok($('.editable').length, 'editable class exists');
      });
      
     test("container should be close when element is removed from dom", function () {
        var e = $('<a href="#" data-pk="1" data-url="post.php" data-name="text1">abc</a>').appendTo('#qunit-fixture').editable(),
            e1 = $('<a href="#" data-pk="1" data-url="post.php" data-name="text2">abc</a>').appendTo('#qunit-fixture').editable().wrap('<div>');
        
        e.click();
        var p = tip(e);
        ok(p.is(':visible'), 'popover shown');
        e.remove();
        ok(!p.is(':visible'), 'popover closed');
     });       
      
//      test("should store name and value and lastSavedValue", function () {
      test("should store name and value", function () {
        var v = 'abr><"&<b>e</b>',
            visible_v = 'abr><"&e',
            esc_v = $('<div>').text(v).html(),
            e = $('<a href="#123" data-name="abc" data-value="123">qwe</a>').appendTo('#qunit-fixture').editable(),
            e2 = $('<a href="#" id="a2">'+v+'</a>').appendTo('#qunit-fixture').editable(),
            e3 = $('<a href="#" id="a3">'+esc_v+'</a>').appendTo('#qunit-fixture').editable();
       
        equal(e.data('editable').options.name, 'abc', 'name exists');
        equal(e.data('editable').value, '123', 'value exists');
//        equal(e.data('editable').lastSavedValue, '123', 'lastSavedValue exists');
        
        equal(e2.data('editable').value, visible_v, 'value taken from elem content correctly');     
//        equal(e2.data('editable').lastSavedValue, visible_v, 'lastSavedValue taken from text correctly');  
        
        equal(e3.data('editable').value, v, 'value taken from elem content correctly (escaped)');     
//        equal(e3.data('editable').lastSavedValue, v, 'lastSavedValue taken from text correctly (escaped)');             
      }); 
      
      test("should take container's title from json options", function () {
        //do not test inline  
        if(fc.c === 'inline') {
            expect(0);
            return;
        }
        
        var title = 'abc',
        //add to fx because qunit-fixture has wrong positioning
        e = $('<a href="#" id="a"></a>').appendTo(fx).editable({
              placement: 'bottom',
              title: title
        });

        e.click();
        var p = tip(e); 
        ok(p.is(':visible'), 'popover shown');

        //todo: for jqueryui phantomjs calcs wrong position. Need investigation
        if(!$.browser.webkit && fc.f !== 'jqueryui') {
            ok(p.offset().top > e.offset().top, 'placement ok');
        }
        
        //check title
        ok(p.find(':contains("'+title+'")').length, 'title ok');
        e.remove();
      });   
      
      test("should close all other containers on click on editable", function () {
        var e1 = $('<a href="#" data-pk="1" data-url="post.php" id="a">abc</a>').appendTo('#qunit-fixture').editable(),  
            e2 = $('<a href="#" data-pk="1" data-url="post.php" id="b">abcd</a>').appendTo('#qunit-fixture').editable();  
                                                                      
        e1.click()
        var p1 = tip(e1);
        ok(p1.is(':visible'), 'popover1 visible');
        
        e2.click()
        var p2 = tip(e2);
        ok(p2.is(':visible'), 'popover2 visible');
        ok(!p1.is(':visible'), 'popover1 closed');
        
        p2.find('button[type=button]').click();
        ok(!p2.is(':visible'), 'popover2 closed');
      });
      
     test("click outside container should hide it", function () {
        var e = $('<a href="#" data-pk="1" data-url="post.php" data-name="text1">abc</a>').appendTo('#qunit-fixture').editable(),
            e1 = $('<div>').appendTo('body');
        
        e.click();
        var p = tip(e);
        ok(p.is(':visible'), 'popover shown');
        
        p.click();
        ok(p.is(':visible'), 'popover still shown');
        
        e1.click();
        ok(!p.is(':visible'), 'popover closed');
     });        
      
     test("should not wrap buttons when parent has position:absolute", function () {
        var  d = $('<div style="position: absolute; top: 200px">').appendTo(fx),
             e = $('<a href="#" data-pk="1" data-url="post.php" data-name="text1">abc</a>').appendTo(d).editable();
            
        e.click();
        var p = tip(e);
        ok(p.find('button').offset().top < p.find('.editable-input').offset().top + p.find('.editable-input').height(), 'buttons top ok');
        ok(p.find('button').offset().left > p.find('.editable-input').offset().left + p.find('.editable-input').width(), 'buttons left ok');
       
        d.remove();
     });       
      
      //unfortunatly, testing this feature does not always work in browsers. Tested manually.
      /*
       test("enablefocus option", function () {
            // focusing not passed in phantomjs
            if($.browser.webkit) {
                ok(true, 'skipped in PhantomJS');
                return;
            }
            
            var e = $('<a href="#">abc</a>').appendTo('#qunit-fixture').editable({
              enablefocus: true
            }),
             e1 = $('<a href="#">abcd</a>').appendTo('#qunit-fixture').editable({
              enablefocus: false
            });            
            
            e.click()
            var p = tip(e);
            ok(p.is(':visible'), 'popover 1 visible');
            p.find('button[type=button]').click();
            ok(!p.is(':visible'), 'popover closed');            
            ok(e.is(':focus'), 'element 1 is focused');            
            
            e1.click()
            p = tip(e1);
            ok(p.is(':visible'), 'popover 2 visible');
            p.find('button[type=button]').click();
            ok(!p.is(':visible'), 'popover closed');            
            ok(!e1.is(':focus'), 'element 2 is not focused');            
      });
     */
          
}(jQuery));  