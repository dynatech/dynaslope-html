
$(document).ready(() => {
    initializeColumnsOnClick()
});

function initializeColumnsOnClick(){
	$('#subsurface_column').on('change', function() {
		const selected_column = this.value;
		const input = {
			column: selected_column,
			start_date: getStartDate("rainfall"),
			end_date: $("#data_timestamp").val()
        };
        console.log(input);
		getPlotDataForSubsurfaceColumn(input);
		createSubsurfaceContainer();
	});
}

function getSiteColumn (site_code) {
    return $.getJSON(`../subsurface_column/getSiteSubsurfaceColumns/${site_code}`)
    .catch(err => err);
}

function createSiteColumns (sources){
	$subsurface_column = $("#subsurface_column");
	$subsurface_column.empty();
	$subsurface_column.append('<option>Select Column</option>');
    sources.forEach(({ name }) => {
        const txt = name.toUpperCase();
        $subsurface_column.append('<option value="'+name+'">'+txt+'</option>');
    });
}

function getPlotDataForSubsurfaceColumn({column, start_date, end_date}) {
	return $.getJSON(`../subsurface_column/getPlotDataForSubsurface/${column}/${start_date}/${end_date}`)
    .catch(err => err);
}

function createSubsurfacteContainer() {
	
}

