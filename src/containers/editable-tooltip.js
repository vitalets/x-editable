/**
* Editable jQuery UI Tooltip 
* ---------------------
* requires jquery ui 1.9.x 
*/
(function ($) {
    
    //extend methods
    $.extend($.fn.editableContainer.Constructor.prototype, {
        containerName: 'tooltip',
        innerCss: '.ui-tooltip-content', 
        
        initContainer: function(){
            this.handlePlacement();
            this.options.open = $.proxy(function() {
                //disable events hiding tooltip by default
                this.container()._on(this.container().element, {
                    mouseleave: function(e){ e.stopImmediatePropagation(); },
                    focusout: function(e){ e.stopImmediatePropagation(); }
                });  
            }, this);
            this.call(this.options);
            //disable standart event to show tooltip
            this.container()._off(this.container().element, 'mouseover focusin');
        },         
        
        tip: function() {
            return this.container()._find(this.container().element);
        },
        
        show: function() {
            this.call('open');
            this.tip().addClass('editable-container');
            
            this.initForm(); 
            this.tip().find(this.innerCss)
                .empty()
                .append($('<label>').text(this.options.title || this.$element.data( "ui-tooltip-title") || this.$element.data( "originalTitle")))
                .append(this.$form);      
            this.$form.editableform('render');             
        },  
        
        hide: function() {
            this.call('close');      
        },
        
        setPosition: function() {
            this.tip().position( $.extend({
                of: this.$element
            }, this.options.position ) );     
        },
        
        handlePlacement: function() {
           var pos; 
           switch(this.options.placement) {
               case 'top':
                      pos = {
                          my: "center bottom-5", 
                          at: "center top" 
                      };
               break;
               case 'right':
                      pos = {
                          my: "left+5 center", 
                          at: "right center" 
                      };
               break;
               case 'bottom':
                      pos = {
                          my: "center top+5", 
                          at: "center bottom" 
                      };
               break;
               case 'left':
                      pos = {
                          my: "right-5 center", 
                          at: "left center" 
                      };
               break;                                             
           }
           
           this.options.position = $.extend({}, this.options.position, pos);
        },
        
       destroy: function() {
          //jqueryui tooltip destroy itself
       }                 
    });
    
    //defaults
    $.fn.editableContainer.defaults = $.extend({}, $.fn.tooltip.defaults, $.fn.editableContainer.defaults, {
        items: '*',
        content: ' ',
        position: {}
    });
    
}(window.jQuery));