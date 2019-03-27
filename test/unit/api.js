module("api", {
  setup: function () {
    fx = $('#async-fixture');
    $.support.transition = false;
  }
});

test("validate, getValue, option", function () {
  var e = $(
    '<a href="#" data-type="text" id="username">user</a>' +
    '<a href="#" data-type="textarea" id="comment">12345</a>' +
    '<a href="#" data-type="select" id="sex" data-value="1" data-source=\'{"1":"q", "2":"w"}\'>q</a>' +
    '<a href="#" data-type="date" id="dob" data-format="dd.mm.yyyy">15.05.1984</a>'
    ).appendTo('#qunit-fixture').editable(),
    e1 = $('#username').editable('option', 'validate', function (value) {
      if ($.trim(value) !== 'user1') return 'username is required';
    }),
    e2 = $('#sex').editable('option', 'validate', function (value) {
      if ($.trim(value) != 2) return 'error';
    });

  //check get value
  var values = e.editable('getValue');

  equal(values.username, 'user', 'username ok');
  equal(values.comment, '12345', 'comment ok');
  equal(values.sex, 1, 'sex ok');
  equal(values.dob, '15.05.1984', 'dob ok');

  //validate
  var errors = e.editable('validate');
  ok(errors.username && errors.sex && !errors.comment, 'validation failed ok');

  //enter correct values
  e1.click();
  var p = tip(e1);
  p.find('input').val('user1');
  p.find('button[type="submit"]').click();
  ok(!p.is(':visible'), 'username changed');

  e2.click();
  p = tip(e2);
  p.find('select').val(2);
  p.find('button[type="submit"]').click();
  ok(!p.is(':visible'), 'sex changed');

  //validate again
  var errors = e.editable('validate');
  ok($.isEmptyObject(errors), 'validation ok');
});

test("getValue with originally empty elements", function () {
  var e = $(
    '<a href="#" data-type="text" id="username"></a>' +
    '<a href="#" data-type="textarea" id="comment"></a>' +
    '<a href="#" data-type="select" id="sex" data-source=\'{"1":"q", "2":"w"}\'></a>' +
    '<a href="#" data-type="date" id="dob"></a>'
  ).appendTo('#qunit-fixture').editable();

  //check get value
  var values = e.editable('getValue');

  equal(values.username, '', 'text empyt value');
  equal(values.comment, '', 'textarea empty value');
  ok(!('sex' in values), 'select value not present');
  ok(!('dob' in values), 'date value not present');
});

test("getValue with isSingle = true", function () {
  var v = '123',
    e = $(
      '<a href="#" data-type="text" id="username">' + v + '</a>' +
      '<a href="#" data-type="textarea" id="comment">456</a>'
    ).appendTo('#qunit-fixture').editable();

  //check get value
  var value = e.editable('getValue', true);
  equal(value, v, 'value ok');
});

asyncTest("'init' event", function () {
  expect(3);
  var e = $('<a href="#" data-pk="1" data-url="post.php" data-name="text1">abc</a>').appendTo(fx);

  e.on('init', function (event, editable) {
    equal(e[0], this, 'scope ok');
    equal(editable.value, 'abc', 'init triggered, value correct');
    setTimeout(function () {
      equal(editable, e.data('editable'), 'editable param ok');
      e.remove();
      start();
    }, timeout);
  });

  e.editable();
});

asyncTest("events: shown / hidden (reason: cancel, onblur, nochange, manual)", function () {
  var val = '1', test_reason,
    e = $('<a href="#" data-pk="1" data-type="select" data-url="post.php" data-name="text" data-value="' + val + '"></a>').appendTo(fx);

  e.on('shown', function (event, edt) {
    //distinguish from native bootstrap popover event
    if (arguments.length != 2) return;
    var editable = $(this).data('editable');
    equal(editable.value, val, 'shown triggered, value correct');
    equal(edt, editable, 'edt param correct');
  });

  e.on('hidden', function (event, reason) {
    //distinguish from native bootstrap popover event
    if (arguments.length != 2) return;
    ok((reason === test_reason) || (test_reason === 'manual' && reason === undefined), 'hidden triggered, reason ok');
  });

  e.editable({
    source: 'groups.php'
  });

  e.click();

  setTimeout(function () {
    var p = tip(e);

    test_reason = 'cancel'
    p.find('.editable-cancel').click();  //cancel
    ok(!p.is(':visible'), 'popover closed ' + test_reason);

    test_reason = 'onblur'
    e.click();
    p = tip(e);
    ok(p.is(':visible'), 'popover shown ' + test_reason);
    e.parent().click();
    ok(!p.is(':visible'), 'popover closed ' + test_reason);

    test_reason = 'nochange'
    e.click();
    p = tip(e);
    ok(p.is(':visible'), 'popover shown ' + test_reason);
    p.find('form').submit();  //submit value without changes
    ok(!p.is(':visible'), 'popover closed ' + test_reason);

    test_reason = 'manual'
    e.click();
    p = tip(e);
    ok(p.is(':visible'), 'popover shown ' + test_reason);
    e.editable('hide');
    ok(!p.is(':visible'), 'popover closed ' + test_reason);

    e.remove();
    start();
  }, timeout);

});

asyncTest("event: save / hidden (reason: save)", function () {
  expect(3);
  var val = '1',
    e = $('<a href="#" data-pk="1" data-type="select" data-url="post.php" data-name="text" data-value="' + val + '"></a>').appendTo(fx);

  e.on('save', function (event, params) {
    equal(params.newValue, 2, 'save triggered, value correct');
    equal(params.submitValue, '2', 'submitValue property correct');
  });

  e.on('hidden', function (event, reason) {
    //distinguish from native bootstrap popover event
    if (arguments.length != 2) return;
    equal(reason, 'save', 'hidden triggered, reason ok');
  });

  e.editable({
    source: groups
  });

  e.click();
  var p = tip(e);
  p.find('select').val(2);
  p.find('form').submit();

  setTimeout(function () {
    e.remove();
    start();
  }, timeout);
});

asyncTest("hide when saving value", function () {
  var newVal = 2,
    e = $('<a href="#" data-pk="1" data-type="select" data-url="post.php" data-name="text" data-value="1"></a>')
      .appendTo(fx)
      .editable({
        source: groupsArr
      });

  e.click();
  var p = tip(e);
  p.find('select').val(2);
  p.find('form').submit();

  e.parent().click();

  ok(p.is(':visible'), 'popover still visible');

  setTimeout(function () {
    equal(e.data('editable').value, newVal, 'new value saved');
    ok(!p.is(':visible'), 'popover closed');

    e.remove();
    start();
  }, timeout);

});

test("show/hide/toggle methods", function () {
  var e = $('<a href="#" data-pk="1" data-url="post.php" data-name="text1">abc</a>').appendTo('#qunit-fixture').editable();
  e.editable('show');
  var p = tip(e);
  ok(p.is(':visible'), 'popover shown');
  e.editable('hide');
  p = tip(e);
  ok(!p.is(':visible'), 'popover closed');
  e.editable('toggle');
  p = tip(e);
  ok(p.is(':visible'), 'popover shown');
});

test("enable/disable/toggleDisabled methods", function () {
  var e = $('<a href="#" data-type="text" data-pk="1" data-url="post.php" data-name="text1">abc</a>').appendTo('#qunit-fixture').editable({
    disabled: true
  });
  ok(e.hasClass('editable-disabled'), 'has disabled class');
  ok(e.hasClass('editable-click'), 'has click class');

  e.click();
  ok(!e.data('editableContainer'), 'nothing on click');

  e.editable('enable');
  ok(!e.hasClass('editable-disabled'), 'does not have disabled class');

  e.click();
  var p = tip(e);
  ok(p.is(':visible'), 'popover shown on click');

  e.editable('disable');
  p = tip(e);
  ok(e.hasClass('editable-disabled'), 'has disabled class');
  ok(!p.is(':visible'), 'popover closed');

  e.editable('toggleDisabled');
  ok(!e.hasClass('editable-disabled'), 'does not have disabled class (toggle)');
});


test("option method (string and object)", function () {
  var e = $('<a href="#" data-url="post.php" data-name="text">abc</a>').appendTo('#qunit-fixture').editable(),
    e1 = $('<a href="#" data-pk="1" data-name="text1">abc</a>').appendTo('#qunit-fixture').editable(),
    url = 'abc';

  $('#qunit-fixture a').editable('option', 'pk', 2);

  equal(e.data('editable').options.pk, 2, 'pk set correctly');
  equal(e1.data('editable').options.pk, 2, 'pk2 set correctly');

  $('#qunit-fixture a').editable('option', {pk: 3, value: 'abcd'});

  equal(e.data('editable').options.pk, 3, 'pk set correctly (by object)');
  equal(e.data('editable').value, 'abcd', 'value set correctly (by object)');
  equal(e.text(), 'abcd', 'text set correctly (by object)');
});

asyncTest("'submit' method: client and server validation errors", function () {
  var ev1 = 'ev1',
    ev2 = 'ev2',
    e1v = 'e1v',
    e = $('<a href="#" class="new-val" data-type="text" data-url="post.php" data-name="text">' + ev1 + '</a>').appendTo(fx).editable({
      validate: function (value) {
        if (value == ev1) return 'invalid';
      }
    }),
    e1 = $('<a href="#" class="new-val" data-type="text" data-name="text1">' + e1v + '</a>').appendTo(fx).editable();

  $.mockjax({
    url: 'new-error.php',
    response: function (settings) {
      equal(settings.data.text, ev2, 'first value ok');
      equal(settings.data.text1, e1v, 'second value ok');
      equal(settings.data.a, 123, 'custom data ok');
      equal(settings.type, 'PUT', 'ajaxOptions ok');
      this.responseText = {
        errors: {
          text1: 'server-invalid'
        }
      };
    }
  });

  $.mockjax({
    url: 'new.php',
    response: function (settings) {
      ok(false, 'should not submit to new.php');
    }
  });

  $(fx).find('.new-val').editable('submit', {
    url: 'new.php',
    error: function (errors) {
      equal(errors.text, 'invalid', 'client validation error ok');
    }
  });

  //change value to pass client side validation
  e.click();
  var p = tip(e);
  p.find('input[type=text]').val(ev2);
  p.find('button[type=submit]').click();

  $(fx).find('.new-val').editable('submit', {
    url: 'new-error.php',
    data: {a: 123},
    success: function (data, config) {
      ok(data.errors, 'errors received from server');
      ok(typeof config.error === 'function', 'config passed correctly');

      if (data && data.id) {
        //success
      } else if (data && data.errors) {
        config.error.call(this, data.errors); //call error from success
      }
    },
    error: function (errors) {
      equal(errors.text1, 'server-invalid', 'server validation error ok');
    },
    ajaxOptions: {
      type: 'PUT',
      dataType: 'json'
    }
  });

  setTimeout(function () {
    e.remove();
    e1.remove();
    start();
  }, timeout);

});


asyncTest("'submit' method: server error", function () {
  var ev1 = 'ev1',
    e1v = 'e1v',
    e = $('<a href="#" class="new-err" data-type="text" data-url="post.php" data-name="text">' + ev1 + '</a>').appendTo(fx).editable(),
    e1 = $('<a href="#" class="new-err" data-type="text" data-name="text1">' + e1v + '</a>').appendTo(fx).editable();

  $(fx).find('.new-err').editable('submit', {
    url: 'error.php',
    error: function (data) {
      equal(this[0], $(fx).find('.new-err')[0], 'success context ok');
      equal(this[1], $(fx).find('.new-err')[1], 'success context2 ok');

      equal(data.status, 500, 'status 500 ok');
      equal(data.responseText, 'customtext', 'server error ok');

      e.remove();
      e1.remove();
      start();
    }
  });

});

asyncTest("'submit' method: success (multiple elems)", function () {
  var ev1 = 'ev1',
    e1v = 'e1v',
    pk = 123,
    e = $('<a href="#" class="new" data-type="text" data-url="post.php" data-name="text">' + ev1 + '</a>').appendTo(fx).editable(),
    e1 = $('<a href="#" class="new" data-type="text" data-name="text1">' + e1v + '</a>').appendTo(fx).editable();

  $.mockjax({
    url: 'new-success.php',
    response: function (settings) {
      equal(settings.data.text, ev1, 'first value ok');
      equal(settings.data.text1, e1v, 'second value ok');
      this.responseText = 'response-body';
    }
  });

  $(fx).find('.new').editable('submit', {
    url: 'new-success.php',
    success: function (data) {
      equal(this[0], $(fx).find('.new')[0], 'success context ok');
      equal(this[1], $(fx).find('.new')[1], 'success context2 ok');
      equal(data, 'response-body', 'response body ok');

      e.remove();
      e1.remove();
      start();
    },
    error: function (errors) {
      ok(false, 'error should not be called');
    }
  });

});

asyncTest("'submit' method: success (single elem)", function () {
  expect(5);

  var ev1 = 'ev1',
    pk = 123,
    e = $('<a href="#" class="new" data-type="text" data-pk="' + pk + '" data-url="submit-single" data-name="text">' + ev1 + '</a>').appendTo(fx).editable({
      success: function (data) {
        equal(data, 'response-body', 'response body ok');
      }
    });

  $.mockjax({
    url: 'submit-single',
    response: function (settings) {
      equal(settings.data.name, 'text', 'name ok');
      equal(settings.data.pk, pk, 'pk ok');
      equal(settings.data.value, ev1, 'value ok');
      equal(settings.data.a, 1, 'extra data ok');
      this.responseText = 'response-body';
    }
  });

  $(fx).find('.new').editable('submit', {
    data: {a: 1}
  });

  setTimeout(function () {
    e.remove();
    start();
  }, timeout);

});

asyncTest("'submit' method: error (single elem)", function () {
  expect(1);

  var e = $('<a href="#" class="new" data-type="text" data-pk="123" data-url="error.php" data-name="text">text</a>').appendTo(fx).editable();

  $(fx).find('.new').editable('submit', {
    error: function () {
      equal(this[0], e[0], 'error called in correct scope');
    }
  });

  setTimeout(function () {
    e.remove();
    start();
  }, timeout);

});


test("setValue method", function () {
  var e = $('<a href="#" data-name="name" data-type="select" data-url="post.php"></a>').appendTo('#qunit-fixture').editable({
    value: 1,
    source: groups
  });

  equal(e.data('editable').value, 1, 'value correct');
  equal(e.text(), groups[1], 'text shown correctly');

  //open editable to check update of input
  e.click();
  var p = tip(e);

  equal(p.find('select').find('option').length, size, 'options loaded');
  equal(p.find('select').val(), e.data('editable').value, 'selected value correct');

  e.editable('setValue', 2);

  equal(e.data('editable').value, 2, 'new value correct');
  equal(e.text(), groups[2], 'new text shown correctly');
  equal(p.find('select').val(), e.data('editable').value, 'new selected value correct');
});


test("`destroy` method", function () {
  var e = $('<a href="#" data-name="name" data-type="text" data-url="post.php"></a>').appendTo('#qunit-fixture').editable({});

  e.click();
  var p = tip(e);
  ok(p.is(':visible'), 'container visible');
  equal(e.text(), 'Empty', 'emptytext shown');

  e.editable('destroy');

  ok(!p.is(':visible'), 'container closed');
  ok(!e.data('editable'), 'editable instance removed');
  ok(!e.data('editableContainer'), 'editableContainer instance removed');
  ok(!e.hasClass('editable'), 'editable class removed');
  ok(!e.hasClass('editable-click'), 'editable-click class removed');

  equal(e.text(), '', 'emptytext removed');


  e.click();

});


asyncTest("'validate' that change value", function () {
  expect(3);

  var e = $('<a href="#" data-type="text" data-pk="1" data-url="validate-change-ok" data-name="text">abc</a>').appendTo(fx).editable({
    validate: function (value) {
      return {newValue: 'newval'};
    }
  });


  $.mockjax({
    url: 'validate-change-ok',
    response: function (settings) {
      equal(settings.data.value, 'newval', 'validate-change-ok');
      this.responseText = '';
    }
  });

  //change value to pass client side validation
  e.click();
  var p = tip(e);
  p.find('input[type=text]').val('cde');
  p.find('button[type=submit]').click();

  setTimeout(function () {
    equal(e.data('editable').value, 'newval', 'new value saved');
    ok(!p.is(':visible'), 'popover closed');

    e.remove();
    start();
  }, timeout);

});

asyncTest("'validate' that change value and shows message", function () {
  expect(3);

  var e = $('<a href="#" data-type="text" data-url="validate-change-error" data-name="text">abc</a>').appendTo(fx).editable({
    validate: function (value) {
      return {newValue: 'newval', msg: 'error!'};
    }
  });


  $.mockjax({
    url: 'validate-change-error',
    response: function (settings) {
      ok(true, 'should not call');
      this.responseText = '';
    }
  });

  //change value to pass client side validation
  e.click();
  var p = tip(e);
  p.find('input[type=text]').val('cde');
  p.find('button[type=submit]').click();

  setTimeout(function () {
    ok(p.is(':visible'), 'popover visible');
    equal(p.find('input[type=text]').val(), 'newval', 'new value shown in input');
    equal(p.find('.editable-error-block').text(), 'error!', 'error msg shown');

    e.remove();
    start();
  }, timeout);

});

