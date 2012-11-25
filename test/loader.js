/**
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

function getAssets(f, c, src, libs) {
    var
    forms = src+'editable-form/',
    inputs = src+'inputs/',
    containers = src+'containers/',
    element = src+'element/',

    bootstrap = libs+'bootstrap221/',
    jqueryui = libs+'jquery-ui-1.9.1.custom/',

    js = [
    forms+'editable-form.js',
    forms+'editable-form-utils.js',
    containers+'editable-container.js',
    element+'editable-element.js',
    inputs+'abstract.js',
    inputs+'list.js',
    inputs+'text.js',
    inputs+'textarea.js',
    inputs+'select.js',  
    inputs+'checklist.js'  
    ],

    css = [
    forms+'editable-form.css',
    containers+'editable-container.css',
    element+'editable-element.css'
    ];


    //tune js and css
    if(f==='jqueryui') { 
        //core
        js.unshift(jqueryui+'js/jquery-ui-1.9.1.custom.js')
        css.unshift(jqueryui+'css/redmond/jquery-ui-1.9.1.custom.css');

        //editable
        js.push(forms+'editable-form-jqueryui.js');
        js.push(getContainer('editable-tooltip.js'));

        //date
        js.push(inputs+'dateui/dateui.js');

        //style
        css.push('style.css');
    } else if(f==='plain') { 
        //core
        js.unshift(libs+'poshytip/jquery.poshytip.js');
        css.unshift(libs+'poshytip/tip-yellowsimple/tip-yellowsimple.css');

        //editable
        js.push(getContainer('editable-poshytip.js'));

        //date
        js.push(inputs+'dateui/dateui.js');
        js.push(inputs+'dateui/jquery-ui-datepicker/js/jquery-ui-1.9.1.custom.js');    
        css.unshift(inputs+'dateui/jquery-ui-datepicker/css/redmond/jquery-ui-1.9.1.custom.css');

        //style
        css.push('style.css');    
    /* bootstrap */        
    } else {      
        //core
        js.unshift(bootstrap+'js/bootstrap.js')
        css.unshift(bootstrap+'css/bootstrap.css');
//        css.push(bootstrap+'css/bootstrap.css');
        //css.unshift(bootstrap+'css/bootstrap-responsive.css');

        //editable
        js.push(forms+'editable-form-bootstrap.js');
        js.push(getContainer('editable-popover.js'));

        //date
        js.push(inputs+'date/bootstrap-datepicker/js/bootstrap-datepicker.js');
        js.push(inputs+'date/date.js');
        css.push(inputs+'date/bootstrap-datepicker/css/datepicker.css');    
    }

    function getContainer(container) {
        return (c === 'inline') ? containers+'/editable-inline.js' : containers + container;
    }  

    //js.push('main.js');
    
    return {css: css, js: js};
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