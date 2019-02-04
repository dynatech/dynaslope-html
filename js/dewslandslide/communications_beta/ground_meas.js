$(document).ready(() => {
	initializeAddSpecialCaseButtonOnClick();
});

function initializeAddSpecialCaseButtonOnClick () {
    $("#add-special-case").click(() => {
        addSpecialCase();
    });
}

function reconstructSavedSettingsForGndMeasReminder(settings, def_event, def_extended, def_routine, all_data) {
	try {
		$("#no-site-on-monitoring").hide();
		resetCaseDiv();
	    ground_meas_reminder_data = {
	        event: def_event,
	        extended: def_extended,
	        routine: def_routine,
	        settings: settings,
	        template: all_data.template.template,
	        time_of_sending : all_data.time_of_sending

	    }
	    if(def_event.length == 0){
	    	$("#no-site-on-monitoring-msg").text("No site under event monitoring.");
	    	$("#save-gnd-meas-settings-button").prop("disabled",true);
	    	$("#add-special-case").prop("disabled",true);
	    }else {
	    	$("#no-site-on-monitoring").hide();
	    	$("#save-gnd-meas-settings-button").prop("disabled",false);
	    	$("#add-special-case").prop("disabled",false);
	    	displaySavedReminderMessage(settings, def_event, def_extended, def_routine);
	    }
	} catch(err) {
		sendReport(err.message);
		// PMS
	}
}

function changeSemiAutomationSettings(category, data) {
	try {
		if (category != "routine" && category != "event" && category != "extended") {
	        reconstructSavedSettingsForGndMeasReminder(data.settings, data.event, data.extended, data.routine);
	    } else {
	        resetCaseDiv();
	        const currentDate = new Date();
	        const current_meridiem = currentDate.getHours();
	        if(data.saved == false){
	        	let template = data.template.template.replace("(monitoring_type)", category);
		        
		        $('#reminder-message').text(template);

		        $(".gndmeas-reminder-site").empty();
		        $(".gndmeas-reminder-office").empty();

		        switch(category) {
		            case 'extended':
		                site_count = data.extended_sites.length;
		                if (site_count == 0){
		                	$("#no-site-on-monitoring").show();
		                	$("#no-site-on-monitoring-msg").text("No site under extended monitoring.");
		                	$("#save-gnd-meas-settings-button").prop("disabled",true);
		                	$("#add-special-case").prop("disabled",true);
		                } else {
		                	$("#no-site-on-monitoring").hide();
		                	$("#save-gnd-meas-settings-button").prop("disabled",false);
		                	$("#add-special-case").prop("disabled",false);
		                	for (var i = 0; i < data.extended_sites.length; i++) {
			                    var modIndex = i % 6;
			                    sitename = data.extended_sites[i].toUpperCase();
						        if ($.inArray(data.extended_sites[i],data.cant_send_gndmeas) == -1) {
						        	$(`#gnd-sitenames-${modIndex}`).append(`<div class="checkbox"><label><input name="gnd-sitenames" type="checkbox" value="${sitename}" checked>${sitename}</label></div>`);
						        } else {
						        	$(`#gnd-sitenames-${modIndex}`).append(`<div class="checkbox"><label><input name="gnd-sitenames" type="checkbox" value="${sitename}">${sitename}</label></div>`);
						        } 
			                }
		                }
		                
		                break;
		            case 'event':
		                site_count = data.event_sites.length;
		                if (site_count == 0){
		                	$("#no-site-on-monitoring").show();
		                	$("#no-site-on-monitoring-msg").text("No site under event monitoring.");
		                	$("#save-gnd-meas-settings-button").prop("disabled",true);
		                	$("#add-special-case").prop("disabled",true);
		                } else {
		                	$("#no-site-on-monitoring").hide();
		                	$("#save-gnd-meas-settings-button").prop("disabled",false);
		                	$("#add-special-case").prop("disabled",false);
			                for (var i = 0; i < data.event_sites.length; i++) {
			                    var modIndex = i % 6;
			                    sitename = data.event_sites[i].site_code.toUpperCase();
						        if ($.inArray(data.event_sites[i].site_code,data.cant_send_gndmeas) == -1) {
						        	$(`#gnd-sitenames-${modIndex}`).append(`<div class="checkbox"><label><input name="gnd-sitenames" type="checkbox" value="${sitename}" checked>${sitename}</label></div>`);
						        } else {
						        	$(`#gnd-sitenames-${modIndex}`).append(`<div class="checkbox"><label><input name="gnd-sitenames" type="checkbox" value="${sitename}">${sitename}</label></div>`);
						        } 
			                }
			            }
		                break;
		            case 'routine':
		                site_count = data.routine_sites.length;
		                if (site_count == 0){
		                	$("#no-site-on-monitoring").show();
		                	$("#no-site-on-monitoring-msg").text("No site under routing monitoring.");
		                	$("#save-gnd-meas-settings-button").prop("disabled",true);
		                	$("#add-special-case").prop("disabled",true);
		                } else {
		                	$("#no-site-on-monitoring").hide();
		                	$("#save-gnd-meas-settings-button").prop("disabled",false);
		                	$("#add-special-case").prop("disabled",false);
			                for (var i = 0; i < data.routine_sites.length; i++) {
			                    var modIndex = i % 6;
			                    sitename = data.routine_sites[i].toUpperCase();
						        if ($.inArray(data.routine_sites[i],data.cant_send_gndmeas) == -1) {
						        	$(`#gnd-sitenames-${modIndex}`).append(`<div class="checkbox"><label><input name="gnd-sitenames" type="checkbox" value="${sitename}" checked>${sitename}</label></div>`);
						        } else {
						        	$(`#gnd-sitenames-${modIndex}`).append(`<div class="checkbox"><label><input name="gnd-sitenames" type="checkbox" value="${sitename}">${sitename}</label></div>`);
						        } 
			                }
			            }
		                break;
		        }
	        }else {
		        displaySavedReminderMessage(data.settings, data.event, data.extended ,data.routine);
	        } 
	    }
	} catch(err) {
		sendReport(err.message);
		// PMS
	}
}

function displaySavedReminderMessage (settings, def_event, def_extended, def_routine) {
	gnd_meas_overwrite = "old";
    let event_sites = [];
    let event_sites_full = [];
    let event_templates_container = [];
    let event_altered = [];
    let routine_sites = [];
    let routine_sites_full = [];
    let routine_templates_container = [];
    let routine_altered = [];
    let extended_sites = [];
    let extended_sites_full = [];
    let extended_templates_container = [];
    let extended_altered = [];
    let special_cases = 0;
    let has_event_settings = false;
    let has_extended_settings = false;
    let has_routine_settings = false;
    let template = ground_meas_reminder_data.template.replace("(monitoring_type)", $("#gnd-meas-category").val());
    try {
		$(".gndmeas-reminder-site").empty();
	    $(".gndmeas-reminder-office").empty();
		for (let counter = 0; counter < settings.length; counter++) {
	        switch(settings[counter].type) {
	            case 'routine':
	            	has_routine_settings = true;
	                routine_sites_full.push(settings[counter]);
	                routine_sites.push(settings[counter].site);
	                if(settings[counter].altered_template == 0){
		                if ($.inArray(settings[counter].msg, routine_templates_container) == -1) {
		                    routine_templates_container.push(settings[counter].msg);
		                }
	            	}
	                if (settings[counter].altered_template == 1) {
	                    routine_altered.push(settings[counter]);
	                }
	                break;
	            case 'extended':
	            	has_extended_settings = true;
	                extended_sites_full.push(settings[counter]);
	                extended_sites.push(settings[counter].site);
	                if(settings[counter].altered_template == 0){
		                if ($.inArray(settings[counter].msg, extended_templates_container) == -1) {
		                    extended_templates_container.push(settings[counter].msg); 
		                }
	            	}

	                if (settings[counter].altered_template == 1) {
	                    extended_altered.push(settings[counter]);
	                }
	                break;
	            case 'event':
	            	has_event_settings = true;
	                event_sites_full.push(settings[counter]);
	                event_sites.push(settings[counter].site);
	                if(settings[counter].altered_template == 0){
		                if ($.inArray(settings[counter].msg, event_templates_container) == -1) {
		                   event_templates_container.push(settings[counter].msg); 
		                }
	                }
	                if (settings[counter].altered_template == 1) {
	                    event_altered.push(settings[counter]);
	                }
	                break;
	        }
	    }

	    let gnd_meas_category = $("#gnd-meas-category").val();
	    switch(gnd_meas_category) {
	        case 'extended':
	            site_count = def_extended.length;
	            if(site_count == 0){
	            	showAndHideGroudMeasButton(true);
	            	$("#no-site-on-monitoring-msg").text(displayNoEventText(gnd_meas_category));
	            }else {
					showAndHideGroudMeasButton(false);
	            	if(has_extended_settings == true){
		            	for (var i = 0; i < def_extended.length; i++) {
			                var modIndex = i % 6;
			                sitename = def_extended[i].toUpperCase();
			                if ($.inArray(sitename, extended_sites) != -1 && $.inArray(extended_sites_full[i], extended_altered) == -1) {
			                    $(`#gnd-sitenames-${modIndex}`).append('<div class="checkbox"><label><input type="text" class="automation_distinction" value="reminder_automation_id_'+extended_sites_full[i].automation_id+'" hidden><input name="gnd-sitenames" type="checkbox" value="'+sitename+'" checked>'+sitename+'</label></div>');
			                } else {
			                    $(`#gnd-sitenames-${modIndex}`).append(`<div class="checkbox"><label><input type="text" class="automation_distinction" value="new" hidden><input name="gnd-sitenames" type="checkbox" value="${sitename}">${sitename}</label></div>`);
			                }
			            }

			            $("#reminder-message").text(extended_templates_container[0]);
			            for (let counter = 0; counter < extended_altered.length; counter++){
			                addSpecialCase();
			                $("#special-case-message-"+counter+"").val(extended_altered[counter].msg);
			                $("#special-case-message-"+counter+"").after("<input type='text' id='reminder_automation_id_"+extended_altered[counter].automation_id+"' value="+extended_altered[counter].automation_id+" hidden> ");
			                $("input[name=\"gnd-meas-"+counter+"\"]:checkbox").each(function () {
			                    if (extended_altered[counter].site == this.value) {
			                        $(this).prop("checked", true);
			                    } else {
			                        $(this).prop("checked", false);
			                    }
			                });
			            }
	            	}else {
	            		gnd_meas_overwrite = "new";
	            		delegateCheckboxesForNoSavedSettings(def_extended);
					    $("#reminder-message").text(template);
	            	}
	            }
	            
	            break;
	        case 'event':
	            site_count = def_event.length;
	            if(site_count == 0){
	            	showAndHideGroudMeasButton(true);
	            	$("#no-site-on-monitoring-msg").text(displayNoEventText(gnd_meas_category));
	            }else {
	            	showAndHideGroudMeasButton(false);
	            	if(has_event_settings == true){
	            		for (var i = 0; i < def_event.length; i++) {
			                var modIndex = i % 6;
			                sitename = def_event[i].site_code.toUpperCase();
			                if ($.inArray(sitename, event_sites) != -1 && $.inArray(event_sites_full[i], event_altered) == -1) {
			                  	$(`#gnd-sitenames-${modIndex}`).append('<div class="checkbox"><label><input type="text" class="automation_distinction" value="reminder_automation_id_'+event_sites_full[i].automation_id+'" hidden><input name="gnd-sitenames" type="checkbox" value="'+sitename+'" checked>'+sitename+'</label></div>');  
			                } else {
			                   	$(`#gnd-sitenames-${modIndex}`).append(`<div class="checkbox"><label><input type="text" class="automation_distinction" value="new" hidden><input name="gnd-sitenames" type="checkbox" value="${sitename}">${sitename}</label></div>`);
			                }

			            }

			            $("#reminder-message").text(event_templates_container[0]);
			            for (let counter = 0; counter < event_altered.length; counter++){
			                addSpecialCase();
			                $("#special-case-message-"+counter+"").val(event_altered[counter].msg);
			                $("#special-case-message-"+counter+"").after("<input type='text' id='reminder_automation_id_"+event_altered[counter].automation_id+"' value="+event_altered[counter].automation_id+" hidden> ");
			                $("input[name=\"gnd-meas-"+counter+"\"]:checkbox").each(function () {
			                    if (event_altered[counter].site == this.value) {
			                        $(this).prop("checked", true);
			                    } else {
			                        $(this).prop("checked", false);
			                    }
			                });
			            }
	            	}else{
	            		gnd_meas_overwrite = "new";
	            		delegateCheckboxesForNoSavedSettings(def_event, "event");
					    $("#reminder-message").text(template);
	            	}
	            	
	            }
	            
	            break;
	        case 'routine':
	            site_count = def_routine.length;
	            if(site_count == 0){
	            	showAndHideGroudMeasButton(true);
	            	$("#no-site-on-monitoring-msg").text(displayNoEventText(gnd_meas_category));
	            }else {
	            	showAndHideGroudMeasButton(false);
	            	if(has_routine_settings == true){
	            		for (var i = 0; i < def_routine.length; i++) {
			                var modIndex = i % 6;
			                sitename = def_routine[i].toUpperCase();
			                if ($.inArray(sitename, routine_sites) != -1 && $.inArray(routine_sites_full[i], routine_altered) == -1) {
			                    $(`#gnd-sitenames-${modIndex}`).append('<div class="checkbox"><label><input type="text" class="automation_distinction" value="reminder_automation_id_'+routine_sites_full[i].automation_id+'" hidden><input name="gnd-sitenames" type="checkbox" value="'+sitename+'" checked>'+sitename+'</label></div>');
			                } else {
			                    $(`#gnd-sitenames-${modIndex}`).append(`<div class="checkbox"><label><input class="automation_distinction1" type="text" value="new" hidden><input name="gnd-sitenames" type="checkbox" value="${sitename}">${sitename}</label></div>`);
			                }
			            }
			            $("#reminder-message").text(routine_templates_container[0]);
			            for (let counter = 0; counter < routine_altered.length; counter++){
			                addSpecialCase();
			                $("#special-case-message-"+counter+"").val(routine_altered[counter].msg);
			                $("#special-case-message-"+counter+"").after("<input type='text' id='reminder_automation_id_"+routine_altered[counter].automation_id+"' value="+routine_altered[counter].automation_id+" hidden> ");
			                $("input[name=\"gnd-meas-"+counter+"\"]:checkbox").each(function () {
			                    if (routine_altered[counter].site == this.value) {
			                        $(this).prop("checked", true);
			                    } else {
			                        $(this).prop("checked", false);
			                    }
			                });
			            }
	            	}else {
	            		gnd_meas_overwrite = "new";
	            		delegateCheckboxesForNoSavedSettings(def_routine);
					    $("#reminder-message").text(template);
	            	}
	            	
	            }
	            
	        break;
	    }
    } catch(err) {
    	sendReport(err.message);
    	// PMS
    }

}

function showAndHideGroudMeasButton (behavior) {
	if(behavior == true){
		$("#no-site-on-monitoring").show();
		$("#save-gnd-meas-settings-button").prop("disabled",true);
    	$("#add-special-case").prop("disabled",true);
    	$("#reminder-message").text();
    	$("#reminder-message").prop("disabled",true);
	}else {
		$("#no-site-on-monitoring").hide();
    	$("#save-gnd-meas-settings-button").prop("disabled",false);
    	$("#add-special-case").prop("disabled",false);
    	$("#reminder-message").prop("disabled",false);
    	$("#reminder-message").text();
	}
}

function displayNoEventText(type){
	let message = "";
	if (type == "event") {
		message = "No site under event monitoring.";
	}else if (type == "extended") {
		message = "No site under extended monitoring.";
	}else if (type == "routine") {
		message = "No site under routine monitoring.";
	}

	return message;
}

function delegateCheckboxesForNoSavedSettings(data, category){
	let site_name = null;
	for (var i = 0; i < data.length; i++) {
        var modIndex = i % 6;
        if(category == "event"){
        	site_name = data[i].site_code.toUpperCase();
        }else {
        	site_name = data[i].toUpperCase();
        }
        $(`#gnd-sitenames-${modIndex}`).append('<div class="checkbox"><label><input type="text" class="automation_distinction" hidden><input name="gnd-sitenames" type="checkbox" value="'+site_name+'" checked>'+site_name+'</label></div>');
    }

}


function updateGndMeasTemplate(template) {
	let current_date_time = moment().format('H:mm:ss');
	let gndmeas_time = null;
	if(current_date_time >= moment().format("07:30:00") && current_date_time <= moment().format("11:30:00")){
		template = template.replace("(ground_meas_submission)", "11:30 AM");
	} else if (current_date_time >= moment().format("11:30:00") && current_date_time <= moment().format("14:30:00")){
		template = template.replace("(ground_meas_submission)", "3:30 PM");
	}

	return template;

}

function displaySitesForGndMeasReminder(data) {
	try {
		$("#no-site-on-monitoring").hide();
	    gnd_meas_overwrite = "new";
	    ground_meas_reminder_data = data;
	    const currentDate = new Date();
	    const current_meridiem = currentDate.getHours();
	    let template = ground_meas_reminder_data.template.template.replace("(monitoring_type)", $("#gnd-meas-category").val());
	    $(".gndmeas-reminder-site").empty();
	    $(".gndmeas-reminder-office").empty();

	    if (current_meridiem >= 13 && current_meridiem <= 18) {
	        template = template.replace("(greetings)", "hapon");
	    } else if (current_meridiem >= 18 && current_meridiem <= 23) {
	        template = template.replace("(greetings)", "hapon");
	    } else if (current_meridiem >= 0 && current_meridiem <= 3) {
	        template = template.replace("(greetings)", "umaga");
	    } else if (current_meridiem >= 4 && current_meridiem <= 11) {
	        template = template.replace("(greetings)", "umaga");
	    } else {
	        template = template.replace("(greetings)", "hapon");
	    }

	    $("#reminder-message").text(template);
	    site_count = data.event_sites.length;
	    for (var i = 0; i < data.event_sites.length; i++) {
	    	console.log();
	        var modIndex = i % 6;
	        sitename = data.event_sites[i].site_code.toUpperCase();
	        if ($.inArray(data.event_sites[i].site_code,data.cant_send_gndmeas) == -1) {
	        	$(`#gnd-sitenames-${modIndex}`).append(`<div class="checkbox"><label><input name="gnd-sitenames" type="checkbox" value="${sitename}" checked>${sitename}</label></div>`);
	        } else {
	        	$(`#gnd-sitenames-${modIndex}`).append(`<div class="checkbox"><label><input name="gnd-sitenames" type="checkbox" value="${sitename}">${sitename}</label></div>`);
	        } 
	    }
	} catch(err) {
		sendReport(err.message);
		// PMS
	}
}

function addSpecialCase () {
    const case_name = `clone-special-case-${special_case_id}`;
    const class_sites_div = `clone-sites-div-${special_case_num}`;
    const class_msg_div = `clone-msg-div-${special_case_num}`; 
    const $clone = $("#special-case-template").clone().prop("hidden", false);
    const regular_reminder_msg = $("#reminder-message").val();
    const $clone_sites = $(".gndmeas-reminder-site-container").children().clone();
    try {
	    if (site_count <= special_case_num) {
	        $("#add-special-case").prop('disabled',true);
	    } else {
	        $("#add-special-case").prop('disabled',false);
	        $clone.attr("id", case_name);
	        $clone.find("div#special-case-body .col-sm-6:first-child").addClass(class_sites_div);
	        $clone.find("div#special-case-body .col-sm-6:last-child").addClass(class_msg_div);
	        $clone.find("textarea.special-case-message-container").attr('id', `special-case-message-${special_case_num}`);
	        $clone.find("textarea.special-case-message-container").val(regular_reminder_msg);
	        $clone_sites.find("input").each((index, element) => {
	            let checkbox_name = `gnd-meas-${special_case_num}`;
	            $(element).attr('name', checkbox_name);
	            $(element).prop("checked", false);
	        });
	        
	        $clone.find("#special-case-sites").append($clone_sites);
	        $("#special-case-container").append($clone);
	        special_case_id += 1;
	        special_case_num += 1;

	        if (site_count <= special_case_num) $("#add-special-case").prop('disabled',true); 
	    }
    } catch(err) {
    	sendReport(err.message);
    	// PMS
    }
}

function removeInputField () {
    $(document).on("click", ".remove", ({ currentTarget }) => {
        special_case_num = special_case_num-1;
        $("#add-special-case").prop('disabled',false);
        $(currentTarget).closest("div.special-case-template").remove();
    });
}

function initializeResetSpecialCasesButtonOnCLick () {
    $("#reset-button").on("click",() => {
        resetSpecialCases();
    });    
}

function resetSpecialCases () {
    $("#gnd-meas-category").val('event');
    let special_case_length = $(".special-case-template").length;
    special_case_num = 0;
    for (let counter = special_case_length-1; counter >=0; counter--) {
        $("#clone-special-case-"+counter).remove();
    }
    resetCaseDiv();
    try {
    	var data = {
		    type: "getGroundMeasDefaultSettings"
		};
		wss_connect.send(JSON.stringify(data)); 
	} catch(err) {
		sendReport(err);
		// Add PMS here
	}
       
}

function resetCaseDiv () {
    $("#add-special-case").prop('disabled',false);
    let case_div = $("#special-case-container");
    case_div.empty();
    special_case_num = 0;
    special_case_id = 0;
}