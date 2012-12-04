require(["jquery", "loader"], function($, loader) {

    requirejs.config(loader.getConfig("../src"));
   
    //loader.loadCss('libs/qunit/qunit-1.10.0.css');
   
    require(['element/editable-element', 
             'test/libs/mockjax/jquery.mockjax',
      //       'test/libs/qunit/qunit-1.10.0'
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