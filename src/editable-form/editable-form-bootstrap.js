/*
Editableform based on Twitter Bootstrap
*/
(function ($) {
    
    //form template
    $.fn.editableform.template = '<form class="form-inline editableform"><div class="control-group">' + 
    '<div class="editable-input"></div><div class="editable-buttons"></div>' + 
    '<div class="help-block editable-error-block"></div>' + 
    '</div></form>'; 
    
    //buttons
    $.fn.editableform.buttons = '<button type="submit" class="btn btn-primary"><i class="icon-ok icon-white"></i></button><button type="button" class="btn clearfix"><i class="icon-ban-circle"></i></button>';         
    
    //error classes
    $.fn.editableform.errorGroupClass = 'error';
    $.fn.editableform.errorBlockClass = null;    
    
}(window.jQuery));