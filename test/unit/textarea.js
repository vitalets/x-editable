module("textarea", {
  setup: function () {
    fx = $('#async-fixture');
    $.support.transition = false;
  }
});

test("textarea should contain '' if element is empty", function () {
  var e = $('<a href="#" data-type="textarea"></a>').appendTo('#qunit-fixture').editable()
  e.click()
  var p = tip(e);
  ok(p.find('textarea').length, 'textarea exists')
  ok(!p.find('textarea').val().length, 'textrea is empty')
  p.find('.editable-cancel').click();
  ok(!p.is(':visible'), 'popover was removed')
})

test("placeholder", function () {
  var e = $('<a href="#" data-type="textarea"></a>').appendTo('#qunit-fixture').editable({placeholder: 'abc'})
  e.click()
  var p = tip(e);
  equal(p.find('textarea').attr('placeholder'), 'abc', 'placeholder exists');
  p.find('.editable-cancel').click();
  ok(!p.is(':visible'), 'popover was removed');
})


asyncTest("should load correct value and save new entered text (and value)", function () {
  var e = $('<a href="#" data-pk="1" data-url="post.php">abb&c"</a>').appendTo(fx).editable({
    type: 'textarea',
    send: 'ifpk',
    success: function (response, newvalue) {
      equal(newvalue, 'a!b<b>\'c', 'value in success ok');
    }
  });

  e.click()
  var p = tip(e);
  ok(p.is(':visible'), 'popover visible');
  ok(p.find('textarea').length, 'textarea exists');
  equal(p.find('textarea').val(), e.data('editable').value, 'textrea val equal text');

  p.find('textarea').val('a!b<b>\'c');
  p.find('form').submit();

  setTimeout(function () {
    ok(!p.is(':visible'), 'popover closed')
    equal(e.data('editable').value, 'a!b<b>\'c', 'new text saved to value')
    equal(e.text().toLowerCase(), 'a!b<b>\'c'.toLowerCase(), 'new text shown')
    e.remove();
    start();
  }, timeout);
})

asyncTest("should keep newlines on show and on save", function () {
  var v = '12\n56',
    e = $('<a href="#" data-type="textarea" data-pk="1" data-url="post.php">' + v + '</a>').appendTo(fx).editable(),
    vnew = "12\n3<b>4\n56\n\n78",
    vnew2 = "12\n3&lt;b&gt;4\n56\n\n78";

  equal(e.data('editable').value, v, '\\n preserved');

  e.click();
  var p = tip(e);
  equal(p.find('textarea').val(), e.data('editable').value, 'textarea contains correct value');

  p.find('textarea').val(vnew)
  p.find('form').submit();

  setTimeout(function () {
    ok(!p.is(':visible'), 'popover closed')
    equal(e.data('editable').value, vnew, 'new text saved to value')
    equal(e.html().toLowerCase(), vnew2.toLowerCase(), 'new text shown')
    e.remove();
    start();
  }, timeout);
});


asyncTest("submit by ctrl+enter", function () {
  expect(2);
  var v = '12<br>3&lt;i&gt;4<br />56',
    e = $('<a href="#" data-type="textarea" data-pk="1" data-url="post.php">' + v + '</a>').appendTo(fx).editable(),
    vnew = 'sdfg',
    event;

  e.click();
  var p = tip(e);
  p.find('textarea').val(vnew);

  var event = jQuery.Event("keydown");
  event.ctrlKey = true;
  event.which = 13;

  p.find('textarea').trigger(event);

  setTimeout(function () {
    ok(!p.is(':visible'), 'popover closed');
    equal(e.data('editable').value, vnew, 'new text saved to value');
    e.remove();
    start();
  }, timeout);
})
   
