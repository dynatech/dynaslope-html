/****
 *
 *  Created by Kevin Dhale dela Cruz
 *  JS file for Individual Monitoring Event Page [public_alert/monitoring_events_individual.php]
 *  [host]/public_alert/monitoring_events/[release_id]
 *
****/
let current_release = {};
const GL_TRIGGER_LOOKUP = {
    R: "Rainfall (R)",
    E: "Earthquake (E)",
    D: "On-demand (D)",
    g: "Surficial data movement (g/L2)",
    G: "Surficial data movement (G/L3)",
    s: "Subsurface data movement (s/L2)",
    S: "Subsurface data movement (S/L3)",
    m: "Manifestation (m)",
    M: "Manifestation (M)"
};
let STAFF_LIST;
let GL_VALIDITY;

$(document).ready(() => {
    const $loading_bar = $("#loading");
    $loading_bar.modal("show");
    const event_id = window.location.pathname.split("/")[3];

    getStaffNames()
    .done((staff_list) => {
        STAFF_LIST = staff_list;
    });

    getEvent(event_id)
    .done(([event]) => {
        console.log(event);
        const {
            site_code, event_start, validity,
            purok, sitio, barangay, municipality,
            province
        } = event;
        GL_VALIDITY = validity;
        const formattedEventStartTS = moment(event_start).format("MMMM Do YYYY, hh:mm A");
        const formattedValidityTS = moment(validity).format("MMMM Do YYYY, hh:mm A");

        let address = `Brgy. ${barangay}, ${municipality}, ${province}`;
        let temp = "";
        if (purok !== null) temp = `Purok ${purok}, `;
        if (sitio !== null) temp = `${temp}Sitio ${sitio}, `;
        address = `${temp}${address}`;

        const timeframe = `${formattedEventStartTS} to ${formattedValidityTS}`;
        initializeEventDetailsOnLoad(site_code.toUpperCase(), address, timeframe);
    });

    $.when(getDataForEWICard(event_id), getEventNarratives(event_id), getEventEOSAnalysis(event_id))
    .done((ewi_data, [event_narratives], [eos]) => {
        const timeline_array = compileTimelineCardDataIntoArray(ewi_data, event_narratives, eos);

        timeline_array.sort((a, b) => moment(b.ts).diff(a.ts));
        console.log(timeline_array);

        let card_id;
        let get_iomp = false;
        let height_counter = 0;
        timeline_array.forEach((timeline_entry, index) => {
            const { type } = timeline_entry;
            if (type === "eos") {
                get_iomp = true;
                card_id = index;
            }
            if (type === "ewi" && get_iomp) {
                setIOMPForEachEOS(timeline_entry, card_id);
                get_iomp = false;
            }

            createTimelineCard(timeline_entry, index);
            if (["ewi", "eos"].includes(type)) {
                addBuffers(index, height_counter);
                height_counter = 0;
            }

            if (type === "narrative") {
                height_counter += $(`#card-${index}`).outerHeight(true);
            }
        });

        $loading_bar.modal("hide");
    });

    // Initializations
    initializeReleaseEditOnClick();

    $(".datetime").datetimepicker({
        format: "YYYY-MM-DD HH:mm:ss",
        allowInputToggle: true,
        widgetPositioning: {
            horizontal: "right",
            vertical: "bottom"
        }
    });

    $(".time").datetimepicker({
        format: "HH:mm:ss",
        allowInputToggle: true,
        widgetPositioning: {
            horizontal: "right",
            vertical: "bottom"
        }
    });

    $(window).on("resize", () => {
        setElementHeight();
    }).resize();

    $(window).on("resize", () => {
        $("#page-wrapper").css("min-height", ($(window).height()));
    }).resize();

    reposition("#edit");
    reposition("#outcome");
    reposition("#bulletinLoadingModal");

    jQuery.validator.addMethod("at_least_one", (value, element, options) => {
        if ($(".od_group[name=llmc").is(":checked") || $(".od_group[name=lgu").is(":checked")) { return true; }
        return false;
    }, "");

    jQuery.validator.addClassRules("od_group", { at_least_one: true });

    $("#modalForm").validate({
        debug: true,
        rules: {
            data_timestamp: "required",
            release_time: "required",
            trigger_rain: "required",
            trigger_eq: "required",
            trigger_od: "required",
            trigger_ground_1: "required",
            trigger_ground_2: "required",
            trigger_sensor_1: "required",
            trigger_sensor_2: "required",
            trigger_rain_info: "required",
            trigger_eq_info: "required",
            trigger_od_info: "required",
            trigger_ground_1_info: "required",
            trigger_ground_2_info: "required",
            trigger_sensor_1_info: "required",
            trigger_sensor_2_info: "required",
            magnitude: {
                required: true,
                step: false
            },
            latitude: {
                required: true,
                step: false
            },
            longitude: {
                required: true,
                step: false
            },
            reason: "required"
        },
        errorPlacement (error, element) {
            console.error(error);
            element.parents(".form-group").addClass("has-feedback");

            // Add the span element, if doesn't exists, and apply the icon classes to it.
            if (!element.next("span")[0]) {
                if (!element.is("[type=checkbox]")) { $("<span class='glyphicon glyphicon-remove form-control-feedback' style='top:18px; right:22px;'></span>").insertAfter(element); }
                if (element.parent().is(".datetime")) element.next("span").css("right", "15px");
                if (element.is("select")) element.next("span").css({ top: "18px", right: "30px" });
                if (element.is("input[type=number]")) element.next("span").css({ top: "24px", right: "20px" });
                if (element.is("textarea")) element.next("span").css({ top: "24px", right: "22px" });
                if (element.attr("id") === "reason") element.next("span").css({ top: "0", right: "0" });
            }
        },
        success (label, element) {
            // Add the span element, if doesn't exists, and apply the icon classes to it.
            if (!$(element).next("span")) {
                $("<span class='glyphicon glyphicon-ok form-control-feedback' style='top:0px; right:37px;'></span>").insertAfter($(element));
            }
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
            $("#edit").modal("hide");
            const data = $("#modalForm").serializeArray();
            const temp = {};
            data.forEach((value) => { temp[value.name] = value.value === "" ? null : value.value; });
            temp.release_id = current_release.release_id;
            temp.trigger_list = current_release.trigger_list.length === 0 ? null : current_release.trigger_list;
            console.log(temp);
            $.post("/../../pubrelease/update", temp)
            .done((data) => {
                $("#outcome").modal({ backdrop: "static" });
                console.log("Updated");
            });
        }
    });

    $("#refresh").click(() => { location.reload(); });

    let release_id = null;
    let text = null;
    let filename = null;
    let subject = null;

    $(".print").click(() => {
        release_id = $(this).val();
        loadBulletin(release_id, event_id);
    });

    $("#download").click(() => {
        $.when(renderPDF(release_id))
        .then(() => {
            $("#bulletinLoadingModal").modal("hide");
            filename = $("#filename").text();
            window.location.href = `/../bulletin/view/DEWS-L Bulletin for ${filename}.pdf`;
        });
    });

    $("#send").click(() => {
        $.when(renderPDF(release_id))
        .then((x) => {
            if (x === "Success.") {
                const recipients = $("#recipients").tagsinput("items");
                console.log(recipients);

                text = $("#info").val();
                const i = text.indexOf("DEWS");
                text = `${text.substr(0, i)}<b>${text.substr(i)}</b>`;

                subject = $("#subject").text();
                filename = `${$("#filename").text()}.pdf`;
                sendMail(text, subject, filename, recipients);
            }
        });
    });
});

function setElementHeight () {
    const window_h = $(window).height();
    const offset = $("#column_2").offset().top;
    const nav_height_top = $(".navbar-fixed-top").height();
    const nav_height_bottom = $(".navbar-fixed-bottom").height();
    const final = window_h - offset - nav_height_bottom - 80;
    $("#map-canvas").css("min-height", final);
}

/* ----- INITIALIZERS DECLARATIONS ----- */

function initializeEventDetailsOnLoad (...args) {
    const ids = ["#site-code", "#address", "#event_timeframe"];
    ids.forEach((id, index) => {
        $(id).text(args[index]);
    });
}

function createTimelineCard (timeline_entry, index) {
    const { type } = timeline_entry;
    const $template = $(`#${type}-card-template`).clone().prop("id", `card-${index}`).prop("hidden", false);

    const column_side = type === "narrative" ? "right" : "left";

    let $timeline_card = $template;

    if (type === "ewi") $timeline_card = prepareEwiCard(timeline_entry, GL_VALIDITY, $template);
    if (type === "narrative") $timeline_card = prepareNarrativeCard(timeline_entry, $template);
    if (type === "eos") $timeline_card = prepareEOSCard(timeline_entry, $template);

    $(`#timeline-column-${column_side} ul.timeline`).append($timeline_card);
}

function prepareEwiCard (release_data, validity, $template) {
    const {
        release_time, internal_alert_level,
        data_timestamp, release_triggers,
        reporter_id_mt, reporter_id_ct,
        comments
    } = release_data;
    const qualifier = selectEwiCardQualifier(data_timestamp, validity);

    $template.find(".card-title").text(qualifier);
    $template.find(".card-title-ts").text(moment(data_timestamp).add(30, "min").format("MMMM Do YYYY, hh:mm A"));
    $template.find(".release_time").text(moment.utc(release_time, "HH:mm").format("hh:mm A"));
    $template.find(".internal_alert_level").text(internal_alert_level);

    if (release_triggers.length === 0) $template.find(".triggers").prop("hidden", true);
    else {
        release_triggers.forEach((trigger) => {
            const { trigger_type, timestamp: trigger_timestamp, info } = trigger;
            const trigger_info = `${GL_TRIGGER_LOOKUP[trigger_type]} alert triggered on ${moment(trigger_timestamp).format("MMMM Do YYYY, hh:mm A")}`;
            const $trigger_li = $("<li>").text(trigger_info);
            const $tech_info_li = $(`<ul><li>${info}</li></ul>`);

            const $trigger_ul = $template.find(".triggers > ul");
            $trigger_ul.append($trigger_li);
            $trigger_ul.append($tech_info_li);
        });
    }

    if (comments === "" || comments === null) $template.find(".comments-div").prop("hidden", true);
    else $template.find(".comments").text(comments);

    const iomp = [["mt", reporter_id_mt], ["ct", reporter_id_ct]];
    iomp.forEach(([type, id]) => {
        const { first_name, last_name } = STAFF_LIST.find(element => id === element.id);
        $template.find(`.reporters > .${type}`).text(`${first_name} ${last_name}`);
    });

    return $template;
}

function prepareNarrativeCard (narrative_data, $template) {
    const { narrative, timestamp: narrative_ts } = narrative_data;
    $template.find(".narrative-span").text(narrative);
    $template.find(".narrative-ts").text(moment(narrative_ts).format("MMMM Do YYYY, hh:mm:ss A"));
    return $template;
}

function prepareEOSCard (eos_data, $template) {
    const { analysis, shift_start } = eos_data;
    const shift_end = moment(shift_start).add(13, "hours").format("MMMM Do YYYY, hh:mm A");
    $template.find(".card-title-ts").text(shift_end);
    $template.find(".analysis-div").html(analysis);
    return $template;
}

function selectEwiCardQualifier (data_timestamp, validity) {
    const ts = moment(data_timestamp).add(30, "min");
    let qualifier;

    if (moment(ts).isSame(validity)) qualifier = "End of Monitoring: ";
    else if (moment(ts).isBefore(validity)) qualifier = "Early Warning Release for ";
    else {
        const duration = moment.duration(ts.diff(validity));
        const days = Math.floor(duration.asDays());
        qualifier = `Day ${days} of Extended Monitoring: `;
    }
    return qualifier;
}

function getTriggersForSpecificRelease (release_id, triggers_arr) {
    const triggers = triggers_arr.filter(data => data.release_id === release_id);
    return triggers;
}

function initializeReleaseEditOnClick () {
    $("#edit-release-btn").on("click", () => {
        $("#modalForm .form-group").removeClass("has-feedback").removeClass("has-error").removeClass("has-success");
        $("#modalForm .glyphicon.form-control-feedback").remove();

        console.log("Debug: Clicked Edit Button once.");

        const release_id = this.id;
        $.get(
            `/../../pubrelease/getRelease/${release_id}`,
            (release) => {
                $("#data_timestamp").val(release.data_timestamp);
                $("#release_time").val(release.release_time);
                $("#comments").val(release.comments);

                console.log("release ", release);
                current_release = jQuery.extend(true, {}, release);
                $.get(
                    `/../../pubrelease/getAllEventTriggers/${release.event_id}/${release_id}`,
                    (triggers) => {
                        const lookup = {
                            G: "ground", g: "ground", S: "sensor", s: "sensor", E: "eq", R: "rain", D: "od"
                        };
                        for (const k in lookup) { $(`#${lookup[k]} input`).prop("disabled", true); $(`#${lookup[k]}_area`).hide(); }

                        current_release.trigger_list = [];
                        triggers.forEach((a) => {
                            const delegate = function (x, a) { if (x.includes(".od_group")) { $(x).prop("disabled", false).prop("checked", parseInt(a)); } else $(x).val(a).prop("disabled", false); };
                            switch (a.trigger_type) {
                                case "g": case "s": $(`#trigger_${lookup[a.trigger_type]}_1`).val(a.timestamp).prop("disabled", false); $(`#trigger_${lookup[a.trigger_type]}_1_info`).val(a.info).prop("disabled", false); current_release.trigger_list.push([`trigger_${lookup[a.trigger_type]}_1`, a.trigger_id]); break;
                                case "G": case "S": $(`#trigger_${lookup[a.trigger_type]}_2`).val(a.timestamp).prop("disabled", false); $(`#trigger_${lookup[a.trigger_type]}_2_info`).val(a.info).prop("disabled", false); current_release.trigger_list.push([`trigger_${lookup[a.trigger_type]}_2`, a.trigger_id]); break;
                                case "R": case "E":
                                case "D": $(`#trigger_${lookup[a.trigger_type]}`).val(a.timestamp).prop("disabled", false); $(`#trigger_${lookup[a.trigger_type]}_info`).val(a.info).prop("disabled", false); current_release.trigger_list.push([`trigger_${lookup[a.trigger_type]}`, a.trigger_id]);
                                    if (a.trigger_type == "E") { delegate("#magnitude", a.eq_info[0].magnitude); delegate("#latitude", a.eq_info[0].latitude); delegate("#longitude", a.eq_info[0].longitude); break; } else if (a.trigger_type == "D") { delegate("#reason", a.od_info[0].reason); delegate(".od_group[name=llmc]", a.od_info[0].is_llmc); delegate(".od_group[name=lgu]", a.od_info[0].is_lgu); break; }
                            }
                            $(`#${lookup[a.trigger_type]}_area`).show();
                        });
                    }, "json"
                )
                .done(() => {
                    $("#edit").modal("show");
                });
            }, "json"
        );
    });
}

/* ----- DATA GETTERS ----- */

// Gets from the backend all the narratives for a specific event
function getEventNarratives (event_id) {
    return $.getJSON(`/../../accomplishment/getNarratives/${event_id}`)
    .catch((error) => {
        console.log(error);
    });
}

function getEventEOSAnalysis (event_id) {
    return $.getJSON(`/../../accomplishment/getEndOfShiftDataAnalysis/all/${event_id}`)
    .catch((error) => {
        console.log(error);
    });
}

// Gets event details from the backend via pubrelease controller
function getEvent (event_id) {
    return $.getJSON(`/../../../pubrelease/getEvent/${event_id}`)
    .catch((error) => {
        console.log(error);
    });
}

// Gets all triggers for the specified event from the backend via pubrelease controller
function getAllEventTriggers (event_id) {
    return $.getJSON(`/../../../pubrelease/getAllEventTriggers/${event_id}`)
    .catch((error) => {
        console.log(error);
    });
}

// Gets ewi releases for the specified event from the backend via pubrelease controller
function getAllEventReleases (event_id) {
    return $.getJSON(`/../../../pubrelease/getAllRelease/${event_id}`)
    .catch((error) => {
        console.log(error);
    });
}

function getDataForEWICard (event_id) {
    return $.when(getAllEventReleases(event_id), getAllEventTriggers(event_id))
    .then(([releases], [triggers]) => {
        const new_map = releases.map((release) => {
            const { release_id, data_timestamp } = release;
            const release_triggers = getTriggersForSpecificRelease(release_id, triggers);
            return {
                ...release,
                release_triggers,
                ts: data_timestamp,
                type: "ewi"
            };
        });

        return $.Deferred().resolve(new_map);
    });
}

function compileTimelineCardDataIntoArray (releases, event_narratives, eos) {
    const timeline_array = [...releases];

    event_narratives.forEach((narrative) => {
        const { timestamp } = narrative;
        const temp = { ...narrative, ts: timestamp, type: "narrative" };
        timeline_array.push(temp);
    });

    eos.forEach((current_eos) => {
        const { shift_start } = current_eos;
        const shift_end = moment(shift_start).add(13, "hours");
        const temp = { ...current_eos, ts: shift_end, type: "eos" };
        timeline_array.push(temp);
    });

    return timeline_array;
}

function getStaffNames () {
    return $.getJSON("/../../../monitoring/getStaffNames")
    .catch((error) => {
        console.log(error);
    });
}

function setIOMPForEachEOS (timeline_entry, card_id) {
    const { reporter_id_mt, reporter_id_ct } = timeline_entry;
    const iomp = [["mt", reporter_id_mt], ["ct", reporter_id_ct]];
    iomp.forEach(([type, id]) => {
        const { first_name, last_name } = STAFF_LIST.find(element => id === element.id);
        $(`#card-${card_id}`).find(`.reporters > .${type}`).text(`${first_name} ${last_name}`);
    });
}

function addBuffers (index, height_counter) {
    const $buffer = $("<li>", { class: "buffer" });
    const $card = $(`#card-${index}`);
    $("#timeline-column-left > .timeline").append($buffer.clone());

    const $tbody = $card.prevAll(".timeline:first").find(".timeline-body");
    const t_body_height = $tbody.outerHeight(true) + 8;

    let left_buffer_height;
    let right_buffer_height = 0;
    if ($tbody.length === 0) left_buffer_height = height_counter - 20;
    else if (height_counter <= t_body_height + 80) {
        left_buffer_height = 0;

        const card_heading_height = $card.find(".timeline-heading").outerHeight(true) + 20;
        if (index === 37 || index === 38) console.log(height_counter, t_body_height, card_heading_height);
        right_buffer_height = t_body_height - card_heading_height + 40;
    } else {
        left_buffer_height = height_counter - t_body_height - 80;
    }

    const $column_right = $("#timeline-column-right > .timeline");
    const last_height = right_buffer_height + 35;
    const $column_right_last = $column_right.find("li:last-child");
    if ($column_right_last.hasClass("buffer")) {
        $column_right_last.height(last_height);
    } else {
        $column_right.append($buffer.height(last_height));
    }

    $card.prev(".buffer").height(left_buffer_height);
}
