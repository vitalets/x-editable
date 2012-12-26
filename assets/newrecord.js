$(function(){
    
    $.mockjax({
        url: '/post',
        responseTime: 500,
        responseText: ''
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
        responseText: '{ "id": 1 }'
//        responseText: '{"errors": {"username": "username already exist"} }'
    });             
    
   //init editables 
   $('.myeditable').editable({
      url: '/post',
      placement: 'right'
   });
   
   //make username required
   $('#new_username').editable('option', 'validate', function(v) {
       if(!v) return 'Required field!';
   });
   
   //automatically show next editable
   $('.myeditable').on('save.newuser', function(){
       var that = this;
       setTimeout(function() {
           $(that).closest('tr').next().find('.myeditable').editable('show');
       }, 200);
   });
   
   //create new user
   $('#save-btn').click(function() {
       $('.myeditable').editable('submit', { 
           url: '/newuser', 
           ajaxOptions: {
               dataType: 'json' //assuming json response
           },           
           success: function(data, config) {
               if(data && data.id) {  //record created, response like {"id": 2}
                   //set pk
                   $(this).editable('option', 'pk', data.id);
                   //remove unsaved class
                   $(this).removeClass('editable-unsaved');
                   //show messages
                   var msg = 'New user created! Now editables submit individually.';
                   $('#msg').addClass('alert-success').removeClass('alert-error').html(msg).show();
                   $('#save-btn').hide(); 
                   $(this).off('save.newuser');                   
               } else if(data && data.errors){ 
                   //server-side validation error, response like {"errors": {"username": "username already exist"} }
                   config.error.call(this, data.errors);
               }               
           },
           error: function(errors) {
               var msg = '';
               if(errors && errors.responseText) { //ajax error, errors = xhr object
                   msg = errors.responseText;
               } else { //validation error (client-side or server-side)
                   $.each(errors, function(k, v) { msg += k+": "+v+"<br>"; });
               } 
               $('#msg').removeClass('alert-success').addClass('alert-error').html(msg).show();
           }
       });
   }); 
   
   //reset
   $('#reset-btn').click(function() {
       $('.myeditable').editable('setValue', null)
                       .editable('option', 'pk', null)
                       .removeClass('editable-unsaved');
                       
       $('#save-btn').show();
       $('#msg').hide();                
   });
});