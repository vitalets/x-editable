$(function(){
    setTimeout(function() {
  
    //defaults
//    $.fn.editable.defaults.url = 'error.php'; 
    $.fn.editable.defaults.url = 'post.php'; 

    //enable / disable
   $('#enable').click(function() {
       $('#user .editable').editable('toggleDisabled');
   });    
    
    //editables 
    $('#username').editable({
                           url: 'post.php',
                           type: 'text',
                           pk: 1,
                           name: 'username',
                           title: 'Enter username'
    });
    
    $('#firstname').editable({
        validate: function(value) {
           if($.trim(value) == '') return 'This field is required';
        }
    });
    
    $('#lastname').editable();
    
    $('#sex').editable({
        source:{
            0: 'Male',
            1: 'Female'
        }   
    });    
    
    $('#action').on('render', function(e, editable) {
        var colors = {0: "gray", 1: "green", 2: "blue", 3: "red"};
        $(this).css("color", colors[editable.value]);  
    });
    
    $('#status, #action').editable({
 
    });   
    
    $('#group').editable({
      //  source: 'groups.php'
    });   

    $('#dob').editable({
       // format: 'dd.mm.yyyy'
    });      
    
    $('#weight').editable({
        url: 'error.php'  
    });     
    
    $('#comments').editable(); 
    
    $('#note').editable(); 
    
    $('#pencil').click(function(e) {
        e.stopPropagation();
        e.preventDefault();
        $('#note').editable('toggle');
   });    
    
    //------------------------------------------------
    /* creating new record example */
    //------------------------------------------------
    
   $('.myeditable').editable({
      url: 'post.php'
   });
   
   $('#new_username').editable('option', 'validate', function(v) {if(v == '') return 'Required field!'});
   
   $('#save-btn').click(function() {
       $('.myeditable').editable('submit', { //call submit
           url: 'new.php', //url for creating new user
           success: function(data) {
               var msg = 'New user created! Now editables work in regular way.';
               $('#msg').addClass('alert-success').removeClass('alert-error')
               $('#msg').addClass('ui-state-highlight').removeClass('ui-state-error')
               .html(msg).show();
               $('#save-btn').hide(); 
           },
           error: function(data) {
               var msg = '';
               if(data.errors) { //validation error
                   $.each(data.errors, function(k, v) { msg += k+": "+v+"<br>"; });
               } else if(data.responseText) { //ajax error
                   msg = data.responseText;
               }
               $('#msg').removeClass('alert-success').addClass('alert-error')
               $('#msg').removeClass('ui-state-highlight').addClass('ui-state-error')
               .html(msg).show();
           }
       });
   });   
   
   /*
   $('#save-btn').click(function() {
       var  $btn = $(this),
            errors = $('.myeditable').editable('validate');
       if($.isEmptyObject(errors)) {
           var data = $('.myeditable').editable('getValue');
           $.post('new.php', data, function(response) {
              $('#user_id').text(response.id); 
              $btn.hide();
              $btn.parent().find('.alert-error').hide();
              $btn.parent().find('.alert-success').show();
              $('.myeditable').editable('markAsSaved');
          }); 
       } else {
          var msg = '<strong>Validation errors!</strong><br>';
          $.each(errors, function(k, v) { msg += v+'<br>'; });
          $btn.parent().find('.alert-error').html(msg).show(); 
       }
   });
   */  
}, 300);
});