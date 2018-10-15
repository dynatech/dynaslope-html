let button_type = null;
$(document).ready(function(e) {
	intializeSaveSiteButton();
	getAllSites();
	initializeOpenAddNewSiteModal();
	initializeOnClickUpdateSite();
	// $( '#modal_button').hide();
	// $( window ).resize(function() {
	//   site_info_page_widht = $(window ).width();
	//   site_info_page_height = $(window).height();
	//   console.log(site_info_page_widht,site_info_page_height)

	//  	if (site_info_page_widht <= 992 || site_info_page_height <= 624) {

	// 		$( '#site_form').hide();
	// 		$( '#modal_button').show();
	// 	} else{
	// 		$( '#modal_button').hide();
	// 		$( '#site_form').show();
	// 	}
	// });



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

// function initializeValidateSiteInformationForm () {
// 	$("#site-information-form").validate({
//         debug: true,
//         rules: {
//             site_name: "required",
// 			site_code: "required",
// 			barangay: "required",
// 			municipality: "required",
// 			province: "required",
// 			region: "required",
// 			psgc: "required",
// 			households: "required",
// 			season: "required",
// 			is_active: "required"
//         },
//         messages: { comments: "" },
//         errorPlacement (error, element) {
//             const placement = $(element).closest(".form-group");
//             if ($(element).hasClass("cbox_trigger_switch")) {
//                 $("#errorLabel").append(error).show();
//             } else if (placement) {
//                 $(placement).append(error);
//             } else {
//                 error.insertAfter(placement);
//             } // remove on success

//             element.parents(".form-group").addClass("has-feedback");

//             // Add the span element, if doesn't exists, and apply the icon classes to it.
//             const $next_span = element.next("span");
//             if (!$next_span[0]) {
//                 if (element.is("select") || element.is("textarea")) $next_span.css({ top: "25px", right: "25px" });
//             }
//         },
//         success (label, element) {
//             // Add the span element, if doesn't exists, and apply the icon classes to it.
//             if (!$(element).next("span")) {
//                 $("<span class='glyphicon glyphicon-ok form-control-feedback' style='top:0px; right:37px;'></span>").insertAfter($(element));
//             }

//             $(element).closest(".form-group").children("label.error").remove();
//         },
//         highlight (element, errorClass, validClass) {
//             $(element).parents(".form-group").addClass("has-error").removeClass("has-success");
//             if ($(element).parent().is(".datetime") || $(element).parent().is(".time")) {
//                 $(element).nextAll("span.glyphicon").remove();
//                 $("<span class='glyphicon glyphicon-remove form-control-feedback' style='top:0px; right:37px;'></span>").insertAfter($(element));
//             } else $(element).next("span").addClass("glyphicon-remove").removeClass("glyphicon-ok");
//         },
//         unhighlight (element, errorClass, validClass) {
//             $(element).parents(".form-group").addClass("has-success").removeClass("has-error");
//             if ($(element).parent().is(".datetime") || $(element).parent().is(".time")) {
//                 $(element).nextAll("span.glyphicon").remove();
//                 $("<span class='glyphicon glyphicon-ok form-control-feedback' style='top:0px; right:37px;'></span>").insertAfter($(element));
//             } else $(element).next("span").addClass("glyphicon-ok").removeClass("glyphicon-remove");
//         },
//         submitHandler (form) {
        	
            
//         }
//     });
// }

function intializeSaveSiteButton(){
	$("#btn-insert-site").click(({ currentTarget }) => {
        button_type = "insert";
        const data = {
        	site_code: $("#site_code").val(),
        	purok: $("#purok").val(),
        	sitio: $("#sitio").val(),
        	barangay: $("#barangay").val(),
        	municipality: $("#municipality").val(),
        	province: $("#province").val(),
        	region: $("#region").val(),
        	psgc: $("#psgc").val(),
        	households: $("#households").val(),
        	season: $("#season").val(),
        	is_active: $("#is_active").val()
        };
        insertOrUpdateSite(data, button_type);
    });
}

function insertOrUpdateSite  (data,type) {
	let url = null;
	if(type == "insert"){
		url = "../site_info/insertNewSite";
	}else if(type == "update"){
		url = "../site_info/updateSite";
	}else {
		url = "../site_info/deleteSite";
	}

	$.post(url, data)
    .done((result, textStatus, jqXHR) => {
        console.log(result);
        $.notify("Successfully added new site", "success");
    })
    .catch((x) => {
    	// insert pms here
    })
    .always(() => {
    	//for closing loader modal
    });
}


function deleteSite () {

}

function getSiteInformation () {

}

function getAllSites(){
	$.getJSON("../site_info/getAllSites")
    .done((data) => {
        displayAllSites(data);
    });
}

function displayAllSites(data){
	// $("#site-info-modal").modal("show");
	$("#sites-table").empty();
	$("#sites-table").DataTable({
		destroy: true,
		data: data,
		columns: [
		{ "data": "site_code", "title": "Site ID"},
		{ "data": "purok", "title": "Purok" },
		{ "data": "sitio", "title": "Sitio"},
		{ "data": "barangay", "title": "Barangay"},
		{ "data": "municipality", "title": "Municipality"},
		{ "data": "province", "title": "Province"},
		{ "data": "region", "title": "Region" },
		{ "data": "psgc", "title": "PSGC"},
		{ "data": "households", "title": "Households"},
		{ "data": "season", "title": "Season"},
		{ "data": "active", "title": "Is Active"},
		{ "data": "actions", "title": "Actions"}
		],
		"dom": '<"toolbar">frtip'
	});
	$("div.toolbar").html('<button type="button" class="btn btn-primary" id="open-site-modal"><span class="glyphicon glyphicon-plus" aria-hidden="true"></span> Add new site</button>&nbsp;&nbsp;');
}

function initializeOpenAddNewSiteModal(){
	$(".toolbar #open-site-modal").click(({ currentTarget }) => {
		alert();
    });
}

function initializeOnClickUpdateSite () {
	$('#sites-table').on('click','.update',function(){
        $('form').trigger('reset');
    	var table = $('#sites-table').DataTable();
		var data = table.row($(this).closest('tr')).data();
		console.log(data);
    });

    $('#sites-table').on('click','.delete',function(){
        $('form').trigger('reset');
    	var table = $('#sites-table').DataTable();
		var data = table.row($(this).closest('tr')).data();
		console.log(data);
    });
}