

fs = require('fs');
var moment = require('moment');
var najax = $ = require('najax');

let releases = fs.readFileSync(process.argv[2]);
let host = process.argv[3];

releases = JSON.parse(releases);

i = 0;
releases.forEach(function (details) {
	console.log(details);
	let release_id = details.release_id;
	let event_id = details.event_id;
	let bulletin_timestamp = details.bulletin_timestamp;

	console.log( release_id, event_id, bulletin_timestamp );

	if( i == 0 ) renderPDF(release_id, details, event_id, bulletin_timestamp);
	else setTimeout( function () { renderPDF(release_id, details, event_id, bulletin_timestamp); }, 6000 * i );
	i++;
});


function renderPDF(id, details, event_id, bulletin_timestamp) 
{
    // console.log("ID", id, "OnEdit", onEdit);
    // let isEdited = onEdit === true ? 1 : 0;
    // let edits = [], editableEditedValue = [];

    // if(isEdited)
    // {
    //     $(".editable").each(function (i) {
    //         editableEditedValue.push([$(this).prop('id'), $(this).val()]);
    //         let temp = encodeURIComponent($(this).val());
    //         edits.push(temp);
    //     });

    //     tagBulletin(release_id, editableEditedValue, editableOrigValue);
    // }
    
    let address = host + '/bulletin/run_script/' + id + '/0';

    najax({
        url: address,
        type: "GET",
        cache: false
    })
    .done( function (response) {
        if(response == "Success.")
        {
            console.log("PDF RENDERED");
            console.log(details.body, details.subject, details.filename, details.recipients);
            sendMail(details.body, details.subject, details.filename, details.recipients, event_id, bulletin_timestamp);
        }
        else console.log(response);
    })
    .error(function (a) {
        console.log("Error rendering:", a);
    });
}

function sendMail(text, subject, filename, recipients, event_id, bulletin_timestamp) {

    let form = {
        text: text,
        subject: subject,
        filename: filename,
        recipients: recipients
    };

    najax({
        url: host + '/bulletin/mail/', 
        type: 'POST',
        data: form,
    })
    .done( function(data)
    {
        if(data == "Sent.")
        {
            console.log('Email sent');
            saveNarrative(recipients, event_id, bulletin_timestamp);
        }
        else
        {
            console.log('EMAIL SENDING FAILED', data);
        }   
        
    })
    .error(function(xhr, status, error) 
    {
      let err = eval("(" + xhr.responseText + ")");
      alert(err.Message);
    }); 
}

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

    console.log({ 'narratives': narratives });

	najax({
    	url: host + "/accomplishment/insertNarratives",
    	type: 'POST',
    	data: { 'narratives': narratives }
    })
    .done(function (data) {
    	console.log("Narrative saved");
    	console.log(JSON.stringify("Sending success"));
    })
    .error(function (x, y) {
        console.log(y);
    });
}