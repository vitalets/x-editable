/**
* text
*/
(function ($) {
    var Text = function (options) {
        this.init('text', options, Text.defaults);
    };

    $.fn.editableform.utils.inherit(Text, $.fn.editableform.types.abstract);

    $.extend(Text.prototype, {
        activate: function() {
            if(this.$input.is(':visible')) {
                $.fn.editableform.utils.setCursorPosition(this.$input.get(0), this.$input.val().length);
                this.$input.focus();
            }
        }  
    });

    Text.defaults = $.extend({}, $.fn.editableform.types.abstract.defaults, {
        tpl: '<input type="text">' 
    });

    $.fn.editableform.types.text = Text;

}(window.jQuery));