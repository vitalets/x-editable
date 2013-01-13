/**
Typeahead input (bootstrap only)

@class typeahead
@extends list
@final
@example
<a href="#" id="country" data-type="typeahead" data-pk="1" data-url="/post" data-original-title="Input country"></a>
<script>
$(function(){
    $('#country').editable({
        value: 2,    
        source: [
              {value: 1, text: 'Active'},
              {value: 2, text: 'Blocked'},
              {value: 3, text: 'Deleted'}
           ]
        }
    });
});
</script>
**/
(function ($) {

    var Constructor = function (options) {
        this.init('typeahead', options, Constructor.defaults);
        
        //overriding combodate config (as by default jQuery extend() is not recursive)
        this.options.typeahead = $.extend({}, Constructor.defaults.typeahead, {
            //set default methods for typeahead to work with objects
            matcher: this.matcher,  
            sorter: this.sorter,  
            highlighter: this.highlighter,  
            updater: this.updater  
        }, options.typeahead);
    };

    $.fn.editableutils.inherit(Constructor, $.fn.editabletypes.list);

    $.extend(Constructor.prototype, {
        renderList: function() {
            this.options.typeahead.source = this.sourceData;
            
            this.$input.typeahead(this.options.typeahead);
            
            //attach own render method
            this.$input.data('typeahead').render = $.proxy(this.typeaheadRender, this.$input.data('typeahead'));
            
            this.renderClear();
            this.setClass();
            this.setAttr('placeholder');
        },
       
        value2htmlFinal: function(value, element) {
            if(this.getIsObjects()) {
                var items = $.fn.editableutils.itemsByValue(value, this.sourceData);
                $(element).text(items.length ? items[0].text : '');
            } else {
                $(element).text(value);
            }
        },
        
        html2value: function (html) {
            return html ? html : null;
        },
        
        value2input: function(value) {
            if(this.getIsObjects()) {
                var items = $.fn.editableutils.itemsByValue(value, this.sourceData);
                this.$input.data('value', value).val(items.length ? items[0].text : '');                
            } else {
                this.$input.val(value);
            }
        },
        
        input2value: function() {
            if(this.getIsObjects()) {
                var value = this.$input.data('value'),
                    items = $.fn.editableutils.itemsByValue(value, this.sourceData);
                    
                if(items.length && items[0].text.toLowerCase() === this.$input.val().toLowerCase()) {
                   return value;
                } else {
                   return null; //entered string not found in source
                }                 
            } else {
                return this.$input.val();
            }
        },
        
        /*
         if in sourceData values <> texts, typeahead in "objects" mode: 
         user must pick some value from list, otherwise `null` returned.
         if all values == texts put typeahead in "strings" mode:
         anything what entered is submited.
        */        
        getIsObjects: function() {
            if(this.isObjects === undefined) {
                this.isObjects = false;
                for(var i=0; i<this.sourceData.length; i++) {
                    if(this.sourceData[i].value !== this.sourceData[i].text) {
                        this.isObjects = true;
                        break;
                    } 
                }
            } 
            return this.isObjects;
        },  
               
        /*
          Methods borrowed from text input
        */
        activate: $.fn.editabletypes.text.prototype.activate,
        renderClear: $.fn.editabletypes.text.prototype.renderClear,
        postrender: $.fn.editabletypes.text.prototype.postrender,
        toggleClear: $.fn.editabletypes.text.prototype.toggleClear,
        clear: function() {
            $.fn.editabletypes.text.prototype.clear.call(this);
            this.$input.data('value', ''); 
        },
        
        
        /*
          Typeahead option methods used as defaults
        */
        matcher: function (item) {
            return $.fn.typeahead.Constructor.prototype.matcher.call(this, item.text);
        },
        sorter: function (items) {
            var beginswith = []
            , caseSensitive = []
            , caseInsensitive = []
            , item
            , text

            while (item = items.shift()) {
                text = item.text
                if (!text.toLowerCase().indexOf(this.query.toLowerCase())) beginswith.push(item)
                else if (~text.indexOf(this.query)) caseSensitive.push(item)
                else caseInsensitive.push(item)
            }

            return beginswith.concat(caseSensitive, caseInsensitive)
        },
        highlighter: function (item) {
            return $.fn.typeahead.Constructor.prototype.highlighter.call(this, item.text);
        },
        updater: function (item) {
            item = this.$menu.find('.active').data('item');
            this.$element.data('value', item.value);
            return item.text;
        },        
        
        /*
          Overwrite typeahead's render method to store objects.
          There are a lot of disscussion in bootstrap repo on this point and still no result.
          See https://github.com/twitter/bootstrap/issues/5967 
          
          This function just store item in via jQuery data() method instead of attr('data-value')
        */        
        typeaheadRender: function (items) {
            var that = this

            items = $(items).map(function (i, item) {
//                i = $(that.options.item).attr('data-value', item)
                i = $(that.options.item).data('item', item)
                i.find('a').html(that.highlighter(item))
                return i[0]
            })

            items.first().addClass('active')
            this.$menu.html(items)
            return this
        }
        
    });      

    Constructor.defaults = $.extend({}, $.fn.editabletypes.list.defaults, {
        /**
        @property tpl 
        @default <input type="text">
        **/         
        tpl:'<input type="text">',
        /**
        Configuration of typeahead.[Possible options](http://twitter.github.com/bootstrap/javascript.html#typeahead).
        
        @property typeahead 
        @type object
        @default null
        **/
        typeahead: null,
        /**
        Whether to show `clear` button 
        
        @property clear 
        @type boolean
        @default true        
        **/
        clear: true
    });

    $.fn.editabletypes.typeahead = Constructor;      
    
}(window.jQuery));