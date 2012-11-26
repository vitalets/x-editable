/*
Editableform based on jQuery UI
*/
(function ($) {
    
    $.extend($.fn.editableform.Constructor.prototype, {
         initTemplate: function() {
              this.$form = $($.fn.editableform.template);
              
              //buttons
              this.$form.find('div.editable-buttons').append($.fn.editableform.buttons);                
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
    
    //buttons
    $.fn.editableform.buttons = '<button type="submit" style="height: 24px">submit</button><button type="button" style="height: 24px">cancel</button>';
    
    //error classes
    $.fn.editableform.errorGroupClass = null;
    $.fn.editableform.errorBlockClass = 'ui-state-error';
    
}(window.jQuery));