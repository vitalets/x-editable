/**
* Production version of loader
* load requred js and css according to f (form) and c (container) parameters
*/

function getFC() {
    var url = window.location.href, f, c;
    if(url.match(/f=jqueryui/i)) { 
        f = 'jqueryui';
    } else if(url.match(/f=plain/i)) {
        f = 'plain';
    } else {      //bootstrap
        f = 'bootstrap';
    }
    c = url.match(/c=inline/i) ? 'inline' : 'popup';
    return {f: f, c: c};
}

function getAssets(f, c, libs) {
    var
    bootstrap = libs+'bootstrap/',
    jqueryui = libs+'jquery-ui-1.9.1.custom/',
    editable = libs+'editable/';
    js = [],
    css = [],
    editable_js = '';

    //tune js and css
    if(f==='jqueryui') { 
        //core
//        js.unshift(jqueryui+'js/jquery-ui-1.9.1.custom.js');
//        css.unshift(jqueryui+'css/redmond/jquery-ui-1.9.1.custom.css');
        js.unshift('http://code.jquery.com/ui/1.9.1/jquery-ui.js');
        css.unshift('http://code.jquery.com/ui/1.9.1/themes/redmond/jquery-ui.css');

        //editable
        editable_js = (c === 'inline') ? 'jqueryui-editable-inline.js' : 'jqueryui-editable.js'; 
        editable_js = editable+'jqueryui-editable/js/'+editable_js;
        css.push(editable+'jqueryui-editable/css/jqueryui-editable.css'); 

        //style
        css.push(libs+'demo.css');
    } else if(f==='plain') { 
        //core
        js.unshift(libs+'poshytip/jquery.poshytip.js');
        css.unshift(libs+'poshytip/tip-yellowsimple/tip-yellowsimple.css');

        //editable  
        editable_js = (c === 'inline') ? 'jquery-editable-inline.js' : 'jquery-editable-poshytip.js'; 
        editable_js = editable+'jquery-editable/js/'+editable_js; 
        css.push(editable+'jquery-editable/css/jquery-editable.css');           

        //date
        js.push(libs+'jquery-ui-datepicker/js/jquery-ui-1.9.1.custom.js');    
        js.push(libs+'jquery-ui-datepicker/js/jquery-ui-1.9.1.custom.js');    
        css.unshift('http://code.jquery.com/ui/1.9.1/themes/redmond/jquery-ui.css');
//        css.unshift(jqueryui+'css/redmond/jquery-ui-1.9.1.custom.css');

        //style
        css.push(libs+'demo.css');    
    } else {      //bootstrap
        //core
        /*
        js.unshift(bootstrap+'js/bootstrap.js')
        css.unshift(bootstrap+'css/bootstrap.css');
        */
        
        js.unshift('//netdna.bootstrapcdn.com/twitter-bootstrap/2.2.1/js/bootstrap.min.js');
        css.unshift('//netdna.bootstrapcdn.com/twitter-bootstrap/2.2.1/css/bootstrap.min.css');

        //editable
        editable_js = (c === 'inline') ? 'bootstrap-editable-inline.js' : 'bootstrap-editable.js'; 
        editable_js = editable+'bootstrap-editable/js/'+editable_js;         
        css.push(editable+'bootstrap-editable/css/bootstrap-editable.css');            
    }
    
    js.push(libs+'demo-mock.js');
   // js.push(libs+'demo.js');
    
    return {css: css, js: js, editable_js: editable_js};
}


function loadAssets(css, js) {
    for(var i = 0; i < css.length; i++) {
        loadCss(css[i]);
    }    
    
    for(i = 0; i < js.length; i++) {
        loadJs(js[i]);
    }
}   
    
function loadCss(url) {
    var link = document.createElement("link");
    link.type = "text/css";
    link.rel = "stylesheet";
    link.href = url;
    document.getElementsByTagName("head")[0].appendChild(link);
}

function loadJs(url) {
    if(!url) return;
    var script = document.createElement("script");
    script.src = url;
    document.getElementsByTagName("head")[0].appendChild(script);
}