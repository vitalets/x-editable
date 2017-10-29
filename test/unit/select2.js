$(function () {

    module("select2", {
        setup: function(){
            sfx = $('#qunit-fixture'),
            fx = $('#async-fixture');
            $.support.transition = false;
        }
    });

     asyncTest("local: init-change-save (not multiple)", function () {
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
        var $input = p.find('select');
        ok($input.length, 'input exists');
        ok($input.select2, 'select2 applied');
        equal($input.val(), e.data('editable').value, 'selected value correct');
        equal(p.find('.select2-selection').text(), text, 'selected text correct');

        //select new value
        s = 1;
        text = 'text1';
        $input.val(s).trigger('change');

        equal($input.val(), s, 'new value ok');
        equal(p.find('.select2-selection').text(), text, 'new text ok');

        p.find('form').submit();

        setTimeout(function() {
            ok(!p.is(':visible'), 'popover closed');
            equal(e.data('editable').value, s, 'new value ok');
            equal(e.text(), text, 'new text ok');

            e.remove();
            start();
        }, timeout);
     });

     asyncTest("local: init-change-save (multiple)", function () {
        var s = '2,3', text = 'text2, text3',
            e = $('<a href="#" data-type="select2" data-name="select2" data-value="'+s+'"></a>').appendTo(fx).editable({
            source: [{id: 1, text: 'text1'}, {id: 2, text: 'text2'}, {id: 3, text: 'text3'}],
            select2: {
                multiple: true
            }
        });

        console.log('init', e.data('editable').value)

        //autotext
        equal(e.data('editable').value.join(','), s, 'initial value ok');
        equal(e.text(), text, 'intial text ok');

        e.click();
        var p = tip(e);

        ok(p.is(':visible'), 'popover visible');
        var $input = p.find('select');
        ok($input.length, 'input exists');
        ok($input.data('select2'), 'select2 applied');
        equal($input.val(), s, 'selected value ok');
        equal(p.find('.select2-selection__choice').length, 2, 'selected text ok');
        equal(p.find('.select2-selection__choice').eq(0).text().substr(1), 'text2', 'text2 ok');
        equal(p.find('.select2-selection__choice').eq(1).text().substr(1), 'text3', 'text3 ok');

        //select new value
        s = '1,2';
        text = 'text1, text2';
        $input.val([1, 2]).trigger('change');

        equal($input.val(), s, 'new value ok');
        equal(p.find('.select2-selection__choice').length, 2, 'new text ok');
        equal(p.find('.select2-selection__choice').eq(0).text().substr(1), 'text1', 'text1 ok');
        equal(p.find('.select2-selection__choice').eq(1).text().substr(1), 'text2', 'text2 ok');

        p.find('form').submit();

        setTimeout(function() {
            ok(!p.is(':visible'), 'popover closed');
            equal(e.data('editable').value, s, 'new value ok');
            equal(e.text(), text, 'new text ok');

            e.remove();
            start();
        }, timeout);
     });

    asyncTest("local: tags (simple array)", function () {
        var s = 'text2,abc', text = 'text2, abc',
            e = $('<a href="#" data-type="select2" data-name="select2">'+text+'</a>').appendTo(fx).editable({
            viewseparator: ', ',
            select2: {
                tags: ['text1', 'text2']
            }
        });

        console.log('init', e.data('editable'))

        equal(e.data('editable').value.join(','), s, 'initial value ok');

        e.click();
        var p = tip(e);

        ok(p.is(':visible'), 'popover visible');
        var $input = p.find('select');
        ok($input.length, 'input exists');
        ok($input.data('select2'), 'select2 applied');
        equal($input.val(), s, 'selected value ok');
        equal(p.find('.select2-selection__choice').length, 2, 'selected text ok');
        equal(p.find('.select2-selection__choice').eq(0).text().substr(1), 'text2', 'text2 ok');
        equal(p.find('.select2-selection__choice').eq(1).text().substr(1), 'abc', 'abc ok');

        $input.append(new Option('cde', 'cde'));

        //select new value
        s = 'text1,cde';
        text = 'text1, cde';
        $input.val(['text1', 'cde']).trigger('change');

        equal($input.val().join(','), s, 'new value ok');
        equal(p.find('.select2-selection__choice').length, 2, 'new text ok');
        equal(p.find('.select2-selection__choice').eq(0).text().substr(1), 'text1', 'text1 ok');
        equal(p.find('.select2-selection__choice').eq(1).text().substr(1), 'cde', 'cde ok');

        console.log('pre-submit');
        p.find('form').submit();
        console.log('post-submit')

        setTimeout(function() {
            ok(!p.is(':visible'), 'popover closed');
            equal(e.data('editable').value.join(','), s, 'new value ok');
            equal(e.text(), text, 'new text ok');

            e.remove();
            start();
        }, timeout);
     });


    asyncTest("local: tags with space separator", function () {
        var sep = ' ', vsep = '-',
            s = 'a,text2 abc d',
            text = 'a,text2-abc-d',
            e = $('<a href="#" data-type="select2" data-name="select2" data-value="'+s+'"></a>').appendTo(fx).editable({
            viewseparator: vsep,
            select2: {
              tags: [],
              separator: sep
            }
        });

        equal(e.data('editable').value.join(sep), s, 'initial value ok');
        equal(e.data('editable').value.join(vsep), text, 'initial text ok');

        e.click();
        var p = tip(e);

        ok(p.is(':visible'), 'popover visible');
        var $input = p.find('select');
        ok($input.length, 'input exists');
        ok($input.data('select2'), 'select2 applied');
        equal($input.val().join(sep), s, 'selected value ok');

        equal(p.find('.select2-selection__choice').length, 3, 'selected text ok');
        equal(p.find('.select2-selection__choice').eq(0).text().substr(1), 'a,text2', 'text2 ok');
        equal(p.find('.select2-selection__choice').eq(1).text().substr(1), 'abc', 'abc ok');
        equal(p.find('.select2-selection__choice').eq(2).text().substr(1), 'd', 'd ok');


        $input.append(new Option('a,text1', 'a,text1'));
        $input.append(new Option('cde', 'cde'));

        //select new value
        s = 'a,text1 cde';
        text = 'a,text1-cde';
        $input.val(['a,text1', 'cde']).trigger('change');

        equal($input.val().join(sep), s, 'new value ok');
        equal(p.find('.select2-selection__choice').length, 2, 'new text ok');
        equal(p.find('.select2-selection__choice').eq(0).text().substr(1), 'a,text1', 'text1 ok');
        equal(p.find('.select2-selection__choice').eq(1).text().substr(1), 'cde', 'cde ok');

        p.find('form').submit();

        setTimeout(function() {
            ok(!p.is(':visible'), 'popover closed');
            equal(e.data('editable').value.join(sep), s, 'new value ok');
            equal(e.text(), text, 'new text ok');

            e.remove();
            start();
        }, timeout);
     });
 /*
 asyncTest("local: tags (array of objects)", function () {
        var s = 'text2,abc', text = 'text2, abc',
            e = $('<a href="#" data-type="select2" data-name="select2"></a>').appendTo(fx).editable({
            viewseparator: ', ',
            value: [1, 2],
            select2: {
                tags: [{id: 1, text: 'text1'}, {id: 2, text: 'text2'}]
            }
        });

        equal(e.text(), 'text1, text2', 'initial text ok');

        e.click();
        var p = tip(e);

        ok(p.is(':visible'), 'popover visible');
        var $input = p.find('input[type="hidden"]');
        ok($input.length, 'input exists');
        ok($input.select2, 'select2 applied');
        equal($input.val(), '1,2', 'selected value ok');
        equal(p.find('.select2-search-choice > div').length, 2, 'selected text ok');
        equal(p.find('.select2-search-choice > div').eq(0).text(), 'text1', 'text1 ok');
        equal(p.find('.select2-search-choice > div').eq(1).text(), 'text2', 'text2 ok');

        //select new value
//        s = 'text1,cde';
 //       text = 'text1, cde';
        $input.select2('val', [1]);

        equal($input.val(), '1', 'new value ok');
        equal(p.find('.select2-search-choice > div').length, 1, 'new text ok');
        equal(p.find('.select2-search-choice > div').eq(0).text(), 'text1', 'text1 ok');

        p.find('form').submit();

        setTimeout(function() {
            ok(!p.is(':visible'), 'popover closed');
            equal(e.data('editable').value.length, 1, 'new value ok');
            equal(e.text(), 'text1', 'new text ok');

            e.remove();
            start();
        }, timeout);
     });
 */

     test("local: setValue + x-editable source", function () {
        var e = $('<a href="#" data-type="select2" data-name="select2" data-value="1">test2</a>').appendTo('#qunit-fixture').editable({
               source: [{value: 1, text: 'text1'}, {value: 2, text: 'text2'}, {value: 3, text: 'text3'}]
            });

        //autotext
        equal(e.data('editable').value, 1, 'initial value ok');

        //setValue before open
 		e.editable('setValue', 2);
 		equal(e.data('editable').value, 2, 'value ok');
 		equal(e.text(), 'text2', 'text ok');

        //open
        e.click();
        var p = tip(e);
        p.find('.editable-cancel').click();

        //setValue after hide
        e.editable('setValue', 3);
        equal(e.data('editable').value, 3, 'value ok');
        equal(e.text(), 'text3', 'text ok');
     });

    asyncTest("remote: init-change-save, just url (not multiple)", function () {
        var s = 2, text = groups[s],
            newVal = 0, newText = groups[newVal],
            e = $('<a href="#" data-type="select2" data-name="select2" data-value="'+s+'">'+text+'</a>').appendTo(fx).editable({
                source: 'groupsArr2'
            });

        //autotext
        equal(e.data('editable').value, s, 'initial value ok');
        equal(e.text(), text, 'intial text ok');

        e.click();
        var p = tip(e);

        ok(p.is(':visible'), 'popover visible');

        var $input = p.find('select');

        ok($input.length, 'input exists');
        ok($input.data('select2'), 'select2 applied');

        setTimeout(function() {
           equal($input.val(), e.data('editable').value, 'selected value correct');
           equal(p.find('.select2-selection').text(), text, 'selected text correct');

           $input.select2('open');

           equal($('.select2-results li').length, groupsArr2.length, 'items loaded');
           equal($('.select2-results__option--highlighted').text(), text, 'highlight ok');

           //select new value (0)
           $('.select2-results li').eq(newVal).mouseup();
           equal(p.find('.select2-selection').text(), newText, 'new selected text ok');

           //submit
           p.find('form').submit();

           setTimeout(function() {
               ok(!p.is(':visible'), 'popover closed');
               equal(e.data('editable').value, newVal, 'new value ok');
               equal(e.text(), newText, 'new text ok');

               //open again
               e.click();
               p = tip(e);
               equal(p.find('.select2-selection').text(), newText, 'text ok on second open');
               equal($input.val(), newVal, 'selected value ok on second open');

               //setValue in closed state
               p.find('.editable-cancel').click();
               e.editable('setValue', 1);
               equal(e.data('editable').value, 1, 'setValue: value ok');
               equal(e.text(), groups[1], 'setValue: text ok');

               e.remove();
               start();
           }, timeout);
        }, timeout);
     });

    test("remote: initially empty", function () {
        var s = 2, text = groups[s],
            newVal = 0, newText = groups[newVal],
            e = $('<a href="#" data-type="select2" data-name="select2"></a>').appendTo(sfx).editable({
                source: 'groupsArr2',
                select2: {
                    placeholder: 'placeholder'
                }
            });

        e.click();
        var p = tip(e);

        ok(p.is(':visible'), 'popover visible');
        equal(p.find('.select2-selection').text(), 'placeholder', 'placeholder shown in select2');
    });

    asyncTest("remote: custom id, custom text, init selection (not multiple)", function () {
        var s = 2,
            data = [
            {cid: 1, name: '111'},
            {cid: 2, name: '222'}
            ],
            idIndex,
            text = '222', req = 0,
            newVal = 0, newText = groups[newVal],
            e = $('<a href="#" data-type="select2" data-name="select2" data-value="'+s+'">'+text+'</a>').appendTo(fx).editable({
                pk: 1,
                select2: {
                   minimumInputLength: 1,
                   id: function (e) {
                       return e.cid;
                   },
                   ajax: {
                       url: '/select2list',
                       dataType: 'json',
                       data: function (term, page) {
                           return { query: term };
                       },
                       results: function (data, page) {
                           return { results: data };
                       }
                   },
                   formatResult: function (e) {
                       return e.name;
                   },
                   formatSelection: function (e) {
                       return e.name;
                   },
                   initSelection: function (element, callback) {
                       console.log('initSelection');
                       return $.get('/select2id', { query: element.val() }, function (data) {
                           callback(data);
                       }, 'json');
                   }
                }
            });

       //mocks
       $.mockjax({
           url: '/select2list',
           responseTime: 50,
           response: function() {
               req++;
               this.responseText = data;
           }
       });

       $.mockjax({
           url: '/select2id',
           responseTime: 50,
           response: function() {
               req++;
               this.responseText = data[idIndex];
           }
       });

        //start
        idIndex = 1;
        e.click();
        var p = tip(e);

        var $input = p.find('select');

        ok(p.is(':visible'), 'popover visible');

        //waiting for initSelection
        setTimeout(function() {
            equal(p.find('.select2-selection').text(), text, 'selected text correct');
            equal(req, 1, '1 request ok');

            //enter 1 symbol
            $input.select2('open');
            $('.select2-search__field').val('1').trigger('keyup');

            //wait for list loading
            setTimeout(function() {
               equal($('.select2-results li').length, data.length, 'items loaded');
               equal($('.select2-results__option--highlighted').text(), data[1].name, 'highlight ok');

               //click on first
               var newVal = 1, newText = '111';
               $('.select2-results li').eq(0).mouseup();
               equal(p.find('.select2-selection').text(), data[0].name, 'new selected text ok');

               //submit
               p.find('form').submit();

               setTimeout(function() {
                   ok(!p.is(':visible'), 'popover closed');
                   equal(e.data('editable').value, newVal, 'new value ok');
                   equal(e.text(), newText, 'new text ok');

                   //open again
                   idIndex = 0;
                   e.click();
                   setTimeout(function() {
                       p = tip(e);
                       var $input = p.find('select');
                       equal(p.find('.select2-selection').text(), newText, 'text ok on second open');
                       equal($input.val(), newVal, 'selected value ok on second open');

                       e.remove();
                       start();
                   }, timeout);
               }, timeout);
            }, timeout);
        }, timeout);
   });
});
