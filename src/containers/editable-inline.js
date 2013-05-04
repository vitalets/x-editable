/**
* Editable Inline 
* ---------------------
*/
(function ($) {
    "use strict";
    
    //copy prototype from EditableContainer
    //extend methods
    $.extend($.fn.editableContainer.Inline.prototype, $.fn.editableContainer.Popup.prototype, {
        containerName: 'editableform',
        innerCss: '.editable-inline',
        containerClass: 'editable-container editable-inline', //css class applied to container element
                 
        initContainer: function(){
            //container is <span> element
            this.$tip = $('<span></span>');
            
            //convert anim to miliseconds (int)
            if(!this.options.anim) {
                this.options.anim = 0;
            }         
        },
        
        splitOptions: function() {
            //all options are passed to form
            this.containerOptions = {};
            this.formOptions = this.options;
        },
        
        tip: function() {
           return this.$tip; 
        },
        
        innerShow: function () {
            this.$element.hide();
            this.tip().insertAfter(this.$element).show();
        }, 
        
        innerHide: function () {
            this.$tip.hide(this.options.anim, $.proxy(function() {
                this.$element.show();
                this.innerDestroy();
            }, this)); 
        },
        
        innerDestroy: function() {
            if(this.tip()) {
                this.tip().empty().remove();
            }
        } 
    });

}(window.jQuery));