

fs = require('fs');
var moment = require('moment');
var najax = $ = require('najax');

let candidate_alerts = fs.readFileSync(process.argv[2]);
let current_alerts = fs.readFileSync(process.argv[3]);
let host = process.argv[4];

let lookup = { "r1":["rain","rain","R"], "r2":["rain","rain","R"], "l2":["ground","ground_1","g"], "l3":["ground","ground_2","G"], "L2":["sensor","sensor_1","s"], "L3":["sensor","sensor_2","S"], "d1":["od","od","D"], "e1":["eq","eq","E"] };

candidate_alerts = JSON.parse(candidate_alerts); // Note that PublicAlert.json is really wrapped in an array
current_alerts = JSON.parse(current_alerts);

candidate_alerts = candidate_alerts.candidate;

let merged_arr = current_alerts.latest.concat(current_alerts.overdue);

let forRelease = processAlertsForRelease(candidate_alerts, merged_arr);

let response = null;
try {
	releaseAllAlerts(forRelease, host);
	response = "success";
} catch (err) {
	response = err;
}

console.log(JSON.stringify(response));

/******* FUNCTIONS ********/

function evaluateTriggers(row, latest_trigger_ts) 
{
	let list = row.retriggerTS;
	let arr = [];
	list.forEach(function (x) {
		if( moment(x.timestamp).isAfter(latest_trigger_ts) || latest_trigger_ts == null )
		{
			arr.push(x);
		}
	});

	let release_entry = { "trigger_list": [] };
	arr.forEach(function (x) {
		let y = lookup[x.retrigger]; 
		release_entry["trigger_" + y[1]]= x.timestamp;
		
		let info = y[2] == "E" ? row.tech_info[y[0] + "_tech"]["info"] : row.tech_info[y[0] + "_tech"];
		release_entry["trigger_" + y[1] + "_info"] = info;

		// if( y[2] == "D" ) $(".od_group, #reason").prop("disabled", false);
		if( y[2] == "E" ) {
			let x = row.tech_info[y[1] + "_tech"];
			release_entry.magnitude = x.magnitude;
			release_entry.latitude = x.latitude;
			release_entry.longitude = x.longitude;
		}
		release_entry.trigger_list.push(y[2]);
	});

	return release_entry;
}

function processAlertsForRelease( candidate_alerts, merged_arr ) 
{
	let final = [];
	candidate_alerts.forEach( function ( candidate ) 
	{
		let index = merged_arr.map(x => x.name).indexOf(candidate.site);
		let previous = null;
		let entry = null;

		// ENSURE BLOCKING OF AUTO-RELEASE ON ALERTS THAT NEED
		// MANUAL RELEASE
		if( !candidate.isManual )
		{
			if(index > -1)
			{
				previous = merged_arr[index];
				entry = evaluateTriggers(candidate, previous.trigger_timestamp);
				entry.previous_validity = previous.validity;

				// Put internal alert checker here if there's invalid trigger
				if( candidate.internal_alert == "A0" )
				{
					if( moment(previous.validity).isAfter( moment(candidate.timestamp).add(30, 'minutes') ) )
						entry.status = "invalid";
					else entry.status = "extended";
				}
				else entry.status = "on-going";
				entry.event_id = previous.event_id;

				// let hour = moment(candidate.timestamp).hour();
				// let minute = moment(candidate.timestamp).minutes();
				// if( hour % 4 == 3 && minute == 30 ) $("#release").prop("disabled", false);
				// else $("#release").prop("disabled", true);
			}
			else
			{
				//console.log("NEW EVENT");
				entry = evaluateTriggers(candidate, null);
				let index_ex = current_alerts.extended.map(x => x.name).indexOf(candidate.site);
				if(index_ex > -1) entry.previous_event_id = current_alerts.extended[index_ex].event_id;

				entry.status = "new";
			}

			entry.timestamp_entry = candidate.timestamp;
			entry.site = candidate.site;
			entry.rain_alert = candidate.rain_alert;
			entry.internal_alert_level = candidate.internal_alert;
			entry.reporter_1 = 1;
			entry.reporter_2 = 1;
			entry.comments = null;
			entry.release_time = moment().format("YYYY-MM-DD HH:mm:ss")

			let aX = entry.internal_alert_level.slice(0,2);
		    entry.public_alert_level = aX == "ND" ? "A1" : aX;
		    entry.trigger_list = entry.trigger_list.length == 0 ? null : entry.trigger_list;

			if (entry.status == "new")
		    {
		    	if( typeof entry.previous_event_id != 'undefined' ) entry.previous_event_id = entry.previous_event_id;
		    }
		    else entry.current_event_id = entry.event_id;

		    if (entry.status == "on-going")
		    {
		    	let extend = false;

		    	if( entry.internal_alert_level.indexOf("ND") > -1 || entry.internal_alert_level.indexOf("g0") > -1 || entry.internal_alert_level.indexOf("s0") > -1 )
		    		extend = true;

		    	if( entry.trigger_list == null && moment(entry.previous_validity).isSame( moment(entry.timestamp_entry).add(30, 'minutes') ) )
		    	{
		    		if( extend ) entry.extend_ND = true;
		    		else if ( entry.rain_alert == "rx" ) entry.extend_rain_x = true;
		    	}
		    }
		    
			final.push(entry);
		}
	});

	return final;
}

function releaseAllAlerts( alerts, host ) 
{
	if( alerts != [] )
	{
		alerts.forEach(function (entry) 
		{
			//console.log(entry);
			najax({
		        url: host + "/pubrelease/insert",
		        type: "POST",
		        data : entry
		    }).error(function (data, statusText, e) {
	        	console.log(data.responseText);
	      	});

			// if(entry.status == 'extended') {
		 //    	$.post(host + "/issues_and_reminders/archiveIssuesFromLoweredEvents", {event_id: entry.current_event_id})
		 //    	.done(function (has_updated) {
		 //            // if(has_updated == 'true') { doSend("getNormalAndLockedIssues"); }
		 //        });
		 //    }

		 //    $.ajax({
		 //        url: host + "/pubrelease/insert",
		 //        type: "POST",
		 //        data : entry,
		 //        // success: function(result, textStatus, jqXHR)
		 //        // {	           
		 //        //     doSend("getOnGoingAndExtended");
		 //        // },
		 //        error: function(xhr, status, error) {
		 //          var err = eval("(" + xhr.responseText + ")");
		 //          alert(err.Message);
		 //        }
		 //    });
		});
	}
}