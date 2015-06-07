/**
Select2 input. Based on amazing work of Igor Vaynberg https://github.com/ivaynberg/select2.
Please see [original select2 docs](http://ivaynberg.github.com/select2) for detailed description and options.

You should manually download and include select2 distributive:

    <link href="select2/select2.css" rel="stylesheet" type="text/css"></link>
    <script src="select2/select2.js"></script>

To make it **bootstrap-styled** you can use css from [here](https://github.com/fk/select2-bootstrap-theme):

    <link href="select2-bootstrap.css" rel="stylesheet" type="text/css"></link>

**Note:** currently `autotext` feature does not work for select2 with `ajax` remote source.
You need initially put both `data-value` and element's text youself:

    <a href="#" data-type="select2" data-value="1">Text1</a>


@class select2
@extends abstractinput
@since 1.4.1
@final
@example
<a href="#" id="country" data-type="select2" data-pk="1" data-value="ru" data-url="/post" data-title="Select country"></a>
<script>
$(function(){
    //local source
    $('#country').editable({
        source: [
              {id: 'gb', text: 'Great Britain'},
              {id: 'us', text: 'United States'},
              {id: 'ru', text: 'Russia'}
           ],
        select2: {
           multiple: true
        }
    });
    //remote source (simple)
    $('#country').editable({
        source: '/getCountries',
        select2: {
            placeholder: 'Select Country',
            minimumInputLength: 1
        }
    });
    //remote source (advanced)
    $('#country').editable({
        select2: {
            placeholder: 'Select Country',
            allowClear: true,
            minimumInputLength: 3,
            id: function (item) {
                return item.CountryId;
            },
            ajax: {
                url: '/getCountries',
                dataType: 'json',
                data: function (term, page) {
                    return { query: term };
                },
                results: function (data, page) {
                    return { results: data };
                }
            },
            formatResult: function (item) {
                return item.CountryName;
            },
            formatSelection: function (item) {
                return item.CountryName;
            },
            initSelection: function (element, callback) {
                return $.get('/getCountryById', { query: element.val() }, function (data) {
                    callback(data);
                });
            }
        }
    });
});
</script>
**/
(function ($) {
    "use strict";

    var Constructor = function (options) {
        this.init('select2', options, Constructor.defaults);

        options.select2 = options.select2 || {};

        // placeholder
        if (options.placeholder) {
            options.select2.placeholder = options.placeholder;
        }

        // Automatically recognize the old `tags` behaviour and convert it into
        // `tags` + `data`, which is what Select2 4.0.0 expects.
        //
        // Also defaults to being a multiple selection, like older versions of
        // Select2.
        if ($.isArray(options.select2.tags)) {
            options.select2.data = options.select2.tags;
            options.select2.tags = true;
            options.select2.multiple = true;
        }

        if (options.select2.formatSelection) {
            options.select2.templateSelection = options.select2.formatSelection;
        }

        if (options.select2.formatResult) {
            options.select2.templateResult = options.select2.formatResult;
        }

        if (options.select2.ajax) {
            if (options.select2.ajax.results) {
                options.select2.ajax.processResults = options.select2.ajax.results;
            }

            if (options.select2.ajax.processResults) {
                var processResults = options.select2.ajax.processResults;

                options.select2.ajax.processResults = $.proxy(function (data) {
                    var results = processResults(data);

                    results.results = this.convertSource(results.results);

                    console.log('processResults', data, results)

                    return results;
                }, this);
            }
        }

        if (options.select2.initSelection) {
            this.options.initFunction = options.select2.initSelection;
            delete options.select2.initSelection;
        }

        //overriding objects in config (as by default jQuery extend() is not recursive)
        this.options.select2 = $.extend({}, Constructor.defaults.select2, options.select2);

        //detect whether it is multi-valued
        this.isMultiple = this.options.select2.multiple;
        this.isRemote = ('ajax' in this.options.select2);

        //store function returning ID of item
        //should be here as used inautotext for local source
        this.idFunc = this.options.select2.id;
        if (typeof(this.idFunc) !== "function") {
            var idKey = this.idFunc || 'id';
            this.idFunc = function (e) { return e[idKey]; };
        }

        //store function that renders text in select2
        this.formatSelection = this.options.select2.formatSelection;
        if (typeof(this.formatSelection) !== "function") {
            this.formatSelection = function (e) { return e.text; };
        }
    };

    $.fn.editableutils.inherit(Constructor, $.fn.editabletypes.select);

    $.extend(Constructor.prototype, {
        render: function () {
            console.log('render');
            if (!this.$input.data('select2')) {
                this.$input.select2(this.options.select2);
            }
            console.log(this.$input.html())

            if (this.options.initFunction) {
                this.options.initFunction(this.$input, $.proxy(function (initial) {
                    console.log('initFunction', initial);
                    if ($.isArray(initial)) {

                    } else {
                        var id = this.idFunc(initial);
                        initial.id = id;
                        var option = new Option(initial.text, id);
                        option.selected = true;

                        $(option).data('data', initial);

                        this.$input.append(option);
                        this.$input.trigger('change');
                    }
                }, this));

                delete this.options.initFunction;
            }

            return Constructor.superclass.render.call(this);
        },

        renderList: function() {
            console.log('renderList', arguments)
            var $options = this.$input.children();
            Constructor.superclass.renderList.apply(this, arguments);
            this.$input.prepend($options);

            //can not apply select2 here as it calls initSelection
            //over input that does not have correct value yet.
            //apply select2 only in value2input
            //this.$input.select2(this.options.select2);

            //trigger resize of editableform to re-position container in multi-valued mode
            if (this.isMultiple) {
               this.$input.on('change', function() {
                   $(this).closest('form').parent().triggerHandler('resize');
               });
            }
       },

       /**
        * Used to convert a value (`data-value` or `options.value`) to the actual
        * selected value that can be processed by x-editable.
        *
        * This is needed because x-editable does not support multiple selections
        * by default.
        */
       str2value: function (str) {
           console.log('str2value', str);

           if ($.isArray(str)) {
               return str;
           }

           if (this.isMultiple) {
               return str.split(this.getSeparator());
           }

           return str;
       },

       /**
        * Called when no value is supplied, used to determine the value based on the text.
        */
       html2value: function (html) {
           console.log('html2value', html, this.isMultiple);
           if (!this.isMultiple) {
               return html;
           }

           return html.split(this.options.viewseparator);
       },

       /**
        * Used to update the text in the link based on the selected value
        */
       value2html: function (value, element) {
           console.log('value2html', arguments)
           Constructor.superclass.value2html.apply(this, arguments);
       },

       /**
        * Used to convert the value to the text representation of it.
        *
        * Superclass doesn't support multiple selects, so we need to override this.
        */
       value2htmlFinal: function (value, element) {
           // The select input type can handle single selects fine
           // We have to special case multiple selects, which aren't supported
           // by default.
           if (!$.isArray(value)) {
               console.log('value2htmlFinal', arguments, 'non-array');
               return Constructor.superclass.value2htmlFinal.call(this, value, element);
           }

           var results = [];

           // Convert all of the values into their text
           for (var v = 0; v < value.length; v++) {
               var val = value[v];

               var items = $.fn.editableutils.itemsByValue(val, this.sourceData);

               // There are no items in cases like tagging
               // So just assume that the tag value is also the text
               if (items.length === 0) {
                   results.push(value[v]);
               } else {
                   results.push(items[0].text);
               }
           }

           console.log('results', results);

           // The output is the text joined by the viewseparator (comma by default)
           results = results.join(this.options.viewseparator);

           console.log('value2htmlFinal', arguments, results);

           $(element)[this.options.escape ? 'text' : 'html']($.trim(results));
       },

       /**
        * Used to set the value of Select2 based on the current x-editable selections.
        */
       value2input: function (value) {
           console.log('value2input', value)

           // The value for a multiple select can be passed in as a single string
           // This will convert it from a string to an array of data values
           if (value && !$.isArray(value) && this.isMultiple) {
               value = this.str2value(value);

               console.log('value2input', value, 'fixed');
           }

           if (!value) {
               return;
           }

           // Branch off based on whether or not it's a multiple select
           // Either way, we are adding `<option>` tags for selected values that
           // don't already exist, so they can be selected correctly.
           if ($.isArray(value)) {
               var $options = this.$input.find('option');

               for (var v = 0; v < value.length; v++) {
                   var $filtered = $options.filter(function (i, elem) {
                       return elem.value == value[v].toString();
                   });

                   // Check if the option doesn't already exist
                   if ($filtered.length === 0) {
                       // Automatically create the option for the value
                       this.$input.append(new Option(value[v], value[v]));
                   }
               }
           } else {
               var $filtered = this.$input.find('option').filter(function (i, elem) {
                   return elem.value == value.toString()
               });

               if ($filtered.length === 0) {
                   var $el = $(this.options.scope);
                   var text;
                   if (!$el.data('editable').isEmpty) {
                       text = $el.text();
                   } else {
                       text = value;
                   }
                   this.$input.append(new Option(text, value));
               }
           }

           // After setting the value we must trigger the change event for Select2
           this.$input.val(value).trigger('change');
       },

        autosubmit: function() {
            this.$input.on('change', function(e, isInitial){
                if(!isInitial) {
                  $(this).closest('form').submit();
                }
            });
        },

        getSeparator: function() {
            return this.options.select2.separator || this.options.separator;
        },

        /*
        Converts source from x-editable format: {value: 1, text: "1"} to
        select2 format: {id: 1, text: "1"}

        Also normalizes the id for the source values to always be a string.
        */
        convertSource: function (source) {
            if ($.isArray(source)) {
                for (var i = 0; i < source.length; i++) {
                    if (source[i].value !== undefined) {
                        source[i].id = source[i].value;
                    }

                    source[i].id = "" + this.idFunc(source[i]);
                }
            }

            return source;
        },
        
        activate: function() {
        	this.$input.select2('open');
        },
        

        /**
         * Convert the Select2 data array into a x-editable compatible list of
         * selections.
         *
         * This will also automatically pull selected data from Select2 if
         * nothing was passed in and Select2 was already initialized.
         */
        makeArray: function (data) {
            if (!data && this.$input && this.$input.data('select2')) {
                data = this.$input.select2('data');
            }

            console.log('makeArray', data);

            if ($.isArray(data)) {
                for (var i = 0; i < data.length; i++) {
                    if (data[i].id !== undefined) {
                        data[i].value = data[i].id;
                    }
                }
            }

            return Constructor.superclass.makeArray.call(this, data);
        },

        destroy: function() {
	        if(this.$input) {
	            if(this.$input.data('select2')) {
	                this.$input.select2('destroy');
	            }
	        }
        }

    });

    Constructor.defaults = $.extend({}, $.fn.editabletypes.select.defaults, {
        /**
        Configuration of select2. [Full list of options](http://ivaynberg.github.com/select2).

        @property select2
        @type object
        @default null
        **/
        select2: null,
        /**
        Placeholder attribute of select

        @property placeholder
        @type string
        @default null
        **/
        placeholder: null,
        /**
        Source data for select. It will be assigned to select2 `data` property and kept here just for convenience.
        Please note, that format is different from simple `select` input: use 'id' instead of 'value'.
        E.g. `[{id: 1, text: "text1"}, {id: 2, text: "text2"}, ...]`.

        @property source
        @type array|string|function
        @default null
        **/
        source: null,
        /**
        Separator used to display tags.

        @property viewseparator
        @type string
        @default ', '
        **/
        viewseparator: ', ',

        /**
        Separator of values when reading from `data-value` attribute

        @property separator
        @type string
        @default ','
        **/
        separator: ','
    });

    $.fn.editabletypes.select2 = Constructor;

}(window.jQuery));
