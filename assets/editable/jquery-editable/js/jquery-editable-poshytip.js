/*! X-editable - v1.0.0 
* In-place editing with Twitter Bootstrap, jQuery UI or pure jQuery
* https://github.com/vitalets/x-editable
* Copyright (c) 2012 Vitaliy Potapov; Licensed MIT, GPL */

/**
* Editable-form plugin
* Form with single input element, two buttons and automatic loader, shown on init/submit
* Plugin applied to DIV tag and show form inside
* Input must be one of following types:
* - text
* - textarea
* - select
* - date
* - <your input here>
* 
* EVENTS:
* - render
* - resize
* - save
*/
(function ($) {

    var EditableForm = function (element, options) {
        this.options = $.extend({}, $.fn.editableform.defaults, options);
        this.$container = $(element); //div, containing form
        this.initInput();
    };

    EditableForm.prototype = {
        constructor: EditableForm,
        initInput: function() {
            var TypeConstructor, typeOptions;
            
            //create input of specified type
            if(typeof $.fn.editableform.types[this.options.type] === 'function') {
                TypeConstructor = $.fn.editableform.types[this.options.type];
                typeOptions = $.fn.editableform.utils.sliceObj(this.options, Object.keys(TypeConstructor.defaults));
                this.input = new TypeConstructor(typeOptions);
            } else {
                $.error('Unknown type: '+ this.options.type);
                return; 
            }          

            this.value = this.input.str2value(this.options.value); 
        },
        initTemplate: function() {
            this.$form = $($.fn.editableform.template); 
        },
        render: function() {
            this.$loading = $(this.options.loading);        
            this.$container.empty().append(this.$loading);
            this.showLoading();
           
            this.initTemplate(); 
            
            this.$container.triggerHandler('rendering');
            
            //render input
            $.when(this.input.render())
            .then($.proxy(function () {
                this.$form.find('div.control-group').prepend(this.input.$input);
                this.$form.find('button[type=button]').click($.proxy(this.cancel, this));
                this.$container.append(this.$form);
                if(this.input.error) {
                    this.error(this.input.error);
                    this.$form.find('button[type=submit]').attr('disabled', true);
                    this.input.$input.attr('disabled', true);
                } else {
                    this.error(false);
                    this.input.$input.removeAttr('disabled');
                    this.$form.find('button[type=submit]').removeAttr('disabled');
                    this.input.value2input(this.value);
                    this.$form.submit($.proxy(this.submit, this));
                }
                this.showForm();
            }, this));
        },
        cancel: function() {
            this.$container.triggerHandler('cancel');
        },
        showLoading: function() {
            var fw, fh, iw, ih;
            //set loading size equal to form
            if(this.$form) {
                fh = this.$form.outerHeight() || 0;
                fw = this.$form.outerWidth() || 0;
                ih = (this.input && this.input.$input.outerHeight()) || 0;
                iw = (this.input && this.input.$input.outerWidth()) || 0;
                if(fh || ih) {
                    this.$loading.height(fh > ih ? fh : ih);
                }
                if(fw || iw) {
                    this.$loading.width(fw > iw ? fw : iw);
                }
                this.$form.hide();
            }
            this.$loading.show(); 
        },

        showForm: function() {
            this.$loading.hide();
            this.$form.show();
            this.input.activate();         
            this.$container.triggerHandler('show');
        },
        
        error: function(msg) {
            var $group = this.$form.find('.control-group'),
                $block = this.$form.find('.editable-error-block');
                
            if(msg === false) {
                $group.removeClass($.fn.editableform.errorGroupClass);
                $block.removeClass($.fn.editableform.errorBlockClass).empty().hide(); 
            } else {
                $group.addClass($.fn.editableform.errorGroupClass);
                $block.addClass($.fn.editableform.errorBlockClass).text(msg).show();
            }
        },
               
        submit: function(e) {
            e.stopPropagation();
            e.preventDefault();

            var error,
                //get value from input
                newValue = this.input.input2value(),
                newValueStr;

            //validation
            if (error = this.validate(newValue)) {
                this.error(error);
                this.showForm();
                return;
            } 
            
            //value as string
            newValueStr = this.input.value2str(newValue);
            
            //if value not changed --> cancel
            /*jslint eqeq: true*/
            if (newValueStr == this.input.value2str(this.value)) {
            /*jslint eqeq: false*/                
                this.cancel();
                return;
            } 

            //sending data to server
            $.when(this.save(newValueStr))
            .done($.proxy(function(response) {
               this.error(false);   
               this.value = newValue;
               this.$container.triggerHandler('save', {newValue: newValue, response: response});
            }, this))
            .fail($.proxy(function(xhr) {
               this.error(xhr.responseText || xhr.statusText || 'Unknown error!'); 
               this.showForm();  
            }, this));
        },

        save: function(value) {
            var pk = (typeof this.options.pk === 'function') ? this.options.pk.call(this) : this.options.pk,
                send = !!((this.options.url !== undefined) && (this.options.url !== null) && ((this.options.send === 'always') || (this.options.send === 'auto' && pk))),
                params;
                
            if (send) { //send to server
                this.showLoading();
                
                //try parse json in single quotes
                this.options.params = $.fn.editableform.utils.tryParseJson(this.options.params, true);                
                
                params = $.extend({}, this.options.params, {
                    name: this.options.name || '',
                    value: value,
                    pk: pk 
                });

                //send ajax to server and return deferred object
                return $.ajax({
                    url     : (typeof this.options.url === 'function') ? this.options.url.call(this) : this.options.url,
                    data    : params,
                    type    : 'post',
                    dataType: 'json'
                });
            }
        }, 
        
        validate: function (value) {
            if (value === undefined) {
                value = this.value;
            }
            if (typeof this.options.validate === 'function') {
                return this.options.validate.call(this, value);
            }
        },
        
       option: function(key, value) {
          this.options[key] = value;
       }        
    };

    //jquery plugin definition
    $.fn.editableform = function (option) {
        var args = arguments;
        return this.each(function () {
            var $this = $(this), 
            data = $this.data('editableform'), 
            options = typeof option === 'object' && option; 
            if (!data) {
                $this.data('editableform', (data = new EditableForm(this, options)));
            }
            
            if (typeof option === 'string') { //call method 
                data[option].apply(data, Array.prototype.slice.call(args, 1));
            } 
        });
    };
    
    //keep link to constructor to allow inheritance
    $.fn.editableform.Constructor = EditableForm;    

    //defaults
    $.fn.editableform.defaults = {
        /* see also defaults for input */
        type: 'text',
        url:null,
        params:null,
        name: null,
        pk: null,
        value: null,  //initial value
        send: 'auto', //always|auto|never
        loading: '<div class="editableform-loading"></div>',
        validate: null
    };   

    /*
      Note: following params could redefined in engine: bootstrap or jqueryui:
      Classes 'control-group' and 'editable-error-block' must always present!
    */      
      $.fn.editableform.template = '<form class="form-inline editableform"><div class="control-group">' + 
    '&nbsp;<button type="submit">Ok</button>&nbsp;<button type="button">Cancel</button></div>' + 
    '<div class="editable-error-block"></div>' + 
    '</form>';
      
      //error class attahced to control-group
      $.fn.editableform.errorGroupClass = null;
      //error class attahced to editable-error-block
      $.fn.editableform.errorBlockClass = 'editable-error';

        
    //input types
    $.fn.editableform.types = {};
    $.fn.editableform.utils = {};

}(window.jQuery));
/**
* EditableForm utils
*/
(function ($) {
    $.extend($.fn.editableform, {
        utils: {
            /**
            * classic JS inheritance function
            */
            inherit: function (Child, Parent) {
                var F = function() { };
                F.prototype = Parent.prototype;
                Child.prototype = new F();
                Child.prototype.constructor = Child;
                Child.superclass = Parent.prototype;
            },

            /**
            * set caret position in input
            * see http://stackoverflow.com/questions/499126/jquery-set-cursor-position-in-text-area
            */        
            setCursorPosition: function(elem, pos) {
                if (elem.setSelectionRange) {
                    elem.setSelectionRange(pos, pos);
                } else if (elem.createTextRange) {
                    var range = elem.createTextRange();
                    range.collapse(true);
                    range.moveEnd('character', pos);
                    range.moveStart('character', pos);
                    range.select();
                }
            },

            /**
            * function to parse JSON in *single* quotes. (jquery automatically parse only double quotes)
            * That allows such code as: <a data-source="{'a': 'b', 'c': 'd'}">
            * safe = true --> means no exception will be thrown
            * for details see http://stackoverflow.com/questions/7410348/how-to-set-json-format-to-html5-data-attributes-in-the-jquery
            */
            tryParseJson: function(s, safe) {
                if (typeof s === 'string' && s.length && s.match(/^\{.*\}$/)) {
                    if (safe) {
                        try {
                            /*jslint evil: true*/
                            s = (new Function('return ' + s))();
                            /*jslint evil: false*/
                        } catch (e) {} finally {
                            return s;
                        }
                    } else {
                        /*jslint evil: true*/
                        s = (new Function('return ' + s))();
                        /*jslint evil: false*/
                    }
                }
                return s;
            },

            /**
            * slice object by specified keys
            */
            sliceObj: function(obj, keys, caseSensitive /* default: false */) {
                var key, keyLower, newObj = {};

                if (!$.isArray(keys) || !keys.length) {
                    return newObj;
                }

                for (var i = 0; i < keys.length; i++) {
                    key = keys[i];
                    if (obj.hasOwnProperty(key)) {
                        newObj[key] = obj[key];
                    }

                    if(caseSensitive === true) {
                        continue;
                    }

                    //when getting data-* attributes via $.data() it's converted to lowercase.
                    //details: http://stackoverflow.com/questions/7602565/using-data-attributes-with-jquery
                    //workaround is code below.
                    keyLower = key.toLowerCase();
                    if (obj.hasOwnProperty(keyLower)) {
                        newObj[key] = obj[keyLower];
                    }
                }

                return newObj;
            },
            
            /**
            * exclude complex objects from $.data() before pass to config
            */
            getConfigData: function($element) {
                var data = {};
                $.each($element.data(), function(k, v) {
                   if(typeof v !== 'object' || (v && typeof v === 'object' && v.constructor === Object)) {
                      data[k] = v;
                   }
                });
                return data;
            }            
        }
    });      
}(window.jQuery));
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
/**
* Editable-element
* Initialize HTML element that can be editable by click.
* 1. methods
* 
* 2. events
* - render 
*/
(function ($) {

    var Editable = function (element, options) {
        this.$element = $(element);
        this.options = $.extend({}, $.fn.editable.defaults, $.fn.editableform.utils.getConfigData(this.$element), options);  
        this.init();
    };

    Editable.prototype = {
        constructor: Editable, 
        init: function () {
            var TypeConstructor, 
                isValueByText = false, 
                doAutotext, 
                finalize;

            //initialization flag    
            this.isInit = true;    
                
            //editableContainer must be defined
            if(!$.fn.editableContainer) {
                $.error('You must define $.fn.editableContainer via including corresponding file (e.g. editablePopover)');
                return;
            }    
                
            //name must be defined
            this.options.name = this.options.name || this.$element.attr('id');
            if (!this.options.name) {
                $.error('You must define name (or id) for Editable element');
                return;
            } 
             
            //create input of specified type. Input will be used for converting value, not in form
            if(typeof $.fn.editableform.types[this.options.type] === 'function') {
                TypeConstructor = $.fn.editableform.types[this.options.type];
                this.typeOptions = $.fn.editableform.utils.sliceObj(this.options, Object.keys(TypeConstructor.defaults));
                this.input = new TypeConstructor(this.typeOptions);
            } else {
                $.error('Unknown type: '+ this.options.type);
                return; 
            }            

            //set value from settings or by element's text
            if (this.options.value === undefined || this.options.value === null) {
                this.value = this.input.html2value($.trim(this.$element.html()));
                isValueByText = true;
            } else {
                this.value = this.input.str2value($.trim(this.options.value));
            }
            
            //attach handler to close any container on escape
            $(document).off('keyup.editable').on('keyup.editable', function (e) {
                if (e.which === 27) {
                    $('.editable-container').find('button[type=button]').click();
                }
            }); 
            
            //attach handler to close container when click outside
            $(document).off('click.editable').on('click.editable', function(e) {
                //if click inside container --> do nothing
                var $target = $(e.target);
                if($target.is('.editable-container') || $target.parents('.editable-container').length || $target.parents('.ui-datepicker-header').length) {
                    return;
                }
                $('.editable-container').find('button[type=button]').click();
            });
            
            //add 'editable' class
            this.$element.addClass('editable');
            
            //always attach click handler, but in disabled mode it just prevent default action (useful for links)
            this.$element.on('click.editable', $.proxy(this.click, this));
            
            //check conditions for autotext:
            //if value was generated by text or value is empty, no sense to run autotext
            doAutotext = !isValueByText && this.value !== null && this.value !== undefined;
            doAutotext &= (this.options.autotext === 'always') || (this.options.autotext === 'auto' && !this.$element.text().length);
            $.when(doAutotext ? this.input.value2html(this.value, this.$element) : true).then($.proxy(function() {
                if(this.options.disabled) {
                    this.disable();
                } else {
                    this.enable(); 
                }
                this.$element.triggerHandler('render', this);
                this.isInit = false;    
            }, this));
        },
        
        enable: function() {
            this.options.disabled = false;
            this.$element.removeClass('editable-disabled');
            this.handleEmpty();
            if(this.options.toggle === 'click') {
                this.$element.addClass('editable-click');
                if(this.$element.attr('tabindex') === -1) {
                    this.$element.removeAttr('tabindex');                                
                }
            }
        },
        
        disable: function() {
            this.options.disabled = true; 
            this.hide();           
            this.$element.addClass('editable-disabled');
            this.handleEmpty();
            if(this.options.toggle === 'click') {
                this.$element.removeClass('editable-click');
                this.$element.attr('tabindex', -1);                
            }
        },
        
        toggleDisabled: function() {
            if(this.options.disabled) {
                this.enable();
            } else { 
                this.disable(); 
            }
        },  
        
        option: function(key, value) {
            if(key === 'disabled') {
                if(value) {
                    this.disable();
                } else {
                    this.enable();
                }
                return;
            } 
                       
            this.options[key] = value;
            
            //transfer new option to container! 
            if(this.container) {
              this.container.option(key, value);  
            }
        },              
        
        /**
        * set emptytext if element is empty (reverse: remove emptytext if needed)
        */
        handleEmpty: function () {
            var emptyClass = 'editable-empty';
            //emptytext shown only for enabled
            if(!this.options.disabled) {
                if ($.trim(this.$element.text()) === '') {
                    this.$element.addClass(emptyClass).text(this.options.emptytext);
                } else {
                    this.$element.removeClass(emptyClass);
                }
            } else {
                //below required if element disable property was changed
                if(this.$element.hasClass(emptyClass)) {
                    this.$element.empty();
                    this.$element.removeClass(emptyClass);
                }
            }
        },        
        
        click: function (e) {
            e.preventDefault();
            if(this.options.disabled || this.options.toggle !== 'click') {
                return;
            }
            //stop propagation bacause document listen any click to hide all containers
            e.stopPropagation();
            this.toggle();
        },
        
        /**
        * show container with form
        */
        show: function () {
            if(this.options.disabled) {
                return;
            }
            
            //init editableContainer: popover, tooltip, inline, etc..
            if(!this.container) {
                var containerOptions = $.extend({}, this.options, {
                    value: this.value,
                    autohide: false
                });
                this.$element.editableContainer(containerOptions);
                this.$element.on({
                    save: $.proxy(this.save, this),
                    cancel: $.proxy(this.hide, this)
                });
                this.container = this.$element.data('editableContainer'); 
            } else if(this.container.tip().is(':visible')) {
                return;
            }      
                                         
            //hide all other editable containers. Required to work correctly with toggle = manual
            $('.editable-container').find('button[type=button]').click();
            
            //show container
            this.container.show();
        },
        
        /**
        * hide container with form
        */        
        hide: function () {
            if(this.container && this.container.tip().is(':visible')) {
                this.container.hide();
                
                //return focus on element
                if (this.options.enablefocus && this.options.toggle === 'click') {
                    this.$element.focus();
                }                
            }
        },
        
        /**
        * show/hide form container
        */
        toggle: function () {
            if(this.container && this.container.tip().is(':visible')) {
                this.hide();
            } else {
                this.show();
            }
        },
        
        /**
        * called when form was submitted
        */          
        save: function(e, params) {
             var error, form;
             
             //if sent to server, call success callback. if it return string --> show error
             if((params.response !== undefined) && (error = this.options.success.call(this, params.response, params.newValue))) {
                 form = this.container.tip().find('form').parent().data('editableform');
                 form.error(error);
                 form.showForm();
                 return;
             }
           
            //if value was not sent to server and value changed --> mark element with unsaved css
            if(params.response === undefined && this.input.value2str(this.value) !== this.input.value2str(params.newValue)) { 
                this.$element.addClass('editable-unsaved');
            } else {
                this.$element.removeClass('editable-unsaved');
            }
            
            this.hide();
            this.setValue(params.newValue);
        },

        validate: function () {
            if (typeof this.options.validate === 'function') {
                return this.options.validate.call(this, this.value);
            }
        },
        
        setValue: function(v, convertStr) {
            if(convertStr) {
                this.value = this.input.str2value(v);
            } else {
                this.value = v;
            }
            if(this.container) {
                this.container.option('value', this.value);
            }
            $.when(this.input.value2html(this.value, this.$element))
            .then($.proxy(function() {
                this.handleEmpty();
                this.$element.triggerHandler('render', this);                        
            }, this));
        }        
    };

    /* EDITABLE PLUGIN DEFINITION
    * ======================= */

    $.fn.editable = function (option) {
        //special methods returning non-jquery object
        var result = {}, args = arguments, datakey = 'editable';
        switch (option) {
            case 'validate':
                this.each(function () {
                    var $this = $(this), data = $this.data(datakey), error;
                    if (data && (error = data.validate())) {
                        result[data.options.name] = error;
                    }
                });
            return result;

            case 'getValue':
                this.each(function () {
                    var $this = $(this), data = $this.data(datakey);
                    if (data && data.value !== undefined && data.value !== null) {
                        result[data.options.name] = data.input.value2str(data.value);
                    }
                });
            return result;

            case 'submit':  //collects value, validate and submit to server for creating new record
                var config = arguments[1] || {},
                $elems = this,
                errors = this.editable('validate'),
                values;

                if(typeof config.error !== 'function') {
                    config.error = function() {};
                } 

                if($.isEmptyObject(errors)) {
                    values = this.editable('getValue'); 
                    if(config.data) {
                        $.extend(values, config.data);
                    }
                    $.ajax({
                        type: 'POST',
                        url: config.url, 
                        data: values, 
                        dataType: 'json'
                    }).success(function(response) {
                        if(typeof response === 'object' && response.id) {
                            $elems.editable('option', 'pk', response.id); 
                            $elems.removeClass('editable-unsaved');
                            if(typeof config.success === 'function') {
                                config.success.apply($elems, arguments);
                            } 
                        } else { //server-side validation error
                            config.error.apply($elems, arguments);
                        }
                    }).error(function(){  //ajax error
                        config.error.apply($elems, arguments);
                    });
                } else { //client-side validation error
                    config.error.call($elems, {errors: errors});
                }
            return this;
        }

        //return jquery object
        return this.each(function () {
            var $this = $(this), 
                data = $this.data(datakey), 
                options = typeof option === 'object' && option;

            if (!data) {
                $this.data(datakey, (data = new Editable(this, options)));
            }

            if (typeof option === 'string') { //call method 
                data[option].apply(data, Array.prototype.slice.call(args, 1));
            } 
        });
    };    
            

    $.fn.editable.defaults = {
        type:'text',
        disabled: false,
        toggle: 'click',
        trigger: 'manual',
        emptytext: 'Empty',
        autotext: 'auto', 
        enablefocus: false,
        success: function(response, newValue) {} //value successfully sent on server and response status = 200
    };
    
}(window.jQuery));
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
/**
* text
*/
(function ($) {
    var Text = function (options) {
        this.init('text', options, Text.defaults);
    };

    $.fn.editableform.utils.inherit(Text, $.fn.editableform.types.abstract);

    $.extend(Text.prototype, {
        activate: function() {
            if(this.$input.is(':visible')) {
                $.fn.editableform.utils.setCursorPosition(this.$input.get(0), this.$input.val().length);
                this.$input.focus();
            }
        }  
    });

    Text.defaults = $.extend({}, $.fn.editableform.types.abstract.defaults, {
        tpl: '<input type="text">' 
    });

    $.fn.editableform.types.text = Text;

}(window.jQuery));
/**
* textarea
*/
(function ($) {

    var Textarea = function (options) {
        this.init('textarea', options, Textarea.defaults);
    };

    $.fn.editableform.utils.inherit(Textarea, $.fn.editableform.types.abstract);

    $.extend(Textarea.prototype, {
        render: function () {
            Textarea.superclass.render.call(this);

            //ctrl + enter
            this.$input.keydown(function (e) {
                if (e.ctrlKey && e.which === 13) {
                    $(this).closest('form').submit();
                }
            });
        },

        value2html: function(value, element) {
            var html = '', lines;
            if(value) {
                lines = value.split("\n");
                for (var i = 0; i < lines.length; i++) {
                    lines[i] = $('<div>').text(lines[i]).html();
                }
                html = lines.join('<br>');
            }
            $(element).html(html);
        },

        html2value: function(html) {
            if(!html) {
                return '';
            }
            var lines = html.split(/<br\s*\/?>/i);
            for (var i = 0; i < lines.length; i++) {
                lines[i] = $('<div>').html(lines[i]).text();
            }
            return lines.join("\n"); 
        },        

        activate: function() {
            if(this.$input.is(':visible')) {
                $.fn.editableform.utils.setCursorPosition(this.$input.get(0), this.$input.val().length);
                this.$input.focus();
            }
        }         
    });

    Textarea.defaults = $.extend({}, $.fn.editableform.types.abstract.defaults, {
        tpl:'<textarea rows="8"></textarea>',
        inputclass:'span3'
    });

    $.fn.editableform.types.textarea = Textarea;    

}(window.jQuery));
/**
* select
*/
(function ($) {

    var Select = function (options) {
        this.init('select', options, Select.defaults);
    };

    $.fn.editableform.utils.inherit(Select, $.fn.editableform.types.abstract);

    $.extend(Select.prototype, {
        render: function () {
            Select.superclass.render.call(this);
            var deferred = $.Deferred();
            this.error = null;
            this.sourceData = null;
            this.prependData = null;
            this.onSourceReady(function () {
                this.renderOptions();
                deferred.resolve();
            }, function () {
                this.error = this.options.sourceError;
                deferred.resolve();
            });

            return deferred.promise();
        },

        html2value: function (html) {
            return null; //it's not good idea to set value by text for SELECT. better set NULL
        },

        value2html: function (value, element) {
            var deferred = $.Deferred();
            this.onSourceReady(function () {
                var i, text = null;
                if($.isArray(this.sourceData)) {
                    for(i=0; i<this.sourceData.length; i++){
                        /*jshint eqeqeq: false*/
                        if(this.sourceData[i].value == value) {
                        /*jshint eqeqeq: true*/                            
                            text = this.sourceData[i].text;
                            break; 
                        }
                    } 
                }
                Select.superclass.value2html(text, element);
                deferred.resolve();
            }, function () {
                Select.superclass.value2html(this.options.sourceError, element);
                deferred.resolve();
            });

            return deferred.promise();
        },  

        // ------------- additional functions ------------

        onSourceReady: function (success, error) {
            //if allready loaded just call success
            if($.isArray(this.sourceData)) {
                success.call(this);
                return; 
            }

            // try parse json in single quotes (for double quotes jquery does automatically)
            try {
                this.options.source = $.fn.editableform.utils.tryParseJson(this.options.source, false);
            } catch (e) {
                error.call(this);
                return;
            }

            //loading from url
            if (typeof this.options.source === 'string') {
                var cacheID = this.options.source + (this.options.name ? '-' + this.options.name : ''),
                cache;

                if (!$(document).data(cacheID)) {
                    $(document).data(cacheID, {});
                }
                cache = $(document).data(cacheID);

                //check for cached data
                if (cache.loading === false && cache.sourceData) { //take source from cache
                    this.sourceData = cache.sourceData;
                    success.call(this);
                    return;
                } else if (cache.loading === true) { //cache is loading, put callback in stack to be called later
                    cache.callbacks.push($.proxy(function () {
                        this.sourceData = cache.sourceData;
                        success.call(this);
                    }, this));

                    //also collecting error callbacks
                    cache.err_callbacks.push($.proxy(error, this));
                    return;
                } else { //no cache yet, activate it
                    cache.loading = true;
                    cache.callbacks = [];
                    cache.err_callbacks = [];
                }

                //loading sourceData from server
                $.ajax({
                    url: this.options.source,
                    type: 'get',
                    cache: false,
                    data: {name: this.options.name},
                    dataType: 'json',
                    success: $.proxy(function (data) {
                        cache.loading = false;
                        // this.options.source = data;
                        this.sourceData = this.makeArray(data);
                        if($.isArray(this.sourceData)) {
                            this.doPrepend();
                            //store result in cache
                            cache.sourceData = this.sourceData;
                            success.call(this);
                            $.each(cache.callbacks, function () { this.call(); }); //run success callbacks for other fields
                        } else {
                            error.call(this);
                            $.each(cache.err_callbacks, function () { this.call(); }); //run error callbacks for other fields
                        }
                    }, this),
                    error: $.proxy(function () {
                        cache.loading = false;
                        error.call(this);
                        $.each(cache.err_callbacks, function () { this.call(); }); //run error callbacks for other fields
                    }, this)
                });
            } else { //options as json/array
                this.sourceData = this.makeArray(this.options.source);
                if($.isArray(this.sourceData)) {
                    this.doPrepend();
                    success.call(this);   
                } else {
                    error.call(this);
                }
            }
        },

        doPrepend: function () {
            if(this.options.prepend === null || this.options.prepend === undefined) {
                return;  
            }
            
            if(!$.isArray(this.prependData)) {
                //try parse json in single quotes
                this.options.prepend = $.fn.editableform.utils.tryParseJson(this.options.prepend, true);
                if (typeof this.options.prepend === 'string') {
                    this.options.prepend = {'': this.options.prepend};
                }              
                this.prependData = this.makeArray(this.options.prepend);
            }

            if($.isArray(this.prependData) && $.isArray(this.sourceData)) {
                this.sourceData = this.prependData.concat(this.sourceData);
            }
        },

        renderOptions: function() {
            if(!$.isArray(this.sourceData)) {
                return;
            }

            for(var i=0; i<this.sourceData.length; i++) {
                this.$input.append($('<option>', {value: this.sourceData[i].value}).text(this.sourceData[i].text)); 
            }
        },

        /**
        * convert data to array suitable for sourceData, e.g. [{value: 1, text: 'abc'}, {...}]
        */
        makeArray: function(data) {
            var count, obj, result = [], iterateEl;
            if(!data || typeof data === 'string') {
                return null; 
            }

            if($.isArray(data)) { //array
                iterateEl = function (k, v) {
                    obj = {value: k, text: v};
                    if(count++ >= 2) {
                        return false;// exit each if object has more than one value
                    }
                };
            
                for(var i = 0; i < data.length; i++) {
                    if(typeof data[i] === 'object') {
                        count = 0;
                        $.each(data[i], iterateEl);
                        if(count === 1) {
                            result.push(obj); 
                        } else if(count > 1 && data[i].hasOwnProperty('value') && data[i].hasOwnProperty('text')) {
                            result.push(data[i]);
                        } else {
                            //data contains incorrect objects
                        }
                    } else {
                        result.push({value: i, text: data[i]}); 
                    }
                }
            } else {  //object
                $.each(data, function (k, v) {
                    result.push({value: k, text: v});
                });  
            }
            return result;
        }

    });      

    Select.defaults = $.extend({}, $.fn.editableform.types.abstract.defaults, {
        tpl:'<select></select>',
        source:null,  //can be string (url), object or array [{value: 1, text: 'abc'}, {...}]
        prepend:false,
        sourceError: 'Error when loading options'
    });

    $.fn.editableform.types.select = Select;      

}(window.jQuery));
/**
* Editable Poshytip 
* ---------------------
* requires jquery.poshytip.js
*/
(function ($) {
    
    //extend methods
    $.extend($.fn.editableContainer.Constructor.prototype, {
        containerName: 'poshytip',
        innerCss: 'div.tip-inner',
        
        initContainer: function(){
            this.handlePlacement();
            this.call(this.options);
            
            var $content = $('<div>')
              .append($('<label>').text(this.options.title || this.$element.data( "ui-tooltip-title") || this.$element.data( "originalTitle")))
              .append(this.initForm());            
              
            this.call('update', $content);                         
        },        
        
        show: function () {
            this.$form.editableform('render');
            this.tip().addClass('editable-container');


            this.call('show');
            this.$form.data('editableform').input.activate();
        },        
         
        setPosition: function() {
            this.container().refresh(false);
        },
        
        handlePlacement: function() {
           var x, y, ox = 0, oy = 0; 
           switch(this.options.placement) {
               case 'top':
                      x = 'center';
                      y = 'top';
                      oy = 5;
               break;
               case 'right':
                      x = 'right';
                      y = 'center';
                      ox = 10;
               break;
               case 'bottom':
                      x = 'center';
                      y = 'bottom';
                      oy = 5;
               break;
               case 'left':
                      x = 'left';
                      y = 'center';
                      ox = 10;
               break;                                             
           }
           
           this.options.alignX = x;
           this.options.offsetX = ox;
           
           this.options.alignY = y;
           this.options.offsetY = oy;
        }
    });
    
    //defaults
    $.fn.editableContainer.defaults = $.extend({}, $.fn.poshytip.defaults, $.fn.editableContainer.defaults, {
        className: 'tip-yellowsimple',
        showOn: 'none',
        content: '',
        alignTo: 'target'
    });
    
    
    /**
    * Poshytip fix: disable incorrect table display
    * see https://github.com/vadikom/poshytip/issues/7
    */ 
    /*jshint eqeqeq:false, curly: false*/
    var tips = [],
    reBgImage = /^url\(["']?([^"'\)]*)["']?\);?$/i,
    rePNG = /\.png$/i,
    ie6 = $.browser.msie && $.browser.version == 6;
    
    $.Poshytip.prototype.refresh = function(async) {
        if (this.disabled)
            return;
            
        var currPos;
        if (async) {
            if (!this.$tip.data('active'))
                return;
            // save current position as we will need to animate
            currPos = {left: this.$tip.css('left'), top: this.$tip.css('top')};
        }

        // reset position to avoid text wrapping, etc.
        this.$tip.css({left: 0, top: 0}).appendTo(document.body);

        // save default opacity
        if (this.opacity === undefined)
            this.opacity = this.$tip.css('opacity');

        // check for images - this code is here (i.e. executed each time we show the tip and not on init) due to some browser inconsistencies
        var bgImage = this.$tip.css('background-image').match(reBgImage),
        arrow = this.$arrow.css('background-image').match(reBgImage);

        if (bgImage) {
            var bgImagePNG = rePNG.test(bgImage[1]);
            // fallback to background-color/padding/border in IE6 if a PNG is used
            if (ie6 && bgImagePNG) {
                this.$tip.css('background-image', 'none');
                this.$inner.css({margin: 0, border: 0, padding: 0});
                bgImage = bgImagePNG = false;
            } else {
                this.$tip.prepend('<table class="fallback" border="0" cellpadding="0" cellspacing="0"><tr><td class="tip-top tip-bg-image" colspan="2"><span></span></td><td class="tip-right tip-bg-image" rowspan="2"><span></span></td></tr><tr><td class="tip-left tip-bg-image" rowspan="2"><span></span></td><td></td></tr><tr><td class="tip-bottom tip-bg-image" colspan="2"><span></span></td></tr></table>')
                .css({border: 0, padding: 0, 'background-image': 'none', 'background-color': 'transparent'})
                .find('.tip-bg-image').css('background-image', 'url("' + bgImage[1] +'")').end()
                .find('td').eq(3).append(this.$inner);
            }
            // disable fade effect in IE due to Alpha filter + translucent PNG issue
            if (bgImagePNG && !$.support.opacity)
                this.opts.fade = false;
        }
        // IE arrow fixes
        if (arrow && !$.support.opacity) {
            // disable arrow in IE6 if using a PNG
            if (ie6 && rePNG.test(arrow[1])) {
                arrow = false;
                this.$arrow.css('background-image', 'none');
            }
            // disable fade effect in IE due to Alpha filter + translucent PNG issue
            this.opts.fade = false;
        }

        var $table = this.$tip.find('table.fallback');
        if (ie6) {
            // fix min/max-width in IE6
            this.$tip[0].style.width = '';
            $table.width('auto').find('td').eq(3).width('auto');
            var tipW = this.$tip.width(),
            minW = parseInt(this.$tip.css('min-width'), 10),
            maxW = parseInt(this.$tip.css('max-width'), 10);
            if (!isNaN(minW) && tipW < minW)
                tipW = minW;
            else if (!isNaN(maxW) && tipW > maxW)
                tipW = maxW;
            this.$tip.add($table).width(tipW).eq(0).find('td').eq(3).width('100%');
        } else if ($table[0]) {
            // fix the table width if we are using a background image
            // IE9, FF4 use float numbers for width/height so use getComputedStyle for them to avoid text wrapping
            // for details look at: http://vadikom.com/dailies/offsetwidth-offsetheight-useless-in-ie9-firefox4/
            $table.width('auto').find('td').eq(3).width('auto').end().end().width(document.defaultView && document.defaultView.getComputedStyle && parseFloat(document.defaultView.getComputedStyle(this.$tip[0], null).width) || this.$tip.width()).find('td').eq(3).width('100%');
        }
        this.tipOuterW = this.$tip.outerWidth();
        this.tipOuterH = this.$tip.outerHeight();

        this.calcPos();

        // position and show the arrow image
        if (arrow && this.pos.arrow) {
            this.$arrow[0].className = 'tip-arrow tip-arrow-' + this.pos.arrow;
            this.$arrow.css('visibility', 'inherit');
        }

        if (async) {
            this.asyncAnimating = true;
            var self = this;
            this.$tip.css(currPos).animate({left: this.pos.l, top: this.pos.t}, 200, function() { self.asyncAnimating = false; });
        } else {
            this.$tip.css({left: this.pos.l, top: this.pos.t});
        }
    };
    /*jshinteqeqeq: true, curly: true*/
}(window.jQuery));
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
