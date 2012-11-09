/**
* editable abstract type definition
* Every new type must implement this interface
* It does not store value or text. It just store settings and input
*/
(function ($) {

    var Abstract = function () { };

    Abstract.prototype = {
       /**
        * initialize settings
        */
       init: function(type, options, defaults) {
           this.type = type;
           this.options = $.extend({}, defaults, options); 
           this.$input = null;
           this.error = null;
       },
       
       /**
       * creates DOM element which is ready to be shown
       * Can return jQuery deferred object
       */
       render: function() {
            this.$input = $(this.options.tpl);
            if(this.options.inputclass) {
                this.$input.addClass(this.options.inputclass); 
            }
            
            if (this.options.placeholder) {
                this.$input.attr('placeholder', this.options.placeholder);
            }            
       }, 

       /**
       * set element's html by value
       */
       value2html: function(value, element) {
           var html = $('<div>').text(value).html();
           $(element).html(html);
       },
        
       /**
       * returns value from element's html
       */       
       html2value: function(html) {
           return $('<div>').html(html).text();
       },
        
       /**
       * convert value to string for submiting on server
       */
       value2str: function(value) {
           return value;
       }, 
       
       /**
       * convert string received from server (data-value or options.value) into value object
       */
       str2value: function(str) {
           return str;
       }, 
       
       /**
       * set value to input
       */
       value2input: function(value) {
           this.$input.val(value);
       },
        
       /**
       * returns value (object) by input 
       */
       input2value: function() { 
           return this.$input.val();
       }, 

       /**
       * method called to focus input again
       */
       activate: function() {
           if(this.$input.is(':visible')) {
               this.$input.focus();
           }
       } 
    };
        
    Abstract.defaults = {    
        tpl: '',
        inputclass: 'span2',
        name: null,
        placeholder: false
    };
    
    $.extend($.fn.editableform.types, {abstract: Abstract});
        
}(window.jQuery));