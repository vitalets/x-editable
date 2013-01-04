/**
Bootstrap datefield input - modification for inline mode.
Shows normal <input type="text"> and binds popup datepicker.  
Automatically shown in inline mode.
**/
(function ($) {

    var DateField = function (options) {
        this.init('datefield', options, DateField.defaults);
        this.initPicker(options, DateField.defaults);
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
            this.$field.off('focus keydown');
            
            //update value of datepicker
            this.$field.keyup($.proxy(function(){
               this.$input.removeData('date');
               this.$input.datepicker('update');
            }, this));
            
        },   
        
       value2input: function(value) {
           this.$field.val(value ? this.dpg.formatDate(value, this.parsedViewFormat, this.options.datepicker.language) : '');
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
        @default 
        **/         
        tpl:'<div class="input-append date"><input class="input-small" type="text"/><span class="add-on"><i class="icon-th"></i></span></div>',
        /**
        @property inputclass 
        @default ''
        **/         
        inputclass: '',
        
        /* datepicker config */
        datepicker: {
            weekStart: 0,
            startView: 0,
            autoclose: true
        },
        
        /* disable clear link */ 
        clear: false
    });
    
    $.fn.editabletypes.datefield = DateField;

}(window.jQuery));