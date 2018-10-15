
$(document).ready(function(e) {
	// initializeValidateSiteInformationForm();
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

function initializeValidateSiteInformationForm () {
	$("#site-information-form").validate({
        debug: true,
        rules: {
            site_name: "required",
			site_code: "required",
			barangay: "required",
			municipality: "required",
			province: "required",
			region: "required",
			psgc: "required",
			households: "required",
			season: "required",
			is_active: "required"
        },
        messages: { comments: "" },
        errorPlacement (error, element) {
            const placement = $(element).closest(".form-group");
            if ($(element).hasClass("cbox_trigger_switch")) {
                $("#errorLabel").append(error).show();
            } else if (placement) {
                $(placement).append(error);
            } else {
                error.insertAfter(placement);
            } // remove on success

            element.parents(".form-group").addClass("has-feedback");

            // Add the span element, if doesn't exists, and apply the icon classes to it.
            const $next_span = element.next("span");
            if (!$next_span[0]) {
                if (element.is("select") || element.is("textarea")) $next_span.css({ top: "25px", right: "25px" });
            }
        },
        success (label, element) {
            // Add the span element, if doesn't exists, and apply the icon classes to it.
            if (!$(element).next("span")) {
                $("<span class='glyphicon glyphicon-ok form-control-feedback' style='top:0px; right:37px;'></span>").insertAfter($(element));
            }

            $(element).closest(".form-group").children("label.error").remove();
        },
        highlight (element, errorClass, validClass) {
            $(element).parents(".form-group").addClass("has-error").removeClass("has-success");
            if ($(element).parent().is(".datetime") || $(element).parent().is(".time")) {
                $(element).nextAll("span.glyphicon").remove();
                $("<span class='glyphicon glyphicon-remove form-control-feedback' style='top:0px; right:37px;'></span>").insertAfter($(element));
            } else $(element).next("span").addClass("glyphicon-remove").removeClass("glyphicon-ok");
        },
        unhighlight (element, errorClass, validClass) {
            $(element).parents(".form-group").addClass("has-success").removeClass("has-error");
            if ($(element).parent().is(".datetime") || $(element).parent().is(".time")) {
                $(element).nextAll("span.glyphicon").remove();
                $("<span class='glyphicon glyphicon-ok form-control-feedback' style='top:0px; right:37px;'></span>").insertAfter($(element));
            } else $(element).next("span").addClass("glyphicon-ok").removeClass("glyphicon-remove");
        },
        submitHandler (form) {
        	
            
        }
    });
}

function insertNewSite () {
	$.post("../site_info/insert", data)
    .done((result, textStatus, jqXHR) => {
        console.log(result);
        // doSend("updateDashboardTables");

        // const { timestamp_entry } = data;
        // const baseline = moment(timestamp_entry).add(30, "minutes");
        // const exec_time = moment().diff(baseline);
        // const report = {
        //     type: "timeliness",
        //     metric_name: "web_ewi_timeliness",
        //     module_name: "Web EWI Release",
        //     execution_time: exec_time
        // };

        // PMS.send(report);

        // const $modal = $("#resultModal");
        // $modal.find(".modal-header").html("<h4>Early Warning Information Release</h4>");
        // $modal.find(".modal-body").html("<p><strong>SUCCESS:</strong>&ensp;Early warning information successfully released on site!</p>");
        // setTimeout(() => { $modal.modal("show"); }, 300);
    })
    .catch((x) => {
        // showErrorModal(x, "inserting release");
        // const report = {
        //     type: "error_logs",
        //     metric_name: "web_ewi_error_logs",
        //     module_name: "Web EWI Release",
        //     report_message: `error inserting release ${x.responseText}`
        // };

        // PMS.send(report);
    })
    .always(() => {
    	//for closing loader modal
    });
}

function updateSite () {

}

function deleteSite () {

}

function getSiteInformation () {

}

function getAllSites(){

}