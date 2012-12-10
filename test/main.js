//detect version of jquery from url param, e.g. 'jquery=1.7.2' 
var jqver = decodeURIComponent((new RegExp('[?|&]' + 'jquery' + '=' + '([^&;]+?)(&|#|;|$)').exec(location.search)||[,""])[1].replace(/\+/g, '%20'))||null;
    jqurl = jqver ? "http://ajax.googleapis.com/ajax/libs/jquery/"+jqver+"/jquery.min.js" : "libs/jquery/jquery-1.8.2.min.js";
    
require(["loader", jqurl], function(loader) {

    var config = loader.getConfig("../src"),
        params = loader.getParams();
    
    //add test specific dependencies
    config.shim['test/mocks'] = ['element/editable-element', 'test/libs/mockjax/jquery.mockjax'];
        
    //as we need to keep order of tests, create shim dependencies automatically
    addTests(config);
    
    requirejs.config(config);
   
    require(['test/unit/api'], 
    function() {
        //disable effects
        $.fx.off = true;
        $.support.transition = false;           
        
        QUnit.load();
        QUnit.start();
    });
    
    function addTests(config) {
        var tests = [
            'test/mocks',
            'test/unit/common',
            'test/unit/text',
            'test/unit/textarea',
            'test/unit/select',
            'test/unit/checklist',
            (params.f === 'bootstrap') ?  'test/unit/date' :  'test/unit/dateui',            
            'test/unit/api'
       ];
       
       for(var i=0; i<tests.length-1; i++) {
          config.shim[tests[i+1]] = [tests[i]]; 
       }
    }
});