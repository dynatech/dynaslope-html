
$(document).ready(() => {
    generateDataTables();
});

function deactivatedSensors () {
    return $.getJSON("../sensor_overview/deactivatedSensors")
    .catch((error) => {
        console.error(error);
    });
}

function deactivatedLoggers () {
    return $.getJSON("../sensor_overview/deactivatedLoggers")
    .catch((error) => {
        console.error(error);
    });
}

function loggerHealth () {
    return $.getJSON("../sensor_overview/loggerHealth")
    .catch((error) => {
        console.error(error);
    });
}

function rainHealth () {
    return $.getJSON("../sensor_overview/rainHealth")
    .catch((error) => {
        console.error(error);
    });
}

function somsHealth () {
    return $.getJSON("../sensor_overview/somsHealth")
    .catch((error) => {
        console.error(error);
    });
}

function piezoHealth () {
    return $.getJSON("../sensor_overview/piezoHealth")
    .catch((error) => {
        console.error(error);
    });
}

function generateDataTables () {
    const sensor_overview = [
        deactivatedSensors(),
        deactivatedLoggers(),
        loggerHealth(),
        rainHealth(),
        somsHealth(),
        piezoHealth()
    ];

    sensor_overview.forEach((data) => {
        data.done((value) => {
            value.forEach((val) => {
                createTables(val[0], val[1]);
            });
        });
    });
}

function createTables (data_source, table_id) {
    const table_container = $("#table-container").clone().removeAttr("id").prop("hidden", false);
    const table = $("#table-div").clone();
    const table_template = table.find("#table-template").clone().prop("hidden", false);

    if (table_id === "#deact-sensor" || table_id === "#deact-logger") {
        data_source.forEach((info) => {
            table_template.find(".removable").remove();
            table_template.find("#cheader").text("Date Deactivated");

            const table_row = table_template
            .find("#deact-row-template")
            .clone()
            .removeAttr("id")
            .prop("hidden", false);

            table_row.find("#logger-name").text(info.logger_name);
            table_row.find("#date-deactivated").text(info.date_deactivated);
            table_template.append(table_row);
        });
    } else {
        data_source.forEach((info) => {
            const table_row = table_template.find("#row-template").clone().removeAttr("id").prop("hidden", false);
            const {
                logger_name, time_delta, data_presence, last_data
            } = info;
            const lookup = [
                ["#logger-name", logger_name],
                ["#time-delta", time_delta],
                ["#data-presence", data_presence],
                ["#last-data-available", last_data]
            ];
            lookup.forEach(([element, text]) => {
                table_row.find(element).text(text);
            });
            table_template.append(table_row);
        });
    }
    table.append(table_template);
    table_container.append(table);
    $(`${table_id}`).append(table_container);
    table_template.DataTable();
}
