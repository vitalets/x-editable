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
});