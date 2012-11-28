$(function(){
    
    $.mockjax({
        url: '/post',
        responseTime: 500,
        responseText: {
            success: true
        }
    });  
    
    $.mockjax({
        url: '/groups',
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
        url: '/newuser',
        responseTime: 300,
        responseText: {
            id: 1
        }
    });             
    
   //init editables 
   $('.myeditable').editable({
      url: '/post'
   });
   
   //make username required
   $('#new_username').editable('option', 'validate', function(v) {
       if(v == '') return 'Required field!';
   });
   
   //create new user
   $('#save-btn').click(function() {
       $('.myeditable').editable('submit', { 
           url: '/newuser', 
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
});