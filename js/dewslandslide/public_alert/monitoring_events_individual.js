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
let EVENT_ID;
let SITE_CODE;

$(document).ready(() => {
    const $loading_bar = $("#loading");
    $loading_bar.modal("show");
    EVENT_ID = window.location.pathname.split("/")[3];

    initializeDateTimePickers();
    // initializePageResizer();
    initializeFormValidator();
    initializeBulletinSendingAndDownloading();
    initializeReleaseEditOnClick();

    reposition("#edit");
    reposition("#outcome");
    reposition("#bulletinLoadingModal");

    getStaffNames()
    .done((staff_list) => {
        STAFF_LIST = staff_list;
    });

    getEvent(EVENT_ID)
    .done(([event]) => {
        const {
            site_code, event_start, validity,
            purok, sitio, barangay, municipality,
            province
        } = event;
        GL_VALIDITY = validity;
        SITE_CODE = site_code;

        // Refactor this to new function
        const formattedEventStartTS = moment(event_start).format("MMMM Do YYYY, hh:mm A");
        const formattedValidityTS = moment(validity).format("MMMM Do YYYY, hh:mm A");

        let address = `Brgy. ${barangay}, ${municipality}, ${province}`;
        let temp = "";
        if (purok !== null) temp = `Purok ${purok}, `;
        if (sitio !== null) temp = `${temp}Sitio ${sitio}, `;
        address = `${temp}${address}`;
        const timeframe = `${formattedEventStartTS} to ${formattedValidityTS}`;
        // End of code to be refactored

        initializeEventDetailsOnLoad(site_code.toUpperCase(), address, timeframe);
    });

    $.when(getDataForEWICard(EVENT_ID), getEventNarratives(EVENT_ID), getEventEOSAnalysis(EVENT_ID))
    .done((ewi_data, [event_narratives], [eos]) => {
        const timeline_array = compileTimelineCardDataIntoArray(ewi_data, event_narratives, eos);

        timeline_array.sort((a, b) => moment(b.ts).diff(a.ts));

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

            if (["ewi", "eos"].includes(type)) {
                if (index !== 0 && timeline_array[index - 1].type === "narrative") {
                    addBuffer(type);
                    adjustBufferHeight(type, index, height_counter);
                }
            } else {
                if (index !== 0 && ["ewi", "eos"].includes(timeline_array[index - 1].type)) {
                    addBuffer(type);
                    adjustBufferHeight(type, index);
                }
            }

            createTimelineCard(timeline_entry, index);
        });

        $loading_bar.modal("hide");
    });

    $("#refresh").click(() => { location.reload(); });
});

// function setElementHeight () {
//     const window_h = $(window).height();
//     const offset = $("#column_2").offset().top;
//     const nav_height_top = $(".navbar-fixed-top").height();
//     const nav_height_bottom = $(".navbar-fixed-bottom").height();
//     const final = window_h - offset - nav_height_bottom - 80;
//     $("#map-canvas").css("min-height", final);
// }

/* ----- INITIALIZERS DECLARATIONS ----- */

function initializeDateTimePickers () {
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
}

function initializePageResizer () {
    $(window).on("resize", () => {
        setElementHeight();
    }).resize();

    $(window).on("resize", () => {
        $("#page-wrapper").css("min-height", ($(window).height()));
    }).resize();
}

function initializeFormValidator () {
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
}

function initializeBulletinSendingAndDownloading () {
    let release_id = null;
    let text = null;
    let filename = null;
    let subject = null;

    $("body").on("click", ".print", ({ currentTarget }) => {
        release_id = $(currentTarget).data("release-id");
        console.log($(currentTarget).data("name"));
        console.log($(currentTarget).data("release-id"));
        loadBulletin(release_id, EVENT_ID);
        $(".bulletin-title").text(`Early Warning Information Bulletin for ${SITE_CODE.toUpperCase()}`);
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
}

function initializeReleaseEditOnClick () {
    $("body").on("click", ".fa-edit", (data) => {
        const { currentTarget } = data;
        const release_id = $(currentTarget).data("release-id");

        $("#modalForm .form-group").removeClass("has-feedback").removeClass("has-error").removeClass("has-success");
        $("#modalForm .glyphicon.form-control-feedback").remove();

        getSpecificReleaseData(release_id)
        .done((release_data) => {
            const { data_timestamp, release_time, comments } = release_data;
            $("#data_timestamp").val(data_timestamp);
            $("#release_time").val(release_time);
            $("#comments").val(comments);
        });

        getJSONReleaseTriggers(release_id)
        .done((triggers) => {
            const lookup = {
                G: "ground", g: "ground", S: "sensor", s: "sensor", E: "eq", R: "rain", D: "od"
            };

            for (const k in lookup) {
                $(`#${lookup[k]} input`).prop("disabled", true);
                $(`#${lookup[k]}_area`).hide();
            }

            current_release.trigger_list = [];
            triggers.forEach((a) => {
                const delegate = (x, a) => {
                    if (x.includes(".od_group")) {
                        $(x).prop("disabled", false).prop("checked", parseInt(a));
                    } else $(x).val(a).prop("disabled", false);
                };
                switch (a.trigger_type) {
                    case "g": case "s":
                        $(`#trigger_${lookup[a.trigger_type]}_1`).val(a.timestamp).prop("disabled", false);
                        $(`#trigger_${lookup[a.trigger_type]}_1_info`).val(a.info).prop("disabled", false);
                        current_release.trigger_list.push([`trigger_${lookup[a.trigger_type]}_1`, a.trigger_id]);
                        break;
                    case "G": case "S":
                        $(`#trigger_${lookup[a.trigger_type]}_2`).val(a.timestamp).prop("disabled", false);
                        $(`#trigger_${lookup[a.trigger_type]}_2_info`).val(a.info).prop("disabled", false);
                        current_release.trigger_list.push([`trigger_${lookup[a.trigger_type]}_2`, a.trigger_id]);
                        break;
                    case "R": case "E": case "D":
                        $(`#trigger_${lookup[a.trigger_type]}`).val(a.timestamp).prop("disabled", false);
                        $(`#trigger_${lookup[a.trigger_type]}_info`).val(a.info).prop("disabled", false);
                        current_release.trigger_list.push([`trigger_${lookup[a.trigger_type]}`, a.trigger_id]);
                        if (a.trigger_type === "E") {
                            delegate("#magnitude", a.eq_info[0].magnitude);
                            delegate("#latitude", a.eq_info[0].latitude);
                            delegate("#longitude", a.eq_info[0].longitude);
                        } else if (a.trigger_type === "D") {
                            delegate("#reason", a.od_info[0].reason);
                            delegate(".od_group[name=llmc]", a.od_info[0].is_llmc);
                            delegate(".od_group[name=lgu]", a.od_info[0].is_lgu);
                        }
                        break;
                    default:
                        console.error("Error: Trigger type does not exist.");
                }
                $(`#${lookup[a.trigger_type]}_area`).show();
            });
        })
        .done(() => {
            $("#edit").modal("show");
        });

        /* PLEASE HELP. What is the correct implem? Above of this or below this??? */
        // getSpecificReleaseData(release_id)
        // .done((release_data) => {
        //     console.log("This is the release_data: ", release_data);
        // })
        // .done(
        //     getJSONReleaseTriggers(release_id)
        //     .done((triggers) => {
        //         console.log("This is the release_triggers: ", triggers);

        //         const lookup = {
        //             G: "ground", g: "ground", S: "sensor", s: "sensor", E: "eq", R: "rain", D: "od"
        //         };

        //         for (const k in lookup) {
        //             $(`#${lookup[k]} input`).prop("disabled", true);
        //             $(`#${lookup[k]}_area`).hide();
        //         }

        //         current_release.trigger_list = [];
        //         triggers.forEach((a) => {
        //             const delegate = (x, a) => {
        //                 if (x.includes(".od_group")) {
        //                     $(x).prop("disabled", false).prop("checked", parseInt(a));
        //                 } else $(x).val(a).prop("disabled", false);
        //             };
        //             switch (a.trigger_type) {
        //                 case "g": case "s":
        //                     $(`#trigger_${lookup[a.trigger_type]}_1`).val(a.timestamp).prop("disabled", false);
        //                     $(`#trigger_${lookup[a.trigger_type]}_1_info`).val(a.info).prop("disabled", false);
        //                     current_release.trigger_list.push([`trigger_${lookup[a.trigger_type]}_1`, a.trigger_id]);
        //                     break;
        //                 case "G": case "S":
        //                     $(`#trigger_${lookup[a.trigger_type]}_2`).val(a.timestamp).prop("disabled", false);
        //                     $(`#trigger_${lookup[a.trigger_type]}_2_info`).val(a.info).prop("disabled", false);
        //                     current_release.trigger_list.push([`trigger_${lookup[a.trigger_type]}_2`, a.trigger_id]);
        //                     break;
        //                 case "R": case "E": case "D":
        //                     $(`#trigger_${lookup[a.trigger_type]}`).val(a.timestamp).prop("disabled", false);
        //                     $(`#trigger_${lookup[a.trigger_type]}_info`).val(a.info).prop("disabled", false);
        //                     current_release.trigger_list.push([`trigger_${lookup[a.trigger_type]}`, a.trigger_id]);
        //                     if (a.trigger_type === "E") {
        //                         delegate("#magnitude", a.eq_info[0].magnitude);
        //                         delegate("#latitude", a.eq_info[0].latitude);
        //                         delegate("#longitude", a.eq_info[0].longitude);
        //                     } else if (a.trigger_type === "D") {
        //                         delegate("#reason", a.od_info[0].reason);
        //                         delegate(".od_group[name=llmc]", a.od_info[0].is_llmc);
        //                         delegate(".od_group[name=lgu]", a.od_info[0].is_lgu);
        //                     }
        //                     break;
        //                 default:
        //                     console.error("Error: Trigger type does not exist.");
        //             }
        //             $(`#${lookup[a.trigger_type]}_area`).show();
        //         });
        //     })
        // )
        // .done(() => {
        //     $("#edit").modal("show");
        // });
    });
}

function getStaffNames () {
    return $.getJSON("/../../../monitoring/getStaffNames")
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

function initializeEventDetailsOnLoad (...args) {
    const ids = ["#site-code", "#address", "#event_timeframe"];
    ids.forEach((id, index) => {
        $(id).text(args[index]);
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

function getTriggersForSpecificRelease (release_id, triggers_arr) {
    const triggers = triggers_arr.filter(data => data.release_id === release_id.toString());
    return triggers;
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

function setIOMPForEachEOS (timeline_entry, card_id) {
    const { reporter_id_mt, reporter_id_ct } = timeline_entry;
    const iomp = [["mt", reporter_id_mt], ["ct", reporter_id_ct]];
    iomp.forEach(([type, id]) => {
        const { first_name, last_name } = STAFF_LIST.find(element => id === element.id);
        $(`#card-${card_id}`).find(`.reporters > .${type}`).text(`${first_name} ${last_name}`);
    });
}

function addBuffer (type) {
    const $buffer = $("<li>", { class: "buffer" });
    const column_side = type === "narrative" ? "right" : "left";
    $(`#timeline-column-${column_side} ul.timeline`).append($buffer);
}

function adjustBufferHeight (type) {
    const column_side = type === "narrative" ? "right" : "left";
    const $column = $(`#timeline-column-${column_side} ul.timeline`);
    const $buffer = $column.find("li.buffer:last-child");
    let height = 0;

    if (column_side === "left") {
        const $prev_card = $buffer.prevAll(".timeline:first");
        let t_body_height = 0;

        if ($prev_card.length !== 0) {
            const $tbody_prev = $prev_card.find(".timeline-body");
            const $panel_prev = $prev_card.find(".timeline-panel");
            t_body_height += $tbody_prev.outerHeight(true);
            t_body_height += parseFloat($prev_card.css("margin-bottom"));
            t_body_height += parseFloat($panel_prev.css("padding-bottom"));
            t_body_height += parseFloat($panel_prev.css("border-bottom"));
        }

        let narrative_height_counter = 0;

        const $last_narrative = $("#timeline-column-right > ul > li:last-child");
        const $prev_narratives = $last_narrative.prevUntil("li.buffer").addBack();

        $prev_narratives.each((i, elem) => {
            narrative_height_counter += $(elem).outerHeight(true);
        });

        height = narrative_height_counter - t_body_height - 20 - 20;
    } else {
        let height_counter = 0;
        const $last_left_card = $("#timeline-column-left > ul > li:last-child");
        const $prev_cards = $last_left_card.prevUntil("li.buffer").addBack();
        const $last_buffer = $last_left_card.prevAll("li.buffer:first");

        let excess_height = 0;
        if ($last_buffer.height() === 0) {
            const $prev_card = $last_buffer.prevAll(".timeline:first");
            let t_body_height = 0;

            if ($prev_card.length !== 0) {
                const $tbody_prev = $prev_card.find(".timeline-body");
                const $panel_prev = $prev_card.find(".timeline-panel");
                t_body_height += $tbody_prev.outerHeight(true);
                t_body_height += parseFloat($prev_card.css("margin-bottom"));
                t_body_height += parseFloat($panel_prev.css("padding-bottom"));
                t_body_height += parseFloat($panel_prev.css("border-bottom"));
            }

            let narrative_height_counter = 0;

            const $last_child = $("#timeline-column-right > ul > li:last-child");
            const $prev_narratives = $last_child.prevUntil("li.buffer");

            $prev_narratives.each((i, elem) => {
                narrative_height_counter += $(elem).outerHeight(true);
            });

            excess_height = t_body_height - narrative_height_counter + 20 + 20;
        }

        $prev_cards.each((i, elem) => {
            let card_height;
            if (i + 1 === $prev_cards.length) {
                const $theading_prev = $(elem).find(".timeline-heading");
                const $panel_prev = $(elem).find(".timeline-panel");
                if ($theading_prev.length !== 0) {
                    card_height = $theading_prev.outerHeight(true);
                    card_height += parseFloat($panel_prev.css("padding-top"));
                    card_height += parseFloat($panel_prev.css("border-top"));
                }
            } else {
                card_height = $(elem).outerHeight(true);
            }

            height_counter += card_height;
        });

        height = height_counter + excess_height - 20 - 20;
    }

    $buffer.height(height);
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
        comments, release_id
    } = release_data;
    const qualifier = selectEwiCardQualifier(data_timestamp, validity);

    $template.find(".fa-edit").data("release-id", release_id);
    $template.find(".print").data("release-id", release_id); 
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

function getSpecificReleaseData (release_id) {
    return $.getJSON(`/../../../pubrelease/getRelease/${release_id}`)
    .catch((error) => {
        console.log(error);
    });
}

function getJSONReleaseTriggers (release_id) {
    return $.getJSON(`/../../../pubrelease/getAllEventTriggers/${EVENT_ID}/${release_id}`)
    .catch((error) => {
        console.log(error);
    });
}
