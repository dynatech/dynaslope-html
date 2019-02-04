function getDevDetails() {
	return $.getJSON('/ais/config/dev_config.json');
}

function sendNotification() {
	sendSMStoDevs("TEST");
}

function sendReport() {
	sendSMStoDevs("TEST");
}

function formatRequest() {
	sendSMStoDevs("TEST");
}

function sendSMStoDevs(report_details) {
	let details = getDevDetails();
	details.done(function(data){
		console.log(report_details);
		console.log(data);
	});
}