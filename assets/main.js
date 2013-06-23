$(function(){
   prettyPrint();
    
   if($('#subnav').length) {
       $('body').scrollspy({
           target: '#subnav',
           offset: 100
       });   
       
       $('#subnav a').mousedown(function(e){
           $('body').scrollspy('refresh');
       });
   }
   
   $('.cdn input[type="radio"]').click(function(){
       var css = '<link href="//cdnjs.cloudflare.com/ajax/libs/x-editable/' + window.version+'/'+$(this).data('css')+'" rel="stylesheet"/>\n',
           js = '<script src="//cdnjs.cloudflare.com/ajax/libs/x-editable/' + window.version+'/'+$(this).data('js')+'"></script>';
          
       $('.cdn pre').text(css+js);
       prettyPrint(); 
   });
   
   $('.cdn input[type="radio"]').eq(0).click();
});