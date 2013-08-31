/*
Editableform based on Twitter Bootstrap 2
*/
(function ($) {
    "use strict";
    
    //store parent methods
    var pInitInput = $.fn.editableform.Constructor.prototype.initInput;    
    
    $.extend($.fn.editableform.Constructor.prototype, {
         initTemplate: function() {
            this.$form = $($.fn.editableform.template); 
            this.$form.find('.editable-error-block').addClass('help-block');
         },
         initInput: function() {  
            pInitInput.apply(this);

            //for bs2 set default class `input-medium` to standard inputs
            var emptyInputClass = this.input.options.inputclass === null || this.input.options.inputclass === false;
            var defaultClass = 'input-medium';
            
            //add bs2 default class to standard inputs
            //if(this.input.$input.is('input,select,textarea')) {
            var stdtypes = 'text,select,textarea,password,email,url,tel,number,range,time'.split(','); 
            if(~$.inArray(this.input.type, stdtypes) && emptyInputClass) {
                this.input.options.inputclass = defaultClass;
                this.input.$input.addClass(defaultClass);
            }         
         }
    });    
    
    //buttons
    $.fn.editableform.buttons = '<button type="submit" class="btn btn-primary editable-submit"><i class="icon-ok icon-white"></i></button>'+
                                '<button type="button" class="btn editable-cancel"><i class="icon-remove"></i></button>';         
    
    //error classes
    $.fn.editableform.errorGroupClass = 'error';
    $.fn.editableform.errorBlockClass = null;
    //engine 
    $.fn.editableform.engine = 'bs2';   
    
}(window.jQuery));