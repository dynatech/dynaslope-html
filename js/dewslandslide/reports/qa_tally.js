let event_qa_template = Handlebars.compile($('#event-qa-template').html());
let extended_qa_template = Handlebars.compile($('#extended-qa-template').html());
let routine_qa_template = Handlebars.compile($('#routine-qa-template').html());
let event_data = null;
let extended_data = null;

$(document).ready(function () {
    initializeHandleBars();
    getSavedSettings().then((saved_data) => {
        let event_data = saved_data[0];
        let extended_data = saved_data[1];
        if (event_data[0].length == 0 && extended_data[0].length == 0) {
            initializeOnGoingAndExtended().then((data) => {
                for (let counter = 0; counter < data.extended.length; counter++) {
                    initializeDefaultRecipients("extended",data.extended[counter]);
                }

                for (counter = 0; counter < data.latest.length; counter++) {
                    initializeDefaultRecipients("event",data.latest[counter]);
                }
            });
        } else {
            console.log(event_data);
            console.log(extended_data);
        }
    })
    initializeRoutineQA();
});


function initializeHandleBars() {
    let event_qa_html = event_qa_template();
    let extended_qa_html = extended_qa_template();
    let routine_qa_html = routine_qa_template();
    $("#event-qa-display").html(event_qa_html);
    $("#extended-qa-display").html(extended_qa_html);
    $("#routine-qa-display").html(routine_qa_html);
}


function initializeOnGoingAndExtended() {
    return $.getJSON("../monitoring/getOnGoingAndExtended");
}

function initializeRoutineQA() {

}


function getSavedSettings() {
    return $.getJSON("../qa_tally/saved_settings");
}

// function saveSettings(settings) {
//     return $.post("", settings, function(data) {

//     });
// }

function initializeDefaultRecipients(category,site_data) {
    let site_ids_container = [];
    $.post("../qa_tally/get_default_recipients", {site_ids : site_data.site_id})
    .done(function(data) {
        console.log(category);
        console.log(JSON.parse(data));
    });
}

function displayEvents(event_data) {

}

function displayExtendeds(extended_data) {

}

function displayRoutines() {

}