/**
Typeahead.js input, based on [Twitter Typeahead](http://twitter.github.io/typeahead.js).
It is mainly replacement of typeahead in Bootstrap 3.


@class typeaheadjs
@extends text
@since 1.5.0
@final
@example
<script type="text/javascript" src="http://twitter.github.io/typeahead.js/releases/latest/bloodhound.js"></script>
<a href="#" data-url="/list" class="authorize-workstation" data-type="typeaheadjs" data-pk="1" data-title="Selecione o colaborador">pendente</a>
$(function () {
    'use strict';
    var engine = new Bloodhound({
        name: 'states',
        local: [{ value: "Alabama" }, { value: "Alaska" }, { value: "Arizona" }, { value: "Arkansas" }, { value: "California" }, { value: "Colorado" }, { value: "Connecticut" }, { value: "Delaware" }, { value: "Florida" }, { value: "Georgia" }, { value: "Hawaii" }, { value: "Idaho" }, { value: "Illinois" }, { value: "Indiana" }, { value: "Iowa" }, { value: "Kansas" }, { value: "Kentucky" }, { value: "Louisiana" }, { value: "Maine" }, { value: "Maryland" }, { value: "Massachusetts" }, { value: "Michigan" }, { value: "Minnesota" }, { value: "Mississippi" }, { value: "Missouri" }, { value: "Montana" }, { value: "Nebraska" }, { value: "Nevada" }, { value: "New Hampshire" }, { value: "New Jersey" }, { value: "New Mexico" }, { value: "New York" }, { value: "North Dakota" }, { value: "North Carolina" }, { value: "Ohio" }, { value: "Oklahoma" }, { value: "Oregon" }, { value: "Pennsylvania" }, { value: "Rhode Island" }, { value: "South Carolina" }, { value: "South Dakota" }, { value: "Tennessee" }, { value: "Texas" }, { value: "Utah" }, { value: "Vermont" }, { value: "Virginia" }, { value: "Washington" }, { value: "West Virginia" }, { value: "Wisconsin" }, { value: "Wyoming" }],
        // remote: '/list',
        datumTokenizer: function(d) {
            return Bloodhound.tokenizers.whitespace(d.value);
        },
        queryTokenizer: Bloodhound.tokenizers.whitespace
    });
    engine.initialize();

    // editable
    $('.authorize-workstation').editable({
        mode: "inline",
        typeahead: [
            {
                minLength: 1,
                highlight: true,
                hint: true
            },
            {
                name: 'states',
                source: engine.ttAdapter()
            }
        ]
    });
});
**/
(function ($) {
    "use strict";

    var Constructor = function (options) {
        this.init('typeaheadjs', options, Constructor.defaults);
    };

    $.fn.editableutils.inherit(Constructor, $.fn.editabletypes.text);

    $.extend(Constructor.prototype, {
        render: function() {
            this.renderClear();
            this.setClass();
            this.setAttr('placeholder');
            this.$input.typeahead.apply(this.$input, this.options.typeahead);

            // copy `input-sm | input-lg` classes to placeholder input
            if($.fn.editableform.engine === 'bs3') {
                if(this.$input.hasClass('input-sm')) {
                    this.$input.siblings('input.tt-hint').addClass('input-sm');
                }
                if(this.$input.hasClass('input-lg')) {
                    this.$input.siblings('input.tt-hint').addClass('input-lg');
                }
            }
        }
    });

    Constructor.defaults = $.extend({}, $.fn.editabletypes.list.defaults, {
        /**
        @property tpl
        @default <input type="text">
        **/
        tpl:'<input type="text">',
        /**
        Configuration of typeahead itself.
        [Full list of options](https://github.com/twitter/typeahead.js#dataset).

        @property typeahead
        @type object
        @default null
        **/
        typeahead: null,
        /**
        Whether to show `clear` button

        @property clear
        @type boolean
        @default true
        **/
        clear: true
    });

    $.fn.editabletypes.typeaheadjs = Constructor;

}(window.jQuery));
