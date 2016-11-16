	$(document).ready(function(){
    $('.modal').modal();
    
    if ($.cookie('modal_shown') == null) {
        $.cookie('modal_shown', 'yes', { expires: 7, path: '/' });
        $('#about-modal').modal('open');
    }
    
  });
