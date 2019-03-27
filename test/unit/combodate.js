//formats
var
  fd = 'DD.MM.YYYY', vfd = 'DD-MM-YYYY', vd = '15-05-1984',
  fdt = 'DD-MM-YYYY hh:mm:ss A', vfdt = 'DD MMM YYYY h:m:s a', vdt = '15-05-1984 08:20:30 PM';


module("combodate", {
  setup: function () {
    fx = $('#async-fixture');
    $.support.transition = false;
  }
});

test("combodate options can be defined in data-combodate param", function () {
  var e = $('<a href="#" data-type="combodate" data-combodate="{minYear: 2000, maxYear: 2001}" data-pk="1" data-url="/combodate"></a>').appendTo('#qunit-fixture').editable({
      format: fd,
      viewformat: vfd,
      template: fd
    }),
    m = moment(vd, vfd);

  e.click();
  var p = tip(e);
  equal(p.find('.year option').length, 3, 'years applied correct');
});


asyncTest("container should contain combodate and save new value (date)", function () {

  var e = $('<a href="#" data-type="combodate" data-pk="1" data-url="/combodate">' + vd + '</a>').appendTo(fx).editable({
      format: fd,
      viewformat: vfd,
      template: fd
    }),
    m = moment(vd, vfd);

  $.mockjax({
    url: '/combodate',
    response: function (settings) {
      equal(settings.data.value, m.format(fd), 'submitted value correct');
    }
  });

  equal(e.data('editable').value.format(fd), m.format(fd), 'init value correct');

  e.click();
  var p = tip(e);
  ok(p.is(':visible'), 'container visible');
  equal(p.find('.day, .month, .year, .hour, .minute').filter(':visible').length, 3, 'combos correct');
  equal(p.find('.day').val(), m.date(), 'day set correct');
  equal(p.find('.month').val(), m.month(), 'month set correct');
  equal(p.find('.year').val(), m.year(), 'year set correct');

  //set new day
  p.find('.day').val(16).trigger('change');
  m.date(16);
  p.find('form').submit();

  setTimeout(function () {
    ok(!p.is(':visible'), 'container closed');
    equal(e.data('editable').value.format(fd), m.format(fd), 'new value correct');
    equal(e.text(), m.format(vfd), 'new text correct');
    e.remove();
    start();
  }, timeout);

});

asyncTest("container should contain combodate and save new value (datetime)", function () {

  var e = $('<a href="#" data-type="combodate" data-pk="1" data-url="/combodate-dt" data-value="' + vdt + '"></a>').appendTo(fx).editable({
      format: fdt,
      viewformat: vfdt,
      template: fdt
    }),
    m = moment(vdt, fdt);

  $.mockjax({
    url: '/combodate-dt',
    response: function (settings) {
      equal(settings.data.value, m.format(fdt), 'submitted value correct');
    }
  });

  equal(e.data('editable').value.format(fdt), m.format(fdt), 'init value correct');
  equal(e.text(), m.format(vfdt), 'init text correct');

  e.click();
  var p = tip(e);
  ok(p.is(':visible'), 'container visible');
  equal(p.find('.day, .month, .year, .hour, .minute, .second, .ampm').filter(':visible').length, 7, 'combos correct');

  equal(p.find('.day').val(), m.date(), 'day set correct');
  equal(p.find('.month').val(), m.month(), 'month set correct');
  equal(p.find('.year').val(), m.year(), 'year set correct');
  equal(p.find('.hour').val(), m.hours() - 12, 'hour set correct');
  equal(p.find('.minute').val(), m.minutes(), 'minute set correct');
  equal(p.find('.second').val(), m.seconds(), 'second set correct');
  equal(p.find('.ampm').val(), 'pm', 'ampm set correct');

  //set new day
  p.find('.day').val(16).trigger('change');
  p.find('.hour').val(9).trigger('change');
  m.date(16);
  m.hours(21);
  p.find('form').submit();

  setTimeout(function () {
    ok(!p.is(':visible'), 'container closed');
    equal(e.data('editable').value.format(fdt), m.format(fdt), 'new value correct');
    equal(e.text(), m.format(vfdt), 'new text correct');
    e.remove();
    start();
  }, timeout);

});

