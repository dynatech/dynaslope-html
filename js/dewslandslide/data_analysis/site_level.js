
$(document).ready(function(e) {
	$(document).ajaxStart(function () {
		$('#loading').modal('toggle');
	});
	$(document).ajaxStop(function () {
		$('#loading').modal('toggle');
	});

	var values = window.location.href.split("/")
	var current_site = values[5];
	$(".svgBox").hide()
	$("#soms_search_tool").hide()
	if(current_site != undefined && current_site != "Select"){
		columnSelect(current_site)
		ValueProcess(current_site)
		if(current_site.slice(3,4) != 's'){
			$("#soms_panel").hide()
		}
	}else{
		columnSelect("Select");
	}

});

function removeSpecificArray(array, element) {
	const index = array.indexOf(element);
	array.splice(index, 1);
}

function doSortDates(dates){
	var swapped;
	do {
		swapped = false;
		for (var i=0; i < dates.length-1; i++) {
			if (dates[i][0] > dates[i+1][0]) {
				var temp = dates[i][0];
				dates[i][0] = dates[i+1][0];
				dates[i+1][0] = temp;
				swapped = true;
			}
		}
	} while (swapped);
}
function columnSelect(site_selected) {
	$.ajax({ 
		dataType: "json",
		url: "/site_level_page/getAllSiteNamesPerSite",success: function(result) {
			var all_sites = result;
			var names=[];
			for (i = 0; i <  all_sites.length; i++) {
				names.push(all_sites[i].name)
			}
			var select = document.getElementById('sitegeneral');
			names.splice(names.indexOf(site_selected.toLowerCase()), 1 )
			$("#sitegeneral").append('<option value="'+site_selected+'">'+site_selected.toUpperCase()+'</option>');
			var i;
			for (i = 0; i < names.length; i++) {
				var opt = names[i];
				var el = document.createElement("option");
				el.textContent = opt.toUpperCase();

				if(opt == "select") {
					el.value = "none";
				}
				else {
					el.value = opt;
				}

				select.appendChild(el);
			}
		}
	});
	submit();
}
function submit() {
	$('input[id="submit"]').on('click',function(){
		if($("#sitegeneral").val() != ""){
			var curSite = $("#sitegeneral").val();
			$("#soms_search_tool").slideDown()
			$("#siteD").DataTable().clear();
			$("#siteD").DataTable().destroy();
			$("#mTable").DataTable().clear();
			$("#mTable").DataTable().destroy();
			$("#com_graph").empty();
			$("#graph").empty();
			$(".header-site").hide()
			location = "/data_analysis/column/"+curSite;
		}else{
			$("#errorMsg").modal('show')
		}
	});
}
function ValueProcess(curSite) {
	
	$('.subpanel').on('click',function(){
		$( '#graph11').switchClass( "", "active");
	})
	$('.colpanel').on('click',function(){
		$( '.subannalysis').switchClass( "active", "");
	})
	showCommHealthPlotGeneral(curSite,'com_graph')
	getAlertmini(curSite,'graph')
	ColumnDataProcess(curSite)
	DataPresence(curSite)
	heatmapProcess(curSite,moment().format('YYYY-MM-DDTHH:00'),'30d')
	$('#current_time').attr('value',moment().format('YYYY-MM-DDTHH:00'))
	$('.daygeneral').val('30d')
	$('#reportrange3').val(moment().add(1,'h').format('YYYY-MM-DD HH:00'))
	$(".soms_heatmap").append('<div class="col-md-12" id="heatmap_div"></div>')
	// $('.daygeneral').prop('disabled', true);
	var start = moment(); 
	$('input[name="datefilter3"]').daterangepicker({
		timePicker: true,
		autoUpdateInput: false,
		opens: "right",
		startDate: start,
		locale: {
			cancelLabel: 'Clear'
		},
		singleDatePicker: true,
		showDropdowns: true
	});

	$('input[name="datefilter3"]').on('apply.daterangepicker', function(ev, picker) {
		$("#heatmap_container").empty();
		var time = $(this).val(picker.startDate.format('YYYY-MM-DD HH:mm'));
		var timevalue =time.context.value
		var tdate = timevalue.slice(0,10);
		var time = timevalue.slice(11,16);
		$('#current_time').attr('value',(tdate+"T"+time))
		$('.daygeneral').prop('disabled', false);
		$(".heatmapClass").empty()
		$(".heatmapClass").append('<label class="daygeneral">Days:&nbsp;</label>'+
			'<select class="daygeneral" id="daygeneral"> <option value="">...</option><option value="1d">1 Day</option> <option value="3d">3 Days</option><option value="30d">30 Days</option></select>')
		if($('#daygeneral').val() != ""){
			heatmapProcess(curSite,(tdate+"T"+time),$('#daygeneral').val())
		}else{
			$('#daygeneral').on('change', function() {
				console.log('here')
				heatmapProcess(curSite,(tdate+"T"+time),this.value)
			})
		}
		
	});

	$('#daygeneral').on('change', function() {
		var time = $('#current_time').val();
		heatmapProcess(curSite,time,this.value)
	})

	$('input[name="datefilter2"]').on('cancel.daterangepicker', function(ev, picker) {
		$(this).val('Select Date');
	});


	var fromDate = 'n';
	var toDate = 'n';
	let dataSubmit = { 
		site : curSite, 
		fdate : fromDate,
		tdate : toDate
	}

	allSensorPosition(dataSubmit)
	var start = moment().subtract(2, 'days'); 
	var end = moment();
	

	$('#reportrange').daterangepicker({
		autoUpdateInput: true,
		startDate: start,
		endDate: end,
		opens: "rigth",
		ranges: {
			'Today': [moment(), moment()],
			'Yesterday': [moment().subtract(1, 'days'), moment().subtract(1, 'days')],
			'Last 7 Days': [moment().subtract(6, 'days'), moment()],
			'Last 30 Days': [moment().subtract(29, 'days'), moment()],
			'This Month': [moment().startOf('month'), moment().endOf('month')],
			'Last Month': [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')]
		}
	}, cb);

	cb(start, end);

}
function removeDuplicates(num) {
	var x,
	len=num.length,
	out=[],
	obj={};

	for (x=0; x<len; x++) {
		obj[num[x]]=0;
	}
	for (x in obj) {
		out.push(x);
	}
	return out;
}


function getAlertmini(site,siteDiv){ 
	let dataSubmit = { site:site}
	$.ajax({url: "/node_level_page/getAllSingleAlertGet/"+site,
		dataType: "json",error: function(xhr, textStatus, errorThrown){
			submit()
			$("#errorMsg").modal('show')},
			success: function(data){
				var result = data;
				nodeAlertJSON = JSON.parse(result.nodeAlerts)
				maxNodesJSON = JSON.parse(result.siteMaxNodes)
				nodeStatusJSON = JSON.parse(result.nodeStatus)
				initAlertPlot(nodeAlertJSON,maxNodesJSON,nodeStatusJSON,siteDiv)
				$('#total_node').attr('value',maxNodesJSON[0].nodes)
				
			}
		});
}

function ColumnDataProcess(site){
	$.ajax({url: "/site_level_page/getDatafromSiteColumnGet/"+site,
		dataType: "json",
		success: function(data){
			var result = data;
			var site_details = []
			for (i = 0; i < result.length; i++) {
				site_details.push([result[i].date_install , result[i].date_activation , result[i].region , result[i].barangay , 
					result[i].municipality , result[i].province])
			}
			document.getElementById("header-site").innerHTML = site.toUpperCase()+"(v"+result[result.length-1].version+") Column Overview"
			$('#siteD').DataTable( {
				data:  site_details,
				"processing": true,
				"paging":   false,
				"ordering": false,
				"info":     false,
				"filter":   false    
			} );
			
		}
	});
	$.ajax({url: "/site_level_page/getDatafromSiteMaintenancGet/"+site,
		dataType: "json",
		success: function(data){
			var result = data;
			var site_maintenace = []
			for (i = 0; i < result.length; i++) {
				site_maintenace.push([result[i].sm_id,result[i].site,result[i].start_date , result[i].end_date , result[i].staff_name , result[i].activity , result[i].object, 
					result[i].remarks])
			}
			$('#mTable').DataTable( {
				data:  site_maintenace,
				"processing": true, 
			} );
		}
	});

}


function DataPresence(site){
	var start = moment().subtract(1, 'days'); 
	var end = moment().add(1, 'days');
	// var start = moment('2016-04-05'); 
	// var end = moment('2016-04-06');
	$.ajax({url: "/site_level_page/getDatafromSiteDataPresence/"+site+"/"+start.format('YYYY-MM-DD')+"/"+end.format('YYYY-MM-DD'),
		dataType: "json",
		success: function(result){
			if(result.length != 0){
				var time_non_moment = []
				var time_index_obj =[]
				var time_data =[]
				var pattern = []
				for (a = 0; a < 48; a++) {
					var time = moment(result[0].timeslice).subtract(a*30, "minutes")
					time_non_moment.push(time.format('YYYY-MM-DD HH:mm:ss'))
				}
				time_non_moment.reverse()
				for (b = 0; b < 48; b++) {
					var time = moment(result[0].timeslice).subtract(a*30, "minutes")
					time_index_obj.push({index:b,time:time_non_moment[b]})
				}
				for (c = 0; c < time_non_moment.length; c++) {
					for (d = 0; d < result.length; d++) {
						if(time_non_moment[c] == result[d].timeslice){
							time_data.push(c)
						}
					}
				}


				colors = [ "#222", "#222"]
				for (e = 0; e < time_data.length; e++) {
					pattern.push({index_x:time_data[e],index_y:1,time:time_data[e],timestamp:time_non_moment[time_data[e]]})
				}
				var colorDomain = d3.extent(pattern, function(d) {
					return d.time;
				});

				var colorScale = d3.scale.linear()
				.domain(colorDomain)
				.range(colors);

				var tip = d3.tip()
				.attr('class', 'd3-tip')
				.offset([-10, 0])
				.html(function(d) {
					return "<strong>timestamp:</strong> <span style='color:red'>"+d.timestamp+"</span>";
				}) 

				var svg = d3.select("#data_presence_div")
				.append("svg")
				.attr("width", ($("#data_presence_div").width()))
				.attr("height", 30);

				svg.call(tip);

				var rectangles = svg.selectAll("rect")
				.data(pattern)
				.enter().append("rect")

				rectangles.attr("x", function(d) {
					return d.index_x * ((($("#data_presence_div").width()/48)));})
				.attr("y", function(d) {
					return d.index_y * ((($("#data_presence_div").width()/48)));})
				.attr("width", ((($("#data_presence_div").width()/48)-2)))
				.attr("height", 15).
				style("fill", function(d) {
					return colorScale(d.index_x);})
				.on('mouseover', tip.show)
				.on('mouseout', tip.hide)}
			}
		});
}



function heatmapProcess(site,tdate,day){		
	$.ajax({ 
		dataType: "json",
		url: "/api/heatmap/"+site+"/"+tdate+"/"+day,  success: function(data_result) {
			if(data_result.slice(0,1) != "E" || data_result.slice(0,1) != "i" ){
				$("#heatmap_container").empty()
				$("#heatmap_div").append('<div id="heatmap_container"></div>')
				var result = JSON.parse(data_result)
				var total_node = $('#total_node').val();
				var all_time =[]
				var all_nodes = []
				var pattern_time =[]
				var list_id=[]
				for (var i = 0; i < parseFloat(total_node); i++) {
					list_id.push((i+1))
				}
				for (a = 0; a < result.length; a++) {
					all_time.push(result[a].ts)
					all_nodes.push(result[a].id)
				}
				var list_time = removeDuplicates(all_time)
				
				var number_all =[]
				for (b = 0; b < list_id.length; b++) {
					for (c = 0; c < list_time.length; c++) {
						pattern_time.push({id:list_id[b],ts:list_time[c],cval:"null"})
					}
				}
				var sorted_data_num =[]
				for (d = 0; d < pattern_time.length; d++) {
					number_all.push(d)
					for (e = 0; e < result.length; e++) {
						if((pattern_time[d].id == result[e].id) && (pattern_time[d].ts == result[e].ts) ){
							sorted_data_num.push(d)
						}
					}

				}	
				var remove_data = []
				for (f = 0; f < sorted_data_num.length; f++) {
					remove_data.push(number_all.splice(number_all.indexOf(sorted_data_num[f]), 1 ) )
				}

				for (f = 0; f < number_all.length; f++) {
					result.push(pattern_time[number_all[f]])
				}
				var sorted_time = []
				for (g = 0; g < list_time.length; g++) {
					for (h = 0; h < result.length; h++) {
						if(list_time[g] == result[h].ts){
							sorted_time .push(result[h])
						}
					}
				}

				var sorted_result_all = []
				for (g = 0; g < list_id.length; g++) {
					for (h = 0; h < result.length; h++) {
						if(list_id[g] == sorted_time[h].id){
							sorted_result_all.push(sorted_time[h])
						}
					}
				}
				var x_heatmap = []
				var y_heatmap =[]
				for (i = 0; i < list_id.length; i++) {
					for (j = 0; j < list_time.length; j++) {
						x_heatmap.push(i)
						y_heatmap.push(j)
					}
				}

				var series_data =[]
				for (k = 0; k < sorted_result_all.length; k++) {
					series_data.push({y:y_heatmap[k],x:x_heatmap[k],value:parseFloat(sorted_result_all[k].cval),
						ts:sorted_result_all[k].ts,id:sorted_result_all[k].id})
				}

				var obj_list_time=[]
				for (l = 0; l < list_time.length; l++) {
					obj_list_time.push({index:l,ts:list_time[l]})
				}

				var obj_list_id=[]
				for (l = 0; l < list_id.length; l++) {
					obj_list_id.push({index:l,id:list_id[l]})
				}

				if(obj_list_time.length == 48 || obj_list_time.length == 36 || obj_list_time.length == 30){
					heatmapVisual(series_data,obj_list_time,obj_list_id,site)
					
				}else{
					var time_date = Date.parse(tdate.replace('T',' '))
					var template = [];
					var time_template = [];
					var time_object = [];
					var x_and_y=[];
					var data_series_filtered=[]
					if( day == '1d'){
						for (var i = 0; i < 48; i++) {
							time_template.push(moment(time_date ).subtract(i*30,'minutes').format('YYYY-MM-DD HH:mm:ss'))
							template.push(moment(time_date ).subtract(i*30,'minutes').format('YYYY-MM-DD HH:mm:ss'))
							time_object.push({index:i,ts:moment(time_date ).subtract(i*30,'minutes').format('YYYY-MM-DD HH:mm:ss')})
							for (var a = 0; a < obj_list_id.length; a++) {
								x_and_y.push({x:i,y:a})
							}
						}
					}else if( day == '3d'){
						for (var i = 0; i < 36; i++) {
							time_template.push(moment(time_date).subtract(i*2,'hours').format('YYYY-MM-DD HH:mm:ss'))
							template.push(moment(time_date).subtract(i*2,'hours').format('YYYY-MM-DD HH:mm:ss'))
							time_object.push({index:i,ts:moment(time_date ).subtract(i*2,'hours').format('YYYY-MM-DD HH:mm:ss')})
							for (var a = 0; a < obj_list_id.length; a++) {
								x_and_y.push({x:i,y:a})
							}
						}
					}else if( day == '30d'){
						for (var i = 0; i < 30; i++) {
							time_template.push(moment(time_date).subtract(i,'days').format('YYYY-MM-DD HH:mm:ss'))
							template.push(moment(time_date).subtract(i,'days').format('YYYY-MM-DD HH:mm:ss'))
							time_object.push({index:i,ts:moment(time_date ).subtract(i,'days').format('YYYY-MM-DD HH:mm:ss')})
							for (var a = 0; a < obj_list_id.length; a++) {
								x_and_y.push({x:i,y:a})
							}
						}
					}
					template.reverse()
					if(obj_list_time.length != 0){
						var nodata_timestamp=[]
						var data_filteredTime =[]
						
						for (var i = 0; i < obj_list_time.length; i++) {
							removeSpecificArray(time_template,obj_list_time[i])
						}
						for (var a = 0; a < time_template.length; a++) {
							for (var i = 0; i < obj_list_id.length; i++) {
								nodata_timestamp.push({id:obj_list_id[i].id,ts:time_template[a],value: NaN})
							}
						}
						for (var i = 0; i < series_data.length; i++) {
							nodata_timestamp.push({id:series_data[i].id,ts:series_data[i].ts,value:series_data[i].value})
						}

						for (var i = 0; i < template.length; i++) {
							for (var a = 0; a < nodata_timestamp.length; a++) {
								if( Date.parse(template[i]) == Date.parse(nodata_timestamp[a].ts)){
									data_filteredTime.push(nodata_timestamp[a])
								}
							}
						}


						for (var i = 0; i < obj_list_id.length; i++) {
							for (var a = 0; a < data_filteredTime.length; a++) {
								if(obj_list_id[i].id == data_filteredTime[a].id ){
									data_series_filtered.push({id:data_filteredTime[a].id,ts:data_filteredTime[a].ts,value:data_filteredTime[a].value,x:x_and_y[a].y,y:x_and_y[a].x})
								}
							}
						}
						
						heatmapVisual(data_series_filtered,time_object,obj_list_id,site)
					}else{
						var total_node = $('#total_node').val();
						var obj_list_id =[];

						for (var i = 0; i < parseFloat(total_node); i++) {
							obj_list_id.push({index:i,id:(i+1)})
						}

						for (var i = 0; i < parseFloat(total_node); i++) {
							for (var a = 0; a < template.length; a++) {
								data_series_filtered.push({id:(i+1),ts:template[a],value:'null',x:i,y:a})
								
							}
						}

						heatmapVisual(data_series_filtered,time_object,obj_list_id,site)
						
					}

				}
			}
		}
	});	
}

function heatmapVisual(series_data,list_time,list_id,site){
	for(var i=0;i<series_data.length;i++){
		if(series_data[i].id == "null" || series_data[i].value == NaN ){
			series_data.splice(i,1);
			i--;
		}
	}
	for(var i=0;i<list_id.length;i++){
		if(list_id[i].id== "null"){
			list_id.splice(i,1);
			i--;
		}
	}
	if(list_id.length != 0){
		times = d3.range(list_time.length);

		var margin = {
			top: 80,
			right: 50,
			bottom: 150,
			left: 50
		};

		var width = $("#svg-commhealth").width() - margin.left - margin.right - 20,
		gridSize = Math.floor(width / list_time.length),
		height = gridSize * (list_id.length+2);

		var tip = d3.tip()
		.attr('class', 'd3-tip')
		.offset([-10, 0])
		.html(function(d) {
			return "<strong>Timestamp:</strong> <span style='color:red'>"+d.ts+"</span>"+
			"<br><strong>Value:</strong> <span style='color:red'>"+d.value+"</span>";
		}) 



		var svg = d3.select('#heatmap_container')
		.append("svg")
		.attr("width", width + margin.left + margin.right)
		.attr("height", height + margin.top + margin.bottom)
		.append("g")
		.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

		var newFontSize = width * 62.5 / 900;
		d3.select("html").style("font-size", newFontSize + "%");

		var colorScale = d3.scale.linear()
		.domain([0,255])
		.range([ "#ffffcc","#ff3300"])

		var x = d3.time.scale()
		.domain([Date.parse(list_time[0].ts),Date.parse(list_time[list_time.length-1].ts)])
		.range([0, width]);

		var xAxis = d3.svg.axis()
		.scale(x);

		
		var dayLabels = svg.selectAll(".dayLabel")
		.data(list_id)
		.enter().append("text")
		.text(function (d) { return d.id; })
		.attr("x", 0)
		.attr("y", function (d, i) { return i * gridSize; })
		.style("text-anchor", "end")
		.attr("transform", "translate(-6," + gridSize / 1.5 + ")")
		.attr("class", function (d, i) { return ((i >= 0 && i <= 4) ? "dayLabel mono axis axis-workweek" : "dayLabel mono axis"); });

		// var timeLabels = svg.selectAll(".timeLabel")
		// .data(times)
		// .enter().append("text")
		// .text(function(d) { return d; })
		// .attr("x", function(d, i) { return i * gridSize; })
		// .attr("y", 0)
		// .style("text-anchor", "middle")
		// .attr("transform", function(d) {
		// 	return "rotate(-65)" 
		// })
		// .attr("class", function(d, i) { return ((i >= 8 && i <= 17) ? "timeLabel mono axis axis-worktime" : "timeLabel mono axis"); });

		svg.call(tip);
		var heatMap = svg.selectAll(".hour")
		.data(series_data)
		.enter().append("rect")
		.attr("x", function(d) { return (d.y ) * gridSize; })
		.attr("y", function(d) { return (d.x ) * gridSize; })
		.attr("class", "hour bordered")
		.attr("width", gridSize)
		.attr("height", gridSize)
		.style("stroke", "white")
		.style("fill", function(d) { return colorScale(d.value); })
		.on('mouseover', tip.show)
		.on('mouseout', tip.hide)
		.append("g");

		// svg.append("g")
		// .attr("class", "x axis")
		// .attr("transform", "translate(0," + (gridSize * list_time.length + 120) + ")")
		// .call(xAxis)
		// .selectAll("text")
		// .attr("y", 0)
		// .attr("x", 9)
		// .attr("dy", ".35em")
		// .attr("transform", "rotate(-90)")
		// .style("text-anchor", "middle");

		svg.append("text")
		.attr("class", "title")
		.attr("x", width/2)
		.attr("y", -40)
		.style("text-anchor", "middle")
		.text("Soms Heatmap");


		var countScale = d3.scale.linear()
		.domain([0, 255])
		.range([0, width])

		var numStops = 10;
		countRange = countScale.domain();
		countRange[2] = countRange[1] - countRange[0];
		countPoint = [];
		for(var i = 0; i < numStops; i++) {
			countPoint.push(i * countRange[2]/(numStops-1) + countRange[0]);
		}


		svg.append("defs")
		.append("linearGradient")
		.attr("id", "legend-traffic")
		.attr("x1", "0%").attr("y1", "0%")
		.attr("x2", "100%").attr("y2", "0%")
		.selectAll("stop") 
		.data(d3.range(numStops))                
		.enter().append("stop") 
		.attr("offset", function(d,i) { 
			return countScale( countPoint[i] )/width;
		})   
		.attr("stop-color", function(d,i) { 
			return colorScale( countPoint[i] ); 
		});



		var legendWidth = Math.min(width*0.8, 400);

		var legendsvg = svg.append("g")
		.attr("class", "legendWrapper")
		.attr("transform", "translate(" + (width/2) + "," + (gridSize * list_id.length + 120) + ")");


		legendsvg.append("rect")
		.attr("class", "legendRect")
		.attr("x", -legendWidth/2)
		.attr("y", 0)
		.attr("width", legendWidth)
		.attr("height", 10)
		.style("fill", "url(#legend-traffic)");


		legendsvg.append("text")
		.attr("class", "legendTitle")
		.attr("x", 0)
		.attr("y", -10)
		.style("text-anchor", "middle")
		.text("Soms Scale");


		var xScale = d3.scale.linear()
		.range([-legendWidth/2, legendWidth/2])
		.domain([ 0, 255] );


		var xAxis = d3.svg.axis()
		.orient("bottom")
		.ticks(5)
		.scale(xScale);


		legendsvg.append("g")
		.attr("class", "axis")
		.attr("transform", "translate(0," + (10) + ")")
		.call(xAxis);
	}else{
		// $(".daygeneral").hide();
		$("#heatmap_div").empty()
		$("#heatmap_div").append('<div id="heatmap_container"><h3 style="text-align: center"> NO DATA </h3></div>')
	}
}




/*SUBSURFACE*/

function cb(start, end) {
	$('#reportrange span').html(start.format('YYYY-MM-DD') + ' - ' + end.format('YYYY-MM-DD')); 
	// alert(time) 
	if($("#sitegeneral").val() != null){

		var curSite = $("#sitegeneral").val();
		var fromDate = $('#reportrange span').html().slice(0,10);
		var toDate = $('#reportrange span').html().slice(13,23);
		var time = moment().format('HH:mm:ss')
		let dataSubmit = { 
			site : curSite, 
			fdate : fromDate+"T"+time,
			tdate : toDate+"T"+time
		}

		allSensorPosition(dataSubmit)
	}
}

function allSensorPosition(data_result) {
	$.ajax({url: "/api/SensorAllAnalysisData/"+data_result.site+"/"+data_result.fdate+"/"+data_result.tdate,
		dataType: "json",
		success: function(result){
			var data = JSON.parse(result);
			columnPosition(data[0].c)
			// console.log(data)
			displacementPosition(data[0].d,data[0].v)
		}
	});
}
function columnPosition(data_result) {
	if(data_result== "error"){
		$("#graph").hide();
		$("#errorMsg").append('<center>Select new timestamp</h1></center>');
	}else{
		var data = data_result;
		var AlllistId = [] ,  AlllistDate = [];
		var listId = [] , listDate = [];
		var fdatadown= [] , fnum= [] ,fAlldown =[] ,fseries=[] ;
		var fseries2=[] , fdatalat= [],fAlllat =[] ;
		for(var i = 0; i < data.length; i++){
			AlllistId.push(data[i].id);
		}
		for(var i = 0; i < data.length; i++){
			AlllistDate.push(data[i].ts);
			if(data[i].id == data[i+1].id){
				listDate.push(data[i].ts)
			}else{
				listDate.push(data[i].ts)
				break;
			}
		}
		for(var i = 0; i < AlllistId.length; i++){
			if(AlllistId[i] != AlllistId[i+1]){
				listId.push(AlllistId[i])
			}
		}

		var sortlist = listDate.sort()
		for(var i = 0; i < listDate.length; i++){
			for(var a = 0; a < data.length; a++){
				if(sortlist[i] == data[a].ts){
					fdatadown.push([data[a].downslope*1000,data[a].depth])
					fdatalat.push([data[a].latslope*1000,data[a].depth])
				}
			}
		}

		for(var a = 0; a < fdatadown.length; a++){
			var num = fdatadown.length-(listId.length*a);
			if(num >= 0 ){
				fnum.push(num);
			}
		}
		for(var a = fnum.length-1; a >= 0; a--){
			if(fnum[a+1] != undefined){
				fAlldown.push(fdatadown.slice(fnum[a+1],fnum[a]))
				fAlllat.push(fdatalat.slice(fnum[a+1],fnum[a]))
			}
		}
		for(var a = 0; a < fAlldown.length; a++){
			var color = parseInt((255 / fAlldown.length)*(a+1))
			fseries.push({name:sortlist[a], data:fAlldown[a] ,color:inferno[color]})
			fseries2.push({name:sortlist[a],  data:fAlllat[a],color:inferno[color]})
		}
		chartProcessInverted("colspangraph",fseries,"Horizontal Displacement, downslope(mm)")
		chartProcessInverted("colspangraph2",fseries2,"Horizontal Displacement, across slope(mm)")
		// console.log(bubble_Sort(fseries2));
	}     
}

function displacementPosition(data_result,data_result_v) {
	if(data_result == "error"){
		$("#graph1").hide();
	}else{
		var data = data_result;
		var totalId =[] , listid = [0] ,allTime=[] ,allId=[] , totId = [];
		var fixedId =[] , alldata=[], alldata1=[] , allIdData =[];
		var disData1 = [] , disData2 = [];
		var fseries = [], fseries2 = [];
		var c1series =[], c2series =[];
		var d1= [] , d2 =[] , n1=[], n2=[];

		for(var i = 0; i < data[0].disp.length; i++){
			if(data[0].disp[i].ts == data[0].disp[i+1].ts ){
				totalId.push(data[0].disp[i]);
			}else{
				totalId.push(data[0].disp[i]);
				break;
			}
		}
		for(var i = 1; i < totalId.length +1 ; i++){
			for(var a = 0; a < data[0].disp.length; a++){
				if(i == data[0].disp[a].id){
					fixedId.push(data[0].disp[a]);
				}
			}
		}
		for(var i = 1; i < fixedId.length-1; i++){
			if(fixedId[i].id != fixedId[i+1].id){
				allIdData.push(i)
			}
			if(fixedId[i-1].id == fixedId[i].id){
				totId.push(fixedId[i].id)
			}else{
				totId.push(fixedId[i].id)
				break;
			}
		}

		for(var i = fixedId.length - 1; i >= 0 ; i--){
			var num = fixedId.length-(totId.length*i);
			if(num >= 0 ){
				listid.push(num);
			}
		}

		for(var a = 1; a < (listid.length-1); a++){
			if(listid[a] != undefined){
				disData1.push(fixedId.slice(listid[a],listid[a+1]));
				disData2.push(fixedId.slice(listid[a],listid[a+1])); 
			}
		}
		
		for(var a = 0; a < disData1.length; a++){
			for(var i = 0; i < disData1[0].length; i++){
				d1.push({x:Date.parse(disData1[a][i].ts) ,y:((disData1[a][i].downslope-data[0].cml_base)*1000)})
				d2.push({x:Date.parse(disData1[a][i].ts) ,y:((disData1[a][i].latslope-data[0].cml_base)*1000)})

			}
		}

		for(var i = 0; i < disData1.length; i++){
			n1.push({from:((disData1[i][0].downslope-data[0].cml_base)*1000),to:(((disData1[i][0].downslope-data[0].cml_base)*1000)+1),
				label: {text: data[0].annotation[i].downslope_annotation,style: {color: '#1c1c1c'}}})
			n2.push({from:((disData1[i][0].downslope-data[0].cml_base)*1000),to:(((disData1[i][0].downslope-data[0].cml_base)*1000)+1),
				label: {text: data[0].annotation[i].latslope_annotation,style: {color: '#1c1c1c'}}})
		}

		for(var a = 0; a < data[0].cumulative.length; a++){
			c1series.push({x:Date.parse(data[0].cumulative[a].ts) ,y:((data[0].cumulative[a].downslope-data[0].cml_base)*1000)})
			c2series.push({x:Date.parse(data[0].cumulative[a].ts) ,y:((data[0].cumulative[a].latslope-data[0].cml_base)*1000)})
		}
		fseries.push({name:'cumulative', data:c1series,type: 'area'});
		fseries2.push({name:'cumulative', data:c1series,type: 'area'});
		for(var a = 1; a < disData1.length+1; a++){
			var color = parseInt((255 / disData1.length)*(a))
			fseries.push({name:(a), data:d1.slice(listid[a],listid[a+1]),color:inferno[color]})
			fseries2.push({name:(a), data:d2.slice(listid[a],listid[a+1]),color:inferno[color]})
		}
		velocityPosition(data_result_v,totalId.length,disData1[0]); 
		fseries.push({name:'unselect'})
		fseries2.push({name:'unselect'})
		chartProcess("dis1",fseries,"Displacement, downslope",n1)
		chartProcess("dis2",fseries2,"Displacement , across slope",n2)


	}     
	
}
function velocityPosition(data_result,id,date) {
	if(data_result == "error"){
		$("#graph2").hide();
	}else{
		var data = data_result;
		var allTime = [] , dataset= [] , sliceData =[];
		var fseries = [], fseries2 = [] ;
		var l2 =[] , l3=[] , alldataNotSlice=[];

		if(data[0].L2.length != 0){
			var catNum=[1];
			for(var a = 0; a < data[0].L2.length; a++){
				allTime.push(data[0].L2[a].ts)
				l2.push([Date.parse(data[0].L2[a].ts) , ((id+1)-data[0].L2[a].id)])
			}
			var symbolD = 'url(http://icons.iconarchive.com/icons/kyo-tux/soft/32/Alert-icon.png)';
			for(var a = 0; a < data[0].L2.length; a++){
				fseries.push({ type: 'scatter', zIndex:5, name:'L2',marker:{symbol:symbolD,width: 25,height: 25} , data:l2})
				fseries2.push({type: 'scatter', zIndex:5 ,name:'L2',marker:{symbol:symbolD,width: 25,height: 25} , data:l2})
			}
			for(var a = 0; a < data[0].L3.length; a++){
				allTime.push(data[0].L3[a].ts)
				l3.push([Date.parse(data[0].L3[a].ts) , ((id+1)-data[0].L3[a].id)]);
			}
			var symbolD1 = 'url(http://en.xn--icne-wqa.com/images/icones/1/3/software-update-urgent-2.png)';
			for(var a = 0; a < data[0].L3.length; a++){
				fseries.push({ type: 'scatter', zIndex:5 , name:'L3',marker:{symbol:symbolD1,width: 25,height: 25} , data:l3})
				fseries2.push({type: 'scatter', zIndex:5,name:'L3',marker:{symbol:symbolD1,width: 25,height: 25} , data:l3})
			}
			for(var i = 0; i < id; i++){
				for(var a = 0; a < allTime.length; a++){
					dataset.push([Date.parse(allTime[a]) , i+1])
				}
			}
			for(var a = 0; a < dataset.length; a++){
				for(var i = 0; i < id; i++){
					if(dataset[a][1] == i){
						alldataNotSlice.push(dataset[a])
					}
				}
			}

			for(var i = alldataNotSlice.length - 1; i >= 0 ; i--){
				var num = alldataNotSlice.length-(allTime.length*i);
				if(num >= 0 ){
					sliceData.push(num);
				}
			}
			for(var a = 0; a < sliceData.length; a++){
				catNum.push((sliceData.length-1)-(a+1)+2)
				var color = parseInt((255 / sliceData.length)*(a+1))
				fseries.push({name:(a+1), data:dataset.slice(sliceData[a],sliceData[a+1]),color :inferno[color]})
				fseries2.push({name:(a+1), data:dataset.slice(sliceData[a],sliceData[a+1]),color :inferno[color]})
			}
		}else{
			var catNum=[];
			for(var a = 0; a < id ; a++){
				for(var i = 0; i < date.length; i++){
					dataset.push([Date.parse(date[i].ts),a]);
				}
			}

			for(var i = dataset.length - 1; i >= 0 ; i--){
				var num = dataset.length-(date.length*i);
				if(num >= 0 ){
					sliceData.push(num);
				}
			}

			for(var a = 0; a < sliceData.length-1; a++){
				catNum.push((sliceData.length-2)-(a+1)+2)
				var color = parseInt((255 / sliceData.length)*(a+1))
				fseries.push({name:(a+1), data:dataset.slice(sliceData[a],sliceData[a+1]),color :inferno[color]})
				fseries2.push({name:(a+1), data:dataset.slice(sliceData[a],sliceData[a+1]),color :inferno[color]})
			}					
		}

		var sorted_fseries =[]
		for (var counter = 0; counter < fseries.length;counter++){
			sorted_fseries.push(doSortDates(fseries[counter].data));
		}

		chartProcessbase("velocity1",fseries,"Velocity Alerts, downslope")
		chartProcessbase("velocity2",fseries2,"Velocity Alerts, across slope")   
	}  
}
function chartProcess(id,data_series,name,nPlot){
	Highcharts.setOptions({
		global: {
			timezoneOffset: -8 * 60
		},
	});
	$("#"+id).highcharts({
		chart: {
			type: 'line',
			zoomType: 'x',
			height: 800,
			width:1100
		},
		title: {
			text: name,
		},
		yAxis: {
			plotBands:nPlot,
			title: {
				text: 'Displacement'
			},
		},
		xAxis: {
			type: 'datetime',
			dateTimeLabelFormats: { 
				month: '%e. %b',
				year: '%b'
			},
			title: {
				text: 'Date'
			},
		},
		tooltip: {
			header:'{point.x:%Y-%m-%d}: {point.y:.2f}',
			
			
		},
		plotOptions: {
			
			line: {
				marker: {
					enabled: false
				}
			},
			area: {
				marker: {
					enabled: false
				}
			},
		},
		credits: {
			enabled: false
		},
		legend: {
			enabled: false
		},
		series:data_series
	});
	var chart = $('#'+id).highcharts();
	$( ".highcharts-series-"+(data_series.length-1) ).click(function() {
		var series = chart.series[(data_series.length-1)];
		for (var i = 0; i < data_series.length-1; i++) {
			if (series.visible) {
				(chart.series[((data_series.length-(i+1))-1)]).update({
					visible: true,
				});
			}else {
				(chart.series[((data_series.length-(i+1))-1)]).update({
					visible: false,
				});
			}
		}
	});
}

function chartProcessInverted(id,data_series,name){
	Highcharts.setOptions({
		global: {
			timezoneOffset: -8 * 60
		},
	});
	$("#"+id).highcharts({
		chart: {
			type: 'line',
			zoomType: 'x',
			height: 1000,
			width: 550
		},
		title: {
			text: name,
		},
		xAxis: {
			gridLineWidth: 1,
		},
		yAxis: {
			title: {
				text: 'Depth'
			},
		},
		plotOptions: {
			line: {
				marker: {
					enabled: true,
				},
			},
			series: {
				lineWidth: 1
			}
		},
		credits: {
			enabled: false
		},
		credits: {
			enabled: false
		},
		series:data_series
	});
}

function chartProcessbase(id,data_series,name){
	Highcharts.setOptions({
		global: {
			timezoneOffset: -8 * 60
		},
	});
	$("#"+id).highcharts({
		chart: {
			type: 'line',
			zoomType: 'x',
			height: 500,
			width: 1100
		},
		title: {
			text: name
		},
		credits: {
			enabled: false
		},
		xAxis: {
			type: 'datetime',
			dateTimeLabelFormats: { 
				month: '%e. %b',
				year: '%b'
			},
			title: {
				text: 'Date'
			}
		},
		legend: {
			enabled: false
		},
		yAxis: {
			title: {
				text: 'Depth'
			},

		},
		plotOptions: {
			
			line: {
				marker: {
					enabled: false
				}
			},
		},
		series:data_series
	});
}
function dataPresencePerSite(site){
	$.ajax({url: "/site_level_page/getDatafromSiteDataPresence/"+site+"/2016-04-20/2016-04-21",
		dataType: "json",
		success: function(result){
			var time_non_moment = []
			var time_index_obj =[]
			var time_data =[]
			var pattern = []
			for (a = 0; a < 48; a++) {
				var time = moment(result[0].timeslice).subtract(a*30, "minutes")
				time_non_moment.push(time.format('YYYY-MM-DD HH:mm:ss'))
			}
			time_non_moment.reverse()
			for (b = 0; b < 48; b++) {
				var time = moment(result[0].timeslice).subtract(a*30, "minutes")
				time_index_obj.push({index:b,time:time_non_moment[b]})
			}
			for (c = 0; c < time_non_moment.length; c++) {
				for (d = 0; d < result.length; d++) {
					if(time_non_moment[c] == result[d].timeslice){
						time_data.push(c)
					}
				}
			}

			colors = [ "#1a9850", "#222"]
			for (e = 0; e < time_data.length; e++) {
				pattern.push({index_x:time_data[e],index_y:1,time:time_data[e],timestamp:time_non_moment[time_data[e]]})
			}
			

			var colorDomain = d3.extent(pattern, function(d) {
				return d.time;
			});

			var colorScale = d3.scale.linear()
			.domain(colorDomain)
			.range(colors);

			var tip = d3.tip()
			.attr('class', 'd3-tip')
			.offset([-10, 0])
			.html(function(d) {
				return "<strong>timestamp:</strong> <span style='color:red'>"+d.timestamp+"</span>";
			}) 


			var svg = d3.select(".heatmap")
			.append("svg")
			.attr("width", 48 * 25)
			.attr("height", 100);


			svg.call(tip);


			var rectangles = svg.selectAll("rect")
			.data(pattern)
			.enter().append("rect");

			rectangles.attr("x", function(d) {
				return d.index_x * 17;})
			.attr("y", function(d) {
				return d.index_y * 17;})
			.attr("width", 15)
			.attr("height", 15).
			style("fill", function(d) {
				return colorScale(d.index_x);})
			.on('mouseover', tip.show)
			.on('mouseout', tip.hide)
		}
	});
}