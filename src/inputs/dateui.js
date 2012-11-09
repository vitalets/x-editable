/**
* jQuery UI Datepicker
* Note: you can not use both date and dateui on the one page!
*/
(function ($) {

    var DateUI = function (options) {
        this.init('dateui', options, DateUI.defaults);
        
        //set popular options directly from settings or data-* attributes
        var directOptions =  $.fn.editableform.utils.sliceObj(this.options, ['format', 'firstDay']);

        //overriding datepicker config (as by default jQuery extend() is not recursive)
        this.options.datepicker = $.extend({}, DateUI.defaults.datepicker, directOptions, options.datepicker);
        
        //by default viewformat equals to format
        if(!this.options.viewformat) {
            this.options.viewformat = this.options.datepicker.format;
        }
        
        //correct formats: replace yyyy with yy
        this.options.viewformat = this.options.viewformat.replace('yyyy', 'yy'); 
        this.options.datepicker.format = this.options.datepicker.format.replace('yyyy', 'yy'); 
        
        //copy format to dateFormat (dateFormat option required for ui datepicker).
        //This allows common option 'format' for all datepickers
        this.options.datepicker.dateFormat = this.options.datepicker.format;        
    };

    $.fn.editableform.utils.inherit(DateUI, $.fn.editableform.types.abstract);    
    
    $.extend(DateUI.prototype, {
        render: function () {
            DateUI.superclass.render.call(this);
            this.$input.datepicker(this.options.datepicker);
        },

        value2html: function(value, element) {
            var text = $.datepicker.formatDate(this.options.viewformat, value);
            DateUI.superclass.value2html(text, element); 
        },

        html2value: function(html) {
           if(typeof html !== 'string') {
               return html;
           }            
            
           //if string does not match format, UI datepicker throws exception
           var d;
           try {
              d = $.datepicker.parseDate(this.options.viewformat, html);
           } catch(e) {}
           
           return d;            
        },   
        
        value2str: function(value) {
           return $.datepicker.formatDate(this.options.datepicker.dateFormat, value);
       }, 
       
       str2value: function(str) {
           if(typeof str !== 'string') {
               return str;
           }
           
           //if string does not match format, UI datepicker throws exception
           var d;
           try {
              d = $.datepicker.parseDate(this.options.datepicker.dateFormat, str);
           } catch(e) {}
           
           return d;
       },             

       value2input: function(value) {
           this.$input.datepicker('setDate', value);
       },
        
       input2value: function() { 
           return this.$input.datepicker('getDate');
       },       
       
       activate: function() {
       }        

    });
    
    DateUI.defaults = $.extend({}, $.fn.editableform.types.abstract.defaults, {
        tpl:'<div style="float: left"></div>',
        inputclass: '',
        format:'yyyy-mm-dd', //format used for sending to server and converting from value
        viewformat: null,  //used for display date in element
        
        //special options
        firstDay: 0,
        datepicker:{
            changeYear: true,
            changeMonth: true
        }
    });   

    $.fn.editableform.types.dateui = DateUI;
    $.fn.editableform.types.date = DateUI;

}(window.jQuery));
