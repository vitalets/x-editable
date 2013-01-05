/**
jQuery UI datefield input - modification for inline mode.
Shows normal <input type="text"> and binds popup datepicker.  
Automatically shown in inline mode.
**/
(function ($) {

    var DateUIField = function (options) {
        this.init('dateuifield', options, DateUIField.defaults);
        this.initPicker(options, DateUIField.defaults);
    };

    $.fn.editableutils.inherit(DateUIField, $.fn.editabletypes.dateui);    
    
    $.extend(DateUIField.prototype, {
        render: function () {
            this.$tpl = $(this.options.tpl);
            this.$input = this.$tpl.find('input'); 
            this.$input.datepicker(this.options.datepicker);

            /*
            if(this.options.clear) {
                this.$clear = $('<a href="#"></a>').html(this.options.clear).click($.proxy(function(e){
                    e.preventDefault();
                    e.stopPropagation();
                    this.clear();
                }, this));
            } 
            */           
       },
      
       value2input: function(value) {
           this.$input.val($.datepicker.formatDate(this.options.viewformat, value));
       },
        
       input2value: function() { 
           return this.html2value(this.$input.val());
       },        
        
       activate: function() {
           $.fn.editabletypes.text.prototype.activate.call(this);
       },
       
       autosubmit: function() {
         //reset autosubmit to empty  
       }
    });
    
    DateUIField.defaults = $.extend({}, $.fn.editabletypes.dateui.defaults, {
        /**
        @property tpl 
        @default <input type="text">
        **/         
        tpl: '<div><input type="text" /></div>',
        /**
        @property inputclass 
        @default ''
        **/         
        inputclass: '',
        
        /* datepicker config */
        datepicker: {
            showOn: "button",
            buttonImage: "http://jqueryui.com/resources/demos/datepicker/images/calendar.gif",
            buttonImageOnly: true,            
            firstDay: 0,
            changeYear: true,
            changeMonth: true,
            showOtherMonths: true
        },
        
        /* disable clear link */ 
        clear: false
    });
    
    $.fn.editabletypes.dateuifield = DateUIField;

}(window.jQuery));