let event_qa_template = null;
let extended_qa_template = null;
let routine_qa_template = null;

let event_data = null;
let event_details = [];
let extended_details = [];
let extended_data = null;

let event_qa_html = null;
let extended_qa_html = null;
let routine_qa_html = null;

try {
    event_qa_template = Handlebars.compile($('#event-qa-template').html());
    extended_qa_template = Handlebars.compile($('#extended-qa-template').html());
    routine_qa_template = Handlebars.compile($('#routine-qa-template').html());
    event_qa_html = event_qa_template();
    extended_qa_html = extended_qa_template();
    routine_qa_html = routine_qa_template();
} catch(err) {
    console.log("Tally running in background...");
}

$(document).ready(function () {
    getSavedSettings().then((saved_data) => {
        let event_data = saved_data[0];
        let extended_data = saved_data[1];
        if (event_data[0].length == 0 && extended_data[0].length == 0) {
            initializeOnGoingAndExtended().then((data) => {
                console.log(data.latest.length);
                for (let counter = 0; counter < data.extended.length; counter++) {
                    initializeRecipients("extended",data.extended[counter],false);
                }

                for (counter = 0; counter < data.latest.length; counter++) {
                    initializeRecipients("event",data.latest[counter],false);
                }
            });
        } else {

            if (event_data[0].length == 0) {
                $('#event-qa-display').append("<strong><span>No sites under event monitoring.</span></strong>");
            } else {
                initializeRecipients("event", event_data[0], true);
            }

            if (extended_data[0].length == 0) {
                $('#extended-qa-display').append("<strong><span>No sites under extended monitoring.</span></strong>");
            } else {
                initializeRecipients("extended", extended_data[0], true); 
            }
        }
    });
    initializeRoutineQA();
});

function initializeOnGoingAndExtended() {
    return $.getJSON("../monitoring/getOnGoingAndExtended");
}

function initializeRoutineQA() {

}

function getSavedSettings() {
    return $.getJSON("../qa_tally/saved_settings");
}

function saveSettings(category, site_data, recipients_data) {
    let data = formatSettings(category, site_data, recipients_data);
    $.post("qa_tally/save_settings ", data, function(data) {
    });
}

function formatSettings(category, site_data, recipients_data) {
    let status = "";
    let ts = null;
    let id_category = "";
    let ewi_expected = 0;
    let ewi_actual = 0;
    let gnd_meas_reminder_expected = 0;
    let gnd_meas_reminder_actual = 0;
    let temp = 0;

    if (site_data.data_timestamp == undefined) {
        ts = site_data.ts
    } else {
        ts = site_data.data_timestamp
    }

    if (category == "event") {
        ewi_expected = recipients_data[0].length*3;
        for (let counter = 0; counter < recipients_data[0].length; counter++) {
            if (recipients_data[0][counter].org_name.toUpperCase() == "LEWC") {
                temp++;
            } 
        }
        gnd_meas_reminder_expected = temp*2;
    } else if (category == "extended") {
        ewi_expected = recipients_data[0].length;
        for (let counter = 0; counter < recipients_data[0].length; counter++) {
            if (recipients_data[0][counter].org_name.toUpperCase() == "LEWC") {
                temp++;
            }  
        }
        gnd_meas_reminder_expected = temp;
    }

    if (site_data.ewi_actual != undefined || site_data.ewi_actual != null) {ewi_actual = site_data.ewi_actual;}
    if (site_data.gndmeas_reminder_actual != undefined || site_data.gndmeas_reminder_actual != null) {gnd_meas_reminder_actual = site_data.gndmeas_reminder_actual;}
    
    let data = {
        "event_category": category,
        "ewi_expected": ewi_expected,
        "ewi_actual": ewi_actual,
        "gndmeas_reminder_expected": gnd_meas_reminder_expected,
        "gndmeas_reminder_actual": gnd_meas_reminder_actual,
        "event_id": site_data.event_id,
        "ts": ts,
        "site_id": site_data.site_id,
        "status": 1
    };

    return data;
}

function initializeRecipients(category,site_data, isOld) {
    let site_ids_container = [];
    if (isOld == true) {
        for (let counter = 0; counter < site_data.length; counter++) {
            $.post("../qa_tally/get_default_recipients", {site_ids : site_data[counter].site_id})
            .done(function(data) {
                if (category == "event") {
                    displayEvents(formatSettings(category,site_data[counter],JSON.parse(data)), JSON.parse(data));
                } else if (category == "extended") {
                    displayExtendeds(formatSettings(category,site_data[counter],JSON.parse(data)),JSON.parse(data));
                } else {
                    // Routine
                }
            });
        }
    } else {
        $.post("../qa_tally/get_default_recipients", {site_ids : site_data.site_id})
        .done(function(data) {
            saveSettings(category, site_data, JSON.parse(data));
            if (category == "event") {
                displayEvents(formatSettings(category,site_data,JSON.parse(data)),JSON.parse(data));
            } else if (category == "extended") {
                displayExtendeds(formatSettings(category,site_data,JSON.parse(data)),JSON.parse(data));
            } else {
                // Routine
            }
        });
    }
}

function displayEvents(settings,event_data) {
    let site_container = [];
    let recipient_container = [];
    let data = [];
    let trimmed_site_name = "";

    for (let counter = 0; counter < event_data[0].length; counter++) {
        let reconstructed_name_container = event_data[0][counter].site_code+" "+event_data[0][counter].org_name+" - "+event_data[0][counter].firstname+" "+
                                            event_data[0][counter].lastname+" ("+event_data[0][counter].sim_num+")";
        if ($.inArray(reconstructed_name_container.toUpperCase(), recipient_container ) == -1) {
            recipient_container.push(reconstructed_name_container.toUpperCase());
        }

        let reconstructed_site_container = event_data[0][counter].purok+", "+event_data[0][counter].sitio+", "+event_data[0][counter].barangay+", "+
                                            event_data[0][counter].municipality+", "+event_data[0][counter].province;
        if ($.inArray(reconstructed_site_container.toUpperCase(), site_container) == -1) {
            site_container.push(reconstructed_site_container.toUpperCase());
        }
    }

    if (site_container.length >= 1) {
        trimmed_site_name = site_container[0].replace(new RegExp('NULL, ', 'g'),"");
    }

    data = {
        "site_name": trimmed_site_name,
        "site_code": event_data[0][0].site_code,
        "recipients": recipient_container,
        "ewi_actual": settings.ewi_actual,
        "ewi_expected": settings.ewi_expected,
        "gndmeas_expected": settings.gndmeas_expected,
        "gndmeas_actual": settings.gndmeas_actual,
        "gndmeas_reminder_expected": settings.gndmeas_reminder_expected,
        "gndmeas_reminder_actual": settings.gndmeas_reminder_actual,
        "last_ts": settings.ts,
        "event_id": settings.event_id
    };

    event_details.unshift(data);
    try {
        tally_panel_html = event_qa_template({'tally_data': event_details});
        $("#event-qa-display").html(tally_panel_html);
    } catch(err) {
        console.log(err);
        console.log("Tally running in background...");
    }
    initializeEvaluateEvent();
}

function displayExtendeds(settings,extended_data) {
    let site_container = [];
    let recipient_container = [];
    let data = [];
    let trimmed_site_name = "";

    for (let counter = 0; counter < extended_data[0].length; counter++) {
        let reconstructed_name_container = extended_data[0][counter].site_code+" "+extended_data[0][counter].org_name+" - "+extended_data[0][counter].firstname+" "+
                                            extended_data[0][counter].lastname+" ("+extended_data[0][counter].sim_num+")";
        if ($.inArray(reconstructed_name_container.toUpperCase(), recipient_container ) == -1) {
            recipient_container.push(reconstructed_name_container.toUpperCase());
        }

        let reconstructed_site_container = extended_data[0][counter].purok+", "+extended_data[0][counter].sitio+", "+extended_data[0][counter].barangay+", "+
                                            extended_data[0][counter].municipality+", "+extended_data[0][counter].province;
        if ($.inArray(reconstructed_site_container.toUpperCase(), site_container) == -1) {
            site_container.push(reconstructed_site_container.toUpperCase());
        }
    }

    if (site_container.length >= 1) {
        trimmed_site_name = site_container[0].replace(new RegExp('NULL, ', 'g'),"");
    }

    data = {
        "site_name": trimmed_site_name,
        "site_code": extended_data[0][0].site_code,
        "recipients": recipient_container,
        "ewi_actual": settings.ewi_actual,
        "ewi_expected": settings.ewi_expected,
        "gndmeas_expected": settings.gndmeas_expected,
        "gndmeas_actual": settings.gndmeas_actual,
        "gndmeas_reminder_expected": settings.gndmeas_reminder_expected,
        "gndmeas_reminder_actual": settings.gndmeas_reminder_actual,
        "last_ts": settings.ts,
        "event_id": settings.event_id
    };
    extended_details.unshift(data);
    try {
        tally_panel_html = extended_qa_template({'tally_data': extended_details});
        $("#extended-qa-display").html(tally_panel_html);
    } catch(err) {
        console.log("Tally running in background");
    }
    initializeEvaluateExtended();    
}

function displayRoutines() {
    $("#routine-qa-display").html(routine_qa_html);
}

function initializeEvaluateEvent() {
    $(".evaluate-event").on("click",function() {
        let event_id = $(this).val();
        $.post("qa_tally/evaluate_site", {id: event_id}, function(data) {
            console.log(data);
        });
    });
}

function initializeEvaluateExtended() {
    $(".evaluate-extended").on("click",function() {
        let event_id = $(this).val();
        $.post("qa_tally/evaluate_site", {id: event_id}, function(data) {
            console.log(data);
        });
    });
}