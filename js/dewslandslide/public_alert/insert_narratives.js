

fs = require('fs');
var moment = require('moment');
var najax = $ = require('najax');

let narratives = fs.readFileSync(process.argv[2]);
let host = process.argv[3];

narratives = JSON.parse(narratives);

//i = 0;
narratives.forEach(function (details) {
	let event_id = details.event_id;
	let bulletin_timestamp = details.bulletin_timestamp;
    let recipients = details.recipients;
    saveNarrative(recipients, event_id, bulletin_timestamp);

	// console.log( release_id, event_id, bulletin_timestamp );

	// if( i == 0 ) renderPDF(release_id, details);
	// else setTimeout( function () { renderPDF(release_id, details); }, 6000 * i );
	// i++;
});

function saveNarrative(recipients, event_id, bulletin_timestamp) {

	let people = recipients.map(function (x) {
        if(x == "rusolidum@phivolcs.dost.gov.ph") return x = "RUS";
        else if(x == "asdaag@yahoo.com") return x = "ASD";
        else if(x == "hyunbin_vince@yahoo.com") return x = "KDDC";
        else return x;
    });

    let x = moment(bulletin_timestamp).hour() % 4 == 0  && moment(bulletin_timestamp).minute() == 0 ?  moment(bulletin_timestamp).format("hh:mm A") : moment(bulletin_timestamp).format("hh:mm A") + " onset";
    if(/12:\d{2} PM/g.test(x)) x = x.replace("PM", "MN"); else if (/12:\d{2} AM/g.test(x)) x = x.replace("AM", "NN");
    let message = "Sent " + x + " EWI Bulletin to " + people.join(", ");

    let narratives = [{ 
        event_id: event_id,
        timestamp: moment().format("YYYY-MM-DD HH:mm:ss"),
        narrative: message
    }];

    let data = { "narratives": narratives }

    console.log(data, host + "/accomplishment/insertNarratives");

	najax({
    	url: host + "/accomplishment/insertNarratives",
    	type: 'POST',
    	data: data
    })
    .done(function (data) {
        console.log(data);
    	console.log("Narrative saved");
    })
    .error(function (x, y) {
        console.log(y);
    });
}