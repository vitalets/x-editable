/**
* Editable jQuery UI Tooltip 
* ---------------------
* requires jquery ui 1.9.x 
*/
(function ($) {
    "use strict";

    //extend methods
    $.extend($.fn.editableContainer.Popup.prototype, {
        containerName: 'tooltip',  //jQuery method, aplying the widget
        //object name in element's .data() 
        containerDataName: 'ui-tooltip', 
        innerCss: '.ui-tooltip-content', 
        defaults: $.ui.tooltip.prototype.options,
        
        //split options on containerOptions and formOptions
        splitOptions: function() {
            this.containerOptions = {};
            this.formOptions = {};
            
            //check that jQueryUI build contains tooltip widget
            if(!$.ui[this.containerName]) {
                $.error('Please use jQueryUI with "tooltip" widget! http://jqueryui.com/download');
                return;
            }
            
            //defaults for tooltip
            for(var k in this.options) {
              if(k in this.defaults) {
                 this.containerOptions[k] = this.options[k];
              } else {
                 this.formOptions[k] = this.options[k];
              } 
            }
        },        
        
        initContainer: function(){
            this.handlePlacement();
            $.extend(this.containerOptions, {
                items: '*',
                content: ' ',
                track:  false,
                open: $.proxy(function() {
                        //disable events hiding tooltip by default
                        this.container()._on(this.container().element, {
                            mouseleave: function(e){ e.stopImmediatePropagation(); },
                            focusout: function(e){ e.stopImmediatePropagation(); }
                        });  
                    }, this)
            });
            
            this.call(this.containerOptions);
            
            //disable standart triggering tooltip events
            this.container()._off(this.container().element, 'mouseover focusin');
        },         
        
        tip: function() {
            return this.container() ? this.container()._find(this.container().element) : null;
        },
        
        innerShow: function() {
            this.call('open');
            var label = this.options.title || this.$element.data( "ui-tooltip-title") || this.$element.data( "originalTitle"); 
            this.tip().find(this.innerCss).empty().append($('<label>').text(label));
        },  
        
        innerHide: function() {
            this.call('close'); 
        },
        
        innerDestroy: function() {
            /* tooltip destroys itself on hide */
        },         
        
        setPosition: function() {
            this.tip().position( $.extend({
                of: this.$element
            }, this.containerOptions.position ) );     
        },
        
        handlePlacement: function() {
           var pos; 
           switch(this.options.placement) {
               case 'top':
                      pos = {
                          my: "center bottom-5", 
                          at: "center top", 
                          collision: 'flipfit'
                      };
               break;
               case 'right':
                      pos = {
                          my: "left+5 center", 
                          at: "right center", 
                          collision: 'flipfit'
                      };
               break;
               case 'bottom':
                      pos = {
                          my: "center top+5", 
                          at: "center bottom", 
                          collision: 'flipfit'
                      };
               break;
               case 'left':
                      pos = {
                          my: "right-5 center", 
                          at: "left center", 
                          collision: 'flipfit'
                      };
               break;                                             
           }
           
           this.containerOptions.position = pos;
        }
                
    });
    
}(window.jQuery));
