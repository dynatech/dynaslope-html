let recipient_container = [];
let recent_contacts_collection = [];
let recent_sites_collection = [];
let samar_sites_details = [];
let last_outbox_ts = null;
let last_inbox_ts = null;
let message_position = null;
let ROUTINE_SITES = null;
let current_date = moment().format("YYYY-MM-DD");
$(document).ready(function() {
	$('#chatterbox-loader-modal').modal({backdrop: 'static', keyboard: false});
    initialize();
	$(".birthdate").datetimepicker({
		locale: "en",
		format: "YYYY-MM-DD"
	});

	getEmployeeContactGroups();
	initializeOnSubmitEmployeeContactForm();
	initializeOnSubmitCommunityContactForm();
    initializeOnSubmitUnregisteredEmployeeContactForm();
    initializeOnSubmitUnregisteredCommunityContactForm();
    initializeDataTaggingButton();
    initializeContactPriorityBehavior();
});


function initialize() {
    setTimeout(function() {
        initializeOnClickGetRoutineReminder();
        initializeQuickInboxMessages();
        initializeDatepickers();
        getRecentActivity();
        recentActivityInitializer();
        getRoutineSites();
        getRoutineReminder();
        getRoutineTemplate();
        getImportantTags();
        initializeAddSpecialCaseButtonOnClick();
        removeInputField();
        initializeResetSpecialCasesButtonOnCLick();
        setTimeout(function(){
            try {
                initializeContactSuggestion("");
                initializeOnClickUpdateEmployeeContact();
                initializeOnClickUpdateCommunityContact();
                initializeOnClickUpdateUnregisteredContact();
                getSiteSelection();
                getLatestAlert()
                getOrganizationSelection();
                initializeMiscButtons();
                getQuickGroupSelection();
                initializeSamarSites();
                initializeScrollOldMessages();
                $("#chatterbox-loader-modal").modal("hide");
            } catch (err) {
                $("#chatterbox-loader-modal").modal("hide");
                const report = {
                    type: "error_logs",
                    metric_name: "initializer_error_logs",
                    module_name: "Communications",
                    report_message: `${err}`,
                    reference_table: "",
                    reference_id: 0,
                    submetrics: []
                };

                PMS.send(report);
                sendReport(err.stack,0)
            }
            
        }, 3000);
    },3000);
}

function getContactSuggestion (name_suggestion) {
    $("#contact-suggestion-container").empty();
    $("#contact-suggestion-container").append(
        '<input type="text" class="awesomplete form-control dropdown-input" id="contact-suggestion" placeholder="Type name..." data-multiple />'+
        '<span class="input-group-btn">'+
        '<button class="btn btn-default" id="go-chat" type="button">Go!</button>'+
        '</span>'
    );

    try {
        let contact_suggestion_input = document.getElementById("contact-suggestion");
        awesomplete = new Awesomplete(contact_suggestion_input,{
                filter (text, input) {
                    return Awesomplete.FILTER_CONTAINS(text, input.match(/[^;]*$/)[0]);
                },replace (text) {
                    var before = this.input.value.match(/^.+;\s*|/)[0];
                    this.input.value = `${before + text}; `;
                },minChars: 3
            });
        let contact_suggestion_container = [];
        name_suggestion.data.forEach(function(raw_names) {
            let priority = "";
            if(raw_names.priority == 1){
                priority = " - Primary";
            }else{
                priority = "";
            }
            let mobile_number = raw_names.number.replace("63", "0");
            let display_info = `${raw_names.fullname} (${mobile_number})${priority}`;
            contact_suggestion_container.push(display_info);
        });
        awesomplete.list = contact_suggestion_container;
        initializeGoChatOnClick(awesomplete);
    } catch(err) {
        sendReport(err.stack,0);
        const report = {
            type: "error_logs",
            metric_name: "get_contact_suggetions_error_logs",
            module_name: "Communications",
            report_message: `${err}`,
            reference_table: "",
            reference_id: 0,
            submetrics: []
        };

        PMS.send(report);
    }
}

function initializeGoChatOnClick (awesomplete) {
    $("#go-chat").on("click", ()=>{
        try {
            let contact_suggestion = $("#contact-suggestion");
            let searchKey = contact_suggestion.val();

            let isValidContact = validateContactSearchKey(searchKey, contact_suggestion);

            if(isValidContact) {
                console.log("go click");
                let multiple_contact = contact_suggestion.val().split(";");
                let final_contact = [];
                multiple_contact.forEach(function(user){
                    let value = user.replace(" - Primary", "");
                    final_contact.push(value);
                });
                conversation_details = prepareConversationDetails(final_contact);
                startConversation(conversation_details);            
            }
            $("#recent-activity-panel").hide(400);
            $("#quick-access-panel").hide(400);
            $("#conversation-panel").show(400)
        } catch(err) {
            sendReport(err.stack,0);
            const report = {
                type: "error_logs",
                metric_name: "chat_search_users_error_logs",
                module_name: "Communications",
                report_message: `${err}`,
                reference_table: "",
                reference_id: 0,
                submetrics: []
            };

            PMS.send(report);
        }
    });
}

function validateContactSearchKey(searchKey, contact_suggestion) {
    try {
        let isInInput = searchKey.includes(";");
        if(isInInput) {
            let searchKey = contact_suggestion.val().split("; ");
            searchKey.pop();
            isInSuggestions = searchKey.every(elem => awesomplete._list.indexOf(elem) > -1);
        } else {
            isInSuggestions = searchKey.indexOf(awesomplete._list) > -1;
        }
        if(contact_suggestion.val().length === 0){
            $.notify("No keyword specified! Please enter a value and select from the suggestions.", "warn");
            return false;
        } else if(!isInSuggestions) {
            console.log("contact_suggestion is empty.");
            $.notify("Please use the correct format and select from the suggestions.", "warn");
            return false
        } else {
            return true;
        }
    } catch(err) {
        sendReport(err.stack,0);
        const report = {
            type: "error_logs",
            metric_name: "contact_search_validation_error_logs",
            module_name: "Communications",
            report_message: `${err}`,
            reference_table: "",
            reference_id: 0,
            submetrics: []
        };

        PMS.send(report);
    }
}

function prepareConversationDetails(multiple_contact) {
    try {
        let raw_name = "";
        let firstname = "";
        let lastname = "";
        let office = "";
        let site = "";
        let number = "N/A";
        let conversation_details = {};
        if (multiple_contact.length > 2) {
            let recipient_container = [];
            let temp = {};
            for (let counter = 0; counter < multiple_contact.length-1; counter++) {
                raw_name = multiple_contact[counter].split(",");
                firstname = raw_name[1].trim();
                lastname = raw_name[0].split("-")[1].trim();
                office = raw_name[0].split(" ")[1].trim();
                site = raw_name[0].split(" ")[0].trim();
                number = "N/A";

                temp = {
                    raw_name: raw_name,
                    firstname: firstname,
                    lastname: lastname,
                    office: office,
                    site: site,
                    number: number,
                    isMultiple: true
                };
                recipient_container.push(temp);
            }
            conversation_details = {
                isMultiple: true,
                data: recipient_container
            };
        } else {
            raw_name = multiple_contact[0].split(",");
            firstname = raw_name[1].trim();
            lastname = raw_name[0].split("-")[1].trim();
            lastname = lastname.replace("NA ","");
            office = raw_name[0].split(" ")[1].trim();
            site = raw_name[0].split(" ")[0].trim();
            conversation_details = {
                full_name: $("#contact-suggestion").val(),
                firstname: firstname,
                lastname: lastname,
                office: office,
                site: site,
                number: "N/A",
                isMultiple: false
            }
            conversation_details_label = site+" "+office+" - "+firstname+" "+lastname;
        }    
        return conversation_details;
    } catch(err) {
        sendReport(err.stack,0);
        const report = {
            type: "error_logs",
            metric_name: "prepare_conversation_details_error_logs",
            module_name: "Communications",
            report_message: `${err}`,
            reference_table: "",
            reference_id: 0,
            submetrics: []
        };

        PMS.send(report);
    }
}

function initializeQuickInboxMessages () {
	getQuickInboxMain();
	getQuickInboxUnregistered();
	getQuickInboxDataLogger();
    $("#inbox-loader").hide();
}

function getQuickInboxMain () {
    try {
        let msg = {
            type: 'smsloadquickinboxrequest'
        }
        wss_connect.send(JSON.stringify(msg));
    } catch(err) {
        console.log(err);
        const report = {
            type: "error_logs",
            metric_name: "load_quick_inbox_error_logs",
            module_name: "Communications",
            report_message: `${err}`,
            reference_table: "sms_inbox",
            reference_id: 7,
            submetrics: []
        };

        PMS.send(report);
        sendReport(err.stack,0);
    }
	
}

function getQuickInboxUnregistered() {
    try {
        let msg = {
            type: 'smsloadquickunknowninbox'
        }
        wss_connect.send(JSON.stringify(msg));
    } catch(err) {
        console.log(err);
        const report = {
            type: "error_logs",
            metric_name: "load_unregistered_inbox_error_logs",
            module_name: "Communications",
            report_message: `${err}`,
            reference_table: "sms_inbox",
            reference_id: 7,
            submetrics: []
        };

        PMS.send(report);
        sendReport(err.stack,0);
    }
    
}

function getQuickInboxDataLogger() {

}

function getRecentActivity () {
	getRecentlyViewedContacts();
	getRecentlyViewedSites();
	getOnRoutineSites();
}

function initializeOnClickUpdateEmployeeContact () {
	$('#emp-response-contact-container').on('click', 'tr:has(td)', function(){
		$("#emp-response-contact-container_wrapper").hide();
		$("#update-contact-container").show(300);
		$("#employee-contact-wrapper").show(300);
		$("#emp-settings-cmd").hide();
		var table = $('#emp-response-contact-container').DataTable();
		var data = table.row(this).data();
        try {
            var msg = {
                'type': 'loadDewslContact',
                'data': data.user_id
            };  
            wss_connect.send(JSON.stringify(msg));
        } catch(err) {
            console.log(err);
            const report = {
                type: "error_logs",
                metric_name: "load_employee_details_error_logs",
                module_name: "Communications",
                report_message: `${err}`,
                reference_table: "users",
                reference_id: 9,
                submetrics: []
            };

            PMS.send(report);
            sendReport(err.stack,0);
        }
		
	});
}

function initializeOnClickUpdateCommunityContact () {
	$('#comm-response-contact-container').on('click', 'tr:has(td)', function(){
		$('#comm-response-contact-container_wrapper').hide();
		$("#update-comm-contact-container").show(300);
		$("#community-contact-wrapper").show(300);
		$("#comm-settings-cmd").hide();
		var table = $('#comm-response-contact-container').DataTable();
		var data = table.row(this).data();
        try {
            var msg = {
                'type': 'loadCommunityContact',
                'data': data.user_id
            };  
            wss_connect.send(JSON.stringify(msg));
        } catch(err) {
            console.log(err);
            const report = {
                type: "error_logs",
                metric_name: "load_community_details_error_logs",
                module_name: "Communications",
                report_message: `${err}`,
                reference_table: "users",
                reference_id: 9,
                submetrics: []
            };

            PMS.send(report);
            sendReport(err.stack,0);
        }
		
	});
}

function initializeOnClickUpdateUnregisteredContact () {
    $('#unregistered-contact-container').on('click', 'tr:has(td)', function(){

        $('#unregistered-contact-container_wrapper').hide(300);
        $('#unregistered-wrapper').show(300);
        let table = $('#unregistered-contact-container').DataTable();
        let table_data = table.row(this).data();
        let label = table_data.unknown_label;
        label = label.split(", ");

        $("#emp_unregistered_user_id").val(table_data.user_id);
        $("#emp_unregistered_first_name").val(label[0]);
        $("#emp_unregistered_lastname").val(label[1]);
        $("#comm_unregistered_user_id").val(table_data.user_id);
        $("#comm_unregistered_firstname").val(label[0]);
        $("#comm_unregistered_lastname").val(label[1]);
        try {
            let msg = {
                'type': 'loadUnregisteredMobileNumber',
                'data': table_data.user_id
            }; 
            console.log(msg);
            wss_connect.send(JSON.stringify(msg));
        } catch(err) {
            console.log(err);
            const report = {
                type: "error_logs",
                metric_name: "load_unregistered_details_error_logs",
                module_name: "Communications",
                report_message: `${err}`,
                reference_table: "users",
                reference_id: 9,
                submetrics: []
            };

            PMS.send(report);
            sendReport(err.stack,0);
        }
        
    });
}

function initLoadLatestAlerts (data) {
    try {
        initCheckboxColors();
        initializeUncheckSiteOnEventInRoutine(data);
        if (data == null) {
            return;
        }
        let alerts = data;
        temp = data;
        let msg;
        for (let i = alerts.length - 1; i >= 0; i--) {
            msg = alerts[i];
            updateLatestPublicRelease(msg);
            $("input[name=\"sitenames\"]:unchecked").each(function () {
                if ($(this).val() == alerts[i].site_id) {
                    if (alerts[i].status == "on-going") {
                        $(this).parent().css("color", "red");
                    } else if (alerts[i].status == "extended") {
                        $(this).parent().css("color", "blue");
                    } 
                } else if ($(this).val() == 32 || $(this).val() == 33) { 
                    if (alerts[i].site_code == "msl" || alerts[i].site_code == "msu") {
                        if (alerts[i].status == "on-going") {
                            $(this).parent().css("color", "red");
                        } else if (alerts[i].status == "extended") {
                            $(this).parent().css("color", "blue");
                        }
                    }
                }
            });
        }
        displayQuickEventInbox(quick_inbox_registered, quick_release);
    } catch(err) {
        sendReport(err.stack,0)
        const report = {
            type: "error_logs",
            metric_name: "load_latest_alerts_error_logs",
            module_name: "Communications",
            report_message: `${err}`,
            reference_table: "",
            reference_id: 0,
            submetrics: []
        };

        PMS.send(report);
    }
}

function initializeUncheckSiteOnEventInRoutine(event_sites){
    if(event_sites != null){
        event_sites.forEach(function(site) {
            const { site_code } = site;
            $(".routine-site-selection label").find("input[value="+site_code+"]").prop("checked", false);
        });
    }
}

function displayQuickEventInbox (){
    try {
        try {
            let inbox_site_code = null;
            let event_site_code = null;
            for (let counter = 0; counter < quick_inbox_registered.length; counter++) {
                inbox_site_code = quick_inbox_registered[counter].full_name;
                inbox_site_code = inbox_site_code.split(" ");
                let inbox_data = quick_inbox_registered[counter];
                for (let counter = 0; counter < quick_release.length; counter++) {
                    event_site_code = quick_release[counter].site_code.toUpperCase();
                    if(event_site_code == inbox_site_code[0]){
                        quick_inbox_event.push(inbox_data);
                    }
                }
            }

            let event_inbox_html = event_inbox_template({'event_inbox_messages': quick_inbox_event});
            $("#quick-event-inbox-display").html(event_inbox_html);
            $("#quick-event-inbox-display").scrollTop(0);
        } catch (err) {
            console.log(err);
        }
    } catch (err) {
        sendReport(err.stack,0)
        const report = {
            type: "error_logs",
            metric_name: "load_quick_inbox_error_logs",
            module_name: "Communications",
            report_message: `${err}`,
            reference_table: "",
            reference_id: 0,
            submetrics: []
        };

        PMS.send(report);
    }
}

function initCheckboxColors () {
    $("input[name=\"sitenames\"]:unchecked").each(function () {
        $(this).parent().css("color", "#333");
    });    
}

function getSiteSelection() {
    try {
        let msg = {
            type: 'getAllSitesConSet'
        }
        wss_connect.send(JSON.stringify(msg));
    } catch(err) {
        console.log(err);
        const report = {
            type: "error_logs",
            metric_name: "sites_error_logs",
            module_name: "Communications",
            report_message: `${err}`,
            reference_table: "sites",
            reference_id: 5,
            submetrics: []
        };

        PMS.send(report);
        sendReport(err.stack,0);
    }
	
}


function getOrganizationSelection() {
    try {
        let msg = {
            type: 'getAllOrgsConSet'
        }
        wss_connect.send(JSON.stringify(msg));
    } catch(err) {
        console.log(err);
        const report = {
            type: "error_logs",
            metric_name: "orgs_error_logs",
            module_name: "Communications",
            report_message: `${err}`,
            reference_table: "organization",
            reference_id: 6,
            submetrics: []
        };

        PMS.send(report);
        sendReport(err.stack,0);
    }
	
}

function initializeContactSuggestion(name_query) {
    try {
        let msg = {
            'type': 'requestnamesuggestions',
            'namequery': name_query
        }
        wss_connect.send(JSON.stringify(msg));
    } catch(err) {
        console.log(err);
        const report = {
            type: "error_logs",
            metric_name: "request_name_suggestion_error_logs",
            module_name: "Communications",
            report_message: `${err}`,
            reference_table: "users",
            reference_id: 9,
            submetrics: []
        };

        PMS.send(report);
        sendReport(err.stack,0);
    }
	
}

function getImportantTags () {
    try {
        let msg = {
            type: 'getImportantTags'
        }
        wss_connect.send(JSON.stringify(msg));
    } catch(err) {
        console.log(err);
        const report = {
            type: "error_logs",
            metric_name: "get_important_tags_error_logs",
            module_name: "Communications",
            report_message: `${err}`,
            reference_table: "gintag_reference",
            reference_id: 12,
            submetrics: []
        };

        PMS.send(report);
        sendReport(err.stack,0);
    }
	
}

function getEmployeeContactGroups () {
	$('#team_ec').tagsinput({
		typeahead: {
			displayKey: 'text',
			source: function (query) {
				var group_tag = [];
				$.ajax({
					url : "../chatterbox/get_employee_contacts",
					type : "GET",
					async: false,
					success : function(data) {
						var data = JSON.parse(data);
						for (var counter = 0; counter < data.length; counter ++) {
							var raw_grouptags = data[counter].grouptags.split(",");
							for (var raw_counter = 0; raw_counter < raw_grouptags.length; raw_counter++) {
								if ($.inArray(raw_grouptags[raw_counter],group_tag) == -1) {
									group_tag.push(raw_grouptags[raw_counter]);
						
								}
							}
						}
					}
				});
				return group_tag;
			}
		} 
	});
}

function initializeOnSubmitEmployeeContactForm () {
	$('#emp-settings-cmd button[type="submit"], #sbt-update-contact-info').on('click',function(){
        try{
            employeeContactFormValidation();
        } catch (err) {
            sendReport(err.stack,0)
            const report = {
                type: "error_logs",
                metric_name: "on_click_submit_employee_form_error_logs",
                module_name: "Communications",
                report_message: `${err}`,
                reference_table: "",
                reference_id: 0,
                submetrics: []
            };

            PMS.send(report);
        }
	});
}

function initializeOnSubmitCommunityContactForm () {
	$('#comm-settings-cmd button[type="submit"], #sbt-update-comm-contact-info').on('click',function(){
		try{
			communityContactFormValidation();
		} catch (err) {
			sendReport(err.stack,0);
            const report = {
                type: "error_logs",
                metric_name: "on_click_submit_community_form_error_logs",
                module_name: "Communications",
                report_message: `${err}`,
                reference_table: "",
                reference_id: 0,
                submetrics: []
            };

            PMS.send(report);
		}
	});
}

function initializeOnSubmitUnregisteredEmployeeContactForm (){
    $('#emp_unregistered_save').on('click',function(){
        try{
            unregisteredEmployeeContactFormValidation();
        } catch (err) {
            sendReport(err.stack,0);
            const report = {
                type: "error_logs",
                metric_name: "on_click_submit_unregistered_form_error_logs",
                module_name: "Communications",
                report_message: `${err}`,
                reference_table: "",
                reference_id: 0,
                submetrics: []
            };

            PMS.send(report);
        }
    });
}

function initializeOnSubmitUnregisteredCommunityContactForm (){
    $('#comm_unregistered_save').on('click',function(){
        try{
            unregisteredCommunityContactFormValidation();
        } catch (err) {
            sendReport(err.stack,0);
            const report = {
            type: "error_logs",
            metric_name: "display_ewi_status_error_logs",
            module_name: "Communications",
            report_message: `${err}`,
            reference_table: "",
            reference_id: 0,
            submetrics: []
        };

        PMS.send(report);
        }
    });
}

function employeeContactFormValidation() {
	$("#employee-contact-form").validate({
        debug: true,
        rules: {
            firstname_ec: "required",
			lastname_ec: "required",
			middlename_ec: "required",
			gender_ec: "required",
			birthdate_ec: "required",
			email_ec: "required",
			active_status_ec: "required",
			team_ec: "required"
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
            } 

            element.parents(".form-group").addClass("has-feedback");

            const $next_span = element.next("span");
            if (!$next_span[0]) {
                if (element.is("select") || element.is("textarea")) $next_span.css({ top: "25px", right: "25px" });
            }
        },
        success (label, element) {
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
            submitEmployeeInformation();
            initializeContactSuggestion("");
            getEmployeeContact();
        }
    });
}

function unregisteredEmployeeContactFormValidation() {
    $("#employee-unregistered-form").validate({
        debug: true,
        rules: {
            emp_unregistered_first_name: "required",
            emp_unregistered_lastname: "required",
            emp_unregistered_middlename: "required",
            emp_unregistered_gender: "required",
            emp_unregistered_birthdate: "required",
            emp_unregistered_email: "required",
            emp_unregistered_active_status: "required",
            emp_unregistered_team: "required"
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
            }

            element.parents(".form-group").addClass("has-feedback");

            const $next_span = element.next("span");
            if (!$next_span[0]) {
                if (element.is("select") || element.is("textarea")) $next_span.css({ top: "25px", right: "25px" });
            }
        },
        success (label, element) {
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
            submitUnregisteredEmployeeInformation();
            initializeContactSuggestion("");
            getEmployeeContact();
            $("#comm-response-contact-container").hide();
            $("#emp-response-contact-container").hide();
            getUnregisteredNumber();
            $("#unregistered-wrapper").hide();
        }
    });
}

function communityContactFormValidation () {

	$("#community-contact-form").validate({
        debug: true,
        rules: {
            firstname_cc: "required",
			lastname_cc: "required",
			gender_cc: "required",
			birthdate_cc: "required",
			active_status_cc: "required",
			ewirecipient_cc: "required"
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
            }

            element.parents(".form-group").addClass("has-feedback");

            const $next_span = element.next("span");
            if (!$next_span[0]) {
                if (element.is("select") || element.is("textarea")) $next_span.css({ top: "25px", right: "25px" });
            }
        },
        success (label, element) {
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
        	site_selected = [];
			organization_selected = [];
			$('#site-selection-div input:checked').each(function() {
			    site_selected.push($(this).attr('value'));
			});

			$('#organization-selection-div input:checked').each(function() {
			    organization_selected.push($(this).attr('value'));
			});

			$("#org-and-site-alert").hide(300);
			if (site_selected.length === 0 && organization_selected.length === 0) {
				$("#selection-feedback").text("site and organization selection");
                $("#org-and-site-alert").show(300);
			} else if (site_selected.length === 0) {
				$("#selection-feedback").text("site selection");
                $("#org-and-site-alert").show(300);
			} else if (organization_selected.length === 0) {
				$("#selection-feedback").text("organization selection");
                $("#org-and-site-alert").show(300);
			} else {
                
				$("#org-and-site-alert").hide(300);
                let has_duplicate = checkChangesInPriority();
                if(has_duplicate == false){
                    submitCommunityContactForm(site_selected, organization_selected);
                    initializeContactSuggestion("");
                    getCommunityContact();
                }else{
                    $.notify("Duplicate entry in priority", "warn");
                }
			}
        }
    });
}

function checkChangesInPriority(){
    try {
        contact_priorities = [];
        $('.contact_priority_id').each(function(){
            let hierarchy_data = {
                hierarchy_id : $(this).val(),
                hierarchy_priority: $(this).prev().val()
            }

           contact_priorities.push(hierarchy_data);
        });

        let check_array = contact_priorities.map(function(item){ return item.hierarchy_priority });
        let has_duplicate = check_array.some(function(item, idx){ 
            return check_array.indexOf(item) != idx 
        });
        
        if(has_duplicate == false){
            if(contact_priorities.length > 1){
                const message = {
                    type: "updateContactHierarchy",
                    data: contact_priorities
                }
                wss_connect.send(JSON.stringify(message));
            } 
        }

        return has_duplicate;
    } catch(err) {
        sendReport(err.stack,0);
        const report = {
            type: "error_logs",
            metric_name: "check_changes_in_priority_error_logs",
            module_name: "Communications",
            report_message: `${err}`,
            reference_table: "contact_hierarchy",
            reference_id: 25,
            submetrics: []
        };

        PMS.send(report);
    }
}

function unregisteredCommunityContactFormValidation () {

    $("#community-unregistered-form").validate({
        debug: true,
        rules: {
            comm_unregistered_firstname: "required",
            comm_unregistered_lastname: "required",
            comm_unregistered_gender: "required",
            comm_unregistered_birthdate: "required",
            comm_unregistered_active_status: "required",
            comm_unregistered_ewi_recipient: "required"
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
            }

            element.parents(".form-group").addClass("has-feedback");

            const $next_span = element.next("span");
            if (!$next_span[0]) {
                if (element.is("select") || element.is("textarea")) $next_span.css({ top: "25px", right: "25px" });
            }
        },
        success (label, element) {
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
            site_selected = [];
            organization_selected = [];
            $('#unregistered-site-selection-div input:checked').each(function() {
                site_selected.push($(this).attr('value'));
            });

            $('#unregistered-organization-selection-div input:checked').each(function() {
                organization_selected.push($(this).attr('value'));
            });

            $("#unregistered-org-and-site-alert").hide(300);
            if (site_selected.length === 0 && organization_selected.length === 0) {
                $("#unregistered-selection-feedback").text("site and organization selection");
                $("#unregistered-org-and-site-alert").show(300);
            } else if (site_selected.length === 0) {
                $("#unregistered-selection-feedback").text("site selection");
                $("#unregistered-org-and-site-alert").show(300);
            } else if (organization_selected.length === 0) {
                $("#unregistered-selection-feedback").text("organization selection");
                $("#unregistered-org-and-site-alert").show(300);
            } else {
                $("#unregistered-org-and-site-alert").hide(300);
                submitUnregisteredCommunityContactForm(site_selected, organization_selected);
                initializeContactSuggestion("");
                getCommunityContact();
                $("#comm-response-contact-container").hide();
                $("#emp-response-contact-container").hide();
                getUnregisteredNumber();
                $("#unregistered-wrapper").hide();
            }
            
        }
    });
}

function recentActivityInitializer() {
    $("#routine-actual-option").on("click", function () {
        $("#routine-reminder-option").removeClass("active");
        $("#def-recipients").text("Default recipients: LEWC, BLGU, MLGU");
    });

    $("#routine-reminder-option").on("click", function () {
        $("#routine-actual-option").removeClass("active");
        $("#def-recipients").text("Default recipients: LEWC");
    });

    $(".rv_contacts a").on("click", function () {
        $(".recent_activities").hide();
        var index = $(this).closest("div").find("input[name='rc_index']").val();
        index = index.replace("activity_contacts_index_", "");
        var data = recent_contacts_collection[parseInt(index)];
        $(".dropdown-input").val(data.data.full_name);
        $("#go-chat").trigger("click");
    });

    $(".rv_sites a").on("click", function () {
        $(".recent_activities").hide();
        $("input[name='sitenames']").prop("checked", false);
        $("input[name='orgs']").prop("checked", false);

        var index = $(this).closest("div").find("input[name='rs_index']").val();
        index = index.replace("activity_sites_index_", "");
        var data = recent_sites_collection[parseInt(index)];

        for (var counter = 0; counter < data.organizations.length; counter++) {
            $("input[name='orgs']:unchecked").each(function () {
                if (data.organizations[counter] == $(this).val()) {
                    $(this).prop("checked", true);
                }
            });
        }

        for (var counter = 0; counter < data.sitenames.length; counter++) {
            $("input[name='sitenames']:unchecked").each(function () {
                if (data.sitenames[counter] == $(this).val()) {
                    $(this).prop("checked", true);
                }
            });
        }

        $("#go-load-groups").trigger("click");
    });

    $(".rv_searched div.recent_searched").on("click", function () {
        $(".recent_activities").hide();
        wss_connect.send(JSON.stringify(recent_searched_collection[$(this).index()]));
    });
}

function getRecentActivity () {
    var division = 1;
    
    if (localStorage.getItem("rv_searched") != null) {
        recent_searched_collection = JSON.parse(localStorage.rv_searched);
    }

    if (localStorage.getItem("rv_sites") != null) {
        recent_sites_collection = JSON.parse(localStorage.rv_sites);
    }

    if (localStorage.getItem("rv_contacts") != null) {
        recent_contacts_collection = JSON.parse(localStorage.rv_contacts);
    }
}


function getRoutineSites() {
    try {
        let msg = {
            type: 'getRoutineSites'
        };
        wss_connect.send(JSON.stringify(msg));
    } catch(err) {
        console.log(err);
        const report = {
            type: "error_logs",
            metric_name: "get_routine_sites_error_logs",
            module_name: "Communications",
            report_message: `${err}`,
            reference_table: "",
            reference_id: 0,
            submetrics: []
        };

        PMS.send(report);
        sendReport(err.stack,0);
    }
	
}

function getRoutineReminder() {
    try {
        let msg = {
            type: 'getRoutineReminder'
        };
        wss_connect.send(JSON.stringify(msg));
    } catch(err) {
        console.log(err);
        const report = {
            type: "error_logs",
            metric_name: "get_routine_reminder_error_logs",
            module_name: "Communications",
            report_message: `${err}`,
            reference_table: "ewi_backbone_template",
            reference_id: 20,
            submetrics: []
        };

        PMS.send(report);
        sendReport(err.stack,0);
    }
	
}

function initializeOnClickGetRoutineReminder() {
    $("#routine-reminder-option").on("click", () => {
        getRoutineReminder();
    });
}

function getRoutineTemplate() {
    try {
        let msg = {
            type: 'getRoutineTemplate'
        };
        wss_connect.send(JSON.stringify(msg));
    } catch(err) {
        console.log(err);
        const report = {
            type: "error_logs",
            metric_name: "get_routine_template_error_logs",
            module_name: "Communications",
            report_message: `${err}`,
            reference_table: "ewi_backbone_template",
            reference_id: 20,
            submetrics: []
        };

        PMS.send(report);
        sendReport(err.stack,0);
    }
}

function getLatestAlert() {
    try {
        var msg = {
            type: 'latestAlerts'
        };
        wss_connect.send(JSON.stringify(msg));  
    } catch(err) {
        console.log(err);
        const report = {
            type: "error_logs",
            metric_name: "latest_alerts_error_logs",
            module_name: "Communications",
            report_message: `${err}`,
            reference_table: "public_alert",
            reference_id: 21,
            submetrics: []
        };

        PMS.send(report);
        sendReport(err.stack,0);
    }
    
}

function displayRoutineReminder(sites,template) {
	let day = moment().format("dddd");
    let month = moment().month();
    month += 1;

    let parsed_template = parseRoutineReminderViaCbx(template[0].template);

    let wet = [[1, 2, 6, 7, 8, 9, 10, 11, 12], [5, 6, 7, 8, 9, 10]];
    let dry = [[3, 4, 5], [1, 2, 3, 4, 11, 12]];
    ROUTINE_SITES = [];

    switch (day) {
        case "Friday":
            $("#def-recipients").css("display", "inline-block");
            $(".routine-options-container").css("display", "flex");
            $("#send-routine-message").css("display", "inline");
            for (var counter = 0; counter < sites.length; counter++) {
                if (wet[sites[counter].season - 1].includes(month)) {
                    ROUTINE_SITES.push(sites[counter]);
                }
            }

            $(".routine-site-selection").remove();
            $(".routine-msg-container").remove(); 

            $(".routine_section").prepend("<div class='routine-site-selection'></div>");

            ROUTINE_SITES.forEach((data) => {
                $(".routine-site-selection").append(`<label><input name='sites-on-routine' id='${data.id}' type='checkbox' value='${data.site}' checked> ${data.site.toUpperCase()}</label>`);
            });

            $(".routine_section").append("<div class='routine-msg-container'></div>");
            $("#routine-reminder-message").val(parsed_template);
            break;
        case "Tuesday":
            $("#def-recipients").css("display", "inline-block");
            $(".routine-options-container").css("display", "flex");
            $("#send-routine-message").css("display", "inline");
            for (var counter = 0; counter < sites.length; counter++) {
                if (wet[sites[counter].season - 1].includes(month)) {
                    ROUTINE_SITES.push(sites[counter]);
                }
            }

            $(".routine-site-selection").remove();
            $(".routine-msg-container").remove(); 

            $(".routine_section").prepend("<div class='routine-site-selection'></div>");

            ROUTINE_SITES.forEach((data) => {
                $(".routine-site-selection").append(`<label><input name='sites-on-routine' id='${data.id}' type='checkbox' value='${data.site}' checked> ${data.site.toUpperCase()}</label>`);
            });

            $(".routine_section").append("<div class='routine-msg-container'></div>");
            $("#routine-reminder-message").val(parsed_template);
            break;
        case "Wednesday":
            $("#def-recipients").css("display", "inline-block");
            $(".routine-options-container").css("display", "flex");
            $("#send-routine-message").css("display", "inline");
            for (var counter = 0; counter < sites.length; counter++) {
                if (dry[sites[counter].season - 1].includes(month)) {
                    ROUTINE_SITES.push(sites[counter]);
                }
            }

            $(".routine-site-selection").remove();
            $(".routine-msg-container").remove();             

            $(".routine_section").prepend("<div class='routine-site-selection'></div>");

            ROUTINE_SITES.forEach((data) => {
                $(".routine-site-selection").append(`<label><input name='sites-on-routine' id='${data.id}' type='checkbox' value='${data.site}' checked> ${data.site.toUpperCase()}</label>`);
            });

            $(".routine_section").append("<div class='routine-msg-container'></div>");
            $("#routine-reminder-message").val(parsed_template);
            break;
        default:
            $(".routine_section").append("<div class='col-md-12 col-sm-12 col-xs-12'><h6>No Routine Monitoring for today.</h6></div>");
            $("#routine-reminder-message").val(parsed_template);
            break;
    }
}

function parseRoutineReminderViaCbx(template) {
    template = template.replace("(greetings)","umaga");
    template = template.replace("(ground_meas_submission)","11:30 AM");
    template = template.replace("(monitoring_type)","routine");
    return template
}

function initializeDatepickers() {
    $("#ewi-date-picker").datetimepicker({
        locale: "en",
        format: "YYYY-MM-DD HH:mm:ss"
    });

    $("#rfi-date-picker").datetimepicker({
        locale: "en",
        format: "hh:mmA MMMM DD, YYYY"
    });
}

function initializeMiscButtons() {
    $("#checkAllOffices").click(() => {
        $("#modal-select-offices").find(".checkbox").find("input").prop("checked", true);
    });
    $("#uncheckAllOffices").click(() => {
        $("#modal-select-offices").find(".checkbox").find("input").prop("checked", false);
    });
    $("#checkAllTags").click(() => {
        $("#modal-select-grp-tags").find(".checkbox").find("input").prop("checked", true);
    });
    $("#uncheckAllTags").click(() => {
        $("#modal-select-grp-tags").find(".checkbox").find("input").prop("checked", false);
    });
    $("#checkAllSitenames").click(() => {
        $("#modal-select-sitenames").find(".checkbox").find("input").prop("checked", true);
    });
    $("#uncheckAllSitenames").click(() => {
        $("#modal-select-sitenames").find(".checkbox").find("input").prop("checked", false);
    });
    $("#checkAllRoutines").click(() => {
        $("#modal-select-sitenames").find(".checkbox").find("input").prop("checked", false);
        ROUTINE_SITES.forEach((data) => {
            let site_id = data.id;
            $("#modal-select-sitenames").find(".checkbox").find("input[value="+site_id+"]").prop("checked", true);
        });
    });
}

function initializeSamarSites() {
    try {
        let msg = {
            type: "getSiteDetails"
        };
        wss_connect.send(JSON.stringify(msg));
    } catch(err) {
        const report = {
            type: "error_logs",
            metric_name: "get_samar_sites_error_logs",
            module_name: "Communications",
            report_message: `${err}`,
            reference_table: "",
            reference_id: 0,
            submetrics: []
        };

        PMS.send(report);
    }
    
}

function initializeScrollOldMessages() {
    $('.chat-message').unbind();
    $('.chat-message').scroll(function() {
      if ($(this).scrollTop() == 0) {
        if(isNewConvo == false){
            $('#chatterbox-loader-modal').modal({backdrop: 'static', keyboard: false});
        }else{
            $('#chatterbox-loader-modal').modal("hide");
        }

        let tag_offices = [];
        $('input[name="orgs"]:checked').each(function() {
            tag_offices.push($(this).val());
        });

        let tag_sites = [];
        let site_code = [];
        $('input[name="sitenames"]:checked').each(function() {
            tag_sites.push($(this).val());
            site_code.push($(this).closest('label').text());
        });
        tag_sites.sort();

        recipient_container = recipient_container.filter(function (el) {
          return el != null;
        });
        
        try {
            let msg = {
                type: "loadOldMessages",
                recipients: recipient_container,
                last_outbox_ts: last_outbox_ts,
                last_inbox_ts: last_inbox_ts
            };
            wss_connect.send(JSON.stringify(msg));
        } catch(err) {
            sendReport(err.stack,0)
            const report = {
                type: "error_logs",
                metric_name: "load_old_messages_error_logs",
                module_name: "Communications",
                report_message: `${err}`,
                reference_table: "",
                reference_id: 0,
                submetrics: []
            };

            PMS.send(report);
            sendReport(err.stack,0)
        }
      }
    });
    initializeOnAvatarClickForTagging();
}


function initializeDataTaggingButton () {
    let timeOut;

    class Item {
        constructor(icon, backgroundColor) {
            this.$element = $(document.createElement("div"));
            this.icon = icon;
            this.$element.addClass("item");
            this.$element.css("background-color", backgroundColor);
            let i = document.createElement("i");
            $(i).addClass("fa fa-" + icon);
            this.$element.append(i);
            this.prev = null;
            this.next = null;
            this.isMoving = false;
            let element = this;
            this.$element.on("mousemove", function() {
                clearTimeout(timeOut);
                timeOut = setTimeout(function() {
                    if (element.next && element.isMoving) {
                        element.next.moveTo(element);
                    } 
                }, 10);
            });
        }
        
        moveTo(item) {
            anime({
                targets: this.$element[0],
                left: item.$element.css("left"),
                top: item.$element.css("top"),
                duration: 700,
                elasticity: 500
            });
            if (this.next) {
                this.next.moveTo(item);
            }
        }

        updatePosition() {    
            anime({
                targets: this.$element[0],
                left: this.prev.$element.css("left"),
                top: this.prev.$element.css("top"),
                duration: 200
            });
            
            if (this.next) {
                this.next.updatePosition();
            }
        }
    }

    class Menu {
        constructor(menu) {
            this.$element = $(menu);
            this.size = 0;
            this.first = null;
            this.last = null;
            this.timeOut = null;
            this.hasMoved = false;
            this.status = "closed";
        }
        
        add(item) {
            let menu = this;
            if (this.first == null) {
                this.first = item;
                this.last = item;
                this.first.$element.on("mouseup", function() {
                    if (menu.first.isMoving) {
                        menu.first.isMoving = false;        
                    } else {
                        menu.click();
                    }
                }); 
                item.$element.draggable(
                    {
                        start: function() {
                            menu.close();
                            item.isMoving = true;
                        }  
                    },
                    {
                        drag: function() {
                            if (item.next) {
                                item.next.updatePosition();
                            }
                        }
                    },
                    {
                        // stop: function() {
                        //     item.isMoving = false;
                        //     item.next.moveTo(item);
                        // }
                    }
                );
            } else {
                this.last.next = item;
                item.prev = this.last;
                this.last = item;
            }
            this.$element.after(item.$element);
            
            
        }
        
        open() {
            this.status = "open";
            let current = this.first.next;
            let iterator = 1;
            let head = this.first;
            let sens = head.$element.css("left") < head.$element.css("right") ? 1 : -1;
            while (current != null) {
                anime({
                    targets: current.$element[0],
                    left: parseInt(head.$element.css("left"), 10) + (sens * (iterator * 50)),
                    top: head.$element.css("top"),
                    duration: 500
                });
                iterator++;
                current = current.next;
            }    
        }
        
        close() {
            this.status = "closed";
            let current = this.first.next;
            let head = this.first;
            let iterator = 1;
            while (current != null) {
                anime({
                    targets: current.$element[0],
                    left: head.$element.css("left"),
                    top: head.$element.css("top"),
                    duration: 500
                });
                iterator++;
                current = current.next;
            }
        }
        
        click() {
            if (this.status == "closed") {
                this.open();
            } else {
                this.close();
            }
        }
        
    }

    let menu = new Menu("#data-tagging");
    let item2 = new Item("bug", "#F8991D");

    menu.add(item2);
    $(document).delay(50).queue(function(next) {
        menu.open();
        next();
        $(document).delay(1000).queue(function(next) {
            menu.close();
            next();
        });
    });  
}