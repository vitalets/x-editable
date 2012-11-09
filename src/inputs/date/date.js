/**
* date
* based on fork: https://github.com/vitalets/bootstrap-datepicker
*/
(function ($) {

    var Date = function (options) {
        this.init('date', options, Date.defaults);
        
        //set popular options directly from settings or data-* attributes
        var directOptions =  $.fn.editableform.utils.sliceObj(this.options, ['format', 'weekStart', 'startView']);

        //overriding datepicker config (as by default jQuery extend() is not recursive)
        this.options.datepicker = $.extend({}, Date.defaults.datepicker, directOptions, options.datepicker);

        //by default viewformat equals to format
        if(!this.options.viewformat) {
            this.options.viewformat = this.options.datepicker.format;
        }  
        
        //language
        this.options.datepicker.language = this.options.datepicker.language || 'en'; 
        
        //store DPglobal
        this.dpg = $.fn.datepicker.DPGlobal; 
        
        //store parsed formats
        this.parsedFormat = this.dpg.parseFormat(this.options.datepicker.format);
        this.parsedViewFormat = this.dpg.parseFormat(this.options.viewformat);
    };

    $.fn.editableform.utils.inherit(Date, $.fn.editableform.types.abstract);    
    
    $.extend(Date.prototype, {
        render: function () {
            Date.superclass.render.call(this);
            this.$input.datepicker(this.options.datepicker);
        },

        value2html: function(value, element) {
            var text = value ? this.dpg.formatDate(value, this.parsedViewFormat, this.options.datepicker.language) : '';
            Date.superclass.value2html(text, element); 
        },

        html2value: function(html) {
            return html ? this.dpg.parseDate(html, this.parsedViewFormat, this.options.datepicker.language) : null;
        },   
        
        value2str: function(value) {
            return value ? this.dpg.formatDate(value, this.parsedFormat, this.options.datepicker.language) : '';
       }, 
       
       str2value: function(str) {
           return str ? this.dpg.parseDate(str, this.parsedFormat, this.options.datepicker.language) : null;
       },             

       value2input: function(value) {
           this.$input.datepicker('update', value);
       },
        
       input2value: function() { 
           return this.$input.data('datepicker').date;
       },       
       
       activate: function() {
       }        

    });
    
    Date.defaults = $.extend({}, $.fn.editableform.types.abstract.defaults, {
        tpl:'<div style="float: left; padding: 0; margin: 0 0 9px 0"></div>',
        inputclass: 'well',
        format:'yyyy-mm-dd', //format used for sending to server and converting from value
        viewformat: null,  //used for display date in element
        //special options
        weekStart: 0,
        startView: 0,
        datepicker:{
            autoclose:false
        }
    });   

    $.fn.editableform.types.date = Date;

}(window.jQuery));
