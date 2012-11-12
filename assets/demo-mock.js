$(function(){
    //ajax mocks
    $.mockjaxSettings.responseTime = 500; 
    
    $.mockjax({
        url: 'post.php',
        response: function(settings) {
            log(settings);
        }
    });

    $.mockjax({
        url: 'error.php',
        status: 400,
        statusText: 'Bad Request',
        response: function(settings) {
            log(settings);
            this.responseText = 'Please input correct value'; 
        }        
    });
    
    $.mockjax({
        url: 'status.php',
        status: 500,
        response: function(settings) {
            log(settings);
            this.responseText = 'Internal Server Error';
        }        
    });
  
    $.mockjax({
        url: 'groups.php',
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
    
    $.mockjax({
        url: 'new.php',
        responseTime: 300,
        responseText: {
            id: 1
        }
    }); 
    
    function log(settings) {
            var s = [];
            s.push(settings.type.toUpperCase() + ' url = "' + settings.url + '"');
            for(var a in settings.data) {
                s.push(a + ' = "' + settings.data[a] + '"');
            }
            s.push('--------------------------------------\n');
            $('#console').val(s.join('\n') + $('#console').val());
    }                 
    
});