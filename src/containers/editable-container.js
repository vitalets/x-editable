/**
* Editable Container 
* Container can be popover, inline form or whatever
* Container must provide following:
* 1. methods: 
*   show(), 
*   hide(), 
*   tip() - returns jquery object of container element
*   option()
* 
* 2. events: 
* - save
* - cancel
* 
* 3. settings: trigger, value, placement
*/
(function ($) {
    
    //Constructor
    var EditableContainer = function (element, options) {
        this.init(element, options);
    };
    
    //methods
    EditableContainer.prototype = {
        containerName: null, //tbd in child class
        innerCss: null, //tbd in child class
        init: function(element, options) {
            this.$element = $(element);
            this.options = $.extend({}, $.fn.editableContainer.defaults, $.fn.editableform.utils.getConfigData(this.$element), options);         
            this.initContainer();
            
            //bind 'destroyed' listener to destroy container when element is removed from dom
            this.$element.on('destroyed', $.proxy(function(){
                this.destroy();
            }, this));             
        },
        
        initContainer: function(){
           this.call(this.options);
        },
        
        initForm: function() {
            this.$form = $('<div>')
            .editableform(this.options)
            .on({
                save: $.proxy(this.save, this),
                cancel: $.proxy(this.cancel, this),
                show: $.proxy(this.setPosition, this),
                rendering: $.proxy(this.setPosition, this)
            });
            return this.$form;
        },        

        tip: function() {
           return this.container().$tip;
        },
        
        //return instance of container
        container: function() {
           return this.$element.data(this.containerName); 
        },
        
        //call container's method
        call: function() {
           this.$element[this.containerName].apply(this.$element, arguments); 
        },
        
        show: function () {
            this.call('show');                
            this.tip().addClass('editable-container');
            
            this.initForm();
            this.tip().find(this.innerCss).empty().append(this.$form);      
            this.$form.editableform('render');            
       },
       
       hide: function() {
           this.call('hide'); 
       },
       
       setPosition: function() {
          //tbd in child class
       },
      
       cancel: function() {
           if(this.options.autohide) {
               this.hide();
           }
           this.$element.triggerHandler('cancel');
       },
       
       save: function(e, params) {
           if(this.options.autohide) {
               this.hide();
           }
           this.$element.triggerHandler('save', params);
       },
      
       option: function(key, value) {
          this.options[key] = value;
          this.call('option', key, value); 
       },
       
       destroy: function() {
          this.call('destroy');
       } 
        
    };
    
    //jQuery plugin definition
    $.fn.editableContainer = function (option) {
        var args = arguments;
        return this.each(function () {
            var $this = $(this),
                dataKey = 'editableContainer', 
                data = $this.data(dataKey), 
                options = typeof option === 'object' && option;

            if (!data) {
                $this.data(dataKey, (data = new EditableContainer(this, options)));
            }
            
            if (typeof option === 'string') { //call method 
                data[option].apply(data, Array.prototype.slice.call(args, 1));
            }            
        });
    };     
    
    //store constructor
    $.fn.editableContainer.Constructor = EditableContainer;
    
    //defaults - must be redefined!
    $.fn.editableContainer.defaults = {
       trigger: 'manual',
       value: null,
       placement: 'top',
       autohide: true
    };
    
    /* 
    * workaround to have 'destroyed' event to destroy popover when element is destroyed
    * see http://stackoverflow.com/questions/2200494/jquery-trigger-event-when-an-element-is-removed-from-the-dom
    */
    jQuery.event.special.destroyed = {
        remove: function(o) {
            if (o.handler) {
                o.handler();
            }
        }
    };    
    
}(window.jQuery));