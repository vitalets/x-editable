/*
Editableform based on jQuery UI
*/
(function ($) {
    "use strict";
    
    $.extend($.fn.editableform.Constructor.prototype, {
        initButtons: function() {
            var $btn = this.$form.find('.editable-buttons');
            $btn.append($.fn.editableform.buttons);
            if(this.options.showbuttons === 'bottom') {
                $btn.addClass('editable-buttons-bottom');
            }
                          
            this.$form.find('.editable-submit').button({
                icons: { primary: "ui-icon-check" },
                text: false
            }).removeAttr('title');
            this.$form.find('.editable-cancel').button({
                icons: { primary: "ui-icon-closethick" },
                text: false
            }).removeAttr('title');
        }
    });
    
    //error classes
    $.fn.editableform.errorGroupClass = null;
    $.fn.editableform.errorBlockClass = 'ui-state-error';
    //engine
    $.fn.editableform.engine = 'jquery-ui';
    
}(window.jQuery));