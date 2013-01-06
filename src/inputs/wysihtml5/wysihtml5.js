/**
Bootstrap wysihtml5 input
See https://github.com/jhollingworth/bootstrap-wysihtml5

@class wysihtml5
@extends abstractinput
@final
@example
<a href="#" id="comments" data-type="wysihtml5" data-pk="1">awesome comment!</a>
<script>
$(function(){
    $('#comments').editable({
        url: '/post',
        title: 'Enter comments'
    });
});
</script>
**/
(function ($) {

    var Wysihtml5 = function (options) {
        this.init('wysihtml5', options, Wysihtml5.defaults);
        
        //extend wysihtml5 manually as $.extend not recursive 
        this.options.wysihtml5 = $.extend({}, Wysihtml5.defaults.wysihtml5, options.wysihtml5);
    };

    $.fn.editableutils.inherit(Wysihtml5, $.fn.editabletypes.abstractinput);

    $.extend(Wysihtml5.prototype, {
        render: function () {
            var deferred = $.Deferred();

            //generate unique id as it required for wysihtml5
            this.$input.attr('id', 'textarea_'+(new Date()).getTime());

            this.setClass();
            this.setAttr('rows');            
            this.setAttr('placeholder');            

            //resolve deffered when widget loaded
            $.extend(this.options.wysihtml5, {
                events: {
                  load: function() {
                     deferred.resolve();
                  }  
                }
            });
            
            this.$input.wysihtml5(this.options.wysihtml5);
            return deferred.promise();
        },
       
        value2html: function(value, element) {
            $(element).html(value);
        },

        html2value: function(html) {
            return html;
        },
        
        value2input: function(value) {
            this.$input.data("wysihtml5").editor.setValue(value, true);
        }, 

        activate: function() {
            this.$input.data("wysihtml5").editor.focus();
        }
    });

    Wysihtml5.defaults = $.extend({}, $.fn.editabletypes.abstractinput.defaults, {
        /**
        @property tpl
        @default <textarea></textarea>
        **/
        tpl:'<textarea class="editable-wysihtml5"></textarea>',
        /**
        @property inputclass
        @default 
        **/
        inputclass: '',
        /**
        Placeholder attribute of input. Shown when input is empty.

        @property placeholder
        @type string
        @default null
        **/
        placeholder: null,
        /**
        Number of rows in textarea

        @property rows
        @type integer
        @default 10
        **/        
        rows: 10,
        /**
        Wysihtml5 defaut options

        @property wysihtml5
        @type object
        @default {stylesheets: false}
        **/        
        wysihtml5: {
            stylesheets: false //see https://github.com/jhollingworth/bootstrap-wysihtml5/issues/183
        }
    });

    $.fn.editabletypes.wysihtml5 = Wysihtml5;

}(window.jQuery));
