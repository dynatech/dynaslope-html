function getDevDetails() {
	return $.getJSON('/ais/config/dev_config.json');
}

function sendNotification() {
	// sendSMStoDevs("TEST");
}

function sendReport(error_msg = "", feature = 0) {
	sendSMStoDevs(error_msg, feature);
}

function formatRequest(report_details, feature, config) {
	let report_message = "";
	let mobile_ids = [];
	report_message = "Module: "+config.modules[feature]+"\n\n";
	report_message += "Error Message: "+report_details+"\n\n";
	for (let counter = 0; counter < config.data.length; counter++) {
		if ($.inArray(feature,config.data[counter].internal_team) != -1) {
			if (counter == 0 ) {
				report_message += "Devs: "+config.data[counter].nickname;
			} else {
				report_message += ", "+config.data[counter].nickname;
			}

			console.log(config.data[counter].mobile_id);
			for (let mobile_counter = 0; mobile_counter < config.data[counter].mobile_id.length; mobile_counter++) {
				mobile_ids.push(config.data[counter].mobile_id[mobile_counter]);
			}
		}
	}
	report_message += " - DYNA-AIS";
	let data = {
		"message": report_message,
		"mobile_ids": mobile_ids
	}
	return data;
}

function sendSMStoDevs(report_details, feature) {
	let details = getDevDetails();
	details.done(function(config){
		let status = null;
		try {
			let report = formatRequest(report_details, feature, config);
			let convo_details = {
				type: 'sendSmsToRecipients',
				recipients: report.mobile_ids,
				message: report.message,
				sender_id: 56, // TEST ID
				site_id: 0,
				is_routine: false
			};
			wss_connect.send(JSON.stringify(convo_details));
			status = true;
		} catch(err) {
			console.log(err);
			status = false;
		}
		return status;
	});
}
