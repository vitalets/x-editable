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