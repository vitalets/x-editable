/**
Bootstrap-datetimepicker.  
Description and examples: https://github.com/smalot/bootstrap-datetimepicker.  
For **i18n** you should include js file from here: https://github.com/smalot/bootstrap-datetimepicker/tree/master/js/locales
and set `language` option.  

@class datetime
@extends abstractinput
@final
@example
<a href="#" id="last_seen" data-type="datetime" data-pk="1" data-url="/post" data-original-title="Select date & time">15/03/2013 12:45</a>
<script>
$(function(){
    $('#last_seen').editable({
        format: 'yyyy-mm-dd hh:ii:ss',    
        viewformat: 'dd/mm/yyyy hh:ii:ss',    
        datetimepicker: {
                weekStart: 1
           }
        }
    });
});
</script>
**/
(function ($) {

    var DateTime = function (options) {
        this.init('datetime', options, DateTime.defaults);
        this.initPicker(options, DateTime.defaults);
    };

    $.fn.editableutils.inherit(DateTime, $.fn.editabletypes.abstractinput);
    
    $.extend(DateTime.prototype, {
        initPicker: function(options, defaults) {
            //'format' is set directly from settings or data-* attributes

            //by default viewformat equals to format
            if(!this.options.viewformat) {
                this.options.viewformat = this.options.format;
            }
            
            //overriding datetimepicker config (as by default jQuery extend() is not recursive)
            //since 1.4 datetimepicker internally uses viewformat instead of format. Format is for submit only
            this.options.datetimepicker = $.extend({}, defaults.datetimepicker, options.datetimepicker, {
                format: this.options.viewformat
            });
            
            //language
            this.options.datetimepicker.language = this.options.datetimepicker.language || 'en'; 

            //store DPglobal
            this.dpg = $.fn.datetimepicker.DPGlobal; 

            //store parsed formats
            this.parsedFormat = this.dpg.parseFormat(this.options.format, this.options.formatType);
            this.parsedViewFormat = this.dpg.parseFormat(this.options.viewformat, this.options.formatType);
            
            //
            this.options.datetimepicker.startView = this.options.startView;
            this.options.datetimepicker.minView = this.options.minView;
            this.options.datetimepicker.maxView = this.options.maxView;
        },
        
        render: function () {
            this.$input.datetimepicker(this.options.datetimepicker);
            
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
            var text = value ? this.dpg.formatDate(value, this.parsedViewFormat, this.options.datetimepicker.language, this.options.formatType) : '';
            DateTime.superclass.value2html(text, element); 
        },

        html2value: function(html) {
            return html ? this.dpg.parseDate(html, this.parsedViewFormat, this.options.datetimepicker.language, this.options.formatType) : null;
        },   
        
        value2str: function(value) {
            return value ? this.dpg.formatDate(value, this.parsedFormat, this.options.datetimepicker.language, this.options.formatType) : '';
       }, 
       
       str2value: function(str) {
           return str ? this.dpg.parseDate(str, this.parsedFormat, this.options.datetimepicker.language, this.options.formatType) : null;
       }, 
       
       value2submit: function(value) {
           return this.value2str(value);
       },                    

       value2input: function(value) {
           this.$input.datetimepicker('update', value);
       },
        
       input2value: function() { 
           return this.$input.data('datetimepicker').date;
       },       
       
       activate: function() {
       },
       
       clear:  function() {
          this.$input.data('datetimepicker').date = null;
          this.$input.find('.active').removeClass('active');
       },
       
       autosubmit: function() {
           this.$input.on('mouseup', '.day', function(e){
               if($(e.currentTarget).is('.old') || $(e.currentTarget).is('.new')) {
                 return;
               }
               var $form = $(this).closest('form');
               setTimeout(function() {
                   $form.submit();
               }, 200);
           });
           //changedate is not suitable as it triggered when showing datetimepicker. see #149
           /*
           this.$input.on('changeDate', function(e){
               var $form = $(this).closest('form');
               setTimeout(function() {
                   $form.submit();
               }, 200);
           });
           */
       }

    });
    
    DateTime.defaults = $.extend({}, $.fn.editabletypes.abstractinput.defaults, {
        /**
        @property tpl 
        @default <div></div>
        **/         
        tpl:'<div class="editable-date well"></div>',
        /**
        @property inputclass 
        @default null
        **/         
        inputclass: null,
        /**
        Format used for sending value to server. Also applied when converting date from <code>data-value</code> attribute.<br>
        Possible tokens are: <code>d, dd, m, mm, yy, yyyy</code>  
        
        @property format 
        @type string
        @default yyyy-mm-dd hh:ii
        **/         
        format:'yyyy-mm-dd hh:ii',
        formatType:'standard',
        /**
        Format used for displaying date. Also applied when converting date from element's text on init.   
        If not specified equals to <code>format</code>
        
        @property viewformat 
        @type string
        @default null
        **/          
        viewformat: null,  
        /**
        Configuration of datetimepicker.
        Full list of options: https://github.com/smalot/bootstrap-datetimepicker
        
        @property datetimepicker 
        @type object
        @default {
            weekStart: 0,
            startView: 0,
            minView: 0,
            autoclose: false
        }
        **/
        datetimepicker:{
            weekStart: 0,
            startView: 2, // month
            maxView: 4, // decade
            minView: 0,
            todayHighlight: false,
            autoclose: false
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

    $.fn.editabletypes.datetime = DateTime;

}(window.jQuery));
