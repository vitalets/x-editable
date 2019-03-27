$(function () {
    $.mockjaxSettings.responseTime = 50;
    
    $.mockjax({
        url: 'post.php',
        responseText: '{"success": true}'
    });

    $.mockjax({
        url: 'error.php',
        status: 500,
        statusText: 'Internal Server Error',
        responseText: 'customtext'
    });   
    
    $.mockjax({
        url: 'post-resp.php',
        response: function(settings) {
            this.responseText = settings;  
        }
    }); 
    
    
    window.groups =  {
            0: 'Guest',
            1: 'Service',
            2: 'Customer',
            3: 'Operator',
            4: 'Support',
            5: 'Admin',
            6: '',
            '': 'Nothing'
      };
      
    //groups as array  
    window.groupsArr = [];
    window.groupsArr2 = [];
    for(var i in groups) {
        groupsArr.push({value: i, text: groups[i]}); 
        groupsArr2.push({id: i, text: groups[i]}); 
    }
      
    window.size = groupsArr.length;
    
    $.mockjax({
        url: 'groups.php',
        responseText: groups
    });
    
    $.mockjax({
        url: 'groupsArr',
        responseText: groupsArr
    });     
    
    $.mockjax({
        url: '/groupsArr2',
        responseText: groupsArr2
    });

    $.mockjax({
        url: 'groups-error.php',
        status: 500,
        responseText: 'Internal Server Error'
    });       
    
});

// useful functions

function tip(e) {
    return e.data('editableContainer').tip();   
}
