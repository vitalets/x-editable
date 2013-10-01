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
       var CDNVersion = '1.4.6'; //cdn is updated with delay..
       var css = '<link href="//cdnjs.cloudflare.com/ajax/libs/x-editable/' + CDNVersion+'/'+$(this).data('css')+'" rel="stylesheet"/>\n',
           js = '<script src="//cdnjs.cloudflare.com/ajax/libs/x-editable/' + CDNVersion+'/'+$(this).data('js')+'"></script>';
          
       $('.cdn pre').text(css+js);
       $('#cdnver').text('('+CDNVersion+')');
       prettyPrint(); 
   });
   
   $('.cdn input[type="radio"]').eq(0).click();
});