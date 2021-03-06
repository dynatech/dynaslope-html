
/****
 *  File Created by Kevin Dhale dela Cruz
 *  JS file for Monitoring Events Table [public_alert/monitoring_events_all.php]
 *  [host]/public_alert/monitoring_events
 ****/

$(document).ready(() => {
    // Initializers
    initializeCurrentAlertsTable();
    initializeHistoryViewOnClick();
    initializeAnalysisPlotButtonOnClick();
    initializeTimestamps();
});

function initializeCurrentAlertsTable () {
    const table = $("#table").DataTable({
        columnDefs: [
            { className: "text-right", targets: [4, 5] },
            { className: "text-left", targets: [1, 2, 3] },
            {
                sortable: false,
                targets: [1, 2, 3]
            }
        ],
        processing: true,
        serverSide: true,
        ajax: {
            url: "/../pubrelease/getAllEventsAsync",
            type: "POST",
            data: (data) => {
                let status = null;
                let site = null;
                if ($("#status_filter").val() !== "" && typeof $("#status_filter").val() !== "undefined") status = $("#status_filter").val();
                if ($("#site_filter").val() !== "" && typeof $("#site_filter").val() !== "undefined") site = $("#site_filter").val();

                data.extra_filter = {
                    hasFilter: status !== null || site !== null,
                    status,
                    site
                };
            }
        },
        columns: [
            {
                data: "event_id",
                render (data, type, full, meta) {
                    return `<a href='/../monitoring/events/${data}'>${data} <span class="fa fa-link"></span></a>`;
                }
            },
            {
                data: "site_code",
                render (data, type, full, meta) {
                    return `${data.toUpperCase()} (${full.barangay}, ${full.municipality}, ${full.province})`;
                }
            },
            {
                data: "status",
                render (data, type, full, meta) {
                    return data.toUpperCase();
                }
            },
            { data: "internal_alert_level" },
            {
                data: "event_start",
                render (data, type, full, meta) {
                    return moment(data).format("D MMMM YYYY, h:mm A");
                }
            },
            {
                data: "validity",
                render (data, type, full, meta) {
                    if (data == null) return "-";
                    return moment(data).format("D MMMM YYYY, h:mm A");
                }
            }
        ],
        pagingType: "full_numbers",
        displayLength: 20,
        lengthMenu: [10, 20, 50],
        order: [[0, "desc"]],
        rowCallback: (row, data, index) => {
            const { status, internal_alert_level } = data;
            let css = `alert-${status}`;

            if (status === "on-going") {
                const public_alert = internal_alert_level.substr(0, 2);
                let alert;
                if (public_alert === "ND") alert = 1;
                else alert = public_alert.substr(1);
                css = `alert-${alert}`;
            }

            $(row).addClass(css);
        },
        initComplete ({ oInstance: instance }) {
            const column_1 = instance.api().columns([1]);
            const $select = $("<select><option value=''>---</option></select>");

            const $select_1 = $select.clone().prop("id", "site_filter");
            $select_1.appendTo($(column_1.footer()).empty())
            .on("change", ({ target }) => {
                const val = $.fn.dataTable.util.escapeRegex($(target).val());
                reloadTable(val);
            });

            $.get("/../pubrelease/getSites", (data) => {
                data.forEach((x) => {
                    $select_1.append(`<option value="${x.site_id}">${x.site_code.toUpperCase()} (${x.address})</option>`);
                });
            }, "json");

            const column_2 = instance.api().columns([2]);
            const $select_2 = $select.clone().prop("id", "status_filter");
            $select_2.appendTo($(column_2.footer()).empty())
            .on("change", ({ target }) => {
                const val = $.fn.dataTable.util.escapeRegex($(target).val());
                reloadTable(val);
            });

            ["on-going", "extended", "finished", "routine", "invalid"].forEach((d) => {
                $select_2.append(`<option value="${d}">${d.toUpperCase()}</option>`);
            });
        }
    });

    function reloadTable (val) {
        table.ajax.reload();
    }
}

/****
 *  JavaScripts to handle events in Monitoring Events History
 *
 *  @author John Louie Nepomuceno, 2018
 ****/

function initializeTimestamps () {
    $(".datetime").datetimepicker({
        format: "YYYY-MM-DD HH:mm:00",
        allowInputToggle: true,
        widgetPositioning: {
            horizontal: "right",
            vertical: "bottom"
        }
    })
    .on("dp.show", ({ currentTarget, delegateTarget }) => {
        // console.log("e", e);
        // console.log("This", $(this));
        // $(this).data("DateTimePicker").maxDate(moment().second(0));

        console.log("currentTarget", $(currentTarget));
        $(currentTarget).data("DateTimePicker").maxDate(moment().second(0));
        setTimeout(() => {
            $(".bootstrap-datetimepicker-widget").css({ left: -17 });
        }, 50);
    });
}

function initializeHistoryViewOnClick () {
    const $history_tab = $("a[href='#history-tab']");

    $history_tab.on("shown.bs.tab", () => {
        const { is_loaded } = $history_tab.data();
        if (typeof is_loaded === "undefined") {
            $("#loading .progress-bar").text("Loading Events History...");
            $("#loading").modal("show");
            loadDefaults();
        }
        $history_tab.data("is_loaded", true);
    });
}

function loadDefaults () {
    // Initialize default date form values
    $("#start-time").val(moment().subtract(1, "months").format("YYYY-MM-DD HH:mm:ss"));
    $("#end-time").val(moment().format("YYYY-MM-DD HH:mm:ss"));

    // Initialize Panel Size
    const panelHeight = $(".filters-div").height();
    $(".chart-div").height(panelHeight);
    $(".alert-count-div").height(panelHeight);

    initializeSiteSelection();

    setTimeout(() => {
        $("#analysis-plot-btn").trigger("click");
    }, 3000);
}

function initializeSiteSelection () {
    $.getJSON("../pubrelease/getSites")
    .then((data) => {
        data.forEach((row, index) => {
            // console.log(index, row);
            $("#site-code").append($("<option></option>").attr("value", row.site_code).text(`${row.site_code.toUpperCase()} (${row.address})`));
        });
    });
}

function initializeAnalysisPlotButtonOnClick () {
    $("#analysis-plot-btn").click(({ currentTarget }) => {
    // $("#alert-level").change(({ currentTarget }) => {
        $("#loading .progress-bar").text("Loading Events History...");
        $("#loading").modal("show");
        prepareFilters();
    });
}

function prepareFilters () {
    const site_selected = $("#site-code").val();
    const alert_level = $("#alert-level").val();
    const start_time = $("#start-time").val();
    const end_time = $("#end-time").val();

    // getEventsPerAlertLevelHistory(alert_level, start_time, end_time);
    getEventsBasedOnDate(site_selected, alert_level, start_time, end_time);
}

// function getEventsPerAlertLevelHistory (alert_level, start_time, end_time) {
//     $.getJSON(`../pubrelease/getEventsPerAlertLevelHistory/${alert_level}/${start_time}/${end_time}`)
//     .then((data) => {
//         displaySites(data);
//         return data;
//     })
//     .done((data2) => {
//         $("#loading").modal("hide");
//         $("#site-count-per-alert").text(data2.length);
//         setEventCountHeader(data2);
//         plotPieChart();
//     })
//     .catch((error) => {
//         // Place PMS HERE
//         console.error(error);
//     });
// }

function getEventsBasedOnDate (site_selected, alert_level, start_time, end_time) {
    $.getJSON(`../pubrelease/getEventsBasedOnDate/${start_time}/${end_time}`)
    .then((data) => {
        const filtered_data = filterData(site_selected, data);
        return filtered_data;
    })
    .then((filtered_data) => {
        let table_data = "";
        switch (alert_level) {
            case "all":
                table_data = filtered_data.all;
                break;
            case "A1":
                table_data = filtered_data.alert_1;
                break;
            case "A2":
                table_data = filtered_data.alert_2;
                break;
            case "A3":
                table_data = filtered_data.alert_3;
                break;
            default:
                console.error("Error! Undefined alert level.");
        }
        displaySites(table_data);
        setEventCountHeader(table_data);
        return filtered_data;
    })
    .done((plot_data) => {
        const {
            all, alert_1,
            alert_2, alert_3
        } = plot_data;

        let pie_data = [];
        if (all.length > 0) {
            pie_data = [{
                name: "Alert 1",
                y: alert_1.length,
                color: "rgba(252, 199, 17, 0.5)"
            }, {
                name: "Alert 2",
                y: alert_2.length,
                color: "rgba(248, 153, 29, 0.7)"
            }, {
                name: "Alert 3",
                y: alert_3.length,
                color: "rgba(201, 48, 44, 0.5)"
            }];
        }

        plotPieChart(pie_data);
        $("#loading").modal("hide");
    })
    .catch((error) => {
        // Place PMS HERE
        console.error(error);
    });
}

function filterData (site, data) {
    let temp = data;
    if (site !== "") {
        temp = data.filter(({ site_code }) => site_code === site);
    }

    const a1 = temp.filter(({ public_alert_level }) => {
        let pal = public_alert_level;
        if (public_alert_level === "ND") pal = "A1";

        return pal === "A1";
    });

    const a2 = temp.filter(({ public_alert_level }) => public_alert_level === "A2");

    const a3 = temp.filter(({ public_alert_level }) => public_alert_level === "A3");

    const filtered = {
        all: temp,
        alert_1: a1,
        alert_2: a2,
        alert_3: a3
    };

    return filtered;
}

function displaySites (table_data) {
    $("#history-table").empty();
    const history_table = $("#history-table").DataTable({
        destroy: true,
        data: table_data,
        autoWidth: false,
        columns: [
            {
                data: "event_id",
                title: "Event ID",
                render (data, type, full, meta) {
                    return `<a href='/../monitoring/events/${data}'>${data} <span class="fa fa-link"></span></a>`;
                }
            },
            {
                data: "site_code",
                title: "Site Code",
                render (data, type, full, meta) {
                    return `${data.toUpperCase()}`;
                }
            },
            {
                data: "public_alert_level",
                title: "Public Alert"
            },
            {
                data: "internal_alert_level",
                title: "Internal Alert Level"
            },
            {
                data: "data_timestamp",
                title: "Data Timestamp"
            }
        ]
    });
}

function setEventCountHeader (data) {
    const header = $("#alert-level option:selected").text();
    $("#site-count-per-alert").text(data.length);

    if (header !== "ALL") {
        if (data.length === 1) {
            $("#event-count-header").text(`${header} Event`);
        } else if (data.length > 1) {
            $("#event-count-header").text(`${header} Events`);
        } else {
            $("#event-count-header").text(`No ${header} Event`);
        }
    } else {
        $("#event-count-header").text("Events");
    }
}

function plotPieChart (chart_data) {

    var chart = Highcharts.chart("pie-chart-container", {
        chart: {
            plotBackgroundColor: null,
            plotBorderWidth: null,
            plotShadow: false,
            type: "pie"
        },
        title: {
            text: ""
        },
        tooltip: {
            pointFormat: "{series.name}: <b>{point.percentage:.1f}%</b>"
        },
        plotOptions: {
            pie: {
                allowPointSelect: true,
                cursor: "pointer",
                dataLabels: {
                    enabled: true,
                    format: "<b>{point.name}</b>: {point.percentage:.1f} %",
                    style: {
                        color: (Highcharts.theme && Highcharts.theme.contrastTextColor) || "black"
                    }
                }
            }
        },
        series: [{
            name: "Public Alert",
            colorByPoint: true,
            data: chart_data
        }],
        responsive: {
            rules: [{
                condition: {
                    maxWidth: 500
                },
                chartOptions: {
                    legend: {
                        align: "center",
                        verticalAlign: "bottom",
                        layout: "horizontal"
                    },
                    yAxis: {
                        labels: {
                            align: "left",
                            x: 0,
                            y: -5
                        },
                        title: {
                            text: null
                        }
                    },
                    subtitle: {
                        text: null
                    },
                    credits: {
                        enabled: false
                    }
                }
            }]
        }
    });
    chart.setSize(450, 300);
}

/****
 *
 *  End of Monitoring Events History Script
 *
 ****/
