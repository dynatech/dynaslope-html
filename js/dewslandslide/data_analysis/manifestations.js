
/****
 *
 *	Created by Kevin Dhale dela Cruz
 *	JS file for Manifestations of Movement Table [analysis/manifestations_view.php]
 *  [host]/analysis/manifestations
 *	
****/

$(document).ready(function() 
{
    let table = buildLatestRecordPerSiteTable();
    
});

function buildLatestRecordPerSiteTable() 
{
    $('#table').DataTable({
        columnDefs : [
            { className: "text-center", "targets": [0] },
            { className: "text-right", "targets": [1, 4] },
            { className: "text-left", "targets": [2, 3] },
            {
                'sortable' : false,
                'targets' : [ 2, 3 ]
            },
        ],
        "processing": true,
        "ajax": {
            url: "/../manifestations/getLatestMOMperSite",
            dataSrc: ''
        },
        "columns": [
            { 
                "data": "site_code", 
                "render": function (data, type, full, meta) {
                    // return "<a style='color:blue' href='/../monitoring/events/" + data + "'>" + data + "</a>";
                    //if( full.ts_observance == null ) return "<strong>" + data.toUpperCase() + " (" + full.barangay + ", " + full.municipality + ", " + full.province + ")</strong>";
                    //else 
                    return "<a style='color:blue' href='/../analysis/manifestations/" + data + "'><strong>" + data.toUpperCase() + " (" + full.barangay + ", " + full.municipality + ", " + full.province + ")</strong></a>";
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
            }
        ],
        // "paginate": false,
        "pagingType": "full_numbers",
        "displayLength": 20,
        "lengthMenu": [ 10, 20, 50 ],
        "order": [[4, "desc"], [0, "asc"]],
        "rowCallback": function (row, data, index) {
            if( data.op_trigger > 0 ) {
                $(row).css("background-color", "rgba(255,0,0,0.5)");
            }
        }
        // "initComplete": function () 
        // {

        //     this.api().columns([1]).every( function () {
        //         var column = this;
        //         var select = $('<select id="site_filter"><option value="">---</option></select>')
        //             .appendTo( $(column.footer()).empty() )
        //             .on( 'change', function () {
        //                 var val = $.fn.dataTable.util.escapeRegex(
        //                     $(this).val()
        //                 );

        //                 reloadTable(val);

        //             } );
  
        //         $.get("/../pubrelease/getSites", function( data ) {
        //             data.forEach(function (x) {
        //                 select.append( '<option value="'+x.id+'">'+ x.name.toUpperCase() + " (" + x.address + ")" +'</option>' )
        //             });
        //         }, "json");

        //     });

        //     this.api().columns([2]).every( function () {
        //         var column = this;
        //         var select = $('<select id="status_filter"><option value="">---</option></select>')
        //             .appendTo( $(column.footer()).empty() )
        //             .on( 'change', function () {
        //                 var val = $.fn.dataTable.util.escapeRegex(
        //                     $(this).val()
        //                 );

        //                 reloadTable(val);

        //             } );
  
        //         ["on-going", "extended", "finished", "routine", "invalid"].forEach( function ( d ) {
        //             select.append( '<option value="'+d+'">'+d.toUpperCase()+'</option>' )
        //         });
        //     });
        // }
    });
}

function reloadTable(val) {
        table.ajax.reload();
    }
