
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


});