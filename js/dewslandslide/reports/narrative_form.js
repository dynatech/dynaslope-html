/****
 *
 *  Created by Kevin Dhale dela Cruz
 *  JS file for Accomplishment Report Filing Form - 
 *  Narrative Tab[reports/accomplishment_report.php]
 *  [host]/reports/accomplishment/form
 *  
****/

$(document).ready(function() 
{
	$('.timestamp_date').datetimepicker({
        format: 'YYYY-MM-DD',
        allowInputToggle: true,
        widgetPositioning: {
            horizontal: 'right',
            vertical: 'bottom'
        }
    });
    $('.timestamp_time').datetimepicker({
        format: 'HH:mm:00',
        allowInputToggle: true,
        widgetPositioning: {
            horizontal: 'right',
            vertical: 'bottom'
        }
    });

	let narrativeTable = null, narratives = [], original = [];
    let hasEdit = false;
    narrativeTable = showNarrative(narratives);

    reposition("#saveNarrativeModal");

    $('#site-list').dropdown();
    let sites = [], event_ids = [];
    $( '#site-list.dropdown-menu a' ).on( 'click', function( event )
    {
        console.log("Clicked");
        var $target = $( event.currentTarget ),
        val = $target.attr( 'data-value' ),
        event_id = $target.attr( 'data-event' ),
        $inp = $target.find( 'input' ),
        idx;

        if ( ( idx = sites.indexOf( val ) ) > -1 ) 
        {
            sites.splice( idx, 1 ); event_ids.splice(idx, 1);
            setTimeout( function() { $inp.prop( 'checked', false ) }, 0);
        } else {
            sites.push( val ); event_ids.push( event_id );
            setTimeout( function() { $inp.prop( 'checked', true ) }, 0);
        }

        $( event.target ).blur();
        var str = sites.toString();
        String.prototype.replaceAll = function(search, replacement) {
            var target = this;
            return target.replace(new RegExp(search, 'g'), replacement);
        };
        str = str.replaceAll("," , ", ");
        $("#sites").val(str);

        if( event_ids.length > 0 )
        {
            if(hasEdit)
            {
                $("#save_message, #cancel").hide();
                $("#change_message, #discard").show();
                $('#saveNarrativeModal').modal({ backdrop: 'static', keyboard: false });
                $("#saveNarrativeModal").modal("show");
            }
            else getNarratives(event_ids);
        }
        else 
        {
            narrativeTable.clear();
            narrativeTable.draw();
            hasEdit = false;
        }

        return false;
    });

    $("#clear-sites").click( function (argument) {
        if(hasEdit)
        {
            $("#save_message, #cancel").hide();
            $("#change_message, #discard").show();
            $('#saveNarrativeModal').modal({ backdrop: 'static', keyboard: false });
            $("#saveNarrativeModal").modal("show");
        }
        else {
            sites = []; event_ids = [];
            $(".site-checkbox").prop("checked", false);
            $("#sites").val("");
            hasEdit = false;
            narrativeTable.clear();
            narratives = [];
            narrativeTable.rows.add(narratives).draw();
        }
        
    });

    function getNarratives(event_ids) 
    {
        $.get( "../../accomplishment/getNarratives/", {event_ids: event_ids})
        .done( function (data) {
                let arr = JSON.parse(data);
                original = arr.slice(0);
                narratives = arr.slice(0);
                console.log(narratives);
                narrativeTable.clear();
                narrativeTable.rows.add(narratives).draw();
        });
    }

    let index_global = null, narrative_id = null;
    jQuery.validator.addMethod("isUniqueTimestamp", function(value, element, param) {
    	let timestamp = null;
    	if( $(element).prop('id') == "timestamp_time" )
    	{
    		let date = $("#timestamp_date").val();
        	timestamp = date + " " + value;
    	} else timestamp = $("#timestamp_edit").val();

        let i = narratives.map( el => el.timestamp ).indexOf(timestamp);
        if( $(element).prop("id") === 'timestamp_time' ) 
        { 
        	if( i < 0 ) return true; else false; 
        }
        else { if( i < 0 || i == index_global ) return true; else false; }
        
    }, "Add a new timestamp or edit the entry with the same timestamp to include new narrative development.");

    jQuery.validator.addMethod("noSpace", function(value, element) { 
        console.log(value[0]);
        return value.trim() != ""; 
    }, "Write a narrative before adding.");

    jQuery.validator.addMethod("hasSiteChecked", function(value, element) {
        if( $('.site-checkbox:checked').length > 0 ) {
            return true;
        } else false;
         
    }, "Please choose a site.");

    $("#narrativeForm").validate(
    {
        rules: {
            sites: {
                hasSiteChecked: true
            },
            timestamp_date: {
                required: true,
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
        errorPlacement: function ( error, element ) {

            var placement = $(element).closest('.form-group');
            //console.log(placement);
            
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
                if(element.parent().is(".datetime") || element.parent().is(".datetime")) element.next("span").css("right", "15px");
                if(element.is("select")) element.next("span").css({"top": "18px", "right": "30px"});
                if(element.is("input[type=number]")) element.next("span").css({"top": "18px", "right": "13px"});
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
            let data = $( "#narrativeForm" ).serializeArray();
            let temp = {};
            temp.narrative = $("#narrative").val();
            temp.narrative = temp.narrative.trim();
            temp.timestamp = $("#timestamp_date").val() + " " + $("#timestamp_time").val();

            $(".site-checkbox:checked").each(function (i, obj) {
                let x = jQuery.extend(true, {}, temp);
                x.event_id = $(obj).parent().data("event");
                x.name = $(obj).parent().data("value");
                narratives.push(x);
            });

            console.log("NEW", narratives);
            hasEdit = true;
            narrativeTable.clear();
            narrativeTable.rows.add(narratives).draw();
        }
    });

    function showNarrative(result) 
    {
        $.fn.dataTable.moment( 'D MMMM YYYY HH:mm:ss' );
        
        var table = $('#narrativeTable').DataTable({
            data: result,
            "columns": [
                { 
                    "data": "name",
                    "render": function (data, type, full) {
                        return data.toUpperCase();
                    },
                    className: "text-left"
                },
                { 
                    "data": "timestamp",
                    "render": function (data, type, full) {
                        return full.timestamp == null ? "N/A" : moment(full.timestamp).format("D MMMM YYYY HH:mm:ss");
                    },
                    "name": "timestamp",
                    className: "text-right"
                },
                {
                    data: "narrative"
                },
                {
                    data: "id",
                    "render": function (data, type, full) {                        
                        let x = typeof data == 'undefined' ? -1 : data;
                        return '<i class="glyphicon glyphicon-edit" aria-hidden="true"></i>&emsp;<i id='+ x +' class="glyphicon glyphicon-trash" aria-hidden="true"></i>';
                    },
                    className: "text-center"
                }
            ],
            "columnDefs": [
                { "orderable": false, "targets": [2, 3] }
            ],
            "rowCallback": function( row, data, index ) 
            {
                if( typeof data.id == "undefined" )
                    $(row).css("background-color", "rgba(0, 255, 89, 0.5)" );
                else if ( typeof data.isEdited !== "undefined" ) 
                    $(row).css("background-color", "rgba(255, 255, 51, 0.5)" );
            },
            dom: 'Bfrtip',
            "buttons": [
                {
                    className: 'btn btn-danger save',
                    text: 'Save Narratives',
                    action: function ( e, dt, node, config ) 
                    {
                        $("#save_message, #cancel").show();
                        $("#change_message, #discard").hide();
                        $("#saveNarrativeModal").modal("show");
                    }
                }
            ],
            "processing": true,
            "order" : [[1, "desc"]],
            "filter": true,
            "info": false,
            "paginate": true        
        });

        $("td").css("vertical-align", "middle");

        return table;
    }

    function delegate(self) 
    {
        let index = narrativeTable.row(self.parents("tr")).index();
        let x = narratives.slice(index, index + 1).pop();
        let temp = {};
        for (var key in x) {
            if (x.hasOwnProperty(key)) {
                temp[key] = x[key];
            }
        }
        index_global = temp.id = index;
        // console.log(temp);
        // console.log(narratives);
        for (var key in temp) {
            if (temp.hasOwnProperty(key)) {
                $("#" + key + "_edit").val(temp[key]);
            }
        }
    }

    reposition("#editModal");

    $("#narrativeTable tbody").on("click", "tr .glyphicon-trash", function (e) {
        let self = $(this);
        narrative_id = this.id;
        console.log(narrative_id);
        delegate(self);
        $(".delete-warning").show();
        $("#editModal input, #editModal textarea").prop("disabled", true);
        $("#update").hide();
        $('#editModal').modal({ backdrop: 'static', keyboard: false, show: true });
    });

    $("#delete").click(function () {
        narratives.splice(index_global, 1);
        narrativeTable.clear();
        narrativeTable.rows.add(narratives).draw();
        if( narrative_id != -1 ) {
            $.post("../../accomplishment/deleteNarrative", { narrative_id: narrative_id } )
            .fail(function(xhr, status, error) {
              let err = eval("(" + xhr.responseText + ")");
              console.log(err.Message);
            });
        }
    });

    $("#narrativeTable tbody").on("click", "tr .glyphicon-edit", function (e) {
        let self = $(this);
        delegate(self);
        $(".delete-warning").hide();
        $("#update").show();
        $("#editModal input, #editModal textarea").prop("disabled", false);
        $('#editModal').modal({ backdrop: 'static', keyboard: false, show: true });
    });

    let edit_validate = $("#editForm").validate(
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
        errorPlacement: function ( error, element ) {

            var placement = $(element).closest('.form-group');
            //console.log(placement);
            
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
                if(element.parent().is(".datetime") || element.parent().is(".datetime")) element.next("span").css("right", "15px");
                if(element.is("select")) element.next("span").css({"top": "18px", "right": "30px"});
                if(element.is("input[type=number]")) element.next("span").css({"top": "18px", "right": "13px"});
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
            let data = $( "#editForm" ).serializeArray();
            let temp = {};
            data.forEach(function (value) {
                value.name = value.name.replace("_edit", "");
                temp[value.name] = value.value == "" ? null : value.value;
            });

            console.log(temp);
            let index = temp.id;
            narratives[index].timestamp = temp.timestamp;
            narratives[index].narrative = temp.narrative;
            if(typeof narratives[index].id !== 'undefined') narratives[index].isEdited = true;
            console.log("NAR", narratives);
            $("#editModal").modal("hide");
            hasEdit = true;

            narrativeTable.clear();
            narrativeTable.rows.add(narratives).draw();
        }
    });

    $("#cancel").click(function () { edit_validate.resetForm(); })

    $("#save_narrative").click(function () 
    {
        $("#saveNarrativeModal").modal('hide');
        setTimeout(function () 
        {
            $("#loading .progress-bar").text("Saving...");
            $("#loading").modal("show");

            let data = { narratives: JSON.stringify(narratives) };
            $.ajax({
                url: "../../accomplishment/insertNarratives",
                type: "POST",
                data : data,
                success: function(result, textStatus, jqXHR)
                {
                    $('.js-loading-bar').modal('hide');
                    console.log(result);
                    setTimeout(function () 
                    {
                        reposition("#saveNarrativeSuccess");
                        $('#saveNarrativeSuccess').modal({ backdrop: 'static', keyboard: false, show: true });
                    }, 500);
                },
                error: function(xhr, status, error) {
                  var err = eval("(" + xhr.responseText + ")");
                  alert(err.Message);
                }
            });
        }, 500)
        
    });

    $(".okay, #discard").click(function (argument) {
        getNarratives(event_ids);
        hasEdit = false;
    });

});