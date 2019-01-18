/****
 *
 *  Created by Kevin Dhale dela Cruz
 *  JS file for Accomplishment Report Filing Form -
 *  Narrative Tab[reports/accomplishment_report.php]
 *  [host]/reports/accomplishment/form
 *
****/

let SITES_ARR = [];
let SELECTION_ARR = [];

let NARRATIVE_TABLE = null;
let NARRATIVES_ARR = [];
let HAS_EDITS = false;

let CURRENT_NARRATIVE_INDEX = null;
let CURRENT_NARRATIVE_ID = null;

$(document).ready(() => {
    reposition("#narrative-confirmation-modal");
    reposition("#edit-modal");
    reposition("#narrative-success-modal");

    initializeFormTimestamps();
    NARRATIVE_TABLE = initializeNarrativeTable(NARRATIVES_ARR);
    initializeNarrativeTableIconsOnClick();

    initializeSiteLinkOnDropDownOnClick();
    initializeClearSitesBtnOnClick();
    initializeNarrativeForm();
    initializeEditModalForm();

    initializeDeleteNarrativeBtnOnClick();
});

function initializeFormTimestamps () {
    $(".timestamp_date").datetimepicker({
        format: "YYYY-MM-DD",
        allowInputToggle: true,
        widgetPositioning: {
            horizontal: "right",
            vertical: "bottom"
        }
    });
    $(".timestamp_time").datetimepicker({
        format: "HH:mm:00",
        allowInputToggle: true,
        widgetPositioning: {
            horizontal: "right",
            vertical: "bottom"
        }
    });
}

function initializeNarrativeTable (result) {
    $.fn.dataTable.moment("D MMMM YYYY HH:mm:ss");

    const table = $("#narrative-table").DataTable({
        data: result,
        columns: [
            {
                data: "site_code",
                render (data, type, full) {
                    return data.toUpperCase();
                },
                className: "text-left"
            },
            {
                data: "timestamp",
                render (data, type, full) {
                    return data == null ? "N/A" : moment(data).format("D MMMM YYYY HH:mm:ss");
                },
                name: "timestamp",
                className: "text-right"
            },
            {
                data: "narrative"
            },
            {
                data: "id",
                render (data, type, full) {
                    const x = typeof data === "undefined" ? -1 : data;
                    return `<i class="glyphicon glyphicon-edit" aria-hidden="true"></i>&emsp;<i id=${x} class="glyphicon glyphicon-trash" aria-hidden="true"></i>`;
                },
                className: "text-center"
            }
        ],
        columnDefs: [
            { orderable: false, targets: [2, 3] }
        ],
        rowCallback (row, data, index) {
            if (typeof data.id === "undefined") $(row).css("background-color", "rgba(0, 255, 89, 0.5)");
            else if (typeof data.isEdited !== "undefined") { $(row).css("background-color", "rgba(255, 255, 51, 0.5)"); }
        },
        dom: "Bfrtip",
        buttons: [
            {
                className: "btn btn-danger save",
                text: "Save Narratives",
                action (e, dt, node, config) {
                    $("#save_message, #cancel").show();
                    $("#change_message, #discard").hide();

                    NARRATIVES_ARR.forEach((item, i, arr) => {
                        if (item.event_id === "none") item.event_id = null;
                    });
                    const data = { narratives: JSON.stringify(NARRATIVES_ARR) };
                    insertNarratives(data);
                }
            }
        ],
        processing: true,
        order: [[1, "desc"]],
        filter: true,
        info: false,
        paginate: true
    });

    $("td").css("vertical-align", "middle");

    return table;
}

function initializeNarrativeTableIconsOnClick () {
    const $narrative_tbody = $("#narrative-table tbody");

    $narrative_tbody.on("click", "tr .glyphicon-trash", ({ currentTarget }) => {
        const self = $(currentTarget);
        CURRENT_NARRATIVE_ID = self.prop("id");
        delegate(self);

        $(".delete-warning").show();
        $("#edit-modal input, #edit-modal textarea").prop("disabled", true);
        $("#update").hide();
        $("#edit-modal").modal({ backdrop: "static", keyboard: false, show: true });
    });

    $narrative_tbody.on("click", "tr .glyphicon-edit", ({ currentTarget }) => {
        const self = $(currentTarget);
        delegate(self);

        $(".delete-warning").hide();
        $("#update").show();
        $("#edit-modal input, #edit-modal textarea").prop("disabled", false);
        $("#edit-modal").modal({ backdrop: "static", keyboard: false, show: true });
    });
}

function delegate (self) {
    const index = NARRATIVE_TABLE.row(self.parents("tr")).index();
    const x = NARRATIVES_ARR.slice(index, index + 1).pop();
    const temp = {};
    for (let key in x) {
        if (x.hasOwnProperty(key)) {
            temp[key] = x[key];
        }
    }
    CURRENT_NARRATIVE_INDEX = index;
    temp.id = index;

    for (let key in temp) {
        if (temp.hasOwnProperty(key)) {
            $(`#${key}_edit`).val(temp[key]);
        }
    }
}

function initializeSiteLinkOnDropDownOnClick () {
    String.prototype.replaceAll = function (search, replacement) {
        const target = this;
        return target.replace(new RegExp(search, "g"), replacement);
    };

    $("#site-list.dropdown-menu a").on("click", (event) => {
        const $target = $(event.currentTarget);
        const {
            value: val,
            event: event_id,
            site: site_id
        } = $target.data();
        const $inp = $target.find("input");
        const idx = SITES_ARR.indexOf(val);

        if (idx > -1) {
            SITES_ARR.splice(idx, 1);
            SELECTION_ARR.splice(idx, 1);
            setTimeout(() => { $inp.prop("checked", false); }, 0);
        } else {
            SITES_ARR.push(val);
            SELECTION_ARR.push({ event_id, site_id });
            setTimeout(() => { $inp.prop("checked", true); }, 0);
        }

        $(event.target).blur();
        let str = SITES_ARR.toString();
        str = str.replaceAll(",", ", ");
        $("#sites").val(str);

        if (SELECTION_ARR.length > 0) {
            if (HAS_EDITS) {
                $("#save_message, #cancel").hide();
                $("#change_message, #discard").show();
                $("#narrative-confirmation-modal").modal({ backdrop: "static", keyboard: false, show: true });
            } else getNarratives(SELECTION_ARR);
        } else {
            NARRATIVE_TABLE.clear();
            NARRATIVE_TABLE.draw();
            HAS_EDITS = false;
        }

        return false;
    });
}

function initializeClearSitesBtnOnClick () {
    $("#clear-sites").click(() => {
        if (HAS_EDITS) {
            $("#save_message, #cancel").hide();
            $("#change_message, #discard").show();
            $("#narrative-confirmation-modal").modal({ backdrop: "static", keyboard: false, show: true });
        } else {
            SITES_ARR = [];
            SELECTION_ARR = [];
            $(".site-checkbox").prop("checked", false);
            $("#sites").val("");
            HAS_EDITS = false;
            NARRATIVE_TABLE.clear();
            NARRATIVES_ARR = [];
            NARRATIVE_TABLE.rows.add(NARRATIVES_ARR).draw();
        }
    });
}

function getNarratives (selection_arr) {
    const event_ids = [];
    const site_ids = [];
    selection_arr.forEach(({ event_id, site_id }) => {
        event_ids.push(event_id);
        site_ids.push(site_id);
    });

    $.getJSON("../../accomplishment/getNarratives/", { event_ids, site_ids })
    .done((data) => {
        NARRATIVES_ARR = data.slice();
        NARRATIVE_TABLE.clear();
        NARRATIVE_TABLE.rows.add(NARRATIVES_ARR).draw();
    });
}

function insertNarratives (data) {
    $("#loading .progress-bar").text("Saving...");
    $("#loading").modal("show");

    $.ajax({
        url: "../../accomplishment/insertNarratives",
        type: "POST",
        data
    })
    .done((result) => {
        console.log(result);
        setTimeout(() => {
            $("#narrative-success-modal").modal({ backdrop: "static", keyboard: false, show: true });
        }, 500);
    })
    .fail(({ xhr, status, error }) => {
        const err = xhr.responseText;
        console.log(err);
        alert(err);
    })
    .always(() => {
        $("#loading").modal("hide");
    });
}

function initializeNarrativeForm () {
    jQuery.validator.addMethod("isUniqueTimestamp", (value, element, param) => {
        let timestamp = null;
        if ($(element).prop("id") === "timestamp_time") {
            const date = $("#timestamp_date").val();
            timestamp = `${date} ${value}`;
        } else timestamp = $("#timestamp_edit").val();

        const i = NARRATIVES_ARR.map(el => el.timestamp).indexOf(timestamp);
        if ($(element).prop("id") === "timestamp_time") {
            if (i < 0) return true;
            return false;
        }

        if (i < 0 || i === CURRENT_NARRATIVE_INDEX) return true;

        return false;
    }, "Add a new timestamp or edit the entry with the same timestamp to include new narrative development.");

    jQuery.validator.addMethod("noSpace", (value, element) => value.trim() !== "", "Write a narrative before adding.");

    jQuery.validator.addMethod("hasSiteChecked", (value, element) => {
        if ($(".site-checkbox:checked").length > 0) {
            return true;
        }
        return false;
    }, "Please choose a site.");

    $("#narrative-form").validate(
        {
            rules: {
                sites: {
                    hasSiteChecked: true
                },
                timestamp_date: {
                    required: true
                },
                timestamp_time: {
                    required: true,
                    isUniqueTimestamp: true
                },
                event_id: {
                    required: true
                },
                narrative: {
                    required: true,
                    noSpace: true
                }
            },
            errorPlacement (error, element) {
                var placement = $(element).closest(".form-group");
                // console.log(placement);

                if ($(element).hasClass("cbox_trigger_switch")) {
                    $("#errorLabel").append(error).show();
                } else if (placement) {
                    $(placement).append(error);
                } else {
                    error.insertAfter(placement);
                } // remove on success

                element.parents(".form-group").addClass("has-feedback");

                // Add the span element, if doesn't exists, and apply the icon classes to it.
                if (!element.next("span")[0]) {
                    if (element.parent().is(".datetime") || element.parent().is(".datetime")) element.next("span").css("right", "15px");
                    if (element.is("select")) element.next("span").css({ top: "18px", right: "30px" });
                    if (element.is("input[type=number]")) element.next("span").css({ top: "18px", right: "13px" });
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
                const temp = {};
                temp.narrative = $("#narrative").val();
                temp.narrative = temp.narrative.trim();
                temp.timestamp = `${$("#timestamp_date").val()} ${$("#timestamp_time").val()}`;

                $(".site-checkbox:checked").each((i, obj) => {
                    const {
                        event: event_id,
                        site: site_id,
                        value: site_code
                    } = $(obj).parent().data();
                    const x = {
                        ...temp,
                        event_id,
                        site_id,
                        site_code
                    };
                    NARRATIVES_ARR.push(x);
                });

                HAS_EDITS = true;
                NARRATIVE_TABLE.clear();
                NARRATIVE_TABLE.rows.add(NARRATIVES_ARR).draw();
            }
        }
    );
}

function initializeEditModalForm () {
    const edit_validate = $("#edit-narrative-form").validate(
        {
            rules: {
                timestamp_edit: {
                    required: true,
                    isUniqueTimestamp: true
                },
                narrative_edit: {
                    required: true
                }
            },
            errorPlacement (error, element) {
                var placement = $(element).closest(".form-group");
                // console.log(placement);

                if ($(element).hasClass("cbox_trigger_switch")) {
                    $("#errorLabel").append(error).show();
                } else if (placement) {
                    $(placement).append(error);
                } else {
                    error.insertAfter(placement);
                } // remove on success

                element.parents(".form-group").addClass("has-feedback");

                // Add the span element, if doesn't exists, and apply the icon classes to it.
                if (!element.next("span")[0]) {
                    if (element.parent().is(".datetime") || element.parent().is(".datetime")) element.next("span").css("right", "15px");
                    if (element.is("select")) element.next("span").css({ top: "18px", right: "30px" });
                    if (element.is("input[type=number]")) element.next("span").css({ top: "18px", right: "13px" });
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
                const data = $("#edit-narrative-form").serializeArray();
                const temp = {};
                data.forEach((value) => {
                    value.name = value.name.replace("_edit", "");
                    temp[value.name] = value.value === "" ? null : value.value;
                });

                const index = temp.id;
                NARRATIVES_ARR[index].timestamp = temp.timestamp;
                NARRATIVES_ARR[index].narrative = temp.narrative;
                if (typeof NARRATIVES_ARR[index].id !== "undefined") NARRATIVES_ARR[index].isEdited = true;
                $("#edit-modal").modal("hide");
                HAS_EDITS = true;

                NARRATIVE_TABLE.clear();
                NARRATIVE_TABLE.rows.add(NARRATIVES_ARR).draw();
            }
        }
    );

    $("#cancel").click(() => { edit_validate.resetForm(); });
}

function initializeDeleteNarrativeBtnOnClick () {
    $("#edit-modal #delete").click(() => {
        NARRATIVES_ARR.splice(CURRENT_NARRATIVE_INDEX, 1);
        NARRATIVE_TABLE.clear();
        NARRATIVE_TABLE.rows.add(NARRATIVES_ARR).draw();

        if (CURRENT_NARRATIVE_ID !== -1) {
            deleteNarratives(CURRENT_NARRATIVE_ID);
        }
    });

    $(".okay, #discard").click(() => {
        getNarratives(SELECTION_ARR);
        HAS_EDITS = false;
    });
}

function deleteNarratives (narrative_id) {
    $.post("../../accomplishment/deleteNarrative", { narrative_id })
    .done(() => {
        $("#narrative-success-modal").modal({ backdrop: "static", keyboard: false, show: true });
    })
    .fail((xhr, status, error) => {
        const err = xhr.responseText;
        console.log(err);
        alert(err);
    });
}
