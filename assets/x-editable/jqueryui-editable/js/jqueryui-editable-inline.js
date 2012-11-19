/*! X-editable - v1.0.0 
* In-place editing with Twitter Bootstrap, jQuery UI or pure jQuery
* http://github.com/vitalets/x-editable
* Copyright (c) 2012 Vitaliy Potapov; Licensed MIT */

/**
Form with single input element, two buttons and two states: normal/loading.
Applied as jQuery method to DIV tag (not to form tag!)
Editableform is linked with one of input types, e.g. 'text' or 'select'.

@class editableform
@uses text
@uses textarea
**/
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
        /**
        Renders editableform

        @method render
        **/        
        render: function() {
            this.$loading = $($.fn.editableform.loading);        
            this.$container.empty().append(this.$loading);
            this.showLoading();
           
            this.initTemplate(); 
            
            /**        
            Fired when rendering starts
            @event rendering 
            @param {Object} event event object
            **/            
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
            /**        
            Fired when form was cancelled by user
            @event cancel 
            @param {Object} event event object
            **/              
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
            /**        
            Fired when form is shown
            @event show 
            @param {Object} event event object
            **/                    
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
               /**        
               Fired when form is submitted
               @event save 
               @param {Object} event event object
               @param {Object} params additional params
                    @param {mixed} params.newValue submitted value
                    @param {Object} params.response ajax response
                    
               @example
                   $('#form-div').on('save'), function(e, params){
                       if(params.newValue === 'username') {...}
                   });                    
               **/                
               this.$container.triggerHandler('save', {newValue: newValue, response: response});
            }, this))
            .fail($.proxy(function(xhr) {
               this.error(typeof xhr === 'string' ? xhr : xhr.responseText || xhr.statusText || 'Unknown error!'); 
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

                if(typeof this.options.url === 'function') { //user's function
                    return this.options.url.call(this, params);
                } else {  //send ajax to server and return deferred object
                    return $.ajax({
                        url     : this.options.url,
                        data    : params,
                        type    : 'post',
                        dataType: 'json'
                    });
                }
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

    /*
    Initialize editableform. Applied to jQuery object.
    
    @method $().editableform(options)
    @params {Object} options
    @example
        var $form = $('&lt;div&gt;').editableform({
            type: 'text',
            name: 'username',
            url: 'post.php',
            value: 'vitaliy'
        });
        
        //to display form you should call 'render' method
        $form.editableform('render');     
    */
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
        
        /**
        Type of input. Can be <code>text|textarea|select|date</code>

        @property type 
        @type string
        @default 'text'
        **/
        type: 'text',
        /**
        Url for submit, e.g. <code>post.php</code>  
        If function - it will be called instead of ajax. Function can return deferred object to run fail/done callbacks.

        @property url 
        @type string|function
        @default null
        @example
        url: function(params) {
           if(params.value === 'abc') {
               var d = new $.Deferred;
               return d.reject('field cannot be "abc"'); //returning error via deferred object
           } else {
               someModel.set(params.name, params.value); //save data in some js model
           }
        }        
        **/        
        url:null,
        /**
        Additional params for submit

        @property params 
        @type object
        @default null
        **/          
        params:null,
        /**
        Name of field. Will be submitted on server. Can be taken from <code>id</code> attribute

        @property name 
        @type string
        @default null
        **/         
        name: null,
        /**
        Primary key of editable object (e.g. record id in database). Use Object for composite keys.

        @property pk 
        @type string|object|function
        @default null
        **/         
        pk: null,
        /**
        Initial value. If not defined - will be taken from element's content.
        For __select__ type should be defined (as it is ID of shown text).

        @property value 
        @type string|object
        @default null
        **/        
        value: null,
        /**
        Strategy for sending data on server. Can be <code>auto|always|never</code>.
        When 'auto' data will be sent on server only if pk defined, otherwise new value will be stored in element.

        @property send 
        @type string
        @default 'auto'
        **/          
        send: 'auto', 
        /**
        Function for client-side validation. If returns string - means validation not passed and string showed as error.

        @property validate 
        @type function
        @default null
        @example
        validate: function(value) {
            if($.trim(value) == '') {
                return 'This field is required';
            }
        }
        **/         
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
      
      //loading div
      $.fn.editableform.loading = '<div class="editableform-loading"></div>';
      
      //error class attahced to control-group
      $.fn.editableform.errorGroupClass = null;  
      
      //error class attahced to editable-error-block
      $.fn.editableform.errorBlockClass = 'editable-error';

      //input types
      $.fn.editableform.types = {};
      //utils
      $.fn.editableform.utils = {};

}(window.jQuery));
/**
* EditableForm utilites
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
Attaches stand-alone container with editable-form to HTML element. Element is used only for positioning, value is not stored anywhere.<br>
This method applied internally in <code>$().editable()</code>. You should subscribe on it's events (save / cancel) to get profit of it.<br>
Final realization can be different: bootstrap-popover, jqueryui-tooltip, poshytip, inline-div. It depends on which js file you include.<br>
Applied as jQuery method.

@class editableContainer
@uses editableform
**/
(function ($) {

    var EditableContainer = function (element, options) {
        this.init(element, options);
    };

    //methods
    EditableContainer.prototype = {
        containerName: null, //tbd in child class
        innerCss: null, //tbd in child class
        init: function(element, options) {
            this.$element = $(element);
            //todo: what is in priority: data or js?
            this.options = $.extend({}, $.fn.editableContainer.defaults, $.fn.editableform.utils.getConfigData(this.$element), options);         
            this.splitOptions();
            this.initContainer();

            //bind 'destroyed' listener to destroy container when element is removed from dom
            this.$element.on('destroyed', $.proxy(function(){
                this.destroy();
            }, this));             
        },

        //split options on containerOptions and formOptions
        splitOptions: function() {
            this.containerOptions = {};
            this.formOptions = {};
            var cDef = $.fn[this.containerName].defaults;
            for(var k in this.options) {
              if(k in cDef) {
                 this.containerOptions[k] = this.options[k];
              } else {
                 this.formOptions[k] = this.options[k];
              } 
            }
        },
        
        initContainer: function(){
            this.call(this.containerOptions);
        },

        initForm: function() {
            this.$form = $('<div>')
            .editableform(this.formOptions)
            .on({
                save: $.proxy(this.save, this),
                cancel: $.proxy(this.cancel, this),
                show: $.proxy(this.setPosition, this),
                rendering: $.proxy(this.setPosition, this)
            });
            return this.$form;
        },        

        /*
        Returns jquery object of container
        @method tip()
        */         
        tip: function() {
            return this.container().$tip;
        },

        container: function() {
            return this.$element.data(this.containerName); 
        },

        call: function() {
            this.$element[this.containerName].apply(this.$element, arguments); 
        },

        /**
        Shows container with form
        @method show()
        **/          
        show: function () {
            this.call('show');                
            this.tip().addClass('editable-container');

            this.initForm();
            this.tip().find(this.innerCss).empty().append(this.$form);      
            this.$form.editableform('render');            
        },

        /**
        Hides container with form
        @method hide()
        **/         
        hide: function() {
            this.call('hide'); 
        },

        /*
        Updates the position of container when content changed.
        @method setPosition()
        */       
        setPosition: function() {
            //tbd in child class
        },

        cancel: function() {
            if(this.options.autohide) {
                this.hide();
            }
            /**        
            Fired when form was cancelled by user
            
            @event cancel 
            @param {Object} event event object
            **/             
            this.$element.triggerHandler('cancel');
        },

        save: function(e, params) {
            if(this.options.autohide) {
                this.hide();
            }
            /**        
            Fired when new value was submitted. You can use <code>$(this).data('editableContainer')</code> inside handler to access to editableContainer instance
            
            @event save 
            @param {Object} event event object
            @param {Object} params additional params
            @param {mixed} params.newValue submitted value
            @param {Object} params.response ajax response
            @example
            $('#username').on('save', function(e, params) {
                //assuming server response: '{success: true}'
                var pk = $(this).data('editableContainer').options.pk;
                if(params.response && params.response.success) {
                    alert('value: ' + params.newValue + ' with pk: ' + pk + ' saved!');
                } else {
                    alert('error!'); 
                } 
            });
            **/             
            this.$element.triggerHandler('save', params);
        },

        /**
        Sets new option
        
        @method option(key, value)
        @param {string} key 
        @param {mixed} value 
        **/         
        option: function(key, value) {
            this.options[key] = value;
            if(key in this.containerOptions) {
                this.containerOptions[key] = value;
                this.setContainerOption(key, value); 
            } else {
                this.formOptions[key] = value;
                if(this.$form) {
                    this.$form.editableform('option', key, value);  
                }
            }
        },
        
        setContainerOption: function(key, value) {
            this.call('option', key, value);
        },

        /**
        Destroys the container instance
        @method destroy()
        **/        
        destroy: function() {
            this.call('destroy');
        } 

    };

    /**
    jQuery method to initialize editableContainer.
    
    @method $().editableContainer(options)
    @params {Object} options
    @example
    $('#edit').editableContainer({
        type: 'text',
        url: 'post.php',
        pk: 1,
        value: 'hello'
    });
    **/  
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
        /**
        Initial value of form input

        @property value 
        @type mixed
        @default null
        @private
        **/        
        value: null,
        /**
        Placement of container relative to element. Can be <code>top|right|bottom|left</code>. Not used for inline container.

        @property placement 
        @type string
        @default 'top'
        **/        
        placement: 'top',
        /**
        Wether to hide container on save/cancel.

        @property autohide 
        @type boolean
        @default true
        @private 
        **/        
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
Makes editable any HTML element on the page. Applied as jQuery method.

@class editable
@uses editableContainer
**/
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
                $.error('You must define $.fn.editableContainer via including corresponding file (e.g. editable-popover.js)');
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
               /**        
               Fired each time when element's text is rendered. Occurs on initialization and on each update of value.
               Can be used for display customization.
                              
               @event render 
               @param {Object} event event object
               @param {Object} editable editable instance
               @example
               $('#action').on('render', function(e, editable) {
                    var colors = {0: "gray", 1: "green", 2: "blue", 3: "red"};
                    $(this).css("color", colors[editable.value]);  
               });                  
               **/                  
                this.$element.triggerHandler('render', this);
                this.isInit = false;    
            }, this));
        },
        
        /**
        Enables editable
        @method enable()
        **/          
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
        
        /**
        Disables editable
        @method disable()
        **/         
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
        
        /**
        Toggles enabled / disabled state of editable element
        @method toggleDisabled()
        **/         
        toggleDisabled: function() {
            if(this.options.disabled) {
                this.enable();
            } else { 
                this.disable(); 
            }
        },  
        
        /**
        Sets new option
        
        @method option(key, value)
        @param {string} key 
        @param {mixed} value 
        **/          
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
        
        /*
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
        Shows container with form
        @method show()
        **/  
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
        Hides container with form
        @method hide()
        **/       
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
        Toggles container visibility (show / hide)
        @method toggle()
        **/  
        toggle: function () {
            if(this.container && this.container.tip().is(':visible')) {
                this.hide();
            } else {
                this.show();
            }
        },
        
        /*
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
            
            /**        
            Fired when new value was submitted. You can use <code>$(this).data('editable')</code> inside handler to access to editable instance
            
            @event save 
            @param {Object} event event object
            @param {Object} params additional params
            @param {mixed} params.newValue submitted value
            @param {Object} params.response ajax response
            @example
            $('#username').on('save', function(e, params) {
                //assuming server response: '{success: true}'
                var pk = $(this).data('editable').options.pk;
                if(params.response && params.response.success) {
                    alert('value: ' + params.newValue + ' with pk: ' + pk + ' saved!');
                } else {
                    alert('error!'); 
                } 
            });
            **/              
        },

        validate: function () {
            if (typeof this.options.validate === 'function') {
                return this.options.validate.call(this, this.value);
            }
        },
        
        /**
        Sets new value of editable
        @method setValue(value, convertStr)
        @param {mixed} value new value 
        @param {boolean} convertStr wether to convert value from string to internal format        
        **/         
        setValue: function(value, convertStr) {
            if(convertStr) {
                this.value = this.input.str2value(value);
            } else {
                this.value = value;
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

    /**
    jQuery method to initialize editable element.
    
    @method $().editable(options)
    @params {Object} options
    @example
    $('#username').editable({
        type: 'text',
        url: 'post.php',
        pk: 1
    });
    **/    
    $.fn.editable = function (option) {
        //special API methods returning non-jquery object
        var result = {}, args = arguments, datakey = 'editable';
        switch (option) {
            /**
            Runs client-side validation for all matched editables
            
            @method validate()
            @returns {Object} validation errors map
            @example
            $('#username, #fullname').editable('validate');
            // possible result:
            {
              username: "username is requied",
              fullname: "fullname should be minimum 3 letters length"
            }
            **/             
            case 'validate':
                this.each(function () {
                    var $this = $(this), data = $this.data(datakey), error;
                    if (data && (error = data.validate())) {
                        result[data.options.name] = error;
                    }
                });
            return result;

            /**
            Returns current values of editable elements. If value is <code>null</code> or <code>undefined</code> it will not be returned
            @method getValue()
            @returns {Object} object of element names and values
            @example
            $('#username, #fullname').editable('validate');
            // possible result:
            {
            username: "superuser",
            fullname: "John"
            }
            **/               
            case 'getValue':
                this.each(function () {
                    var $this = $(this), data = $this.data(datakey);
                    if (data && data.value !== undefined && data.value !== null) {
                        result[data.options.name] = data.input.value2str(data.value);
                    }
                });
            return result;

            /**  
            This method collects values from several editable elements and submit them all to server. 
            It is designed mainly for <a href="#newrecord">creating new records</a>. 
            
            @method submit(options)
            @param {object} options 
            @param {object} options.url url to submit data 
            @param {object} options.data additional data to submit
            @param {function} options.error(obj) error handler (called on both client-side and server-side validation errors)
            @param {function} options.success(obj) success handler 
            @returns {Object} jQuery object
            **/            
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
        /**
        Type of input. Can be <code>text|textarea|select|date</code>

        @property type 
        @type string
        @default 'text'
        **/
        type: 'text',        
        /**
        Sets disabled state of editable

        @property disabled 
        @type boolean
        @default false
        **/         
        disabled: false,
        /**
        How to toggle editable. Can be <code>click|manual</code>. 
        When set to <code>manual</code> you should manually call <code>show/hide</code> methods of editable.  
        Note: if you are calling <code>show</code> on **click** event you need to apply <code>e.stopPropagation()</code> because container has behavior to hide on any click outside.
        
        @example
        $('#edit-button').click(function(e) {
            e.stopPropagation();
            $('#username').editable('toggle');
        });

        @property toggle 
        @type string
        @default 'click'
        **/          
        toggle: 'click',
        /**
        Text shown when element is empty.

        @property emptytext 
        @type string
        @default 'Empty'
        **/         
        emptytext: 'Empty',
        /**
        Allows to automatically set element's text based on it's value. Can be <code>auto|always|never</code>. Usefull for select and date.
        For example, if dropdown list is <code>{1: 'a', 2: 'b'}</code> and element's value set to <code>1</code>, it's html will be automatically set to <code>'a'</code>.  
        <code>auto</code> - text will be automatically set only if element is empty.  
        <code>always|never</code> - always(never) try to set element's text.

        @property autotext 
        @type string
        @default 'auto'
        **/          
        autotext: 'auto', 
        /**
        Wether to return focus on element after form is closed. 
        This allows fully keyboard input.

        @property enablefocus 
        @type boolean
        @default false
        **/          
        enablefocus: false,
        /**
        Initial value of input

        @property value 
        @type mixed
        @default element's text
        **/
        value: null,
        /**
        Success callback. Called when value successfully sent on server and response status = 200.
        Can be used to process json response. If this function returns string - means error occured and string is shown as error message.
        
        @property success 
        @type function
        @default null
        @example
        success: function(response, newValue) {
            if(!response.success) return response.msg;
        }
        **/          
        success: function(response, newValue) {} 
    };
    
}(window.jQuery));
/**
Abstract editable input class.
To create your own input you should inherit from this class.

@class abstract
**/
(function ($) {

    var Abstract = function () { };

    Abstract.prototype = {
       /**
        Iinitializes input
        
        @method init() 
        **/
       init: function(type, options, defaults) {
           this.type = type;
           this.options = $.extend({}, defaults, options); 
           this.$input = null;
           this.error = null;
       },
       
       /**
        Renders input. Can return jQuery deferred object.
        
        @method render() 
       **/       
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
        Sets element's html by value. 
        
        @method value2html(value, element) 
        @param {mixed} value
        @param {DOMElement} element
       **/       
       value2html: function(value, element) {
           var html = $('<div>').text(value).html();
           $(element).html(html);
       },
        
       /**
        Converts element's html to value
        
        @method html2value(html) 
        @param {string} html
        @returns {mixed}
       **/             
       html2value: function(html) {
           return $('<div>').html(html).text();
       },
        
       /**
        Converts value to string (for submiting to server)
        
        @method value2str(value) 
        @param {mixed} value
        @returns {string}
       **/       
       value2str: function(value) {
           return value;
       }, 
       
       /**
        Converts string received from server into value.
        
        @method str2value(str) 
        @param {string} str
        @returns {mixed}
       **/        
       str2value: function(str) {
           return str;
       }, 
       
       /**
        Sets value of input.
        
        @method value2input(value) 
        @param {mixed} value
       **/       
       value2input: function(value) {
           this.$input.val(value);
       },
        
       /**
        Returns value of input. Value can be object (e.g. datepicker)
        
        @method input2value() 
       **/         
       input2value: function() { 
           return this.$input.val();
       }, 

       /**
        Activates input. For text it sets focus.
        
        @method activate() 
       **/        
       activate: function() {
           if(this.$input.is(':visible')) {
               this.$input.focus();
           }
       } 
    };
        
    Abstract.defaults = {  
        /**
        HTML template of input. Normally you should not change it.

        @property tpl 
        @type string
        @default ''
        **/   
        tpl: '',
        /**
        CSS class automatically applied to input

        @property inputclass 
        @type string
        @default span2
        **/         
        inputclass: 'span2',
        /**
        Name attribute of input

        @property name 
        @type string
        @default null
        **/         
        name: null
    };
    
    $.extend($.fn.editableform.types, {abstract: Abstract});
        
}(window.jQuery));
/**
Text input

@class text
@extends abstract
@example
<a href="#" id="username" data-type="text" data-pk="1">awesome</a>
<script>
$(function(){
    $('#username').editable({
        url: 'post.php',
        title: 'Enter username'
    });
});
</script>
**/
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
        /**
        @property tpl 
        @default <input type="text">
        **/         
        tpl: '<input type="text">',
        /**
        Placeholder attribute of input. Shown when input is empty.

        @property placeholder 
        @type string
        @default null
        **/             
        placeholder: null
    });

    $.fn.editableform.types.text = Text;

}(window.jQuery));

/**
Textarea input

@class textarea
@extends abstract
@example
<a href="#" id="comments" data-type="textarea" data-pk="1">awesome comment!</a>
<script>
$(function(){
    $('#comments').editable({
        url: 'post.php',
        title: 'Enter comments'
    });
});
</script>
**/
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
        /**
        @property tpl 
        @default <textarea></textarea>
        **/          
        tpl:'<textarea></textarea>',
        /**
        @property inputclass 
        @default span3
        **/          
        inputclass:'span3',
        /**
        Placeholder attribute of input. Shown when input is empty.

        @property placeholder 
        @type string
        @default null
        **/             
        placeholder: null        
    });

    $.fn.editableform.types.textarea = Textarea;    

}(window.jQuery));
/**
Select (dropdown) input

@class select
@extends abstract
@example
<a href="#" id="status" data-type="select" data-pk="1" data-url="post.php" data-original-title="Select status"></a>
<script>
$(function(){
    $('#status').editable({
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
            return null; //it's not good idea to set value by text for SELECT. Better set NULL
        },

        value2html: function (value, element) {
            var deferred = $.Deferred();
            this.onSourceReady(function () {
                var i, text = '';
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
        /**
        @property tpl 
        @default <select></select>
        **/         
        tpl:'<select></select>',
        /**
        Source data for dropdown list. If string - considered ajax url to load items. Otherwise should be an array.
        Array format is: <code>[{value: 1, text: "text"}, {...}]</code><br>
        For compability it also supports format <code>{value1: text1, value2: text2 ...}</code> but it does not guarantee elements order.      

        @property source 
        @type string|array|object
        @default null
        **/         
        source:null, 
        /**
        Data automatically prepended to the begining of dropdown list.
        
        @property prepend 
        @type string|array|object
        @default false
        **/         
        prepend:false,
        /**
        Error message shown when list cannot be loaded (e.g. ajax error)
        
        @property sourceError 
        @type string
        @default Error when loading options
        **/          
        sourceError: 'Error when loading options'
    });

    $.fn.editableform.types.select = Select;      

}(window.jQuery));

/*
Editableform based on jQuery UI
*/
(function ($) {
    
    $.extend($.fn.editableform.Constructor.prototype, {
         initTemplate: function() {
              this.$form = $($.fn.editableform.template);
              
             //init buttons
             this.$form.find('button[type=submit]').button({
                 icons: { primary: "ui-icon-check" },
                 text: false
             });
             this.$form.find('button[type=button]').button({
                 icons: { primary: "ui-icon-cancel" },
                 text: false
             });
         }
    });
    
    //form template
    $.fn.editableform.template = '<form class="editableform"><div class="control-group">' + 
    '&nbsp;<button type="submit" style="height: 24px">submit</button>&nbsp;<button type="button" style="height: 24px">cancel</button></div>' + 
    '<div class="editable-error-block"></div>' + 
    '</form>'; 
    
    //error classes
    $.fn.editableform.errorGroupClass = null;
    $.fn.editableform.errorBlockClass = 'ui-state-error';
    
}(window.jQuery));
/**
* Editable Inline 
* ---------------------
*/
(function ($) {

    //extend methods
    $.extend($.fn.editableContainer.Constructor.prototype, {
        containerName: 'editableform',
        innerCss: null,
                 
        initContainer: function(){
            //no init for container
            //only convert anim to miliseconds
            if(!this.options.anim) {
                this.options.anim = 0;
            }         
        },
        
        splitOptions: function() {
            this.containerOptions = {};
            this.formOptions = this.options;
        },
        
        tip: function() {
           return this.$form; 
        },
        
        show: function () {
            this.$element.hide();
            
            if(this.$form) {
                this.$form.remove();
            }
            
            this.initForm();
            this.tip().addClass('editable-container').addClass('editable-inline');            
            this.$form.insertAfter(this.$element);
            this.$form.show(this.options.anim);
            this.$form.editableform('render');
        }, 
        
        hide: function () {
            this.$form.hide(this.options.anim, $.proxy(function() {
                this.$element.show();
                //return focus on element
                if (this.options.enablefocus) {
                    this.$element.focus();
                }                
            }, this)); 
        },
        
        destroy: function() {
            this.tip().remove();
        } 
    });

    //defaults
    $.fn.editableContainer.defaults = $.extend({}, $.fn.editableContainer.defaults, {
        anim: 'fast',
        enablefocus: false
    });    


}(window.jQuery));
/**
jQuery UI Datepicker.  
Description and examples: http://jqueryui.com/datepicker.  
Do not use it together with bootstrap-datepicker.

@class dateui
@extends abstract
@example
<a href="#" id="dob" data-type="date" data-pk="1" data-url="post.php" data-original-title="Select date">15/05/1984</a>
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

    var DateUI = function (options) {
        this.init('dateui', options, DateUI.defaults);
        
        //set popular options directly from settings or data-* attributes
        var directOptions =  $.fn.editableform.utils.sliceObj(this.options, ['format']);

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
        /**
        @property tpl 
        @default <div></div>
        **/         
        tpl:'<div></div>',
        /**
        @property inputclass 
        @default 'editable-date'
        **/         
        inputclass: 'editable-date',
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
            changeMonth: true
        }
    });   

    $.fn.editableform.types.dateui = DateUI;
    $.fn.editableform.types.date = DateUI;

}(window.jQuery));
