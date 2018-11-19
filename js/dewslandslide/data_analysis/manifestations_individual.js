
/****
 *
 *	Created by Kevin Dhale dela Cruz
 *	JS file for Manifestations of Movement Table [analysis/manifestations_view.php]
 *  [host]/analysis/manifestations
 *	
****/

let table = null;

$(document).ready(function() 
{
    initializeTimestamps();
    table = buildLatestRecordPerSiteTable();

    $("#release-m0").click(function () {
        if(this.checked) {
            $("#release-div > .panel-body").slideDown();
            disableInput(["#observance_timestamp", "#feature_type", "#manifestation_validator"], false);
        }
        else {
            $("#release-div > .panel-body").slideUp();
            disableInput(["#observance_timestamp", "#feature_type", "#manifestation_validator"], true);
        }
    });

    $('#table tbody').on('click', 'td.details-control', function () {
        var tr = $(this).closest('tr');
        var row = table.row( tr );
 
        if ( row.child.isShown() ) {
            // This row is already open - close it
            row.child.hide();
            $(tr).find('td.details-control > i').removeClass("fa-minus-circle").addClass("fa-plus-circle")
            .css("color", "green");
        }
        else {
            // Open this row
            row.child( format(row.data()) ).show();
            $(tr).find('td.details-control > i').removeClass("fa-plus-circle").addClass("fa-minus-circle")
            .css("color", "red");
        }
    });

    $(document).on("change", "#feature_type", function () {
        let feature_type = this.value;
        let name_list = $("#feature_name").siblings().find(".feature_name_list");
        $("#feature_name").val("");

        $(name_list).find("li:not([data-value='new'])").remove();
        if( feature_type != "" && feature_type != "none" ) {
            let site_id = $(".site").data("id");
            $.get("/../../pubrelease/getFeatureNames/" + site_id + "/" + feature_type, function (data) {
                $(name_list).siblings("button").prop("disabled", false);
                data.forEach(function (data) {
                    let option = $(name_list).find("li[data-value='new']").clone()
                        .attr("data-value", data.feature_name)
                        .data("feature-id", data.feature_id);
                    let link = $(option).html();
                    let new_link = $(link).text(data.feature_name);
                    let a = $(option).html(new_link);
                    $(name_list).prepend(a);
                });
            }, "json");
            disableInput(["#reporter", "#feature_narrative", "#feature_remarks"], false);
        } else {
            $(name_list).siblings("button").prop("disabled", true);
            disableInput(["#reporter", "#feature_narrative", "#feature_remarks"], true);
            if( feature_type == "none" ) disableInput("#reporter", false);
        }
    });

    $(document).on("click", ".feature_name_list li", function () {
        let value = $(this).data("value"), id = $(this).data("feature-id");
        console.log(value, id);
        if( value == "new" ) $("#feature_name").prop("readonly", false).val("").data("feature-id", 0);
        else $("#feature_name").val(value).data("feature-id", id);
    });

    let featureTypeTest = {
        depends: function () {
            return $("#feature_type").val() !== "none" && $("#feature_type").val() !== "";
    }};

    let releaseForm = $("#releaseForm").validate(
    {
        debug: true,
        rules: {
            observance_timestamp: { required: true },
            reporter: { required: true },
            feature_narrative: { required: true },
            feature_remarks: { required: true },
            
            feature_type: { required: true },
            feature_name: { required: featureTypeTest }
        },
        messages: {
            comments: "Provide a reason to invalidate this event. If the event is not invalid and is really an end of event EWI, release it on the indicated end of validity."
        },
        errorPlacement: function ( error, element ) {

            let placement = $(element).closest('.form-group');
            if( $(element).hasClass("cbox_trigger_switch") )
            {
                $("#errorLabel").append(error).show();
            }
            else if (placement) {
                $(placement).append(error)
            } else {
                error.insertAfter(placement);
            } //remove on success 

            element.parents( ".form-group" ).addClass( "has-feedback" );

            // Add the span element, if doesn't exists, and apply the icon classes to it.
            if ( !element.next( "span" )[ 0 ] ) { 
                if( !$(element).hasClass("cbox_trigger") && !$(element).hasClass("cbox_trigger_switch") && !$(element).hasClass("cbox_nd") 
                    && !$(element).hasClass("cbox_trigger_nd") && $(element).attr("name") != "routine_sites[]" )
                    $( "<span class='glyphicon glyphicon-remove form-control-feedback' style='top:18px; right:22px;'></span>" ).insertAfter( element );
                if(element.parent().is(".datetime") || element.parent().is(".datetime")) element.next("span").css("right", "15px");
                if(element.is("select") || element.is("textarea")) element.next("span").css({"top": "25px", "right": "25px"});
                if(element.attr("id") == "reason") element.next("span").css({"top": "0", "right": "0"});
                if(element.is("#reporter")) element.next("span").css({"top": "25px", "right": "15px"});
                if(element.is("#feature_name")) element.next("span").css({"top": "0", "right": "34px"});
                if(element.is("input[type=number]")) element.next("span").css({"top": "24px", "right": "0px"});
            }
        },
        success: function ( label, element ) {
            // Add the span element, if doesn't exists, and apply the icon classes to it.
            if ( !$( element ).next( "span" )) {
                $( "<span class='glyphicon glyphicon-ok form-control-feedback' style='top:0px; right:37px;'></span>" ).insertAfter( $( element ) );
            }

            $(element).closest(".form-group").children("label.error").remove();
        },
        highlight: function ( element, errorClass, validClass ) {
            $( element ).parents( ".form-group" ).addClass( "has-error" ).removeClass( "has-success" );
            if($(element).parent().is(".datetime") || $(element).parent().is(".time")) {
                $( element ).nextAll( "span.glyphicon" ).remove();
                $( "<span class='glyphicon glyphicon-remove form-control-feedback' style='top:0px; right:37px;'></span>" ).insertAfter( $( element ) );
            }
            else $( element ).next( "span" ).addClass( "glyphicon-remove" ).removeClass( "glyphicon-ok" );
        },
        unhighlight: function ( element, errorClass, validClass ) {
            $( element ).parents( ".form-group" ).addClass( "has-success" ).removeClass( "has-error" );
            if($(element).parent().is(".datetime") || $(element).parent().is(".time")) {
                $( element ).nextAll( "span.glyphicon" ).remove();
                $( "<span class='glyphicon glyphicon-ok form-control-feedback' style='top:0px; right:37px;'></span>" ).insertAfter( $( element ) );
            }
            else $( element ).next( "span" ).addClass( "glyphicon-ok" ).removeClass( "glyphicon-remove" );
        },
        submitHandler: function (form) 
        {
            let data = $( "#releaseForm" ).serializeArray();
            let temp = {};
            data.forEach(function (value) { temp[value.name] = value.value == "" ? null : value.value; });
            temp.site_id = $(".site").data("id");
            temp.feature_name = temp.feature_name !== "" ? temp.feature_name : null;
            temp.manifestation_validator = temp.manifestation_validator !== "" ? temp.manifestation_validator : null;

            console.log(temp);
            $("#loading .progress-bar").text("Submitting M0 manifestation feature... Please wait.");
            reposition("#loading");
            $("#loading").modal("show");

            $.ajax({
                url: "/../manifestations/saveM0Manifestation",
                type: "POST",
                data : temp,
                success: function(result, textStatus, jqXHR)
                {
                    $("#loading").modal("hide");
                    $("#loading .progress-bar").text("Loading...");
                    console.log(result);
                    setTimeout(function () 
                    {
                        reposition("#view_modal");
                        $('#view_modal').modal('show');
                    }, 1000);
                },
                error: function(xhr, status, error) {
                  var err = eval("(" + xhr.responseText + ")");
                  alert(err.Message);
                }
            });
        }
    });

});

/*******************************************
 * 
 *           Initialize Timestamps
 *  
*******************************************/
function initializeTimestamps()
{
    $('.datetime').datetimepicker({
        format: 'YYYY-MM-DD HH:mm:00',
        allowInputToggle: true,
        widgetPositioning: {
            horizontal: 'right',
            vertical: 'bottom'
        }
    })
    .on('dp.show', function (e) {
        $(this).data("DateTimePicker").maxDate(moment().second(0));
    });
    
    $('.time').datetimepicker({
        format: 'HH:mm:00',
        allowInputToggle: true,
        widgetPositioning: {
            horizontal: 'right',
            vertical: 'bottom'
        }
    });
}

function buildLatestRecordPerSiteTable() 
{
    let site_code = $(".site").html().toLowerCase();
    let table = $('#table').DataTable({
        columnDefs : [
            { className: "text-right", "targets": [1, 4] },
            { className: "text-left", "targets": [2, 3] },
            { className: "text-center", "targets": [0, 5] },
            {
                'sortable' : false,
                'targets' : [ 2, 3 ]
            },
        ],
        "processing": true,
        "serverSide": true,
        "ajax": {
            "url": "/../manifestations/getAllMOMforASite/" + site_code,
            "type": "POST",
            "data": function(data) {
                let feature_type = null, site = null;
                if( $("#feature_type_filter").val() != "" && typeof $("#feature_type_filter").val() != "undefined" ) 
                    feature_type = $("#feature_type_filter").val();
                if( $("#site_filter").val() != "" && typeof $("#site_filter").val() != "undefined") 
                    site = $("#site_filter").val();

                data.extra_filter = {
                    hasFilter: feature_type !== null || site !== null,
                    filterList : {
                        feature_type: feature_type,
                        site: site
                    }
                }
            }
        },
        "columns": [
            { 
                "data": "manifestation_id", 
                "render": function (data, type, full, meta) {
                    if( full.event_id == null ) return data;
                    else return "<a style='color:blue' href='/../monitoring/events/" + full.event_id + "/" + full.release_id + "'>" + data + "</a>";
                }
            },
            {
                "data": "ts_observance",
                "render": function (data, type, full, meta) {
                    if( data == null ) return "-";
                    else return moment(data).format("D MMMM YYYY, h:mm A");
                }
            },
            { 
                "data": "feature_type",
                "render": function (data, type, full, meta) {
                    if( data == null ) return "-";
                    else return data[0].toUpperCase() + data.slice(1);
                }
            },
            {
                "data": "feature_name",
                "render": function (data, type, full, meta) {
                    if( data == null ) return "-";
                    else return data;
                }
            },
            {
                "data": "op_trigger",
                "render": function (data, type, full, meta) {
                    if( data == null ) return "-";
                    else return data;
                }
            },
            {
                "className": 'text-center details-control',
                "orderable": false,
                "data": null,
                "defaultContent": '',
                "render": function () {
                    return '<i class="fa fa-plus-circle" aria-hidden="true" style="color:green;"></i>';
                },
                width:"15px"
            }
        ],
        // "paginate": false,
        "pagingType": "full_numbers",
        "displayLength": 20,
        "lengthMenu": [ 10, 20, 50 ],
        "order": [[1, "desc"]],
        "rowCallback": function (row, data, index) {
            if( data.op_trigger > 0 ) {
                $(row).css("background-color", "rgba(255,0,0,0.5)");
            }
        },
        "initComplete": function () 
        {

            this.api().columns([2]).every( function () {
                var column = this;
                var select = $('<select id="feature_type_filter"><option value="">---</option></select>')
                    .appendTo( $(column.footer()).empty() )
                    .on( 'change', function () {
                        var val = $.fn.dataTable.util.escapeRegex(
                            $(this).val()
                        );
                        reloadTable(val);
                    });
  
                $.get("/../manifestations/getDistinctFeatureTypes", function( data ) {
                    data.forEach(function (x) {
                        select.append( '<option value="'+x.feature_type+'">'+ x.feature_type[0].toUpperCase() + x.feature_type.slice(1) +'</option>' )
                    });
                }, "json");
            });

            /*this.api().columns([3]).every( function () {
                var column = this;
                var select = $('<select id="feature_name_filter"><option value="">---</option></select>')
                    .appendTo( $(column.footer()).empty() )
                    .on( 'change', function () {
                        var val = $.fn.dataTable.util.escapeRegex(
                            $(this).val()
                        );
                        reloadTable(val);
                    });
  
                column.data().unique().sort().each( function ( d, j ) {
                    select.append( '<option value="'+d+'">'+d+'</option>' )
                });
            });*/
        }
    });

    return table;
}

function reloadTable() 
{
    table.ajax.reload();
}

/* Formatting function for row details - modify as you need */
function format ( d ) {
    // `d` is the original data object for the row
    return '<table class="table">'+
        '<tr>'+
            '<td><strong>Reporter:</strong></td>'+
            '<td>'+d.reporter+'</td>'+
        '</tr>'+
        '<tr>'+
            '<td><strong>Narrative:</strong></td>'+
            '<td>'+d.narrative+'</td>'+
        '</tr>'+
        '<tr>'+
            '<td><strong>Remarks:</strong></td>'+
            '<td>'+d.remarks+'</td>'+
        '</tr>'+
        '<tr>'+
            '<td><strong>Validated by:</strong></td>'+
            '<td>'+d.first_name+' '+d.last_name+'</td>'+
        '</tr>'+
    '</table>';
}

function disableInput(input, toggleInput) 
{
    if( Array.isArray(input) )
    {
        input.forEach(function (selector) {
            $(selector).prop("disabled", toggleInput);
        });
    } else 
    {
        $(input).prop("disabled", toggleInput);
    }
}
