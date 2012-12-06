//detect version of jquery from url param, e.g. 'jquery=1.7.2' 
var jqver = decodeURIComponent((new RegExp('[?|&]' + 'jquery' + '=' + '([^&;]+?)(&|#|;|$)').exec(location.search)||[,""])[1].replace(/\+/g, '%20'))||null;
    jqurl = jqver ? "http://ajax.googleapis.com/ajax/libs/jquery/"+jqver+"/jquery.min.js" : "libs/jquery/jquery-1.8.2.min.js";
    
require(["loader", jqurl], function(loader) {

    requirejs.config(loader.getConfig("../src"));
   
    require(['element/editable-element', 
             'test/libs/mockjax/jquery.mockjax'
             ], 
    function() {
        //disable effects
        $.fx.off = true;
        $.support.transition = false;           
        
        var params = loader.getParams();
        
        require([
            'test/mocks',
            'test/unit/common',
            'test/unit/text',
            'test/unit/textarea',
            'test/unit/select',
            'test/unit/checklist',
            'test/unit/api',
            (params.f === 'bootstrap') ?  'test/unit/date' :  'test/unit/dateui'
        ], function() {
            QUnit.load();
            QUnit.start();
        });
    });
});