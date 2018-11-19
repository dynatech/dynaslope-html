let pms_data = {};
let page = "";

const instance = PMS_MODAL.create({
    modal_id: "chatterbox-accuracy-1"
});

$(document).ready(() => {
	pms_data = {
		"metric_indicator": "registered_inbox",
		"table_source": "smsinbox"
	};
		
    setTimeout(() => {
        if (instance.is_attached) {
            pms_instances['12'] = instance;
        }
    }, 300);

	$("#rainfall_scanner_report").click(function() {
		pms_data = {
			"metric_indicator": "rainfall_scanner_accuracy",
			"table_source": "rainprops"
		};
		rainfall_scanner_report_submit(pms_data);
	});
});

function rainfall_scanner_report_submit(pms_data) {
    console.log(pms_data);
    instance.set({
        reference_id: 0,
        reference_table: "communitycontacts",
        metric_name: pms_data.metric_indicator,
        module_name: "chatterbox"
    });
    
    instance.show();
    instance.print();
    console.log(instance);
}