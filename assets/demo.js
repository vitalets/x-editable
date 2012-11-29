(function(){
  
    //defaults
//    $.fn.editable.defaults.url = '/error'; 
    $.fn.editable.defaults.url = '/post'; 

    //enable / disable
   $('#enable').click(function() {
       $('#user .editable').editable('toggleDisabled');
   });    
    
    //editables 
    $('#username').editable({
                           url: '/post',
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

    $('#sex').on('render', function(e, editable) {
        var colors = {"": "gray", 1: "green", 2: "blue"};
        $(this).css("color", colors[editable.value]);  
    });
    
    $('#sex').editable({
        prepend: "not selected",
        source: [
            {value: 1, text: 'Male'},
            {value: 2, text: 'Female'}
        ]   
    });    
    
    $('#status').editable();   
    
    $('#group').editable();   

    $('#dob').editable();      
    
/* 
    $('#weight').editable({
        url: '/error'  
    });     
*/    
    $('#comments').editable(); 
    
    $('#note').editable(); 
    
    $('#pencil').click(function(e) {
        e.stopPropagation();
        e.preventDefault();
        $('#note').editable('toggle');
   });   
   
   $('#fruits').editable({
       pk: 1,
       limit: 3,
       source: [
        {value: 1, text: 'banana'},
        {value: 2, text: 'peach'},
        {value: 3, text: 'apple'},
        {value: 4, text: 'watermelon'},
        {value: 5, text: 'orange'}
       ]
    }); 
    
    $('#address').editable({
        url: '/post',
        value: {
            city: "Moscow", 
            street: "Lenina", 
            building: "12"
        },
        validate: function(value) {
            if(value.city == '') return 'city is required!'; 
        }
    });              

  //----------------------------------
  // editableContainer() 
  //---------------------------------- 
  
  /* 
   $('#ec').editableContainer();
  
   $('#ec-show').click(function(e) {
       e.stopPropagation();
       $('#ec').editableContainer('option', 'value', 'abc');
       $('#ec').editableContainer('show');
   });
   
   $('#ec-hide').click(function(e) {
       e.stopPropagation();
       $('#ec').editableContainer('hide');
   });
   */
   
}());
