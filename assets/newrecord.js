$(function(){
    
    $.mockjax({
        url: 'post.php',
        responseTime: 500,
        responseText: {
            success: true
        }
    });  
    
    $.mockjax({
        url: 'groups.php',
        responseText: {
            0: 'Guest',
            1: 'Service',
            2: 'Customer',
            3: 'Operator',
            4: 'Support',
            5: 'Admin'
        }
    }); 
    
    $.mockjax({
        url: 'new.php',
        responseTime: 300,
        responseText: {
            id: 1
        }
    });             
    
   //init editables 
   $('.myeditable').editable({
      url: 'post.php'
   });
   
   //make username required
   $('#new_username').editable('option', 'validate', function(v) {
       if(v == '') return 'Required field!';
   });
   
   //create new user
   $('#save-btn').click(function() {
       $('.myeditable').editable('submit', { 
           url: 'new.php', 
           success: function(data) {
               var msg = 'New user created! Now editables work in regular way.';
               $('#msg').addClass('alert-success').removeClass('alert-error').html(msg).show();
               $('#save-btn').hide(); 
           },
           error: function(data) {
               var msg = '';
               if(data.errors) { //validation error
                   $.each(data.errors, function(k, v) { msg += k+": "+v+"<br>"; });
               } else if(data.responseText) { //ajax error
                   msg = data.responseText;
               }
               $('#msg').removeClass('alert-success').addClass('alert-error').html(msg).show();
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
   
});