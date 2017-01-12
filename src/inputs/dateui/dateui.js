/**
jQuery UI Datepicker.  
Description and examples: http://jqueryui.com/datepicker.   
This input is also accessible as **date** type. Do not use it together with __bootstrap-datepicker__ as both apply <code>$().datepicker()</code> method.  
For **i18n** you should include js file from here: https://github.com/jquery/jquery-ui/tree/master/ui/i18n.

@class dateui
@extends abstractinput
@final
@example
<a href="#" id="dob" data-type="date" data-pk="1" data-url="/post" data-title="Select date">15/05/1984</a>
<script>
$(function(){
    $('#dob').editable({
        format: 'yyyy-mm-dd',    
        viewformat: 'dd/mm/yyyy',    
        datepicker: {
                firstDay: 1
           }
        }
    });
});
</script>
**/
(function ($) {
    "use strict";
    
    var DateUI = function (options) {
        this.init('dateui', options, DateUI.defaults);
        this.initPicker(options, DateUI.defaults);
    };

    $.fn.editableutils.inherit(DateUI, $.fn.editabletypes.abstractinput);    
    
    $.extend(DateUI.prototype, {
        initPicker: function(options, defaults) {
            //by default viewformat equals to format
            if(!this.options.viewformat) {
                this.options.viewformat = this.options.format;
            }
            
            //correct formats: replace yyyy with yy (for compatibility with bootstrap datepicker)
            this.options.viewformat = this.options.viewformat.replace('yyyy', 'yy'); 
            this.options.format = this.options.format.replace('yyyy', 'yy');             
            
            //overriding datepicker config (as by default jQuery extend() is not recursive)
            //since 1.4 datepicker internally uses viewformat instead of format. Format is for submit only
            this.options.datepicker = $.extend({}, defaults.datepicker, options.datepicker, {
                dateFormat: this.options.viewformat
            });                        
        },
        
        render: function () {
            this.$input.datepicker(this.options.datepicker);
            
            //"clear" link
            if(this.options.clear) {
                this.$clear = $('<a href="#"></a>').html(this.options.clear).click($.proxy(function(e){
                    e.preventDefault();
                    e.stopPropagation();
                    this.clear();
                }, this));
                
                this.$tpl.parent().append($('<div class="editable-clear">').append(this.$clear));  
            }              
        },

        value2html: function(value, element) {
            var text = $.datepicker.formatDate(this.options.viewformat, value);
            DateUI.superclass.value2html.call(this, text, element); 
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
           return $.datepicker.formatDate(this.options.format, value);
       }, 
       
       str2value: function(str) {
           if(typeof str !== 'string') {
               return str;
           }
           
           //if string does not match format, UI datepicker throws exception
           var d;
           try {
              d = $.datepicker.parseDate(this.options.format, str);
           } catch(e) {}
           
           return d;
       }, 
       
       value2submit: function(value) { 
           return this.options.submitFullDate ? value.toISOString() : this.value2str(value);
       },                     

       value2input: function(value) {
           this.$input.datepicker('setDate', value);
       },
        
       input2value: function() { 
           return this.$input.datepicker('getDate');
       },       
       
       activate: function() {
       },
       
       clear:  function() {
           this.$input.datepicker('setDate', null);
           // submit automatically whe that are no buttons
           if(this.isAutosubmit) {
              this.submit();
           }
       },
       
       autosubmit: function() {
           this.isAutosubmit = true; 
           this.$input.on('mouseup', 'table.ui-datepicker-calendar a.ui-state-default', $.proxy(this.submit, this));
       },

       submit: function() {
           var $form = this.$input.closest('form');
           setTimeout(function() {
               $form.submit();
           }, 200);
       }

    });
    
    DateUI.defaults = $.extend({}, $.fn.editabletypes.abstractinput.defaults, {
        /**
        @property tpl 
        @default <div></div>
        **/         
        tpl:'<div class="editable-date"></div>',
        /**
        @property inputclass 
        @default null
        **/         
        inputclass: null,
        /**
        Format used for sending value to server. Also applied when converting date from <code>data-value</code> attribute.<br>
        Full list of tokens: http://docs.jquery.com/UI/Datepicker/formatDate
        
        @property format 
        @type string
        @default yyyy-mm-dd
        **/          
        format:'yyyy-mm-dd', 
        /**
        Format used for displaying date. Also applied when converting date from element's text on init.    
        If not specified equals to <code>format</code>
        
        @property viewformat 
        @type string
        @default null
        **/          
        viewformat: null,
        
        /**
        Configuration of datepicker.
        Full list of options: http://api.jqueryui.com/datepicker
        
        @property datepicker 
        @type object
        @default {
           firstDay: 0, 
           changeYear: true, 
           changeMonth: true
        }
        **/
        datepicker: {
            firstDay: 0,
            changeYear: true,
            changeMonth: true,
            showOtherMonths: true
        },
        /**
        Text shown as clear date button. 
        If <code>false</code> clear button will not be rendered.
        
        @property clear 
        @type boolean|string
        @default 'x clear'         
        **/
        clear: '&times; clear'        
    });   

    $.fn.editabletypes.dateui = DateUI;

}(window.jQuery));
