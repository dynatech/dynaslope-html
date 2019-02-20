
$(document).ready(() => {
    $("#loading").modal("show");
    getRecentEvents()
    .done((event) => {
        let datamap = FilterDataDuplicates("bymap",event)
        let datatable = FilterDataDuplicates("bytable",event)
        initialLoadMap(datamap,0);
        postRecentEventsInTable(datatable);
    })
    .catch((error) => {
        console.log(error);
    });
    

});


function FilterDataDuplicates(filterBy,event){
    const data = [];
    if (filterBy == "bytable"){
        event.map(x => data.filter(a => a.site_code == x.site_code && a.ts == x.ts).length > 0 ? 
        null : data.push(x));
    }else{
        event.map(x => data.filter(a => a.magnitude == x.magnitude && a.ts == x.ts).length > 0 ? 
        null : data.push(x));
    }

    return data
}


function initialLoadMap(data,state){
    console.log(state)
    let mymap;
    if (state == 0){
        mymap = L.map("earthquake-percentages-plot").setView(["12.8797", "121.7740"], 6);
    }else{
        mymap = L.map("earthquake-percentages-plot").setView([data[0]["eq_lat"], data[0]["eq_lon"]], 7);
    }
    
    mymap.invalidateSize()
    L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw', {
        maxZoom: 18,
        id: 'mapbox.streets'
    }).addTo(mymap);

    if (state == 1){
        L.circle([data[0]["eq_lat"], data[0]["eq_lon"]], {
            color: 'red',
            fillColor: '#f03',
            fillOpacity: 0.5,
            radius: parseInt(data[0]["critical_distance"]) * 1000
        }).addTo(mymap);
    
       
    
        for (let i = 0; i < data.length; i++) {
            if (data[0]["eq_lat"] == data[i]["eq_lat"]){
                L.marker([data[i]["latitude"], data[i]["longitude"]])
                .addTo(mymap).bindPopup(data[i]["site_code"]).openPopup();
            } 
        }
        
        L.popup()
        .setLatLng([data[0]["eq_lat"], data[0]["eq_lon"]])
        .setContent("Magnitude: " + data[0]["magnitude"])
        .openOn(mymap);
    }else{
        for (let i = 0; i < 10; i++) {
            console.log(data[i])
            L.circle([data[i]["eq_lat"], data[i]["eq_lon"]], {
                color: 'red',
                fillColor: '#f03',
                fillOpacity: 0.1,
                radius: parseInt(data[0]["critical_distance"]) * 1000
            }).addTo(mymap);

            L.marker([data[i]["eq_lat"], data[i]["eq_lon"]])
            .addTo(mymap).bindPopup(data[i]["ts"]+" Magnitude: " + data[0]["magnitude"]).openPopup();
        }
    }
    

    $("#loading").modal("hide");
    
}

function postRecentEventsInTable(table_data){
    $("#event-table").empty();
    let table = $("#event-table").DataTable({
        destroy: true,
        data: table_data,
        searching: false,
        columnDefs: [
            { "visible": false, "targets": 0 }
          ],
        rowGroup: {
            dataSrc: 'ts'
        },
        language: {
            select: {
                rows: "%d rows selected"
            }
        },
        select: true,
        order: [
            [0, "desc"]
        ],
        columns: [
            {
                data: "ts",
                title: "Date",
                display: "none"
            },
            {
                data: "magnitude",
                title: "Magnitude"
            },
            {
                data: "latitude",
                title: "Latitude"
            },
            {
                data: "longitude",
                title: "Longitude"
            },
            {
                data: "site_code",
                title: "Near By Site"
            },
        ]
    });

    processEventSelection(table, table_data);

}

function processEventSelection(table,table_data){
    $('#event-table tbody').on( 'click', 'tr', function () {
        var data = table.row(this).data();
        var filterObj = table_data.filter(function(e) {
            return e.ts == data["ts"];
          });
        $("#loading").modal("show");
        $("#earthquake-percentages-plot").remove();
        $("#map").append('<div id="earthquake-percentages-plot" style="width: 550px; height: 700px;"></div>')
        initialLoadMap(filterObj,1)
    } );
 
}




function getRecentEvents() {
    return $.getJSON("../../earthquake_scanner/getRecentEarthquakeEvent");

}

function adjustHeightOnResize() {
    $(window).resize(() => {
        const height = $(window).height();
        let final;
        if (height > 720) final = 550;
        else final = 400;
        CHART.setSize(null, final);
    });
}




