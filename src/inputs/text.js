/**
Text input

@class text
@extends abstractinput
@final
@example
<a href="#" id="username" data-type="text" data-pk="1">awesome</a>
<script>
$(function(){
    $('#username').editable({
        url: '/post',
        title: 'Enter username'
    });
});
</script>
**/
(function ($) {
    var Text = function (options) {
        this.init('text', options, Text.defaults);
    };

    $.fn.editableutils.inherit(Text, $.fn.editabletypes.abstractinput);

    $.extend(Text.prototype, {
        render: function() {
           Text.superclass.render.call(this);

           if (this.options.clear) {
               this.$clear = $('<span class="editable-clear-x"></span>');
               this.$tpl = $('<div style="position: relative">').append(this.$input).append(this.$clear);
               this.$input.css('padding-right', '25px');         
           }
           
           if(this.options.inputclass) {
               this.$input.addClass(this.options.inputclass); 
           }
            
           if (this.options.placeholder) {
               this.$input.attr('placeholder', this.options.placeholder);
           }           
        },
        
        postrender: function() { 
            //attach `clear` button in postrender, because it requires parent height to be calculated (in DOM)
            if (this.$clear) {
                var h = this.$input.parent().height() || 20;
                this.$clear.css('top', (h - this.$clear.outerHeight()) / 2);
                this.$input.keyup($.proxy(this.toggleClear, this));
                this.$clear.click($.proxy(function(){
                    this.$clear.hide();
                    this.$input.val('').focus();
                }, this));
            } 
        },
        
        activate: function() {
            if(this.$input.is(':visible')) {
                this.$input.focus();
                $.fn.editableutils.setCursorPosition(this.$input.get(0), this.$input.val().length);
                if(this.toggleClear) {
                    this.toggleClear();
                }
            }
        },
        
        //show / hide clear button
        toggleClear: function() {
            if(!this.$clear) {
                return;
            }
            
            if(this.$input.val()) {
                this.$clear.show();
            } else {
                this.$clear.hide();
            } 
        }  
    });

    Text.defaults = $.extend({}, $.fn.editabletypes.abstractinput.defaults, {
        /**
        @property tpl 
        @default <input type="text">
        **/         
        tpl: '<input type="text">',
        /**
        Placeholder attribute of input. Shown when input is empty.

        @property placeholder 
        @type string
        @default null
        **/             
        placeholder: null,
        
        /**
        Whether to show `clear` button / link or not 
        **/
        clear: true
    });

    $.fn.editabletypes.text = Text;

}(window.jQuery));
