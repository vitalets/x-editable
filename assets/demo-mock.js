$(function(){
    //ajax mocks
    $.mockjaxSettings.responseTime = 500; 
    
    $.mockjax({
        url: 'post.php',
        response: function(settings) {
            log(settings, this);
        }
    });

    $.mockjax({
        url: 'error.php',
        status: 400,
        statusText: 'Bad Request',
        response: function(settings) {
            this.responseText = 'Please input correct value'; 
            log(settings, this);
        }        
    });
    
    $.mockjax({
        url: 'status.php',
        status: 500,
        response: function(settings) {
            this.responseText = 'Internal Server Error';
            log(settings, this);
        }        
    });
  
    $.mockjax({
        url: 'groups.php',
        response: function(settings) {
            this.responseText = [ 
             {value: 0, text: 'Guest'},
             {value: 1, text: 'Service'},
             {value: 2, text: 'Customer'},
             {value: 3, text: 'Operator'},
             {value: 4, text: 'Support'},
             {value: 5, text: 'Admin'}
           ];
           log(settings, this);
        }        
    });
    
    /*
    //groups as object
    $.mockjax({
        url: 'groups1.php',
        response: function(settings) {
            log(settings);
            this.responseText = { 
             0: 'Guest',
             1: 'Service',
             2: 'Customer',
             3: 'Operator',
             4: 'Support',
             5: 'Admin'
            };
        }        
    });
    */
    
    function log(settings, response) {
            var s = [];
            s.push(settings.type.toUpperCase() + ' url = "' + settings.url + '"');
            for(var a in settings.data) {
                s.push(a + ' = "' + settings.data[a] + '"');
            }
            s.push('RESPONSE: status = ' + response.status);
            console.log(response);
            if(response.responseText) {
                if($.isArray(response.responseText)) {
                    s.push('[');
                    $.each(response.responseText, function(i, v){
                       s.push('{value: ' + v.value+', text: "'+v.text+'"}');
                    }); 
                    s.push(']');
                } else {
                   s.push($.trim(response.responseText));
                }
            }
            s.push('--------------------------------------\n');
            $('#console').val(s.join('\n') + $('#console').val());
    }                 
    
});