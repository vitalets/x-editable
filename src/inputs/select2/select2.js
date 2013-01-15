/**
Select2 input. Based on https://github.com/ivaynberg/select2.  

@class select2
@extends abstractinput
@since 1.4.1
@final
@example
<a href="#" id="country" data-type="select2" data-pk="1" data-url="/post" data-original-title="Select country"></a>
<script>
$(function(){
    $('#country').editable({
        value: 'ru',    
        source: [
              {value: 'gb', text: 'Great Britain'},
              {value: 'us', text: 'United States'},
              {value: 'ru', text: 'Russia'}
           ]
        }
    });
});
</script>
**/
(function ($) {

    var Constructor = function (options) {
        this.init('select2', options, Constructor.defaults);
        
        var mixin = {
            placeholder:  options.placeholder
        };
        
        if(options.select2 && options.select2.tags) {
            
        }
       /*
        if(!(options.select2 && options.select2.tags)) {
            mixin.data = options.source; 
            mixin.initSelection = function (element, callback) {
                //see https://github.com/ivaynberg/select2/issues/710
                var data = [];
                $.each(this.data, function(k, v) {
                    if(v.id ==  element.val()) {
                        data.push(v);
                    } 
                });
                callback(data);
            }; 
        }
      */     
        //overriding objects in config (as by default jQuery extend() is not recursive)
        this.options.select2 = $.extend({}, Constructor.defaults.select2, mixin, options.select2);
    };

    $.fn.editableutils.inherit(Constructor, $.fn.editabletypes.abstractinput);

    $.extend(Constructor.prototype, {
        render: function() {
            this.setClass();
            //apply select2
            this.$input.select2(this.options.select2);
            
            if(this.options.select2.tags) {
               this.$input.on('change', function() {
                   //trigger resize of editableform to re-position container
                   $(this).closest('form').parent().triggerHandler('resize');
               }); 
            }            
            
        },
       
       value2html: function(value, element) {
           var text = '', data;
           if(this.$input) { //when submitting form 
               data = this.$input.select2('data');
           } else { //on init (autotext)
               //here select2 instance not created yet and data may be even not loaded.
               //but we can check data/tags property of select and if it exist lookup text
               if(this.options.select2.tags) {
                   data = value;
               } else if(this.options.select2.data) {
                   data = $.fn.editableutils.itemsByValue(value, this.options.select2.data, 'id');   
               }
           }
           
           if($.isArray(data)) {
               //collect selected data and show with separator
               text = [];
               $.each(data, function(k, v){
                   text.push(v && typeof v === 'object' ? v.text : v); 
               });                   
           } else if(data) {
               text = data.text;  
           }

           text = $.isArray(text) ? text.join(this.options.viewseparator) : text;
           
           $(element).text(text);
       },       
        
       html2value: function(html) {
           return null;
       }, 
       
       value2input: function(value) {
//           this.$input.val(value).select2('val', value);
           this.$input.val(value).trigger('change');
       },
       
       input2value: function() { 
           return this.$input.select2('val');
//           return this.$input.val();
       },

       str2value: function(str) {
            if(typeof str !== 'string') {
                return str;
            }
            var val, i, l,
                separator = this.options.select2.separator || $.fn.select2.defaults.separator;
            if (str === null || str.length < 1) {
                return null;
            }
            val = str.split(separator);
            for (i = 0, l = val.length; i < l; i = i + 1) {
                val[i] = $.trim(val[i]);
            }
            return val;
       }        
        
    });      

    Constructor.defaults = $.extend({}, $.fn.editabletypes.abstractinput.defaults, {
        /**
        @property tpl 
        @default <input type="hidden">
        **/         
        tpl:'<input type="hidden">',
        /**
        Configuration of select2. [Full list of options](http://ivaynberg.github.com/select2).
        
        @property select2 
        @type object
        @default null
        **/
        select2: null,
        /**
        Placeholder attribute of select

        @property placeholder 
        @type string
        @default null
        **/             
        placeholder: null,
        /**
        Source data for select. It will be assigned to select2 `data` property and kept just for convenience.
        Please note, that format is different from simple `select` input.  
        **/
        source: null,
        /**
        Separator used to display tags. 
        
        @property viewseparator 
        @type string
        @default ', '        
        **/
        viewseparator: ', '        
    });

    $.fn.editabletypes.select2 = Constructor;      
    
}(window.jQuery));