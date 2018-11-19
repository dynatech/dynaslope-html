
/****
 *
 *  Created by Kevin Dhale dela Cruz
 *  JS file for Site Maintenance Report Filing Form [reports/sitemaintenance_report.php]
 *  [host]/reports/site_maintenance/form
 *  
****/

$(document).ready(function() 
{
    /*** Initialize Date/Time Input Fields ***/
    $(function () {
        $('.fieldWorkStart').datetimepicker({
            format: 'YYYY-MM-DD',
            allowInputToggle: true,
            widgetPositioning: {
                horizontal: 'right'
            }
        });
        $('.fieldWorkEnd').datetimepicker({
            format: 'YYYY-MM-DD',
            allowInputToggle: true,
            widgetPositioning: {
                horizontal: 'right'
            },
            useCurrent: false //Important! See issue #1075
        });
        $(".fieldWorkStart").on("dp.change", function (e) {
            $('.fieldWorkEnd').data("DateTimePicker").minDate(e.date);
        });
        $(".fieldWorkEnd").on("dp.change", function (e) {
            $('.fieldWorkStart').data("DateTimePicker").maxDate(e.date);
        });
    });

    let maintenanceForm = null;

    /**
     * Activity Area
    **/
    let activiyList = null;
    $.get("../../sitemaintenance/getActivity", function (a) {
        activityList = a;
    }, "json")

    $("#activity").on("change", function () {
        let value = $(this).val();
        for(i = 0; i < activityList.length; i++) {
            if ( value === "") {
                $("#description-well").hide();
            }
            else if (activityList[i].activity === value ) {
                $("#description").html(activityList[i].description);
                $("#description-well").show();
            }
        }
    });


    /*
     * Objects Area
     */
    objectList = ["Rain Gauge", "GSM Clock", "Sensor Column", "Solar Panel", "SD Card", "ARQ", "Battery", "Others (Type/Append on text field)"];
    populateObject(objectList);

    function populateObject(objectList)
    {
        for (var i = 0; i < objectList.length; i++) 
        {
            str = '<li><a href="#" class="small" tabIndex="-1" data-value="';
            str += objectList[i];
            str += '"><input type="checkbox"/>&nbsp;'
            str += objectList[i] + '</a></li>';
            $("#objectList").append(str);
        }
    }

    var options = [];

    $('#objectButton').dropdown();

    $( '#objectList.dropdown-menu a' ).on( 'click', function( event )
    {
        console.log("Clicked");
        var $target = $( event.currentTarget ),
        val = $target.attr( 'data-value' ),
        $inp = $target.find( 'input' ),
        idx;

        if ( ( idx = options.indexOf( val ) ) > -1 ) 
        {
            options.splice( idx, 1 );
            setTimeout( function() { $inp.prop( 'checked', false ) }, 0);
        } else {
            if (val == "Others (Type/Append on text field)" && ($inp.prop('checked') == false))
            {
                $("#object").prop("readonly", false);
                var strLength= $("#object").val().length;
                $("#object").focus();
                $("#object")[0].setSelectionRange(strLength, strLength);
                $("#object").after('<em class="help-block ignore" style="margin-top:40px; margin-bottom:0;">Observe proper spacing (space after comma) and capitalization.</em>');
                $("#object").siblings(".input-group-btn").css("bottom", "17px");
                setTimeout( function() { $inp.prop( 'checked', true ) }, 0);
            } else if (val == "Others (Type/Append on text field)" && $inp.is(':checked')) {
                $("#object").val('');
                $("#object").prop("readonly", true);
                $("#object").siblings("em").remove();
                $("#object").siblings(".input-group-btn").css("bottom", "0");
                setTimeout( function() { $inp.prop( 'checked', false ) }, 0);
            } else {
                options.push( val );
                setTimeout( function() { $inp.prop( 'checked', true ) }, 0);
            }
        }

        $( event.target ).blur();
        var str = options.toString();
        String.prototype.replaceAll = function(search, replacement) {
            var target = this;
            return target.replace(new RegExp(search, 'g'), replacement);
        };
        str = str.replaceAll("," , ", ")
        $("#object").val(str);
        validate();
        $("#object").focusout(validate);
        return false;
    });


    /**
     * Activity - Objects Table
    **/
    function Entry(activity, object, remarks) 
    {
        this.activity = activity;
        this.object = object;
        this.remarks = remarks;
    }


    var entry = new Entry("-", "-", "-", "-");
    var rowList = [];
    alterTable(entry, 0);
    $("#addRow").click(checkData);


    function checkData() 
    {
        var newEntry = new Entry();

        newEntry.activity = $("#activity").val();
        newEntry.object = $("#object").val();
        if ($("#remarks").val() != "") newEntry.remarks = $("#remarks").val();
        else newEntry.remarks = "No remarks";

        for (var i = 0; i < rowList.length; i++) {
            if( newEntry.activity == rowList[i].activity )
            {
                rowList[i].object = newEntry.object;
                rowList[i].remarks = newEntry.remarks;
                buildTable();
                return;
            }
        }
        addRow(newEntry);
    }

    function addRow(newEntry) 
    {
        rowList.push(newEntry);
        buildTable();
    }

    function buildTable() 
    {
        $("#activityTable > tbody").html("");
        for (var i = 0; i < rowList.length; i++) {
            alterTable(rowList[i], i);
        }
    }

    function alterTable(obj, i) 
    {
        $("#activityTable > tbody:last-child")
            .append( "<tr row=" + i +">" +
                ("<td>" + obj.activity + "</td>") +
                ("<td>" + obj.object + "</td>") +
                ("<td>" + obj.remarks + "</td>") +
                ('<td><span class="glyphicon glyphicon-trash" onclick="deleteRow(' + i + ')"></span></td>') +
                "</tr>");

        if(obj.activity == "-") 
        { 
            $(".glyphicon-trash").removeAttr("onclick");
            validate();
        }
        $("th, td").css("text-align", "center");
    }

    function deleteRow(number) 
    {
        rowList.splice(number, 1);
        buildTable();

        if(rowList.length == 0) alterTable(entry, 0);
    }

    $('#activity').change(validate);
    validate();

    function validate() 
    {
        if(isInputAvailable("#activity") && isInputAvailable("#object")) {
            changeButton("#addRow", "#2aabd2", false);
        } else {
            changeButton("#addRow", "rgba(255,0,0,0.4)", true);
        }

    }

    function isInputAvailable(id) 
    {
        if ( $(id).val() == "" || $(id).val() == "None" ||  !($.trim($(id).val())) )
        {
            return false;
        }
        else { return true; }
    }

    function changeButton(element, color, disabledStatus) 
    {
        $(element).css("background-color", color);
        $(element).css("border-color", color);
        $(element).prop("disabled", disabledStatus);
    }


    /**
     * Staff Involved Area
    **/

    let staffList = [];
    $("#addStaff").click(function () {
        let staff = $("#staff option:selected").text();
        let staff_id = $("#staff").val();

        if( staffList.length == 0 ) $("#staffTable tr[value=none]").remove();

        if( staffList.indexOf(staff_id) == -1 )
        {
            str = '<tr class="text-center" value="' + staff_id + '"><td>' + staff + '</td><td style="vertical-align: middle; text-align: center;"><span class="glyphicon glyphicon-trash" ></span></td></tr>';
            $("#staffTable tbody").append(str);
            staffList.push(staff_id);
        }

        $("#staff").valid();
        
    });

    $("#staffTable").on("click", ".glyphicon-trash", function () {
        let x = $(this).parents('tr');
        let id = x.attr("value");
        x.remove();

        let i = staffList.indexOf(x);
        staffList.splice(i, 1);

        if(staffList.length == 0) {
            str = '<tr value="none"><td class="text-center"> - </td><td class="text-center"> - </td></tr>';
            $("#staffTable tbody").append(str);
        }
    });


    /**
     * VALIDATION AREA
    **/

    jQuery.validator.addMethod("hasStaff", function(value, element, param) {
        return staffList.length !== 0;
    }, "");

    maintenanceForm = $("#maintenanceForm").validate(
    {
        ignore: ".ignore",
        rules: {
            site: {
                required: true
            },
            remarks:{
                required: true
            },
            fieldWorkStart: "required",
            fieldWorkEnd: "required",
            activity: {
                required: true
            },
            staff: {
                required: true,
                "hasStaff": true
            },
            object: "required"
        },
        errorElement: "em",
        errorPlacement: function ( error, element ) {

            element.parents( ".form-group" ).addClass( "has-feedback" );

            // Add the span element, if doesn't exists, and apply the icon classes to it.
            if ( !element.next( "span" )[ 0 ] ) { 
                $( "<span class='glyphicon glyphicon-remove form-control-feedback'></span>" ).insertAfter( element );
                if( element.parent().is(".datetime") || element.parent().is(".datetime")) element.next("span").css("right", "15px");
                if( element.is("select") ) element.next("span").css({"top": "24px", "right": "25px"});
                if( element.is("textarea") ) element.next("span").css({"top": "25px", "right": "14px"});
                if(element[0].id == "object" ) element.next("span").css({"top": 0, "right": "30px"});

            }
        },
        success: function ( label, element ) {
            // Add the span element, if doesn't exists, and apply the icon classes to it.
            if ( !$( element ).next( "span" )) {
                $( "<span class='glyphicon glyphicon-ok form-control-feedback' style='top:19px; right:15px;'></span>" ).insertAfter( $( element ) );
            }
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
        submitHandler: function (form) {

            if (rowList.length == 0) {
                var newEntry = new Entry();
                newEntry.activity = $("#activity").val();
                newEntry.object = $("#object").val();
                if ($("#remarks").val() != "") newEntry.remarks = $("#remarks").val();
                else newEntry.remarks = "No remarks";
                rowList.push(newEntry);
            }

            let formData = 
            {
                start_date: $("#fieldWorkStart").val(),
                end_date: $("#fieldWorkEnd").val(),
                site: $("#site").val(),
                staff: staffList,
                activitiesAndObjects: rowList
            };

            console.log(formData);

            $("#myModal").modal({backdrop: "static", show: false});

            $.ajax({
                url: "../../sitemaintenance/insertData",
                type: "POST",
                data : formData,
                success: function(id, textStatus, jqXHR)
                {
                    $("#viewEntry").attr("href", "../../reports/site_maintenance/" + id);
                    $("#returnHome").attr("href", "../../home");
                    reposition("#myModal");
                    $("#myModal").modal("show");

                    console.log(id);
                },
                error: function(xhr, status, error) {
                    var err = eval("(" + xhr.responseText + ")");
                    alert(err.Message);
                }     
            });
        }
    });
});