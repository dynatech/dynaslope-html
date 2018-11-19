
/****
 *
 *  Created by Kevin Dhale dela Cruz
 *  JS file for Site Maintenance Individual Report [reports/sitemaintenance_report_individual.php]
 *  [host]/reports/site_maintenance/[id]
 *  
****/

$(document).ready(function() 
{
    $("th").each(function() {
        $(this).html("<h5><b>" + $(this).text() + "</b></h5>");
    });
    $("td").each(function() {
        $(this).html("<b>" + $(this).text() + "</b>");
    });
    $("th, td").addClass("text-center");

    var gmapJSON;
    function initialize_map() 
    {
        gmapJSON = <?php echo json_encode($map); ?>;
        var siteCoords = gmapJSON;

        var latlng = new google.maps.LatLng(siteCoords['lat'], siteCoords['lon']);

        var mapOptions = {
            center: latlng,
            zoom: 12
        };

        var map = new google.maps.Map(document.getElementById("map-canvas"), mapOptions);

        var marker = new google.maps.Marker({
                position: latlng,
                map: map,
                title: siteCoords['name'].toUpperCase() + '\n'
                    + siteCoords['address']
             });

        var siteName = siteCoords['name'].toUpperCase();
        var mark = marker;
        google.maps.event.addListener(mark, 'click', (function(name) {
            return function(){
                alert(name);
            };
        })(siteName));
        
    }   
    
    google.maps.event.addDomListener(window, 'load', initialize_map);

});