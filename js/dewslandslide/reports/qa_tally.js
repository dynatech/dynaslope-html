let event_qa_template = Handlebars.compile($('#event-qa-template').html());
let extended_qa_template = Handlebars.compile($('#extended-qa-template').html());
let routine_qa_template = Handlebars.compile($('#routine-qa-template').html());
let event_data = null;
let event_details = [];
let extended_details = [];
let extended_data = null;

let event_qa_html = event_qa_template();
let extended_qa_html = extended_qa_template();
let routine_qa_html = routine_qa_template();

$(document).ready(function () {
    getSavedSettings().then((saved_data) => {
        console.log(saved_data);
        let event_data = saved_data[0];
        let extended_data = saved_data[1];
        if (event_data[0].length == 0 && extended_data[0].length == 0) {
            initializeOnGoingAndExtended().then((data) => {
                for (let counter = 0; counter < data.extended.length; counter++) {
                    initializeRecipients("extended",data.extended[counter],false);
                }

                for (counter = 0; counter < data.latest.length; counter++) {
                    initializeRecipients("event",data.latest[counter],false);
                }
            });
        } else {
            initializeRecipients("event", event_data[0], true);
            initializeRecipients("extended", extended_data[0], true);
        }
    })
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
        console.log(data);
    });
    
}

function formatSettings(category, site_data, recipients_data) {
    let status = "";
    let ts = null;
    let id_category = "";
    if (site_data.data_timestamp == undefined) {
        ts = site_data.ts
    } else {
        ts = site_data.data_timestamp
    }

    let data = {
        "event_category": category,
        "ewi_expected": recipients_data[0].length*3,
        "ewi_actual": site_data.ewi_actual,
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
        "last_ts": settings.ts
    };

    event_details.unshift(data);
    tally_panel_html = event_qa_template({'tally_data': event_details});
    $("#event-qa-display").html(tally_panel_html);
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
        "last_ts": settings.ts
    };
    console.log(data)
    extended_details.unshift(data);
    tally_panel_html = extended_qa_template({'tally_data': extended_details});
    $("#extended-qa-display").html(tally_panel_html);
}

function displayRoutines() {
    $("#routine-qa-display").html(routine_qa_html);
}