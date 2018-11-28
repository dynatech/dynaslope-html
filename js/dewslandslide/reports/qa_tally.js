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

}

$(document).ready(function () {
    initializeAlerts();
    initializeRoutineQA();
    initializeTimestamps();
    initializeFormValidation();
});


function initializeAlerts() {
    getSavedSettings().then((saved_data) => {
        let event_data = saved_data[0];
        let extended_data = saved_data[1];
        if (event_data[0].length == 0 && extended_data[0].length == 0) {
            initializeOnGoingAndExtended().then((data) => {
                if (data.extended.length == 0) {
                    $('#extended-qa-display').append("<strong><span>No sites under extended monitoring.</span></strong>");
                } else {
                    for (let counter = 0; counter < data.extended.length; counter++) {
                        initializeRecipients("extended",data.extended[counter],false);
                    }
                }

                if (data.latest.length == 0) {
                    $('#event-qa-display').append("<strong><span>No sites under event monitoring.</span></strong>");
                } else {
                    for (counter = 0; counter < data.latest.length; counter++) {
                        initializeRecipients("event",data.latest[counter],false);
                    }
                }  
            });
        } else {
            let status = shiftChecker(event_data[0], extended_data[0]);
            if (status == false) {
                for (let counter = 0; counter < event_data[0].length; counter++) {
                    let request = {
                        id: event_data[0][counter].event_id,
                        category: "event"
                    };
                    $.post("qa_tally/evaluate_site", {data: request}, function(data) {
                        console.log(data);
                        console.log("resetting settings for event.");
                    });
                }

                for (let counter = 0; counter < extended_data[0].length; counter++) {
                    let request = {
                        id: extended_data[0][counter].event_id,
                        category: "extended"
                    };
                    $.post("qa_tally/evaluate_site", {data: request}, function(data) {
                        console.log(data);
                        console.log("resetting settings for extended.");
                    });  
                }
                initializeAlerts();
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
        }
    });
}

function initializeTimestamps () {
    $(() => {
        $(".timestamp").datetimepicker({
            format: "YYYY-MM-DD HH:mm:00",
            allowInputToggle: true,
            widgetPositioning: {
                horizontal: "right",
                vertical: "bottom"
            }
        });

        $(".shift_start").datetimepicker({
            format: "YYYY-MM-DD HH:30:00",
            enabledHours: [7, 19],
            allowInputToggle: true,
            widgetPositioning: {
                horizontal: "right",
                vertical: "bottom"
            }
        });

        $(".shift_end").datetimepicker({
            format: "YYYY-MM-DD HH:30:00",
            allowInputToggle: true,
            widgetPositioning: {
                horizontal: "right",
                vertical: "bottom"
            },
            useCurrent: false // Important! See issue #1075
        });

        $(".shift_start").on("dp.change", (e) => {
            $(".shift_end").data("DateTimePicker").minDate(e.date);
        });

        $(".shift_end").on("dp.change", (e) => {
            $(".shift_start").data("DateTimePicker").maxDate(e.date);
        });
    });

    $("#shift_start").focusout(({ currentTarget }) => {
        if (currentTarget.value === ""){
            $("#generate").prop("disabled", true).removeClass("btn-info").addClass("btn-danger"); 
        } else {
            $("#generate").prop("disabled", false).removeClass("btn-danger").addClass("btn-info");
        }
    });
}

// function initializeDatePickerValue(){

// }

function initializeFormValidation () {
    jQuery.validator.addMethod("TimestampTest", (value, element) => checkTimestamp(value, element), () => validation_message);

    $("#generate_form").validate({
        debug: true,
        rules: {
            event_shift_start: {
                required: true,
                TimestampTest: true
            },
            event_shift_end: {
                required: true,
                TimestampTest: true
            }
        },
        errorPlacement (error, element) {
            const placement = $(element).closest(".form-group");

            if (placement) {
                $(placement).append(error);
            } else {
                error.insertAfter(placement);
            } // remove on success

            // Add `has-feedback` class to the parent div.form-group
            // in order to add icons to inputs
            element.parents(".form-group").addClass("has-feedback");

            // Add the span element, if doesn't exists, and apply the icon classes to it.
            if (!element.next("span")[0]) {
                $("<span class='glyphicon glyphicon-remove form-control-feedback' style='top:18px; right:22px;'></span>").insertAfter(element);
                if (element.parent().is(".datetime") || element.parent().is(".datetime")) element.next("span").css("right", "15px");
                if (element.is("select")) element.next("span").css({ top: "18px", right: "30px" });
            }
        },
        success (label, element) {
            // Add the span element, if doesn't exists, and apply the icon classes to it.
            if (!$(element).next("span")) {
                $("<span class='glyphicon glyphicon-ok form-control-feedback' style='top:0px; right:37px;'></span>").insertAfter($(element));
            }

            $(element).closest(".form-group").children("label.error").remove();
        },
        highlight (element, errorClass, validClass) {
            $(element).parents(".form-group").addClass("has-error").removeClass("has-success");
            if ($(element).parent().is(".datetime") || $(element).parent().is(".time")) {
                $(element).nextAll("span.glyphicon").remove();
                $("<span class='glyphicon glyphicon-remove form-control-feedback' style='top:0px; right:37px;'></span>").insertAfter($(element));
            } else $(element).next("span").addClass("glyphicon-remove").removeClass("glyphicon-ok");
        },
        unhighlight (element, errorClass, validClass) {
            $(element).parents(".form-group").addClass("has-success").removeClass("has-error");
            if ($(element).parent().is(".datetime") || $(element).parent().is(".time")) {
                $(element).nextAll("span.glyphicon").remove();
                $("<span class='glyphicon glyphicon-ok form-control-feedback' style='top:0px; right:37px;'></span>").insertAfter($(element));
            } else $(element).next("span").addClass("glyphicon-ok").removeClass("glyphicon-remove");
        },
        submitHandler (form) {
            let start = $("#shift_start").val();
            let end = $("#shift_end").val();
            event_details = [];
            extended_details = [];
            getSavedData(start, end);
        }
    });

}

function checkTimestamp (value, { id }) {
    const hour = moment(value).hour();
    const minute = moment(value).minute();
    let message,
        bool;

    if (id === "shift_start") {
        message = "Acceptable times of shift start are 07:30 and 19:30 only.";
        const temp = moment(value).add(13, "hours");
        $("#shift_end").val(moment(temp).format("YYYY-MM-DD HH:mm:ss"));
        $("#shift_end").prop("readonly", true).trigger("focus");
        setTimeout(() => {
            $("#shift_end").trigger("focusout");
        }, 500);
        bool = (hour === 7 || hour === 19) && minute === 30;
    } else {
        message = "Acceptable times of shift end are 08:30 and 20:30 only.";
        bool = ((hour === 8 || hour === 20) && minute === 30);
    }

    return bool;
}

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
    let ewi_ack = 0;
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
    if (site_data.ewi_ack != undefined || site_data.ewi_ack != null) {ewi_ack = site_data.ewi_ack;}
    
    let boolean_status = 0;
    if (site_data.status == 'on-going' || site_data.status == 'extended') {boolean_status = 1;}
    let data = {
        "event_category": category,
        "ewi_expected": ewi_expected,
        "ewi_actual": ewi_actual,
        "ewi_ack": ewi_ack,
        "gndmeas_reminder_expected": gnd_meas_reminder_expected,
        "gndmeas_reminder_actual": gnd_meas_reminder_actual,
        "event_id": site_data.event_id,
        "ts": ts,
        "site_id": site_data.site_id,
        "status": boolean_status
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
        "ewi_ack": settings.ewi_ack,
        "gndmeas_expected": settings.gndmeas_expected,
        "gndmeas_actual": settings.gndmeas_actual,
        "gndmeas_reminder_expected": settings.gndmeas_reminder_expected,
        "gndmeas_reminder_actual": settings.gndmeas_reminder_actual,
        "last_ts": settings.ts,
        "event_id": settings.event_id,
        "status": parseInt(settings.status)
    };

    event_details.unshift(data);
    $("#event-qa-display").empty();
    try {
        tally_panel_html = event_qa_template({'tally_data': event_details});
        $("#event-qa-display").html(tally_panel_html);
    } catch(err) {
    
    
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
        "ewi_ack": settings.ewi_ack,
        "gndmeas_expected": settings.gndmeas_expected,
        "gndmeas_actual": settings.gndmeas_actual,
        "gndmeas_reminder_expected": settings.gndmeas_reminder_expected,
        "gndmeas_reminder_actual": settings.gndmeas_reminder_actual,
        "last_ts": settings.ts,
        "event_id": settings.event_id,
        "status": parseInt(settings.status)
    };

    extended_details.unshift(data);
    $("#extended-qa-display").empty();
    try {
        tally_panel_html = extended_qa_template({'tally_data': extended_details});
        $("#extended-qa-display").html(tally_panel_html);
    } catch(err) {
    
    }
    initializeEvaluateExtended();    
}

function displayRoutines() {
    $("#routine-qa-display").html(routine_qa_html);
}

function initializeEvaluateEvent() {
    $(".evaluate-event").on("click",function() {
        let event_id = $(this).val();
        let request = {
            id: event_id,
            category: "event"
        }
        $.post("qa_tally/evaluate_site", {data: request}, function(data) {
        
        });
    });
}

function initializeEvaluateExtended() {
    $(".evaluate-extended").on("click",function() {
        let event_id = $(this).val();
        let request = {
            id: event_id,
            category: "extended"
        }
        $.post("qa_tally/evaluate_site", {data: request}, function(data) {
            if (data == true) {
                $.notify("Evaluate success!","success");
                $("."+event_id).fadeOut(500, function(){$(this).remove();});
            }
        });
    });
}

function getSavedData(start_date, end_date){
    let data = {
        start : start_date,
        end : end_date
    }
    let url = "../qa_tally/recorded_settings";
    $.post(url, data)
    .done((result, textStatus, jqXHR) => {
        displaySavedSettings(JSON.parse(result));
    });
}

function displaySavedSettings(saved_data){

    let event_data = saved_data[0];

    let extended_data = saved_data[1];
    if (event_data[0].length == 0 && extended_data[0].length == 0) {
        initializeOnGoingAndExtended().then((data) => {
            if (data.extended.length == 0) {
                $('#extended-qa-display').append("<strong><span>No sites under extended monitoring.</span></strong>");
            } else {
                for (let counter = 0; counter < data.extended.length; counter++) {
                    initializeRecipients("extended",data.extended[counter],false);
                }
            }

            if (data.latest.length == 0) {
                $('#event-qa-display').append("<strong><span>No sites under event monitoring.</span></strong>");
            } else {
            
                for (counter = 0; counter < data.latest.length; counter++) {
                    initializeRecipients("event",data.latest[counter],false);
                }
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
   
}

function shiftChecker(event_data, extended_data) {
    let status = null;
    let current_date = moment().format("YYYY-MM-DD");
    if (event_data[0].ts.indexOf(current_date) != -1 || extended_data[0].ts.indexOf(current_date) != -1) {
        status = true;
    } else {
        status = false;
    }
    return status;
}