let quick_inbox_registered = [];
let quick_inbox_unregistered = [];
let quick_inbox_event = [];
let quick_inbox_data_logger = [];
let quick_release = [];
let chatterbox_user = "You";
let message_container = [];
let conversation_recipients = [];
let current_user_id = $("#current_user_id").val();
let current_user_name = first_name;
let chatterbox_sms_signature = ` - ${current_user_name} from PHIVOLCS-DYNASLOPE`;

let employee_input_count = 1;
let employee_input_count_landline = 1;
let community_input_count = 1;
let community_input_count_landline = 1;
let latest_conversation_timestamp = "";
let psgc_scope_filter = [0,0,6,4,2];
let important_tags = null;
let conversation_details_label = null;


let quick_inbox_template = Handlebars.compile($('#quick-inbox-template').html());
let quick_unregistered_template = Handlebars.compile($('#quick-unregistered-inbox-template').html());
let event_inbox_template = Handlebars.compile($('#event-inbox-template').html());
let messages_template_both = Handlebars.compile($('#messages-template-both').html());
let selected_contact_template = Handlebars.compile($('#selected-contact-template').html());
let quick_release_template = Handlebars.compile($('#quick-release-template').html());
let search_key_template = Handlebars.compile($('#search-message-key-template').html());

Handlebars.registerHelper('breaklines', function(text) {
    text = Handlebars.Utils.escapeExpression(text);
    text = text.replace(/(\r\n|\n|\r)/gm, '<br>');
    return new Handlebars.SafeString(text);
});

let special_case_num = 0;
let special_case_id = 0;
let site_count = 0;

let contact_priorities = [];
let call_log_site = [];


Handlebars.registerHelper('breaklines', function(text) {
    text = Handlebars.Utils.escapeExpression(text);
    text = text.replace(/(\r\n|\n|\r)/gm, '<br>');
    return new Handlebars.SafeString(text);
});

$("#data_timestamp").datetimepicker({
    format: "YYYY-MM-DD HH:mm:00",
    allowInputToggle: true,
    widgetPositioning: {
        horizontal: "right",
        vertical: "bottom"
    }
});

function getQuickGroupSelection () {
	getQuickCommunitySelection();
}

function getQuickCommunitySelection () {
	try {
		let list_of_sites = {
			'type': "qgrSites"
		}

		wss_connect.send(JSON.stringify(list_of_sites));

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
	}

	try {

		let list_of_orgs = {
			'type': "qgrOrgs"
		}
		wss_connect.send(JSON.stringify(list_of_orgs));

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
	}

}

function getEmployeeContact(){
	try {
		let employee_details = {
			'type': 'loadAllDewslContacts'
		};
		wss_connect.send(JSON.stringify(employee_details));
	} catch(err) {
		console.log(err);
		const report = {
            type: "error_logs",
            metric_name: "load_employee_contact_error_logs",
            module_name: "Communications",
            report_message: `${err}`,
            reference_table: "",
            reference_id: 0,
            submetrics: []
        };

        PMS.send(report);
	}
}

function getCommunityContact(){
	try {
		let community_details = {
			'type': 'loadAllCommunityContacts'
		};
		wss_connect.send(JSON.stringify(community_details));
	} catch(err) {
		console.log(err);
		const report = {
            type: "error_logs",
            metric_name: "load_community_contact_error_logs",
            module_name: "Communications",
            report_message: `${err}`,
            reference_table: "",
            reference_id: 0,
            submetrics: []
        };

        PMS.send(report);
	}
}

function getUnregisteredNumber(){
	try {
		let community_details = {
			'type': 'loadAllUnregisteredNumber'
		};
		wss_connect.send(JSON.stringify(community_details));
	} catch(err) {
		console.log(err);
		const report = {
            type: "error_logs",
            metric_name: "load_unregistered_number_error_logs",
            module_name: "Communications",
            report_message: `${err}`,
            reference_table: "",
            reference_id: 0,
            submetrics: []
        };

        PMS.send(report);
	}
}

function displaySitesSelection(data) {
	let sitenames = data;
	let sitename, site_id, psgc;
	
	for (var i = 0; i < sitenames.length; i++) {
		var modIndex = i % 6;
		$("#sitenames-"+i).empty();

		sitename = sitenames[i].site_code;
		site_id = sitenames[i].site_id;
		psgc = sitenames[i].psgc_source;
		$("#sitenames-"+modIndex).append('<div class="checkbox"><label class="site_code"><input name="sitenames" id="id_'+psgc+'" type="checkbox" value="'+site_id+'">'+sitename.toUpperCase()+'</label></div>');
	}
}

function startConversation(details) {
	$('#chatterbox-loader-modal').modal({backdrop: 'static', keyboard: false});
	try {
		call_log_site.push(details.site);
		let convo_details = {
			type: 'loadSmsConversation',
			data: details
		};
		wss_connect.send(JSON.stringify(convo_details));
	} catch(err) {
		console.log(err);
		const report = {
            type: "error_logs",
            metric_name: "load_unregistered_number_error_logs",
            module_name: "Communications",
            report_message: `${err}`,
            reference_table: "smsinbox",
            reference_id: 7,
            submetrics: []
        };

        PMS.send(report);
	}	
}

function displayQuickInboxMain(msg_data) {
	try {
		try {
			for (let counter = 0; counter < msg_data.length; counter++) {
				if(msg_data[counter].isunknown == 1){
					console.log("has unknown");
				}
				msg_data[counter].isunknown = 0;
				quick_inbox_registered.unshift(msg_data[counter]);
			}
			
		} catch(err) {
			const report = {
		        type: "error_logs",
		        metric_name: "quick_inbox_error_log",
		        module_name: "Communications",
		        report_message: `${err}`,
		        reference_table: "",
		        reference_id: 0,
		        submetrics: []
		    };

		    PMS.send(report);
        	sendReport(err.message,0);
		}

		quick_inbox_html = quick_inbox_template({'quick_inbox_messages': quick_inbox_registered});

		$("#quick-inbox-display").html(quick_inbox_html);
		$("#quick-inbox-display").scrollTop(0);
	} catch (err) {
		console.log(err);
		const report = {
            type: "error_logs",
            metric_name: "quick_inbox_error_log",
            module_name: "Communications",
            report_message: `${err}`,
            reference_table: "",
            reference_id: 0,
            submetrics: []
        };

        PMS.send(report);
        sendReport(err.message,0);
	}
}

function displayUnregisteredInboxMain(msg_data) {
	try {
		for (let counter = 0; counter < msg_data.length; counter++) {
			quick_inbox_unregistered.push(msg_data[counter]);
		}
		
	
		quick_inbox_html = quick_unregistered_template({'quick_unregistered_inbox_messages': quick_inbox_unregistered});

		$("#quick-unregistered-inbox-display").html(quick_inbox_html);
		$("#quick-unregistered-inbox-display").scrollTop(0);
	} catch(err) {
        sendReport(err.message,0);
		const report = {
            type: "error_logs",
            metric_name: "display_unregistered_error_logs",
            module_name: "Communications",
            report_message: `${err}`,
            reference_table: "",
            reference_id: 0,
            submetrics: []
        };

        PMS.send(report);
	} 
}

function updateLatestPublicRelease (msg) {
    try {
    	quick_release.unshift(msg);
        var quick_release_html = quick_release_template({ quick_release });
        $("#quick-release-display").html(quick_release_html);
        $("#quick-release-display").scrollTop(0);

    } catch (err) {
		const report = {
            type: "error_logs",
            metric_name: "update_public_release_error_log",
            module_name: "Communications",
            report_message: `${err}`,
            reference_table: "public_alert_release",
            reference_id: 3,
            submetrics: []
        };

        PMS.send(report);
    }
}

function displayNewSmsQuickInbox(msg_data) {
	let new_inbox = [];

	for (let counter = 0; counter < msg_data.length; counter++) {
		for (let sub_counter = 0; sub_counter < inbox_container.length; sub_counter++) {
			if (inbox_container[sub_counter].full_name != msg_data[counter].full_name) {
				new_inbox.push(inbox_container[sub_counter]);
			}
		}
		new_inbox.push(msg_data[counter]);
	}

	try {
		for (let counter = 0; counter < new_inbox.length; counter++) {
			new_inbox[counter].isunknown = 0;
			quick_inbox_registered.unshift(new_inbox[counter]);
		}
		quick_inbox_html = quick_inbox_template({'quick_inbox_messages': quick_inbox_registered});
		$("#quick-inbox-display").html(quick_inbox_html);
		$("#quick-inbox-display").scrollTop(0);
	} catch(err) {

		sendReport(err.message,0);

		const report = {
            type: "error_logs",
            metric_name: "quick_inbox_error_log",
            module_name: "Communications",
            report_message: `${err}`,
            reference_table: "smsinbox",
            reference_id: 23,
            submetrics: []
        };

        PMS.send(report);
	}
}

function displayOrgSelection(data){
	let offices = data;
	let office, office_id;

	try {
		for (var i = 0; i < offices.length; i++) {
			var modIndex = i % 5;
			$("#offices-"+i).empty();
			office = offices[i].org_name;
			office_id = offices[i].org_id;
			$("#offices-"+modIndex).append('<div class="checkbox"><label><input type="checkbox" id="id_'+office+'" name="orgs" class="form-group" value="'+office+'">'+office.toUpperCase()+'</label></div>');
		}
	} catch(err) {
		sendReport(err.message,0);
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
	}

}

function displayContactSettingsMenu() {
	$('#employee-contact-wrapper').prop('hidden', true);
	$('#community-contact-wrapper').prop('hidden', true);
	$('#unregistered-contact-container').prop('hidden', true);
	$('#comm-response-contact-container_wrapper').prop('hidden',true);
	$('#emp-response-contact-container_wrapper').prop('hidden',true);
	$('#unregistered-contact-container_wrapper').prop('hidden',true);
	$('#update-contact-container').prop('hidden',true);
	$('#contact-result').remove();
	// fetchSiteAndOffice();
}

function displayDataTableCommunityContacts(cmmty_contact_data){
	try {
		$('#comm-response-contact-container').empty();
		$('#comm-response-contact-container').DataTable({
			destroy: true,
			data: cmmty_contact_data,
			columns: [
			{ "data": "user_id", "title": "User ID"},
			{ "data": "salutation", "title": "Salutation" },
			{ "data": "firstname", "title": "Firstname"},
			{ "data": "lastname", "title": "Lastname"},
			{ "data": "middlename", "title": "Middlename"},
			{ "data": "active_status", "title": "Active Status"}
			]
		});
	$('#comm-response-contact-container').prop('hidden',false);
	} catch (err) {
		sendReport(err.message,0);
		const report = {
            type: "error_logs",
            metric_name: "load_community_contact_error_logs",
            module_name: "Communications",
            report_message: `${err}`,
            reference_table: "users",
            reference_id: 9,
            submetrics: []
        };

        PMS.send(report);
	}

}

function displayDataTableEmployeeContacts(dwsl_contact_data) {
	try {
		$('#emp-response-contact-container').empty();
		$('#emp-response-contact-container').DataTable({
			destroy: true,
			data: dwsl_contact_data,
			columns: [
			{ "data": "user_id", "title": "User ID"},
			{ "data": "firstname", "title": "Firstname"},
			{ "data": "lastname", "title": "Lastname"},
			{ "data": "team", "title": "Team"},
			{ "data": "active_status", "title": "Active Status"}
			]
		});
		$('#emp-response-contact-container').prop('hidden',false);
	} catch(err) {
		sendReport(err.message,0);
		const report = {
            type: "error_logs",
            metric_name: "load_employee_contact_error_logs",
            module_name: "Communications",
            report_message: `${err}`,
            reference_table: "users",
            reference_id: 9,
            submetrics: []
        };

        PMS.send(report);
	}

}

function displayDataTableUnregisteredContacts (unregistered_data){
	try {
		$('#unregistered-contact-container').empty();
		$('#unregistered-contact-container').DataTable({
			destroy: true,
			data: unregistered_data,
			columns: [
				{ "data": "user_id", "title": "Unknown ID"},
				{ "data": "unknown_label", "title": "Label"},
				{ "data": "mobile_id", "title": "Mobile ID"},
				{ "data": "user_number", "title": "User Number"}
			]
		});
		$('#unregistered-contact-container').prop('hidden',false);
	} catch(err) {
		sendReport(err.message,0);
		const report = {
            type: "error_logs",
            metric_name: "load_unregistered_contact_error_logs",
            module_name: "Communications",
            report_message: `${err}`,
            reference_table: "users",
            reference_id: 9,
            submetrics: []
        };

        PMS.send(report);
	}

}

function displaySiteSelection (sites,psgc_source = []) {
	try {
		let column_count = 6; // 6 rows 
		$('#new-site').remove();
		for (let counter = 0; counter < column_count; counter++) {
			$('#sitenames-cc-'+counter).empty();
			$('#unregistered-sitenames-cc-'+counter).empty();
		}
		// console.log(psgc_source[1].psgc);
		for (let i = 0; i < sites.length; i++) {
			let modIndex = i % 6;
			let site = sites[i];
			$("#sitenames-cc-"+modIndex).append('<div class="checkbox"><label><input type="checkbox" id="id_'+site.psgc_source+'" name="sites" class="form-group site-checkbox" value="'+site.site_code+'">'+site.site_code.toUpperCase()+'</label></div>');
			$("#unregistered-sitenames-cc-"+modIndex).append('<div class="checkbox"><label><input type="checkbox" id="id_'+site.psgc_source+'" name="sites" class="form-group site-checkbox" value="'+site.site_code+'">'+site.site_code.toUpperCase()+'</label></div>');

			for (let counter = 0; counter < psgc_source.length; counter++) {
				// TODO : OPTIMIZE BETTER LOGIC FOR THIS.
				if (psgc_source[counter].org_psgc_source.length < 9) {
					psgc_source[counter].org_psgc_source = "0"+psgc_source[counter].org_psgc_source;
					psgc_source[counter].org_psgc_source = psgc_source[counter].org_psgc_source.substring(0,psgc_source[counter].org_psgc_source.length - psgc_scope_filter[parseInt(psgc_source[counter].org_scope)]);
					psgc_source[counter].org_psgc_source = psgc_source[counter].org_psgc_source.substring(1);
					let flagger = parseInt(8 - psgc_source[counter].org_psgc_source.length);
					for (let psgc_filter_counter = 0; psgc_filter_counter < flagger;psgc_filter_counter++) {
						psgc_source[counter].org_psgc_source = psgc_source[counter].org_psgc_source+"0";
					}
				} else {
					let flagger = parseInt(8 - psgc_source[counter].org_psgc_source.length);
					psgc_source[counter].org_psgc_source = psgc_source[counter].org_psgc_source.substring(0,psgc_source[counter].org_psgc_source.length - psgc_scope_filter[parseInt(psgc_source[counter].org_scope)]);
					for (let psgc_filter_counter = 0; psgc_filter_counter < flagger;psgc_filter_counter++) {
						psgc_source[counter].org_psgc_source = psgc_source[counter].org_psgc_source+"0";
					}
				}

				if (psgc_source[counter].site_code.toLowerCase() == site.site_code) {
					$("#sitenames-cc-"+modIndex).find(".checkbox").find("[value="+site.site_code+"]").prop('checked',true);
					$("#unregistered-sitenames-cc-"+modIndex).find(".checkbox").find("[value="+site.site_code+"]").prop('checked',true);
				}
			}
		}
		$('<div id="new-site" class="col-md-12"><a href="#" id="add-site"><span class="glyphicon glyphicon-info-sign"></span>&nbsp;Site not on the list?</a></div>').appendTo('#site-accord .panel-body');

	} catch(err) {
		sendReport(err.message,0);
		const report = {
            type: "error_logs",
            metric_name: "user_site_error_log",
            module_name: "Communications",
            report_message: `${err}`,
            reference_table: "user_organization",
            reference_id: 8,
            submetrics: []
        };

        PMS.send(report);
	}
}

function displayOrganizationSelection (orgs,user_orgs = []) {
	try {
		let column_count = 7;
		$('#new-org').remove();
		for (let counter = 0; counter < column_count; counter++) {
			$('#orgs-cc-'+counter).empty();
			$('#unregistered-orgs-cc-'+counter).empty();
		}

		for (let i = 0; i < orgs.length; i++) {
			let modIndex = i % 7;
			let org = orgs[i];
			let formatted_office_id = org.org_name.replace(": ", "_");
			$("#orgs-cc-"+modIndex).append('<div class="checkbox"><label><input type="checkbox" id="id_'+formatted_office_id+'" name="orgs" class="form-group organization-checkbox" value="'+org.org_name+'">'+org.org_name.toUpperCase()+'</label></div>');
			$("#unregistered-orgs-cc-"+modIndex).append('<div class="checkbox"><label><input type="checkbox" id="id_'+formatted_office_id+'" name="orgs" class="form-group organization-checkbox" value="'+org.org_name+'">'+org.org_name.toUpperCase()+'</label></div>');
			for (let counter = 0; counter < user_orgs.length; counter++) {
				if (user_orgs[counter].org_name.toUpperCase() == org.org_name.toUpperCase()) {
					let formatted_office_value = org.org_name.replace(": ", "_");
					$("#orgs-cc-"+modIndex).find(".checkbox").find("#id_"+formatted_office_value).prop('checked',true);
					$("#unregistered-orgs-cc-"+modIndex).find(".checkbox").find("#id_"+formatted_office_value).prop('checked',true);
				}
			}
		}
		$('<div id="new-org" class="col-md-12"><a href="#" id="add-org"><span class="glyphicon glyphicon-info-sign"></span>&nbsp;Organization not on the list?</a></div>').appendTo('#organization-selection-div');
	} catch (err) {
		sendReport(err.message,0);
		const report = {
            type: "error_logs",
            metric_name: "user_org_error_log",
            module_name: "Communications",
            report_message: `${err}`,
            reference_table: "user_organization",
            reference_id: 8,
            submetrics: []
        };

        PMS.send(report);
		sendReport(err.message,0);;
	}
}

function displayConversationPanel(msg_data, full_data, recipients, titles, isOld = false) {
	try {
		conversation_recipients = [];
		last_outbox_ts = null;
		last_inbox_ts = null;

		recipients.forEach(function(user){
			conversation_recipients.push(user.user_id);
		});

		if (isOld == false) {
			$("#messages").empty();
			$("#conversation-details").empty();
			if(full_data === undefined){
				$("#conversation-details").append(conversation_details_label);
			}else {
				$("#conversation-details").append(full_data);
			}

			$(".recent_activities").addClass("hidden");
			$("#main-container").removeClass("hidden");
			message_container = [];
			recipient_container = [];
			msg_data.reverse();
		    $("#messages").empty();
		    $("#conversation-details").empty();
		    $("#recent-activity-panel").hide(400);
		    $("#conversation-panel").show(400);
			if(full_data === undefined){
				$("#conversation-details").append(conversation_details_label);
			}else {
				$("#conversation-details").append(full_data);
			}

			recipients.forEach(function(mobile_data){
				if (recipient_container.includes(mobile_data.mobile_id) != true) {recipient_container.push(mobile_data.mobile_id);}
			});
		}	

		let counter = 0;
		msg_data.forEach(function(data) {
			if (titles != null) {
				let title_container = titles[counter].split("<split>");
				let title_holder = "";
				for (let sub_counter = 0; sub_counter < title_container.length; sub_counter++) {
					title_holder = title_holder+title_container[sub_counter]+"\n";
				}
				data.title = title_holder;		
			}
			if (data.network == "GLOBE") {
				data.isGlobe = true;
			} else {
				data.isGlobe = false;
			}
			displayUpdatedMessages(data, isOld);
			counter++;
		});

		initializeOnClickCallLogModal(recipient_container);
	} catch(err) {
		sendReport(err.message,0);
		const report_outbox = {
            type: "error_logs",
            metric_name: "display_site_conversation_error_logs",
            module_name: "Communications",
            report_message: `${err}`,
            reference_table: "smsoutbox_users",
            reference_id: 2,
            submetrics: []
        };

        const report_inbox = {
            type: "error_logs",
            metric_name: "display_site_conversation_error_logs",
            module_name: "Communications",
            report_message: `${err}`,
            reference_table: "smsinbox_users",
            reference_id: 23,
            submetrics: []
        };

        PMS.send(report_outbox);
        PMS.send(report_inbox);
	}
}

function initializeOnClickCallLogModal(recipients){
	$("#open-call-log").unbind();
	$("#open-call-log").click(() => {
		$("#call-log-modal").modal({backdrop: 'static',keyboard: false});
		saveCallLog(recipients);
	});
}

function saveCallLog(recipients){
	$("#save-call-log").unbind();
	$("#save-call-log").click(() => {
		let timestamp = $("#data_timestamp").val();
		let message = $("#call_log_message").val();
		message.replace(/\n/g, "<br />");
		if(timestamp.length == 0 || message.length == 0){
			$.notify("All fields are required", "error");
		} else {
			let log_data = {
				'timestamp' : timestamp,
				'message' : "Call log: "+message,
				'tagger_user_id': current_user_id,
				'site_code': call_log_site
			}
			
			let request = {
				'type': 'callLogMessage',
				'data': log_data,
				'recipients': recipients
			};
			wss_connect.send(JSON.stringify(request));
		}
	});
}

function displayUpdatedMessages(data, isOld = false) {
	try {
		latest_conversation_timestamp = data.ts_written;
		data.ts_received == null ? data.isYou = 1 : data.isYou = 0;
		setLastTs(isOld, data);
		data.sms_msg = data.sms_msg.replace(/\n/g, "<br />");
		message_container.unshift(data);
		messages_html = messages_template_both({'messages': message_container});
		let html_string = $('#messages').html();
		if (isOld == false) {
			$('#messages').html(html_string+messages_html);
			$('.chat-message').scrollTop($('#messages').height());
		} else {
			$('.chat-message').scrollTop($('#messages').height()/2);
			$('#messages').html(messages_html+html_string);
		}
		message_container = [];
	} catch(err) {
		sendReport(err.message,0);
		const report_outbox = {
            type: "error_logs",
            metric_name: "display_site_conversation_error_logs",
            module_name: "Communications",
            report_message: `${err}`,
            reference_table: "smsoutbox_users",
            reference_id: 2,
            submetrics: []
        };

        const report_inbox = {
            type: "error_logs",
            metric_name: "display_site_conversation_error_logs",
            module_name: "Communications",
            report_message: `${err}`,
            reference_table: "smsinbox_users",
            reference_id: 23,
            submetrics: []
        };

        PMS.send(report_outbox);
        PMS.send(report_inbox);
	}
}

function setLastTs(isOld, data) {
	try {
		if (isOld == true) {
			if (data.isYou == 1) {
				last_outbox_ts = data.ts_written;
			}

			if (data.isYou == 0) {
				last_inbox_ts = data.ts_received;
			}
		} else {
			if (last_outbox_ts == null) {
				if (data.isYou == 1) {
					last_outbox_ts = data.ts_written;
				}
			}

			if (last_inbox_ts == null) {
				if (data.isYou == 0) {
					last_inbox_ts = data.ts_received;
				}
			}
		}
	} catch(err) {
		sendReport(err.message,0);
		const reports = {
            type: "error_logs",
            metric_name: "set_last_ts_error_logs",
            module_name: "Communications",
            report_message: `${err}`,
            reference_table: "",
            reference_id: 0,
            submetrics: []
        };

        PMS.send(reports);
	}
}

function displayAddEmployeeContactMessage (msg_data) {
	if(msg_data.status === true) {
		$.notify(msg_data.return_msg, "success");
		$("#user_id_ec").val(0);
		$("#salutation_ec").val("");
		$("#firstname_ec").val("");
		$("#middlename_ec").val("");
		$("#lastname_ec").val("");
		$("#nickname_ec").val("");
		$("#birthdate_ec").val("");
		$("#gender_ec").val("");
		$("#active_status_ec").val(1);
		$("#mobile-div").empty();
		$("#landline-div").empty();
		employee_input_count = 1;
		employee_input_count_landline = 1;
	}else {
		$.notify(msg_data, "warn");
	}
}

function displayAddCommunityContactMessage (msg_data) { // LOUIE - new code
	if(msg_data.status === true) {
		$.notify(msg_data.return_msg, "success");
		$("#user_id_cc").val(0);
		$("#salutation_cc").val("");
		$("#firstname_cc").val("");
		$("#middlename_cc").val("");
		$("#lastname_cc").val("");
		$("#nickname_cc").val("");
		$("#birthdate_cc").val("");
		$("#gender_cc").val("");
		$("#active_status_cc").val(1);
		$("#ewi_status").val(0);
		$("#mobile-div-cc").empty();
		$("#landline-div").empty();
		$("#settings-cmd").val('updatecontact').change();
		community_input_count = 1;
		community_input_count_landline = 1;
	}else {
		$.notify(msg_data, "warn");
	}
}

function displayUpdateEmployeeDetails (employee_data) {
	try {
		$("#user_id_ec").val(employee_data.contact_info.id);
		$("#salutation_ec").val(employee_data.contact_info.salutation);
		$("#firstname_ec").val(employee_data.contact_info.firstname);
		$("#middlename_ec").val(employee_data.contact_info.middlename);
		$("#lastname_ec").val(employee_data.contact_info.lastname);
		$("#nickname_ec").val(employee_data.contact_info.nickname);
		$("#birthdate_ec").val(employee_data.contact_info.birthday);
		$("#gender_ec").val(employee_data.contact_info.gender);
		$("#active_status_ec").val(employee_data.contact_info.contact_active_status);
		$("#email_ec").tagsinput('removeAll');
		$("#team_ec").tagsinput('removeAll');
		for (let counter = 0; counter < employee_data.email_data.length; counter++) {
			$('#email_ec').tagsinput('add',employee_data.email_data[counter].email);
		}

		for (let counter = 0; counter < employee_data.team_data.length; counter+=1) {
			$('#team_ec').tagsinput('add',employee_data.team_data[counter].team_name);
		}

		for (let counter = 0; counter < employee_data.mobile_data.length; counter+=1) {
			if(employee_data.mobile_data[counter].number != null){
				const number_count = counter + 1;
				const mobile_data = {
					"mobile_number" : employee_data.mobile_data[counter].number,
					"mobile_status" : employee_data.mobile_data[counter].number_status,
					"mobile_priority" : employee_data.mobile_data[counter].priority,
					"mobile_id" : employee_data.mobile_data[counter].number_id
				}
				appendContactForms("Mobile", number_count, "employee_mobile", mobile_data);
			}
			
		}

		for (let counter = 0; counter < employee_data.landline_data.length; counter+=1) {
			if(employee_data.landline_data[counter].landline_number != null){
				const number_count = counter + 1;
				const landline_data = {
					"landline_number" : employee_data.landline_data[counter].landline_number,
					"landline_remarks" : employee_data.landline_data[counter].landline_remarks,
					"landline_id" : employee_data.landline_data[counter].landline_id
				}
				appendContactForms("Landline", number_count, "employee_landline", landline_data);
			}
		}
	} catch(err) {
		sendReport(err.message,0);
		const report_user_details = {
            type: "error_logs",
            metric_name: "display_user_details_error_logs",
            module_name: "Communications",
            report_message: `${err}`,
            reference_table: "users",
            reference_id: 9,
            submetrics: []
        };

        const report_user_mobile = {
            type: "error_logs",
            metric_name: "display_user_mobile_error_logs",
            module_name: "Communications",
            report_message: `${err}`,
            reference_table: "user_mobile",
            reference_id: 16,
            submetrics: []
        };

        PMS.send(report_user_details);
        PMS.send(report_user_mobile);
	}


}
  
function displayUpdateCommunityDetails (community_data) {
	try {
		let user_orgs = [];
		$("#user_id_cc").val(community_data.contact_info.id);
		$("#salutation_cc").val(community_data.contact_info.salutation);
		$("#firstname_cc").val(community_data.contact_info.firstname);
		$("#middlename_cc").val(community_data.contact_info.middlename);
		$("#lastname_cc").val(community_data.contact_info.lastname);
		$("#nickname_cc").val(community_data.contact_info.nickname);
		$("#birthdate_cc").val(community_data.contact_info.birthday);
		$("#gender_cc").val(community_data.contact_info.gender);
		$("#active_status_cc").val(community_data.contact_info.contact_active_status);

		if (community_data.ewi_data[0].ewi_status === "1") {
			$("#ewirecipient_cc").val(1);
		}else {
			$("#ewirecipient_cc").val(0);
		}

		for (let counter = 0; counter < community_data.mobile_data.length; counter+=1) {
			if(community_data.mobile_data[counter].number != null){
				const number_count = counter + 1;
				const mobile_data = {
					"mobile_number" : community_data.mobile_data[counter].number,
					"mobile_status" : community_data.mobile_data[counter].number_status,
					"mobile_priority" : community_data.mobile_data[counter].priority,
					"mobile_id" : community_data.mobile_data[counter].number_id
				}
				appendContactForms("Mobile", number_count, "community_mobile", mobile_data);
			}
		}

		for (let counter = 0; counter < community_data.landline_data.length; counter+=1) {
			if(community_data.landline_data[counter].landline_number != null){
				const number_count = counter + 1;
				const landline_data = {
					"landline_number" : community_data.landline_data[counter].landline_number,
					"landline_remarks" : community_data.landline_data[counter].landline_remarks,
					"landline_id" : community_data.landline_data[counter].landline_id
				}
				appendContactForms("Landline", number_count, "community_landline", landline_data);
			}
		}

		if(community_data.has_hierarchy == false){
			let org_data = community_data.org_data;
			org_names = [];
			org_data.forEach(function(data) {
				org_names.push(data.org_name);
			});

			let request = {
				'type': 'saveContactHierarchy',
				'site_id': community_data.site_id,
				'user_id': community_data.contact_info.id,
				'org_data': org_names
			};
			wss_connect.send(JSON.stringify(request));
			console.log("save_request");
			$("#contact_priority").val(1);
		}else{
			//display current priority
			$("#contact_priority").val(community_data.has_hierarchy[0].priority);
			$("#contact-priority-panel").hide();
			$("#contact-priority-alert-message").hide();
			$("#contact-hierarchy-table-container").hide();
		}
		initializeContactPriorityBehavior(community_data.site_id, community_data.contact_info.id, community_data.org_data);
		displaySiteSelection(community_data.list_of_sites, community_data.org_data);
		displayOrganizationSelection(community_data.list_of_orgs, community_data.org_data);
	} catch(err) {
		sendReport(err.message,0);
		const report_user_details = {
            type: "error_logs",
            metric_name: "display_user_details_error_logs",
            module_name: "Communications",
            report_message: `${err}`,
            reference_table: "users",
            reference_id: 9,
            submetrics: []
        };

        const report_user_mobile = {
            type: "error_logs",
            metric_name: "display_user_mobile_error_logs",
            module_name: "Communications",
            report_message: `${err}`,
            reference_table: "user_mobile",
            reference_id: 16,
            submetrics: []
        };

        PMS.send(report_user_details);
        PMS.send(report_user_mobile);
	}
}

function initializeContactPriorityBehavior(site_id, user_id, org_data){
	try {
		$("#contact_priority").unbind();
		$("#contact_priority").keyup(function() {
			if($("#contact_priority").val().length == 0 || $("#contact_priority").val() == 0){
				$("#contact-priority-panel").hide(300);
				$("#contact-priority-alert-message").hide();
				$("#contact-hierarchy-table-container").hide();
				contact_priorities = [];
			}else{
				$("#contact-hierarchy-table-container").hide();
				checkIfHasExistingContactPriority(site_id, user_id, org_data);
			}
		});
	} catch (err) {
		const report_contact_behavior = {
            type: "error_logs",
            metric_name: "contact_priority_behavior_error_logs",
            module_name: "Communications",
            report_message: `${err}`,
            reference_table: "",
            reference_id: 0,
            submetrics: []
        };
		PMS.send(report_contact_behavior);
		sendReport(err.message,0);;
	}
}

function displayContactHierarchy(data){
	try {
		if(data != null || data.length == 0){
			if(data.length == 0){
				$("#contact-priority-panel").hide(300);
				$("#contact-priority-alert-message").hide(300);
				$("#contact-hierarchy-table").hide();
				$("#contact-hierarchy-table-container").hide();
			}else{
				$("#contact-priority-panel").show(300);
				$("#contact-priority-alert-message").show(300);
				$("#contact-hierarchy-table").hide();
				$("#contact-hierarchy-table").empty();
				$("#contact-hierarchy-table-container").hide();
				data.forEach(function(priority){
					let site_and_org = priority.site_code + " - " + priority.org_name;
					let name = priority.first_name + " " + priority.last_name;
					$("#contact-hierarchy-table").append(
						"<tr>"+
		                "<td>"+site_and_org.toUpperCase()+"</td>"+
		                "<td>"+name+"</td>"+
		                "<td>"+
		                "<input type='number' class='form-control contact_priority_value' name='contact_priority_value[]' value='"+priority.priority+"'/>"+
		                "<input type='hidden' class='form-control contact_priority_id' name='contact_priority_id[]' value='"+priority.contact_hierarchy_id+"'/>"+
		                "</td>"+
		                "</tr>"
					);
				});
				initializeContactHierarchyPanelBehavior();
			}
		} else {
			console.log("no data received");
		}
	} catch(err) {
		const report_contact_hierarchy = {
            type: "error_logs",
            metric_name: "display_contact_hierarchy_error_logs",
            module_name: "Communications",
            report_message: `${err}`,
            reference_table: "contact_hierarchy",
            reference_id: 25,
            submetrics: []
        };
		PMS.send(report_contact_hierarchy);
		sendReport(err.message,0);
	}
}

function initializeContactHierarchyPanelBehavior(){
	$("#edit-priorities").unbind();
	$("#cancel-priorities").unbind();

	$("#edit-priorities").click(function() {
		$("#contact-priority-alert-message").hide(300);
		$("#contact-hierarchy-table-container").show(300);
		$("#contact-hierarchy-table").show();
	});

	$("#cancel-priorities").click(function() {
		$("#contact-hierarchy-table-container").hide();
		$("#contact-priority-panel").hide();
		$("#contact-hierarchy-table").hide();
	});
}

function checkIfHasExistingContactPriority(site_id, user_id, org_data){
	let org_names = [];
	org_data.forEach(function(data) {
		org_names.push(data.org_name);
	});
	let request = {
		'type': 'checkIfHasExistingContactPriority',
		'site_id': site_id,
		'user_id' : user_id,
		'org_data' : org_names
	};
	wss_connect.send(JSON.stringify(request));
}

function displayUnregisteredMobiles(data){
	try {
		for (let counter = 0; counter < data.length; counter+=1) {
			if(data[counter].user_number != null){

				const number_count = counter + 1;
				const mobile_data = {
					"mobile_number" : "63"+data[counter].user_number,
					"mobile_status" : data[counter].mobile_status,
					"mobile_priority" : data[counter].priority,
					"mobile_id" : data[counter].mobile_id
				}
				appendContactForms("Mobile", number_count, "emp_unregistered_mobile", mobile_data);
				appendContactForms("Mobile", number_count, "comm_unregistered_mobile", mobile_data);
			}
		}
	} catch (err) {
		sendReport(err.message,0);
		const report = {
            type: "error_logs",
            metric_name: "display_unregistered_error_logs",
            module_name: "Communications",
            report_message: `${err}`,
            reference_table: "",
            reference_id: 0,
            submetrics: []
        };
		PMS.send(report);
	}
}

function appendContactForms (type, number_count, category, data) {
	try {
		let container = "";
		if (category == "employee_mobile") {
			container = "#mobile-div";
		} else if (category == "employee_landline"){
			container = "#landline-div";
		} else if (category == "community_mobile"){
			container = "#mobile-div-cc";
		} else if (category == "community_landline"){
			container = "#landline-div-cc";
		} else if (category == "emp_unregistered_mobile") {
			category = "employee_mobile";
			container = "#emp_unregistered_mobile_div";
		} else if (category == "emp_unregistered_landline") {
			category = "employee_landline";
			container = "#emp_unregistered_landline_div";
		} else if (category == "comm_unregistered_mobile") {
			category = "community_mobile";
			container = "#comm_unregistered_mobile_div";
		} else if (category == "comm_unregistered_landline") {
			category = "community_landline";
			container = "#comm_unregistered_landline_div";
		}

		if(number_count === 1)
			$(container).empty();

		if (category == "employee_mobile" || category == "community_mobile") {
			$(container)
			.append(
			"<div class='row'>"+
		    "<div class='col-md-4'>"+
		    "<div class='form-group hideable'>"+
			"<label class='control-label' for='"+category+"_number_"+number_count+"'>"+type+" #:</label>"+
			"<input type='number' class='form-control' id='"+category+"_number_"+number_count+"' name='"+category+"_number_"+number_count+"' value='"+data.mobile_number+"' required/>"+
			"</div>"+
			"</div>"+
			"<div class='col-md-4' hidden>"+
			"<label>"+type+" #:</label>"+
			"<input type='text' id='"+category+"_id_"+number_count+"' class='form-control' value='"+data.mobile_id+"' disabled>"+
			"</div>"+
			"<div class='col-md-4'>"+
			"<div class='form-group hideable'>"+
			"<label class='control-label' for='"+category+"_status_"+number_count+"'>"+type+" # Status:</label>"+
			"<select id='"+category+"_status_"+number_count+"' name='"+category+"_status_"+number_count+"' class='form-control' value='' required>"+
			"<option value='1'>Active</option>"+
			"<option value='0'>Inactive</option>"+
			"</select>"+
			"</div>"+
			"</div>"+
			"<div class='col-md-4'>"+
			"<div class='form-group hideable'>"+
			"<label class='control-label' for='"+category+"_priority_"+number_count+"'>"+type+" # Priority:</label>"+
			"<select id='"+category+"_priority_"+number_count+"' name='"+category+"_priority_"+number_count+"' class='form-control' value='' required>"+
			"<option value=''>--------</option>"+
			"<option value='1'>1</option>"+
			"<option value='2'>2</option>"+
			"<option value='3'>3</option>"+
			"<option value='4'>4</option>"+
			"<option value='5'>5</option>"+
			"</select>"+
			"</div>"+
			"</div>"+
			"</div>");
			$("#"+category+"_priority_"+number_count).val(data.mobile_priority);
			$("#"+category+"_status_"+number_count).val(data.mobile_status);

		} else if (category == "employee_landline" || category == "community_landline"){
			$(container)
			.append(
			"<div class='row'>"+
		    "<div class='col-md-6'>"+
			"<div class='form-group hideable'>"+
	        "<label class='control-label' for='"+category+"_number_"+number_count+"'>"+type+" #</label>"+
			"<input type='number' class='form-control' id='"+category+"_number_"+number_count+"' name='"+category+"_number_"+number_count+"' value='"+data.landline_number+"' required/>"+
			"</div>"+
			"</div>"+
			"<div class='col-md-4' hidden>"+
			"<label>"+type+" ID #:</label>"+
			"<input type='text' id='"+category+"_id_"+number_count+"' class='form-control' value='"+data.landline_id+"' disabled>"+
			"</div>"+
			"<div class='col-md-6'>"+
			"<div class='form-group hideable'>"+
			"<label class='control-label' for='"+category+"_remarks_"+number_count+"'>Remarks</label>"+
			"<input type='text' class='form-control' id='"+category+"_remarks_"+number_count+"' name='"+category+"_remarks_"+number_count+"' value='"+data.landline_remarks+"' required/>"+
			"</div>"+
			"</div>"+
			"</div>");
		}

		if (category == "employee_mobile") {
			employee_input_count += 1;
		} else if (category == "employee_landline"){
			employee_input_count_landline += 1;
		} else if (category == "community_mobile"){
			community_input_count += 1;
		} else if (category == "community_landline"){
			community_input_count_landline += 1;
		}
	} catch(err) {
		sendReport(err.message,0);
		const report = {
            type: "error_logs",
            metric_name: "display_mobile_number_error_logs",
            module_name: "Communications",
            report_message: `${err}`,
            reference_table: "user_mobile",
            reference_id: 16,
            submetrics: []
        };
		PMS.send(report);
	}
}

function loadSiteConversation(){
	if (quick_group_selection_flag == true) {
		$("#modal-select-sitenames").find(".checkbox").find("input").prop('checked', false);
		$("#modal-select-offices").find(".checkbox").find("input").prop('checked', false);
		// loadGroupsEmployee();
	} else  if (quick_group_selection_flag == false) {
		$("#modal-select-grp-tags").find(".checkbox").find("value").prop('checked', false);
		siteConversation();
	} else {
		alert('Something went wrong, Please contact the Administrator');
	}
}

function siteConversation(){
	$('#chatterbox-loader-modal').modal({backdrop: 'static', keyboard: false});
	try {
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

		let convo_request = {
			'type': 'loadSmsForSites',
			'organizations': tag_offices,
			'sitenames': tag_sites,
			'site_code': site_code
		};

		addSitesActivity(convo_request);
		wss_connect.send(JSON.stringify(convo_request));
	} catch(err) {
		const report = {
            type: "error_logs",
            metric_name: "site_conversation_error_logs",
            module_name: "Communications",
            report_message: `${err}`,
            reference_table: "smsinbox",
            reference_id: 7,
            submetrics: []
        };

        PMS.send(report);
        sendReport(err.message,0);
	}

}

function getRoutineMsgFromCBXMain() {
	var routine_msg = $("#routine-default-message").val();
	return routine_msg;
}

function sendSms(recipients, message) {
	try {
		let convo_details = {
			type: 'sendSmsToRecipients',
			recipients: recipients,
			message: message + chatterbox_sms_signature,
			sender_id: current_user_id,
			site_id: 0
		};
		wss_connect.send(JSON.stringify(convo_details));
	} catch(err) {
		const report = {
            type: "error_logs",
            metric_name: "sms_fails_error",
            module_name: "Communications",
            report_message: `${err}`,
            reference_table: "",
            reference_id: 0,
            submetrics: []
        };

        PMS.send(report);
		console.log(err);
	}	
}

function sendRainInfo(recipients, message) {
	let convo_details = {
		type: 'sendRainInfo',
		recipients: recipients,
		message: message + chatterbox_sms_signature,
		sender_id: current_user_id
	};
	wss_connect.send(JSON.stringify(convo_details));
}

function updateConversationBubble(msg_response) {
	message_container = [];
	displayUpdatedMessages(msg_response);
	$("#msg").val("");
	$("#msg").text("");
}

function updateSmsInbox(data) {
	data[0].isunknown = 0;
	displayNewSmsQuickInbox(data);
}

function updateSmsConversationBubble(data) {
	try {
		if ($.inArray(data[0].user_id,conversation_recipients) != -1 ) {
			let msg_container = {
				user: data[0].full_name,
				convo_id: data[0].sms_id,
				gsm_id: data[0].gsm_id,
				isYou: 0,
				mobile_id: data[0].mobile_id,
				read_status: 0,
				send_status: null,
				sms_msg: data[0].msg,
				timestamp: data[0].ts_received,
				ts_received: data[0].ts_received,
				ts_sent: null,
				web_status: null
			};
			displayUpdatedMessages(msg_container);		
		} 
	} catch(err) {
		sendReport(err.message,0);
		const report = {
            type: "error_logs",
            metric_name: "update_sms_conversation_error_log",
            module_name: "Communications",
            report_message: `${err}`,
            reference_table: "",
            reference_id: 0,
            submetrics: []
        };

        PMS.send(report);
	}

}

function updateSmsoutboxConversationBubble(data) {
	if ($("#messages li:last #chat-user").text() == "You" && $("#messages li:last #timestamp-written").text() == latest_conversation_timestamp) {
		$("#messages li:last #timestamp-sent").html(data.ts_sent);
	}
}

function displayImportantTags (data , is_loaded = false) {
	try {
		if(is_loaded === true) {
			important_tags = data;
			data.join(", ");
			$("#important_tags").empty();
			$("#important_tags").append(data.join(", "));

			$('#gintag_selected').tagsinput({
				typeahead: {
					displayKey: 'text',
					afterSelect: function (val) { this.$element.val(""); },
					source: function (query) {
						return data;
					}
				}
			});
		}
	} catch(err) {
		sendReport(err.message,0);
		const report = {
            type: "error_logs",
            metric_name: "get_important_tags_error_logs",
            module_name: "Communications",
            report_message: `${err}`,
            reference_table: "gintag_reference",
            reference_id: 24,
            submetrics: []
        };

        PMS.send(report);
	}
}

function displayRoutineTemplate(template) {
	$("#routine-default-message").val(template[0].template);
}

function addSitesActivity (sites) {
	try {
	    $(".recent_activities").hide();

	    for (var counter = 0; counter < recent_sites_collection.length; counter++) {
	        if (recent_sites_collection[counter].sitenames[0] == sites.sitenames[0]) {
	            return 1;
	        }
	    }

	    if (recent_sites_collection.length == 6) {
	        recent_sites_collection.shift();
	    }
	    recent_sites_collection.push(sites);
	    localStorage.rv_sites = JSON.stringify(recent_sites_collection);
	} catch(err) {
		sendReport(err.message,0);
		const report = {
            type: "error_logs",
            metric_name: "site_activity_error_logs",
            module_name: "Communications",
            report_message: `${err}`,
            reference_table: "",
            reference_id: 0,
            submetrics: []
        };

        PMS.send(report);
	}

}

function addContactsActivity (contacts) {
	try {
	    for (var counter = 0; counter < recent_contacts_collection.length; counter++) {
	        if (recent_contacts_collection[counter].data.full_name == contacts.data.full_name) {
	            return 1;
	        }
	    }

	    if (recent_contacts_collection.length == 6) {
	        recent_contacts_collection.shift();
	    }
	    recent_contacts_collection.push(contacts);
	    localStorage.rv_contacts = JSON.stringify(recent_contacts_collection);
	} catch(err) {
		sendReport(err.message,0);
		const report = {
            type: "error_logs",
            metric_name: "contact_activity_error_logs",
            module_name: "Communications",
            report_message: `${err}`,
            reference_table: "",
            reference_id: 0,
            submetrics: []
        };

        PMS.send(report);
	}
}

function displayEWITemplateOptions(data) {
	try {
	    for (let counter = 0; counter < data.alert_status.length; counter++) {
	        $("#alert_status").append($("<option>", {
	            value: data.alert_status[counter].alert_status,
	            text: data.alert_status[counter].alert_status
	        }));
	    }

	    for (let counter = 0; counter < data.site_code.length; counter ++) {
	        $("#sites").append($("<option>", {
	            value: data.site_code[counter].site_code,
	            text: data.site_code[counter].site_code.toUpperCase()
	        }));
	    }
    	$("#early-warning-modal").modal("toggle");
	} catch(err) {
		sendReport(err.message,0);
		const report = {
            type: "error_logs",
            metric_name: "ewi_template_option_error_logs",
            module_name: "Communications",
            report_message: `${err}`,
            reference_table: "",
            reference_id: 0,
            submetrics: []
        };

        PMS.send(report);
	}
}

function displayEWIAlertLvlInternalLvl(data) {
	try {
	    $("#alert-lvl").empty();
	    $("#internal-alert").empty();

	    $("#alert-lvl").append($("<option>", {
	        value: "------------",
	        text: "------------"
	    }));

	    $("#internal-alert").append($("<option>", {
	        value: "------------",
	        text: "------------"
	    }));

	    for (var counter = 0; counter < data.length; counter++) {
	        if (data[counter].alert_symbol_level.toLowerCase().indexOf("alert") > -1) {
	            $("#alert-lvl").append($("<option>", {
	                value: data[counter].alert_symbol_level,
	                text: data[counter].alert_symbol_level
	            }));
	        } else {
	            $("#internal-alert").append($("<option>", {
	                value: data[counter].alert_symbol_level,
	                text: data[counter].alert_symbol_level
	            }));
	        }
	    }
	} catch(err) {
		sendReport(err.message,0);
		const report = {
            type: "error_logs",
            metric_name: "ewi_alert_level_error_logs",
            module_name: "Communications",
            report_message: `${err}`,
            reference_table: "",
            reference_id: 0,
            submetrics: []
        };

        PMS.send(report);
	}
}

function displaySearchedKey(data) {
	try {
		if (data != null) {
			data.forEach(function(result_data) {
				let search_key_container = [];
				result_data.user == "You" ? result_data.isYou = 1 : result_data.isYou = 0;
				search_key_container.unshift(result_data);
				messages_html = search_key_template({'search_messages': search_key_container});
				let html_string = $('#search-global-result').html();
				$('#search-global-result').html(html_string+messages_html);
				search_key_container = [];
			});
		}
	} catch(err) {
		sendReport(err.message,0);
		const report = {
            type: "error_logs",
            metric_name: "search_key_error_logs",
            module_name: "Communications",
            report_message: `${err}`,
            reference_table: "",
            reference_id: 0,
            submetrics: []
        };

        PMS.send(report);
	}
}

function displayTemplateInChatbox (data) {
	$("#msg").val("");
	$("#msg").val(data);
}

function displayTeamsGroupSending(data) {
	try {
	    for (var x = 0; x < 6; x++) {
	        var myNode = document.getElementById(`tag-${x}`);
	        while (myNode.firstChild) {
	            myNode.removeChild(myNode.firstChild);
	        }
	    }

	    for (var i = 0; i < data.length; i++) {
	        var modIndex = i % 4;
	        var tag = data[i];
	        if (tag != "" || tag != null) {
	            $(`#tag-${modIndex}`).append(`<div class="checkbox"><label><input name="tag" type="checkbox" value="${tag}">${tag.toUpperCase()}</label></div>`);
	        }
	    }
	} catch(err) {
		sendReport(err.message,0);
		const report = {
            type: "error_logs",
            metric_name: "group_send_error_logs",
            module_name: "Communications",
            report_message: `${err}`,
            reference_table: "",
            reference_id: 0,
            submetrics: []
        };
        PMS.send(report);
	}
}