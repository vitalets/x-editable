/*! X-editable - v1.3.0 
* In-place editing with Twitter Bootstrap, jQuery UI or pure jQuery
* http://github.com/vitalets/x-editable
* Copyright (c) 2012 Vitaliy Potapov; Licensed MIT */

/**
Form with single input element, two buttons and two states: normal/loading.
Applied as jQuery method to DIV tag (not to form tag!). This is because form can be in loading state when spinner shown.
Editableform is linked with one of input types, e.g. 'text', 'select' etc.

@class editableform
@uses text
@uses textarea
**/
(function ($) {

    var EditableForm = function (div, options) {
        this.options = $.extend({}, $.fn.editableform.defaults, options);
        this.$div = $(div); //div, containing form. Not form tag! Not editable-element.
        if(!this.options.scope) {
            this.options.scope = this;
        }
        this.initInput();
    };

    EditableForm.prototype = {
        constructor: EditableForm,
        initInput: function() {  //called once
            var TypeConstructor, typeOptions;

            //create input of specified type
            if(typeof $.fn.editabletypes[this.options.type] === 'function') {
                TypeConstructor = $.fn.editabletypes[this.options.type];
                typeOptions = $.fn.editableutils.sliceObj(this.options, $.fn.editableutils.objectKeys(TypeConstructor.defaults));
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
        initButtons: function() {
            this.$form.find('.editable-buttons').append($.fn.editableform.buttons);
        },
        /**
        Renders editableform

        @method render
        **/        
        render: function() {
            this.$loading = $($.fn.editableform.loading);        
            this.$div.empty().append(this.$loading);
            this.showLoading();
            
            //init form template and buttons
            this.initTemplate(); 
            if(this.options.showbuttons) {
                this.initButtons();
            } else {
                this.$form.find('.editable-buttons').remove();
            }

            /**        
            Fired when rendering starts
            @event rendering 
            @param {Object} event event object
            **/            
            this.$div.triggerHandler('rendering');

            //render input
            $.when(this.input.render())
            .then($.proxy(function () {
                //input
                this.$form.find('div.editable-input').append(this.input.$input);

                //automatically submit inputs when no buttons shown
                if(!this.options.showbuttons) {
                    this.input.autosubmit(); 
                }
                
                //"clear" link
                if(this.input.$clear) {
                    this.$form.find('div.editable-input').append($('<div class="editable-clear">').append(this.input.$clear));  
                }                

                //append form to container
                this.$div.append(this.$form);
                 
                //attach 'cancel' handler
                this.$form.find('.editable-cancel').click($.proxy(this.cancel, this));

                if(this.input.error) {
                    this.error(this.input.error);
                    this.$form.find('.editable-submit').attr('disabled', true);
                    this.input.$input.attr('disabled', true);
                    //prevent form from submitting
                    this.$form.submit(function(e){ e.preventDefault(); });
                } else {
                    this.error(false);
                    this.input.$input.removeAttr('disabled');
                    this.$form.find('.editable-submit').removeAttr('disabled');
                    this.input.value2input(this.value);
                    //attach submit handler
                    this.$form.submit($.proxy(this.submit, this));
                }

                /**        
                Fired when form is rendered
                @event rendered
                @param {Object} event event object
                **/            
                this.$div.triggerHandler('rendered');                

                this.showForm();
            }, this));
        },
        cancel: function() {   
            /**        
            Fired when form was cancelled by user
            @event cancel 
            @param {Object} event event object
            **/              
            this.$div.triggerHandler('cancel');
        },
        showLoading: function() {
            var w;
            if(this.$form) {
                //set loading size equal to form 
                this.$loading.width(this.$form.outerWidth());
                this.$loading.height(this.$form.outerHeight());
                this.$form.hide();
            } else {
                //stretch loading to fill container width
                w = this.$loading.parent().width();
                if(w) {
                    this.$loading.width(w);
                }
            }
            this.$loading.show(); 
        },

        showForm: function(activate) {
            this.$loading.hide();
            this.$form.show();
            if(activate !== false) {
                this.input.activate(); 
            }
            /**        
            Fired when form is shown
            @event show 
            @param {Object} event event object
            **/                    
            this.$div.triggerHandler('show');
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
                newValue = this.input.input2value(); //get new value from input

            //validation
            if (error = this.validate(newValue)) {
                this.error(error);
                this.showForm();
                return;
            } 
            
            //if value not changed --> trigger 'nochange' event and return
            /*jslint eqeq: true*/
            if (!this.options.savenochange && this.input.value2str(newValue) == this.input.value2str(this.value)) {
            /*jslint eqeq: false*/                
                /**        
                Fired when value not changed but form is submitted. Requires savenochange = false.
                @event nochange 
                @param {Object} event event object
                **/                    
                this.$div.triggerHandler('nochange');            
                return;
            } 

            //sending data to server
            $.when(this.save(newValue))
            .done($.proxy(function(response) {
                //run success callback
                var res = typeof this.options.success === 'function' ? this.options.success.call(this.options.scope, response, newValue) : null;
                
                //if success callback returns false --> keep form open and do not activate input
                if(res === false) {
                    this.error(false);
                    this.showForm(false);
                    return;
                }     
                
                //if success callback returns string -->  keep form open, show error and activate input               
                if(typeof res === 'string') {
                    this.error(res);
                    this.showForm();
                    return;
                }     
                
                //if success callback returns object like {newValue: <something>} --> use that value instead of submitted
                if(res && typeof res === 'object' && res.hasOwnProperty('newValue')) {
                    newValue = res.newValue;
                }                            

                //clear error message
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
                this.$div.triggerHandler('save', {newValue: newValue, response: response});
            }, this))
            .fail($.proxy(function(xhr) {
                this.error(typeof xhr === 'string' ? xhr : xhr.responseText || xhr.statusText || 'Unknown error!'); 
                this.showForm();  
            }, this));
        },

        save: function(newValue) {
            //convert value for submitting to server
            var submitValue = this.input.value2submit(newValue);
            
            //try parse composite pk defined as json string in data-pk 
            this.options.pk = $.fn.editableutils.tryParseJson(this.options.pk, true); 
            
            var pk = (typeof this.options.pk === 'function') ? this.options.pk.call(this.options.scope) : this.options.pk,
            send = !!(typeof this.options.url === 'function' || (this.options.url && ((this.options.send === 'always') || (this.options.send === 'auto' && pk)))),
            params;

            if (send) { //send to server
                this.showLoading();

                //standard params
                params = {
                    name: this.options.name || '',
                    value: submitValue,
                    pk: pk 
                };

                //additional params
                if(typeof this.options.params === 'function') {
                    params = this.options.params.call(this.options.scope, params);  
                } else {
                    //try parse json in single quotes (from data-params attribute)
                    this.options.params = $.fn.editableutils.tryParseJson(this.options.params, true);   
                    $.extend(params, this.options.params);
                }

                if(typeof this.options.url === 'function') { //user's function
                    return this.options.url.call(this.options.scope, params);
                } else {  
                    //send ajax to server and return deferred object
                    return $.ajax($.extend({
                        url     : this.options.url,
                        data    : params,
                        type    : 'POST'
                    }, this.options.ajaxOptions));
                }
            }
        }, 

        validate: function (value) {
            if (value === undefined) {
                value = this.value;
            }
            if (typeof this.options.validate === 'function') {
                return this.options.validate.call(this.options.scope, value);
            }
        },

        option: function(key, value) {
            this.options[key] = value;
            if(key === 'value') {
                this.setValue(value);
            }
        },

        setValue: function(value, convertStr) {
            if(convertStr) {
                this.value = this.input.str2value(value);
            } else {
                this.value = value;
            }
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
        url: '/post',
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
        Type of input. Can be <code>text|textarea|select|date|checklist</code>

        @property type 
        @type string
        @default 'text'
        **/
        type: 'text',
        /**
        Url for submit, e.g. <code>'/post'</code>  
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
        Additional params for submit. If defined as <code>object</code> - it is **appended** to original ajax data (pk, name and value).  
        If defined as <code>function</code> - returned object **overwrites** original ajax data.
        @example
        params: function(params) {
            //originally params contain pk, name and value
            params.a = 1;
            return params;
        }

        @property params 
        @type object|function
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
        Primary key of editable object (e.g. record id in database). For composite keys use object, e.g. <code>{id: 1, lang: 'en'}</code>.
        Can be calculated dynamically via function.

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
        validate: null,
        /**
        Success callback. Called when value successfully sent on server and **response status = 200**.  
        Useful to work with json response. For example, if your backend response can be <code>{success: true}</code>
        or <code>{success: false, msg: "server error"}</code> you can check it inside this callback.  
        If it returns **string** - means error occured and string is shown as error message.  
        If it returns **object like** <code>{newValue: &lt;something&gt;}</code> - it overwrites value, submitted by user.  
        Otherwise newValue simply rendered into element.
        
        @property success 
        @type function
        @default null
        @example
        success: function(response, newValue) {
            if(!response.success) return response.msg;
        }
        **/          
        success: null,
        /**
        Additional options for ajax request.
        List of values: http://api.jquery.com/jQuery.ajax

        @property ajaxOptions 
        @type object
        @default null
        @since 1.1.1        
        **/        
        ajaxOptions: null,
        /**
        Whether to show buttons or not.  
        Form without buttons can be auto-submitted by input or by onblur = 'submit'.
        @example 
        ajaxOptions: {
            method: 'PUT',
            dataType: 'xml'
        }

        @property showbuttons 
        @type boolean
        @default true
        @since 1.1.1
        **/         
        showbuttons: true,
        /**
        Scope for callback methods (success, validate).  
        If <code>null</code> means editableform instance itself. 

        @property scope 
        @type DOMElement|object
        @default null
        @since 1.2.0
        @private
        **/            
        scope: null,
        /**
        Whether to save or cancel value when it was not changed but form was submitted

        @property savenochange 
        @type boolean
        @default false
        @since 1.2.0
        **/
        savenochange: false         
    };   

    /*
    Note: following params could redefined in engine: bootstrap or jqueryui:
    Classes 'control-group' and 'editable-error-block' must always present!
    */      
    $.fn.editableform.template = '<form class="form-inline editableform">'+
    '<div class="control-group">' + 
    '<div><div class="editable-input"></div><div class="editable-buttons"></div></div>'+
    '<div class="editable-error-block"></div>' + 
    '</div>' + 
    '</form>';

    //loading div
    $.fn.editableform.loading = '<div class="editableform-loading"></div>';

    //buttons
    $.fn.editableform.buttons = '<button type="submit" class="editable-submit">ok</button>'+
    '<button type="button" class="editable-cancel">cancel</button>';      

    //error class attached to control-group
    $.fn.editableform.errorGroupClass = null;  

    //error class attached to editable-error-block
    $.fn.editableform.errorBlockClass = 'editable-error';
}(window.jQuery));
/**
* EditableForm utilites
*/
(function ($) {
    //utils
    $.fn.editableutils = {
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
            if (typeof s === 'string' && s.length && s.match(/^[\{\[].*[\}\]]$/)) {
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
        },

        objectKeys: function(o) {
            if (Object.keys) {
                return Object.keys(o);  
            } else {
                if (o !== Object(o)) {
                    throw new TypeError('Object.keys called on a non-object');
                }
                var k=[], p;
                for (p in o) {
                    if (Object.prototype.hasOwnProperty.call(o,p)) {
                        k.push(p);
                    }
                }
                return k;
            }

        },
        
       /**
        method to escape html.
       **/
       escape: function(str) {
           return $('<div>').text(str).html();
       }           
    };      
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
            this.options = $.extend({}, $.fn.editableContainer.defaults, $.fn.editableutils.getConfigData(this.$element), options);         
            this.splitOptions();
            this.initContainer();

            //bind 'destroyed' listener to destroy container when element is removed from dom
            this.$element.on('destroyed', $.proxy(function(){
                this.destroy();
            }, this)); 
            
            //attach document handlers (once)
            if(!$(document).data('editable-handlers-attached')) {
                //close all on escape
                $(document).on('keyup.editable', function (e) {
                    if (e.which === 27) {
                        $('.editable-open').editableContainer('hide');
                        //todo: return focus on element 
                    }
                });

                //close containers when click outside
                $(document).on('click.editable', function(e) {
                    var $target = $(e.target);
                    
                    //if click inside some editableContainer --> no nothing  
                    if($target.is('.editable-container') || $target.parents('.editable-container').length || $target.parents('.ui-datepicker-header').length) {                
                        return;
                    } else {
                        //close all open containers (except one)
                        EditableContainer.prototype.closeOthers(e.target);
                    }
                });
                
                $(document).data('editable-handlers-attached', true);
            }                        
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
            this.formOptions.scope = this.$element[0]; //set scope of form callbacks to element
            this.$form = $('<div>')
            .editableform(this.formOptions)
            .on({
                save: $.proxy(this.save, this),
                cancel: $.proxy(function(){ this.hide('cancel'); }, this),
                nochange: $.proxy(function(){ this.hide('nochange'); }, this),
                show: $.proxy(this.setPosition, this), //re-position container every time form is shown (occurs each time after loading state)
                rendering: $.proxy(this.setPosition, this), //this allows to place container correctly when loading shown
                rendered: $.proxy(function(){
                    /**        
                    Fired when container is shown and form is rendered (for select will wait for loading dropdown options)
                    
                    @event shown 
                    @param {Object} event event object
                    @example
                    $('#username').on('shown', function() {
                         var $tip = $(this).data('editableContainer').tip();
                         $tip.find('input').val('overwriting value of input..');
                    });                     
                    **/                      
                    this.$element.triggerHandler('shown');
                }, this) 
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
        @param {boolean} closeAll Whether to close all other editable containers when showing this one. Default true.
        **/          
        show: function (closeAll) {
            this.$element.addClass('editable-open');
            if(closeAll !== false) {
                //close all open containers (except this)
                this.closeOthers(this.$element[0]);  
            }
            
            this.innerShow();
        },
        
        /* internal show method. To be overwritten in child classes */
        innerShow: function () {
            this.call('show');                
            this.tip().addClass('editable-container');
            this.initForm();
            this.tip().find(this.innerCss).empty().append(this.$form);     
            this.$form.editableform('render');            
        },

        /**
        Hides container with form
        @method hide()
        @param {string} reason Reason caused hiding. Can be <code>save|cancel|onblur|nochange|undefined (=manual)</code>
        **/         
        hide: function(reason) {  
            if(!this.tip() || !this.tip().is(':visible') || !this.$element.hasClass('editable-open')) {
                return;
            }
            this.$element.removeClass('editable-open');   
            this.innerHide();
            /**        
            Fired when container was hidden. It occurs on both save or cancel.

            @event hidden 
            @param {object} event event object
            @param {string} reason Reason caused hiding. Can be <code>save|cancel|onblur|nochange|undefined (=manual)</code>
            @example
            $('#username').on('hidden', function(e, reason) {
                if(reason === 'save' || reason === 'cancel') {
                    //auto-open next editable
                    $(this).closest('tr').next().find('.editable').editable('show');
                } 
            });            
            **/             
            this.$element.triggerHandler('hidden', reason);   
        },
        
        /* internal hide method. To be overwritten in child classes */
        innerHide: function () {
            this.call('hide');       
        },        
        
        /**
        Toggles container visibility (show / hide)
        @method toggle()
        @param {boolean} closeAll Whether to close all other editable containers when showing this one. Default true.
        **/          
        toggle: function(closeAll) {
            if(this.tip && this.tip().is(':visible')) {
                this.hide();
            } else {
                this.show(closeAll);
            } 
        },

        /*
        Updates the position of container when content changed.
        @method setPosition()
        */       
        setPosition: function() {
            //tbd in child class
        },

        save: function(e, params) {
            this.hide('save');
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
        },
        
        /*
        Closes other containers except one related to passed element. 
        Other containers can be cancelled or submitted (depends on onblur option)
        */
        closeOthers: function(element) {
            $('.editable-open').each(function(i, el){
                //do nothing with passed element and it's children
                if(el === element || $(el).find(element).length) {
                    return;
                }

                //otherwise cancel or submit all open containers 
                var $el = $(el),
                ec = $el.data('editableContainer');

                if(!ec) {
                    return;  
                }
                
                if(ec.options.onblur === 'cancel') {
                    $el.data('editableContainer').hide('onblur');
                } else if(ec.options.onblur === 'submit') {
                    $el.data('editableContainer').tip().find('form').submit();
                }
            });

        },
        
        /**
        Activates input of visible container (e.g. set focus)
        @method activate()
        **/         
        activate: function() {
            if(this.tip && this.tip().is(':visible') && this.$form) {
               this.$form.data('editableform').input.activate(); 
            }
        } 

    };

    /**
    jQuery method to initialize editableContainer.
    
    @method $().editableContainer(options)
    @params {Object} options
    @example
    $('#edit').editableContainer({
        type: 'text',
        url: '/post',
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

    //defaults
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
        Whether to hide container on save/cancel.

        @property autohide 
        @type boolean
        @default true
        @private 
        **/        
        autohide: true,
        /**
        Action when user clicks outside the container. Can be <code>cancel|submit|ignore</code>.  
        Setting <code>ignore</code> allows to have several containers open. 

        @property onblur 
        @type string
        @default 'cancel'
        @since 1.1.1
        **/        
        onblur: 'cancel'
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
        this.options = $.extend({}, $.fn.editable.defaults, $.fn.editableutils.getConfigData(this.$element), options);  
        this.init();
    };

    Editable.prototype = {
        constructor: Editable, 
        init: function () {
            var TypeConstructor, 
                isValueByText = false, 
                doAutotext, 
                finalize;

            //editableContainer must be defined
            if(!$.fn.editableContainer) {
                $.error('You must define $.fn.editableContainer via including corresponding file (e.g. editable-popover.js)');
                return;
            }    
                
            //name
            this.options.name = this.options.name || this.$element.attr('id');
             
            //create input of specified type. Input will be used for converting value, not in form
            if(typeof $.fn.editabletypes[this.options.type] === 'function') {
                TypeConstructor = $.fn.editabletypes[this.options.type];
                this.typeOptions = $.fn.editableutils.sliceObj(this.options, $.fn.editableutils.objectKeys(TypeConstructor.defaults));
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
                /*
                  value can be string when received from 'data-value' attribute
                  for complext objects value can be set as json string in data-value attribute, 
                  e.g. data-value="{city: 'Moscow', street: 'Lenina'}"
                */
                this.options.value = $.fn.editableutils.tryParseJson(this.options.value, true); 
                if(typeof this.options.value === 'string') {
                    this.value = this.input.str2value(this.options.value);
                } else {
                    this.value = this.options.value;
                }
            }
            
            //add 'editable' class to every editable element
            this.$element.addClass('editable');
            
            //attach handler activating editable. In disabled mode it just prevent default action (useful for links)
            if(this.options.toggle !== 'manual') {
                this.$element.addClass('editable-click');
                this.$element.on(this.options.toggle + '.editable', $.proxy(function(e){
                    e.preventDefault();
                    //stop propagation not required anymore because in document click handler it checks event target
                    //e.stopPropagation();
                    
                    if(this.options.toggle === 'mouseenter') {
                        //for hover only show container
                        this.show(); 
                    } else {
                        //when toggle='click' we should not close all other containers as they will be closed automatically in document click listener
                        var closeAll = (this.options.toggle !== 'click');
                        this.toggle(closeAll);
                    }                    
                }, this));
            } else {
                this.$element.attr('tabindex', -1); //do not stop focus on element when toggled manually
            }
            
            //check conditions for autotext:
            //if value was generated by text or value is empty, no sense to run autotext
            doAutotext = !isValueByText && this.value !== null && this.value !== undefined;
            doAutotext &= (this.options.autotext === 'always') || (this.options.autotext === 'auto' && !this.$element.text().length);
            $.when(doAutotext ? this.render() : true).then($.proxy(function() {
                if(this.options.disabled) {
                    this.disable();
                } else {
                    this.enable(); 
                }
               /**        
               Fired when element was initialized by editable method.
                              
               @event init 
               @param {Object} event event object
               @param {Object} editable editable instance
               @since 1.2.0
               **/                  
                this.$element.triggerHandler('init', this);
            }, this));
        },

        /*
        Renders value into element's text.
        Can call custom display method from options.
        Can return deferred object.
        @method render()
        */          
        render: function() {
            //do not display anything
            if(this.options.display === false) {
                return;
            }
            //if it is input with source, we pass callback in third param to be called when source is loaded
            if(this.input.options.hasOwnProperty('source')) {
                return this.input.value2html(this.value, this.$element[0], this.options.display); 
            //if display method defined --> use it    
            } else if(typeof this.options.display === 'function') {
                return this.options.display.call(this.$element[0], this.value);
            //else use input's original value2html() method    
            } else {
                return this.input.value2html(this.value, this.$element[0]); 
            }
        },
        
        /**
        Enables editable
        @method enable()
        **/          
        enable: function() {
            this.options.disabled = false;
            this.$element.removeClass('editable-disabled');
            this.handleEmpty();
            if(this.options.toggle !== 'manual') {
                if(this.$element.attr('tabindex') === '-1') {    
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
            //do not stop focus on this element
            this.$element.attr('tabindex', -1);                
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
        @param {string|object} key option name or object with several options
        @param {mixed} value option new value
        @example
        $('.editable').editable('option', 'pk', 2);
        **/          
        option: function(key, value) {
            //set option(s) by object
            if(key && typeof key === 'object') {
               $.each(key, $.proxy(function(k, v){
                  this.option($.trim(k), v); 
               }, this)); 
               return;
            }

            //set option by string             
            this.options[key] = value;                          
            
            //disabled
            if(key === 'disabled') {
                if(value) {
                    this.disable();
                } else {
                    this.enable();
                }
                return;
            } 
            
            //value
            if(key === 'value') {
                this.setValue(value);
            }
            
            //transfer new option to container! 
            if(this.container) {
                this.container.option(key, value);  
            }
        },              
        
        /*
        * set emptytext if element is empty (reverse: remove emptytext if needed)
        */
        handleEmpty: function () {
            //do not handle empty if we do not display anything
            if(this.options.display === false) {
                return;
            }
            
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
        
        /**
        Shows container with form
        @method show()
        @param {boolean} closeAll Whether to close all other editable containers when showing this one. Default true.
        **/  
        show: function (closeAll) {
            if(this.options.disabled) {
                return;
            }
            
            //init editableContainer: popover, tooltip, inline, etc..
            if(!this.container) {
                var containerOptions = $.extend({}, this.options, {
                    value: this.value
                });
                this.$element.editableContainer(containerOptions);
                this.$element.on("save.internal", $.proxy(this.save, this));
                this.container = this.$element.data('editableContainer'); 
            } else if(this.container.tip().is(':visible')) {
                return;
            }      
            
            //show container
            this.container.show(closeAll);
        },
        
        /**
        Hides container with form
        @method hide()
        **/       
        hide: function () {   
            if(this.container) {  
                this.container.hide();
            }
        },
        
        /**
        Toggles container visibility (show / hide)
        @method toggle()
        @param {boolean} closeAll Whether to close all other editable containers when showing this one. Default true.
        **/  
        toggle: function(closeAll) {
            if(this.container && this.container.tip().is(':visible')) {
                this.hide();
            } else {
                this.show(closeAll);
            }
        },
        
        /*
        * called when form was submitted
        */          
        save: function(e, params) {
            //if url is not user's function and value was not sent to server and value changed --> mark element with unsaved css. 
            if(typeof this.options.url !== 'function' && this.options.display !== false && params.response === undefined && this.input.value2str(this.value) !== this.input.value2str(params.newValue)) { 
                this.$element.addClass('editable-unsaved');
            } else {
                this.$element.removeClass('editable-unsaved');
            }
            
           // this.hide();
            this.setValue(params.newValue);
            
            /**        
            Fired when new value was submitted. You can use <code>$(this).data('editable')</code> to access to editable instance
            
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
            //event itself is triggered by editableContainer. Description here is only for documentation              
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
        @param {boolean} convertStr whether to convert value from string to internal format
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
            $.when(this.render())
            .then($.proxy(function() {
                this.handleEmpty();
            }, this));
        },
        
        /**
        Activates input of visible container (e.g. set focus)
        @method activate()
        **/         
        activate: function() {
            if(this.container) {
               this.container.activate(); 
            }
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
        url: '/post',
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
              username: "username is required",
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
                        result[data.options.name] = data.input.value2submit(data.value);
                    }
                });
            return result;

            /**  
            This method collects values from several editable elements and submit them all to server.   
            Internally it runs client-side validation for all fields and submits only in case of success.  
            See <a href="#newrecord">creating new records</a> for details.
            
            @method submit(options)
            @param {object} options 
            @param {object} options.url url to submit data 
            @param {object} options.data additional data to submit
            @param {object} options.ajaxOptions additional ajax options            
            @param {function} options.error(obj) error handler 
            @param {function} options.success(obj,config) success handler
            @returns {Object} jQuery object
            **/            
            case 'submit':  //collects value, validate and submit to server for creating new record
                var config = arguments[1] || {},
                $elems = this,
                errors = this.editable('validate'),
                values;

                if($.isEmptyObject(errors)) {
                    values = this.editable('getValue'); 
                    if(config.data) {
                        $.extend(values, config.data);
                    }                    
                    
                    $.ajax($.extend({
                        url: config.url, 
                        data: values, 
                        type: 'POST'                        
                    }, config.ajaxOptions))
                    .success(function(response) {
                        //successful response 200 OK
                        if(typeof config.success === 'function') {
                            config.success.call($elems, response, config);
                        } 
                    })
                    .error(function(){  //ajax error
                        if(typeof config.error === 'function') {
                            config.error.apply($elems, arguments);
                        }
                    });
                } else { //client-side validation error
                    if(typeof config.error === 'function') {
                        config.error.call($elems, errors);
                    }
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
        Type of input. Can be <code>text|textarea|select|date|checklist</code> and more

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
        How to toggle editable. Can be <code>click|dblclick|mouseenter|manual</code>.   
        When set to <code>manual</code> you should manually call <code>show/hide</code> methods of editable.    
        **Note**: if you call <code>show</code> or <code>toggle</code> inside **click** handler of some DOM element, 
        you need to apply <code>e.stopPropagation()</code> because containers are being closed on any click on document.
        
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
        Allows to automatically set element's text based on it's value. Can be <code>auto|always|never</code>. Useful for select and date.
        For example, if dropdown list is <code>{1: 'a', 2: 'b'}</code> and element's value set to <code>1</code>, it's html will be automatically set to <code>'a'</code>.  
        <code>auto</code> - text will be automatically set only if element is empty.  
        <code>always|never</code> - always(never) try to set element's text.

        @property autotext 
        @type string
        @default 'auto'
        **/          
        autotext: 'auto', 
        /**
        Initial value of input. Taken from <code>data-value</code> or element's text.

        @property value 
        @type mixed
        @default element's text
        **/
        value: null,
        /**
        Callback to perform custom displaying of value in element's text.  
        If <code>null</code>, default input's value2html() will be called.  
        If <code>false</code>, no displaying methods will be called, element's text will no change.  
        Runs under element's scope.  
        Second parameter __sourceData__ is passed for inputs with source (select, checklist).
        
        @property display 
        @type function|boolean
        @default null
        @since 1.2.0
        @example
        display: function(value, sourceData) {
            var escapedValue = $('<div>').text(value).html();
            $(this).html('<b>'+escapedValue+'</b>');
        }
        **/          
        display: null
    };
    
}(window.jQuery));

/**
AbstractInput - base class for all editable inputs.
It defines interface to be implemented by any input type.
To create your own input you can inherit from this class.

@class abstractinput
**/
(function ($) {

    //types
    $.fn.editabletypes = {};
    
    var AbstractInput = function () { };

    AbstractInput.prototype = {
       /**
        Initializes input
        
        @method init() 
        **/
       init: function(type, options, defaults) {
           this.type = type;
           this.options = $.extend({}, defaults, options); 
           this.$input = null;
           this.$clear = null;
           this.error = null;
       },
       
       /**
        Renders input from tpl. Can return jQuery deferred object.
        
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
           $(element).text(value);
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
        Converts value to string (for internal compare). For submitting to server used value2submit().
        
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
        Converts value for submitting to server
        
        @method value2submit(value) 
        @param {mixed} value
        @returns {mixed}
       **/       
       value2submit: function(value) {
           return value;
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
       },
       
       /**
        Creates input.
        
        @method clear() 
       **/        
       clear: function() {
           this.$input.val(null);
       },
       
       /**
        method to escape html.
       **/
       escape: function(str) {
           return $('<div>').text(str).html();
       },
       
       /**
        attach handler to automatically submit form when value changed (useful when buttons not shown)
       **/       
       autosubmit: function() {
        
       }
    };
        
    AbstractInput.defaults = {  
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
        @default input-medium
        **/         
        inputclass: 'input-medium',
        /**
        Name attribute of input

        @property name 
        @type string
        @default null
        **/         
        name: null
    };
    
    $.extend($.fn.editabletypes, {abstractinput: AbstractInput});
        
}(window.jQuery));

/**
List - abstract class for inputs that have source option loaded from js array or via ajax

@class list
@extends abstractinput
**/
(function ($) {

    var List = function (options) {
       
    };

    $.fn.editableutils.inherit(List, $.fn.editabletypes.abstractinput);

    $.extend(List.prototype, {
        render: function () {
            List.superclass.render.call(this);
            var deferred = $.Deferred();
            this.error = null;
            this.sourceData = null;
            this.prependData = null;
            this.onSourceReady(function () {
                this.renderList();
                deferred.resolve();
            }, function () {
                this.error = this.options.sourceError;
                deferred.resolve();
            });

            return deferred.promise();
        },

        html2value: function (html) {
            return null; //can't set value by text
        },
        
        value2html: function (value, element, display) {
            var deferred = $.Deferred();
            this.onSourceReady(function () {
                if(typeof display === 'function') {
                    //custom display method
                    display.call(element, value, this.sourceData); 
                } else {
                    this.value2htmlFinal(value, element);
                }
                deferred.resolve();
            }, function () {
                //do nothing with element
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
                this.options.source = $.fn.editableutils.tryParseJson(this.options.source, false);
            } catch (e) {
                error.call(this);
                return;
            }

            //loading from url
            if (typeof this.options.source === 'string') {
                //try to get from cache
                if(this.options.sourceCache) {
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
                }
                
                //loading sourceData from server
                $.ajax({
                    url: this.options.source,
                    type: 'get',
                    cache: false,
                    data: this.options.name ? {name: this.options.name} : {},
                    dataType: 'json',
                    success: $.proxy(function (data) {
                        if(cache) {
                            cache.loading = false;
                        }
                        this.sourceData = this.makeArray(data);
                        if($.isArray(this.sourceData)) {
                            this.doPrepend();
                            success.call(this);
                            if(cache) {
                                //store result in cache
                                cache.sourceData = this.sourceData;
                                $.each(cache.callbacks, function () { this.call(); }); //run success callbacks for other fields
                            }
                        } else {
                            error.call(this);
                            if(cache) {
                                $.each(cache.err_callbacks, function () { this.call(); }); //run error callbacks for other fields
                            }
                        }
                    }, this),
                    error: $.proxy(function () {
                        error.call(this);
                        if(cache) {
                             cache.loading = false;
                             //run error callbacks for other fields
                             $.each(cache.err_callbacks, function () { this.call(); }); 
                        }
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
                this.options.prepend = $.fn.editableutils.tryParseJson(this.options.prepend, true);
                if (typeof this.options.prepend === 'string') {
                    this.options.prepend = {'': this.options.prepend};
                }              
                this.prependData = this.makeArray(this.options.prepend);
            }

            if($.isArray(this.prependData) && $.isArray(this.sourceData)) {
                this.sourceData = this.prependData.concat(this.sourceData);
            }
        },

        /*
         renders input list
        */
        renderList: function() {
            // this method should be overwritten in child class
        },
       
         /*
         set element's html by value
        */
        value2htmlFinal: function(value, element) {
            // this method should be overwritten in child class
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
                        result.push({value: data[i], text: data[i]}); 
                    }
                }
            } else {  //object
                $.each(data, function (k, v) {
                    result.push({value: k, text: v});
                });  
            }
            return result;
        },
        
        //search for item by particular value
        itemByVal: function(val) {
            if($.isArray(this.sourceData)) {
                for(var i=0; i<this.sourceData.length; i++){
                    /*jshint eqeqeq: false*/
                    if(this.sourceData[i].value == val) {
                    /*jshint eqeqeq: true*/                            
                        return this.sourceData[i];
                    }
                }
            }
        }        

    });      

    List.defaults = $.extend({}, $.fn.editabletypes.abstractinput.defaults, {
        /**
        Source data for list. If string - considered ajax url to load items. Otherwise should be an array.
        Array format is: <code>[{value: 1, text: "text"}, {...}]</code><br>
        For compability it also supports format <code>{value1: "text1", value2: "text2" ...}</code> but it does not guarantee elements order.      
        If source is **string**, results will be cached for fields with the same source and name. See also <code>sourceCache</code> option.
        
        @property source 
        @type string|array|object
        @default null
        **/         
        source:null, 
        /**
        Data automatically prepended to the beginning of dropdown list.
        
        @property prepend 
        @type string|array|object
        @default false
        **/         
        prepend:false,
        /**
        Error message when list cannot be loaded (e.g. ajax error)
        
        @property sourceError 
        @type string
        @default Error when loading list
        **/          
        sourceError: 'Error when loading list',
        /**
        if <code>true</code> and source is **string url** - results will be cached for fields with the same source and name.  
        Usefull for editable grids.
        
        @property sourceCache 
        @type boolean
        @default true
        @since 1.2.0
        **/        
        sourceCache: true
    });

    $.fn.editabletypes.list = List;      

}(window.jQuery));
/**
Text input

@class text
@extends abstractinput
@final
@example
<a href="#" id="username" data-type="text" data-pk="1">awesome</a>
<script>
$(function(){
    $('#username').editable({
        url: '/post',
        title: 'Enter username'
    });
});
</script>
**/
(function ($) {
    var Text = function (options) {
        this.init('text', options, Text.defaults);
    };

    $.fn.editableutils.inherit(Text, $.fn.editabletypes.abstractinput);

    $.extend(Text.prototype, {
        activate: function() {
            if(this.$input.is(':visible')) {
                this.$input.focus();
                $.fn.editableutils.setCursorPosition(this.$input.get(0), this.$input.val().length);
            }
        }  
    });

    Text.defaults = $.extend({}, $.fn.editabletypes.abstractinput.defaults, {
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

    $.fn.editabletypes.text = Text;

}(window.jQuery));

/**
Textarea input

@class textarea
@extends abstractinput
@final
@example
<a href="#" id="comments" data-type="textarea" data-pk="1">awesome comment!</a>
<script>
$(function(){
    $('#comments').editable({
        url: '/post',
        title: 'Enter comments'
    });
});
</script>
**/
(function ($) {

    var Textarea = function (options) {
        this.init('textarea', options, Textarea.defaults);
    };

    $.fn.editableutils.inherit(Textarea, $.fn.editabletypes.abstractinput);

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
                $.fn.editableutils.setCursorPosition(this.$input.get(0), this.$input.val().length);
                this.$input.focus();
            }
        }         
    });

    Textarea.defaults = $.extend({}, $.fn.editabletypes.abstractinput.defaults, {
        /**
        @property tpl 
        @default <textarea></textarea>
        **/          
        tpl:'<textarea></textarea>',
        /**
        @property inputclass 
        @default input-large
        **/          
        inputclass: 'input-large',
        /**
        Placeholder attribute of input. Shown when input is empty.

        @property placeholder 
        @type string
        @default null
        **/             
        placeholder: null 
    });

    $.fn.editabletypes.textarea = Textarea;    

}(window.jQuery));

/**
Select (dropdown)

@class select
@extends list
@final
@example
<a href="#" id="status" data-type="select" data-pk="1" data-url="/post" data-original-title="Select status"></a>
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

    $.fn.editableutils.inherit(Select, $.fn.editabletypes.list);

    $.extend(Select.prototype, {
        renderList: function() {
            if(!$.isArray(this.sourceData)) {
                return;
            }

            for(var i=0; i<this.sourceData.length; i++) {
                this.$input.append($('<option>', {value: this.sourceData[i].value}).text(this.sourceData[i].text)); 
            }
            
            //enter submit
            this.$input.on('keydown.editable', function (e) {
                if (e.which === 13) {
                    $(this).closest('form').submit();
                }
            });            
        },
       
        value2htmlFinal: function(value, element) {
            var text = '', item = this.itemByVal(value);
            if(item) {
                text = item.text;
            }
            Select.superclass.constructor.superclass.value2html(text, element);   
        },
        
        autosubmit: function() {
            this.$input.off('keydown.editable').on('change.editable', function(){
                $(this).closest('form').submit();
            });
        }
    });      

    Select.defaults = $.extend({}, $.fn.editabletypes.list.defaults, {
        /**
        @property tpl 
        @default <select></select>
        **/         
        tpl:'<select></select>'
    });

    $.fn.editabletypes.select = Select;      

}(window.jQuery));
/**
List of checkboxes. 
Internally value stored as javascript array of values.

@class checklist
@extends list
@final
@example
<a href="#" id="options" data-type="checklist" data-pk="1" data-url="/post" data-original-title="Select options"></a>
<script>
$(function(){
    $('#options').editable({
        value: [2, 3],    
        source: [
              {value: 1, text: 'option1'},
              {value: 2, text: 'option2'},
              {value: 3, text: 'option3'}
           ]
        }
    });
});
</script>
**/
(function ($) {

    var Checklist = function (options) {
        this.init('checklist', options, Checklist.defaults);
    };

    $.fn.editableutils.inherit(Checklist, $.fn.editabletypes.list);

    $.extend(Checklist.prototype, {
        renderList: function() {
            var $label, $div;
            if(!$.isArray(this.sourceData)) {
                return;
            }

            for(var i=0; i<this.sourceData.length; i++) {
                $label = $('<label>').append($('<input>', {
                                           type: 'checkbox',
                                           value: this.sourceData[i].value, 
                                           name: this.options.name
                                     }))
                                     .append($('<span>').text(' '+this.sourceData[i].text));
                
                $('<div>').append($label).appendTo(this.$input);
            }
        },
       
       value2str: function(value) {
           return $.isArray(value) ? value.sort().join($.trim(this.options.separator)) : '';
       },  
       
       //parse separated string
        str2value: function(str) {
           var reg, value = null;
           if(typeof str === 'string' && str.length) {
               reg = new RegExp('\\s*'+$.trim(this.options.separator)+'\\s*');
               value = str.split(reg);
           } else if($.isArray(str)) {
               value = str; 
           }
           return value;
        },       
       
       //set checked on required checkboxes
       value2input: function(value) {
            var $checks = this.$input.find('input[type="checkbox"]');
            $checks.removeAttr('checked');
            if($.isArray(value) && value.length) {
               $checks.each(function(i, el) {
                   var $el = $(el);
                   // cannot use $.inArray as it performs strict comparison
                   $.each(value, function(j, val){
                       /*jslint eqeq: true*/
                       if($el.val() == val) {
                       /*jslint eqeq: false*/                           
                           $el.attr('checked', 'checked');
                       }
                   });
               }); 
            }  
        },  
        
       input2value: function() { 
           var checked = [];
           this.$input.find('input:checked').each(function(i, el) {
               checked.push($(el).val());
           });
           return checked;
       },            
          
       //collect text of checked boxes
        value2htmlFinal: function(value, element) {
           var html = [],
               /*jslint eqeq: true*/
               checked = $.grep(this.sourceData, function(o){
                   return $.grep(value, function(v){ return v == o.value; }).length;
               });
               /*jslint eqeq: false*/
           if(checked.length) {
               $.each(checked, function(i, v) { html.push($.fn.editableutils.escape(v.text)); });
               $(element).html(html.join('<br>'));
           } else {
               $(element).empty(); 
           }
        },
        
       activate: function() {
           this.$input.find('input[type="checkbox"]').first().focus();
       },
       
       autosubmit: function() {
           this.$input.find('input[type="checkbox"]').on('keydown', function(e){
               if (e.which === 13) {
                   $(this).closest('form').submit();
               }
           });
       }
    });      

    Checklist.defaults = $.extend({}, $.fn.editabletypes.list.defaults, {
        /**
        @property tpl 
        @default <div></div>
        **/         
        tpl:'<div></div>',
        
        /**
        @property inputclass 
        @type string
        @default editable-checklist
        **/         
        inputclass: 'editable-checklist',        
        
        /**
        Separator of values when reading from 'data-value' string

        @property separator 
        @type string
        @default ', '
        **/         
        separator: ','
    });

    $.fn.editabletypes.checklist = Checklist;      

}(window.jQuery));

/**
HTML5 input types.
Following types are supported:

* password
* email
* url
* tel
* number
* range

Learn more about html5 inputs:  
http://www.w3.org/wiki/HTML5_form_additions  
To check browser compatibility please see:  
https://developer.mozilla.org/en-US/docs/HTML/Element/Input
            
@class html5types 
@extends text
@final
@since 1.3.0
@example
<a href="#" id="email" data-type="email" data-pk="1">admin@example.com</a>
<script>
$(function(){
    $('#email').editable({
        url: '/post',
        title: 'Enter email'
    });
});
</script>
**/

/**
@property tpl 
@default depends on type
**/ 

/*
Password
*/
(function ($) {
    var Password = function (options) {
        this.init('password', options, Password.defaults);
    };
    $.fn.editableutils.inherit(Password, $.fn.editabletypes.text);
    $.extend(Password.prototype, {
       //do not display password, show '[hidden]' instead
       value2html: function(value, element) {
           if(value) {
               $(element).text('[hidden]');
           } else {
               $(element).empty(); 
           }
       },
       //as password not displayed, should not set value by html
       html2value: function(html) {
           return null;
       }       
    });    
    Password.defaults = $.extend({}, $.fn.editabletypes.text.defaults, {
        tpl: '<input type="password">'
    });
    $.fn.editabletypes.password = Password;
}(window.jQuery));


/*
Email
*/
(function ($) {
    var Email = function (options) {
        this.init('email', options, Email.defaults);
    };
    $.fn.editableutils.inherit(Email, $.fn.editabletypes.text);
    Email.defaults = $.extend({}, $.fn.editabletypes.text.defaults, {
        tpl: '<input type="email">'
    });
    $.fn.editabletypes.email = Email;
}(window.jQuery));


/*
Url
*/
(function ($) {
    var Url = function (options) {
        this.init('url', options, Url.defaults);
    };
    $.fn.editableutils.inherit(Url, $.fn.editabletypes.text);
    Url.defaults = $.extend({}, $.fn.editabletypes.text.defaults, {
        tpl: '<input type="url">'
    });
    $.fn.editabletypes.url = Url;
}(window.jQuery));


/*
Tel
*/
(function ($) {
    var Tel = function (options) {
        this.init('tel', options, Tel.defaults);
    };
    $.fn.editableutils.inherit(Tel, $.fn.editabletypes.text);
    Tel.defaults = $.extend({}, $.fn.editabletypes.text.defaults, {
        tpl: '<input type="tel">'
    });
    $.fn.editabletypes.tel = Tel;
}(window.jQuery));


/*
Number
*/
(function ($) {
    var NumberInput = function (options) {
        this.init('number', options, NumberInput.defaults);
    };
    $.fn.editableutils.inherit(NumberInput, $.fn.editabletypes.text);
    $.extend(NumberInput.prototype, {
         render: function () {
            NumberInput.superclass.render.call(this);

            if (this.options.min !== null) {
                this.$input.attr('min', this.options.min);
            } 
            
            if (this.options.max !== null) {
                this.$input.attr('max', this.options.max);
            } 
            
            if (this.options.step !== null) {
                this.$input.attr('step', this.options.step);
            }                         
        }
    });     
    NumberInput.defaults = $.extend({}, $.fn.editabletypes.text.defaults, {
        tpl: '<input type="number">',
        inputclass: 'input-mini',
        min: null,
        max: null,
        step: null
    });
    $.fn.editabletypes.number = NumberInput;
}(window.jQuery));


/*
Range (inherit from number)
*/
(function ($) {
    var Range = function (options) {
        this.init('range', options, Range.defaults);
    };
    $.fn.editableutils.inherit(Range, $.fn.editabletypes.number);
    $.extend(Range.prototype, {
        render: function () {
            this.$input = $(this.options.tpl);
            var $slider = this.$input.filter('input');
            if(this.options.inputclass) {
                $slider.addClass(this.options.inputclass); 
            }
            if (this.options.min !== null) {
                $slider.attr('min', this.options.min);
            } 
            
            if (this.options.max !== null) {
                $slider.attr('max', this.options.max);
            } 
            
            if (this.options.step !== null) {
                $slider.attr('step', this.options.step);
            }             
            
            $slider.on('input', function(){
                $(this).siblings('output').text($(this).val()); 
            });  
        },
        activate: function() {
            this.$input.filter('input').focus();
        }         
    });
    Range.defaults = $.extend({}, $.fn.editabletypes.number.defaults, {
        tpl: '<input type="range"><output style="width: 30px; display: inline-block"></output>',
        inputclass: 'input-medium'
    });
    $.fn.editabletypes.range = Range;
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
            
            $.extend(this.containerOptions, {
                showOn: 'none',
                content: '',
                alignTo: 'target'
            });            
            
            this.call(this.containerOptions);
            
            var $content = $('<div>')
              .append($('<label>').text(this.options.title || this.$element.data( "title") || this.$element.data( "originalTitle")))
              .append(this.initForm());            
              
            this.call('update', $content);                         
        },        
        
        innerShow: function () {
            this.$form.editableform('render');
            this.call('show');
            this.tip().addClass('editable-container');
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
           
           $.extend(this.containerOptions, {
               alignX: x,
               offsetX: ox,
               alignY: y,
               offsetY:oy
           });
        }
    });
    
    //defaults
    $.fn.editableContainer.defaults = $.extend({}, $.fn.editableContainer.defaults, {
        className: 'tip-yellowsimple'
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
jQuery UI Datepicker.  
Description and examples: http://jqueryui.com/datepicker.   
This input is also accessible as **date** type. Do not use it together with __bootstrap-datepicker__ as both apply <code>$().datepicker()</code> method.

@class dateui
@extends abstractinput
@final
@example
<a href="#" id="dob" data-type="date" data-pk="1" data-url="/post" data-original-title="Select date">15/05/1984</a>
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
        var directOptions =  $.fn.editableutils.sliceObj(this.options, ['format']);

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

    $.fn.editableutils.inherit(DateUI, $.fn.editabletypes.abstractinput);    
    
    $.extend(DateUI.prototype, {
        render: function () {
            DateUI.superclass.render.call(this);
            this.$input.datepicker(this.options.datepicker);
            
            if(this.options.clear) {
                this.$clear = $('<a href="#"></a>').html(this.options.clear).click($.proxy(function(e){
                    e.preventDefault();
                    e.stopPropagation();
                    this.clear();
                }, this));
            }            
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
       
       value2submit: function(value) {
           return this.value2str(value);
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
       },
       
       autosubmit: function() {
           this.$input.on('mouseup', 'table.ui-datepicker-calendar a.ui-state-default', function(e){
               var $form = $(this).closest('form');
               setTimeout(function() {
                   $form.submit();
               }, 200);
           });
       }

    });
    
    DateUI.defaults = $.extend({}, $.fn.editabletypes.abstractinput.defaults, {
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
    $.fn.editabletypes.date = DateUI;

}(window.jQuery));
