$(document).ready(() => {
	initializeChatterboxPanelBehavior();
	initializeOnClickShowPanelButton();
});

function initializeChatterboxPanelBehavior(){
	$("#recent-activity-panel").show();
	$("#conversation-panel").hide();
}

function initializeOnClickShowPanelButton(){
	$("#go-to-conversation").click(() => {
		$("#recent-activity-panel").hide();
		$("#conversation-panel").show();
	});

	$("#go-recent-activity").click(() => {
		$("#recent-activity-panel").show();
		$("#conversation-panel").hide();
	});
}