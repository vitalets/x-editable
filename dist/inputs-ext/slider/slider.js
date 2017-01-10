/**
Slider, based on the Slider plugin by Stefan Petre (http://www.eyecon.ro/bootstrap-slider).

Make sure to include the plugin's code before using this editor.

@class slider
@extends text
@since 1.5.0
@final
**/
(function ($) {
    "use strict";
    
    var Constructor = function (options) {
        this.init('slider', options, Constructor.defaults);
    };

    $.fn.editableutils.inherit(Constructor, $.fn.editabletypes.text);

    $.extend(Constructor.prototype, {
        render: function() {
            // need to set kewdown handler before apply slider
            // for correct autosubmit
            this.isAutosubmit = false;
            var that = this;            
            this.$input.on('keydown', function (e) {
                if (!that.isAutosubmit) {
                    return;
                }
                if (e.which === 13) {
                    that.$input.closest('form').submit();
                }
            });            
            
            // apply slider
            this.$input.slider(this.options.slider);
        },
        
       value2input: function(value) {
       		// make sure it's a number
       		if(typeof value!='number')
       			value=Number(value);
       		if(isNaN(value))
       			value=0;
       		
           this.$input.val(value);
           this.$input.slider('setValue', value);
       },

        autosubmit: function() {
            this.isAutosubmit = true;
        }        
    });      

    Constructor.defaults = $.extend({}, $.fn.editabletypes.list.defaults, {
        /**
        @property tpl 
        @default <input type="text">
        **/         
        tpl:'<input type="text">',
        /**
        **/
        slider: null,
    });

    $.fn.editabletypes.slider = Constructor;      
    
}(window.jQuery));