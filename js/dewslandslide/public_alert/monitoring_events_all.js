
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
    .on("dp.show", (e) => {
        $(this).data("DateTimePicker").maxDate(moment().second(0));
        setTimeout(() => {
            $(".bootstrap-datetimepicker-widget").css({ left: -17 });
        }, 50);
    });
}

function initializeHistoryViewOnClick () {
    // $("#history-tab").click(() => {
    $("a[href='#history-tab']").on("shown.bs.tab", () => {
        $("#loading .progress-bar").text("Loading Events History...");
        $("#loading").modal("show");
        loadDefaultValues();
    });
}

function loadDefaultValues () {
    // Initialize default date form values
    $("#start-time").val(moment().subtract(1, "months").format("YYYY-MM-DD HH:mm:ss"));
    $("#end-time").val(moment().format("YYYY-MM-DD HH:mm:ss"));
    setTimeout(() => {
        $("#analysis-plot-btn").trigger("click");
    }, 3000);
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
    const alert_level = $("#alert-level").val();
    const start_time = $("#start-time").val();
    const end_time = $("#end-time").val();

    getEventsPerAlertLevelHistory(alert_level, start_time, end_time);
}

function getEventsPerAlertLevelHistory (alert_level, start_time, end_time) {
    $.getJSON(`../pubrelease/getEventsPerAlertLevelHistory/${alert_level}/${start_time}/${end_time}`)
    .then((data) => {
        displaySites(data);
        return data;
    })
    .done((data2) => {
        $("#loading").modal("hide");
        $("#site-count-per-alert").text(data2.length);
        setEventCountHeader(data2);
        plotPieChart();
    })
    .catch((error) => {
        // Place PMS HERE
        console.error(error);
    });
}

function displaySites (table_data) {
    $("#history-table").empty();
    history_table = $("#history-table").DataTable({
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

    if (header !== "ALL") {
        if (data.length === 1) {
            $("#event-count-header").text(`${header} EVENT`);
        } else if (data.length > 1) {
            $("#event-count-header").text(`${header} EVENTS`);
        } else {
            $("#event-count-header").text("NO EVENT");
        }
    } else {
        $("#event-count-header").text("EVENTS");
    }
}

function plotPieChart () {
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
            data: [{
                name: "Alert 0",
                y: 60,
                sliced: true,
                selected: true
            }, {
                name: "Alert 1",
                y: 25
            }, {
                name: "Alert 2",
                y: 10
            }, {
                name: "Alert 3",
                y: 5
            }]
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
    chart.setSize(450, 248);
}

/****
 *
 *  End of Monitoring Events History Script
 *
 ****/
