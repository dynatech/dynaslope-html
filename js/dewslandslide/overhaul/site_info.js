
$(document).ready(function(e) {
	$( '#modal_button').hide();
	$( window ).resize(function() {
	  site_info_page_widht = $(window ).width();
	  site_info_page_height = $(window).height();
	  console.log(site_info_page_widht,site_info_page_height)

	 	if (site_info_page_widht <= 992 || site_info_page_height <= 624) {

			$( '#site_form').hide();
			$( '#modal_button').show();
		} else{
			$( '#modal_button').hide();
			$( '#site_form').show();
		}
	});



	var $nav = $('#navigation'),        // GET NAVIGATION ID
    posTop = $nav.position().top;       // NAVIGATION POSITION FROM TOP OF WINDOW
	$(window).resize(function() {
	    posTop = $nav.position().top;
    });

      
    $(window).scroll(function () {      // MAKE SURE .position().top IS OUTSIDE WINDOW SCROLL
        var y = $(this).scrollTop();
		  
        if (y > posTop) {               // WHEN scrollTop() REACHES TOP OF NAVIGATION ADD .fixed
            $nav.addClass('sticky');
            $(".logosmall").removeClass('hidels');
        }
		  
        else {                          // IF scrollTop() IS ABOVE NAVIGATION REMOVE .fixed
            $nav.removeClass('sticky'); 
            $(".logosmall").addClass('hidels');
        }
    });


	$(".navResponsive").click(function(){
		$("nav ul.navHold").toggle();
	});
		
	$("nav ul li.subNav").click(function(){
		$(this).children("ul").toggle();
	});      


	
});