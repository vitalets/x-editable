/**
Bootstrap datefield input - modification for inline mode.
Shows normal <input type="text"> and binds popup datepicker.  
Automatically shown in inline mode.
**/
(function ($) {

    var DateField = function (options) {
        this.init('datefield', options, DateField.defaults);
        this.initPicker();
    };

    $.fn.editableutils.inherit(DateField, $.fn.editabletypes.date);    
    
    $.extend(DateField.prototype, {
        render: function () {
            this.$input = $(this.options.tpl);
            this.$field = this.$input.find('input');
            
            if(this.options.inputclass) {
                this.$field.addClass(this.options.inputclass); 
            }
            
            if (this.options.placeholder) {
                this.$field.attr('placeholder', this.options.placeholder);
            } 
            
            this.$input.datepicker(this.options.datepicker);
            
            //need to disable original event handlers
            this.$field.off('focus keyup keydown');
            
            //shadow update value of datepicker
            this.$field.keyup($.proxy(function(){
               this.$input.data('datepicker').date = this.input2value();  
            }, this));
        },   
        
       value2str: function(value) {
            return value ? this.dpg.formatDate(value, this.parsedViewFormat, this.options.datepicker.language) : '';
       }, 
       
       value2submit: function(value) {
            return value ? this.dpg.formatDate(value, this.parsedFormat, this.options.datepicker.language) : null;
       },                
        
       value2input: function(value) {
           this.$field.val(this.value2str(value));
           this.$input.datepicker('update');
       },
        
       input2value: function() { 
           return this.html2value(this.$field.val());
       },              
        
       activate: function() {
           if(this.$field.is(':visible')) {
               this.$field.focus();
               $.fn.editableutils.setCursorPosition(this.$field.get(0), this.$field.val().length);
           }
       },
       
       autosubmit: function() {
         //reset autosubmit to empty  
       }
    });
    
    DateField.defaults = $.extend({}, $.fn.editabletypes.date.defaults, {
        /**
        @property tpl 
        @default <input type="text">
        **/         
        tpl:'<div class="input-append date"><input class="input-small" type="text"/><span class="add-on"><i class="icon-th"></i></span></div>',
        /**
        @property inputclass 
        @default ''
        **/         
        inputclass: '',
        datepicker: {autoclose: true}, 
        clear: false
    });
    
    $.fn.editabletypes.datefield = DateField;

}(window.jQuery));