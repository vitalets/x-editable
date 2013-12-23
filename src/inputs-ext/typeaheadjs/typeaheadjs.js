/**
Typeahead.js input, based on [Twitter Typeahead](http://twitter.github.io/typeahead.js).   
It is mainly replacement of typeahead in Bootstrap 3.


@class typeaheadjs
@extends text
@since 1.5.0
@final
@example
<a href="#" id="country" data-type="typeaheadjs" data-pk="1" data-url="/post" data-title="Input country"></a>
<script>
$(function(){
    $('#country').editable({
        value: 'ru',
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
    });
});
</script>
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
            
            // need to set kewdown handler before apply typeahead
            // for correct autosubmit
            this.isAutosubmit = false;
            var that = this;            
            this.$input.on('keydown', function (e) {
                if (!that.isAutosubmit) {
                    return;
                }
                var $dropdown = that.$input.closest('.editable-input').find('.tt-dropdown-menu');
                if (!$dropdown.is(':visible') && e.which === 13) {
                    that.$input.closest('form').submit();
                }
            });
            // copy `input-sm | input-lg` classes to placeholder input
            if($.fn.editableform.engine === 'bs3') {
                if(this.$input.hasClass('input-sm')) {
                    this.$input.siblings('input.tt-hint').addClass('input-sm');
                }
                if(this.$input.hasClass('input-lg')) {
                    this.$input.siblings('input.tt-hint').addClass('input-lg');
                }
            }
        },
        
        activate: function() {
            // apply typeaheadjs here since input value is set
            this.$input.typeahead(this.options.typeahead);
            if(this.$input.is(':visible')) {
                this.$input.focus();
                if (this.$input.is('input,textarea') && !this.$input.is('[type="checkbox"],[type="range"]')) {
                    $.fn.editableutils.setCursorPosition(this.$input.get(0), this.$input.val().length);
                }
                if(this.toggleClear) {
                    this.toggleClear();
                }
            }
        },
        
        autosubmit: function() {
            this.isAutosubmit = true;
        },
        
        clear: function() {
            // tell typeaheadjs we've cleared the input
            this.$input.typeahead('setQuery', '');
            this.$clear.hide();
            this.$input.val('').focus();
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
