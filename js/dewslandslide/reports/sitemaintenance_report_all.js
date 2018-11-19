
/****
 *
 *  Created by Kevin Dhale dela Cruz
 *  JS file for Site Maintenance All Reports Table [reports/sitemaintenance_report_all.php]
 *  [host]/reports/site_maintenance/all
 *  
****/

$(document).ready(function() 
{
    let result, table;
    $.ajax ({
        url: "../../sitemaintenance/getAllReports",
        type: "GET",
        dataType: "json",
    })
    .done( function (json) {
        result = json;
        table = buildTable(result);

    });

    function buildTable(result) 
    {

        var table = $('#reportTable').DataTable({
            data: result,
            "columns": [
                {
                    data: "id", 
                    "render": function (data, type, full) {
                        return "<a href='../../reports/site_maintenance/" + full.id + "'>" + full.id + "</a>";
                    },
                    "name": 'id',
                    className: "text-center"
                },
                { 
                    "data": "site",
                    "render": function (data, type, full) {
                        return full.site.toUpperCase() + " (" + full.address + ")";
                    },
                    "name": "site"
                },
                {
                    data: "activity"
                },
                { 
                    "data": "start_date",
                    "render": function (data, type, full) {
                        var date = new Date(full.start_date);
                        return (date.getMonth() + 1) + '/' + date.getDate() + '/' +  date.getFullYear();
                    },
                    "name": "start_date",
                    className: "text-right"
                },
                { 
                    "data": "end_date",
                    "render": function (data, type, full) {
                        var date = new Date(full.end_date);
                        return (date.getMonth() + 1) + '/' + date.getDate() + '/' +  date.getFullYear();
                    },
                    "name": "end_date",
                    className: "text-right"
                }
            ],
            rowsGroup: [
                'id:name',
                'site:name',
                'start_date:name',
                'end_date:name'
            ],
            "processing": true,
            "displayLength": 25,
            "order" : [[0, "desc"]],
            "pagingType": "full_numbers",
            "initComplete": function () 
            {
                this.api().columns([2]).every( function () {
                    var column = this;
                    var select = $('<select><option value=""></option></select>')
                        .appendTo( $(column.footer()).empty() )
                        .on( 'change', function () {
                            var val = $.fn.dataTable.util.escapeRegex(
                                $(this).val()
                            );
      
                            column
                                .search( val ? '^'+val+'$' : '', true, false )
                                .draw();
                        } );
      
                    column.data().unique().sort().each( function ( d, j ) {
                        select.append( '<option value="'+d+'">'+d+'</option>' )
                    });
                });
            }
        });

        $("td").css("vertical-align", "middle");

        return table;

    }

});