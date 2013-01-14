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
        
        //overriding objects in config (as by default jQuery extend() is not recursive)
        this.options.select2 = $.extend({}, Constructor.defaults.select2, {
            data:  options.source,
            placeholder:  options.placeholder,
            initSelection : function (element, callback) {
                    //see https://github.com/ivaynberg/select2/issues/710
                    var data; 
                    $.each(this.data, function(k, v) {
                       if(v.id ==  element.val()) {
                           data = v;
                           return false;
                       } 
                    });
                    callback(data);
            }            
        }, options.select2);
    };

    $.fn.editableutils.inherit(Constructor, $.fn.editabletypes.abstractinput);

    $.extend(Constructor.prototype, {
        render: function() {
            this.setClass();
            //apply select2
            this.$input.select2(this.options.select2);
        },
       
       value2html: function(value, element) {
           if(this.$input) { //when submitting form 
               $(element).text(this.$input.select2('data').text);
           } else { //on init (autotext)
               //todo: here select2 instance not created yet and data may be even not loaded.
               //but we can check data property of select and if it exist find text
               $(element).text('');
           }
       },       
        
       html2value: function(html) {
           return null;
       }, 
       
       value2input: function(value) {
           this.$input.select2('val', value);
//           this.$input.val(value);
       },
       
       input2value: function() { 
           return this.$input.select2('val');
//           return this.$input.val();
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
        source: null        
    });

    $.fn.editabletypes.select2 = Constructor;      
    
}(window.jQuery));