

$(document).ready(function(e) {
	$(document).ajaxStart(function () {
		$('#loading').modal('toggle');
	});
	$(document).ajaxStop(function () {
		$('#loading').modal('toggle');
	});

	$.get("../site_level_page/getAllSiteNamesPerSite").done(function(data){
		var all_sites = JSON.parse(data);
		var names=[];
		for (i = 0; i <  all_sites.length; i++) {
			names.push(all_sites[i].name)
		}

		var select = document.getElementById('sitegeneral');
		$("#sitegeneral").append('<option value="">SELECT</option>');
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
	})
	var per_site_name=[];
	$.get("../site_level_page/getAllSiteNamesPerSite").done(function(data){
		var per_site = JSON.parse(data);
		for (i = 0; i <  per_site.length; i++) {
			per_site_name.push(per_site[i].name)
		}
	})
	$('#sitegeneral').on('change',function(){
		if($("#sitegeneral").val() != "SELECT"){
			var subSites =[];
			var curSite = $("#sitegeneral").val();
			// var fromDate = $('#reportrange span').html().slice(0,10);
			// var toDate = $('#reportrange span').html().slice(13,23);
			var fromDate = 'n';
			var toDate = 'n';
			// dataPresencePerSite(curSite)
			document.getElementById("header-site").innerHTML = curSite.toUpperCase()+" Column Overview"
			for (i = 0; i <  per_site_name.length; i++) {
				var siteCode = per_site_name[i].slice(0,3)
				if( curSite == siteCode) {
					subSites.push(per_site_name[i])
				}
			}
			let dataSubmit = { 
				site : curSite, 
				fdate : fromDate,
				tdate : toDate
			}
			$('#reportrange span').text( moment().subtract(2, 'days').format('YYYY-MM-DD') + ' - ' +  moment().format('YYYY-MM-DD')); 
			allSensorPosition(dataSubmit)
		}else{
			$("#errorMsg").modal('show')
		}
	});
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

	function cb(start, end) {
		$('#reportrange span').html(start.format('YYYY-MM-DD') + ' - ' + end.format('YYYY-MM-DD')); 
		<<<<<<< HEAD
		=======
		// alert($("#sitegeneral").val()) 
		>>>>>>> 60887f0c2a57a4e6ed7337edad0b9d0295080eac
		if($("#sitegeneral").val() != null){

			var curSite = $("#sitegeneral").val();
			var fromDate = $('#reportrange span').html().slice(0,10);
			var toDate = $('#reportrange span').html().slice(13,23);
			<<<<<<< HEAD
			var time = moment().format('HH:mm:ss')
			let dataSubmit = { 
				site : curSite, 
				fdate : fromDate+"T"+time,
				tdate : toDate+"T"+time
				=======

				let dataSubmit = { 
					site : curSite, 
					fdate : fromDate,
					tdate : toDate
					>>>>>>> 60887f0c2a57a4e6ed7337edad0b9d0295080eac
				}

				allSensorPosition(dataSubmit)
			}
		}

		function allSensorPosition(data_result) {
			<<<<<<< HEAD
			=======
			console.log("/api/SensorAllAnalysisData/"+data_result.site+"/"+data_result.fdate+"/"+data_result.tdate)
			>>>>>>> 60887f0c2a57a4e6ed7337edad0b9d0295080eac
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
							fdatadown.push([data[a].downslope * 1000,data[a].depth])
							fdatalat.push([data[a].latslope * 1000,data[a].depth])
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
					var color =  parseInt((255 / fAlldown.length)*(a+1))
					<<<<<<< HEAD
					fseries.push({name:sortlist[a].slice(0,16), data:fAlldown[a] ,color:inferno[color]})
					fseries2.push({name:sortlist[a].slice(0,16),  data:fAlllat[a],color:inferno[color]})
					=======
					fseries.push({name:listDate[a], data:fAlldown[a] ,color:inferno[color]})
					fseries2.push({name:listDate[a],  data:fAlllat[a],color:inferno[color]})
					>>>>>>> 60887f0c2a57a4e6ed7337edad0b9d0295080eac
				}
				chartProcessInverted("colspangraph",fseries,"Horizontal Displacement, downslope(mm)")
				chartProcessInverted("colspangraph2",fseries2,"Horizontal Displacement, across slope(mm)")

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
				var d1= [] , d2 =[];
				for(var i = 0; i < data.length; i++){
					if(data[i].ts == data[i+1].ts ){
						totalId.push(data[i]);
					}else{
						totalId.push(data[i]);
						break;
					}
				}
				for(var i = 1; i < totalId.length +1 ; i++){
					for(var a = 0; a < data.length; a++){
						if(i == data[a].id){
							fixedId.push(data[a]);
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
						d1.push([Date.parse(disData1[a][i].ts) ,disData1[a][i].downslope*1000])
						d2.push([Date.parse(disData1[a][i].ts) ,disData1[a][i].latslope*1000])
					}
				}
				for(var a = 1; a < disData1.length+1; a++){
					<<<<<<< HEAD
					var color =  parseInt((255 / disData1.length)*a)
					=======
					var color =  parseInt((255 / disData1.length)*(a))
					>>>>>>> 60887f0c2a57a4e6ed7337edad0b9d0295080eac
					fseries.push({name:(a), data:d1.slice(listid[a],listid[a+1]),color:inferno[color]})
					fseries2.push({name:(a), data:d2.slice(listid[a],listid[a+1]),color:inferno[color]})
				}
				fseries.push({name:'unselect'})
				fseries2.push({name:'unselect'})
				velocityPosition(data_result_v,totalId.length,disData1[0]); 
				chartProcess("dis1",fseries,"Displacement, downslope")
				chartProcess("dis2",fseries2,"Displacement , across slope")

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
						l3.push([Date.parse(data[0].L3[a].ts) , (((id)+1)-parseInt(data[0].L3[a].id))]);

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
						<<<<<<< HEAD
						var color = parseInt((255 / sliceData.length)*(a+1))
						fseries.push({name:catNum[a], data:dataset.slice(sliceData[a],sliceData[a+1]),color :inferno[color]})
						fseries2.push({name:catNum[a], data:dataset.slice(sliceData[a],sliceData[a+1]),color :inferno[color]})
						=======
						var color =  parseInt((255 / sliceData.length)*(a+1))
						fseries.push({name:(a+1), data:dataset.slice(sliceData[a],sliceData[a+1]),color :inferno[color]})
						fseries2.push({name:(a+1), data:dataset.slice(sliceData[a],sliceData[a+1]),color :inferno[color]})
						>>>>>>> 60887f0c2a57a4e6ed7337edad0b9d0295080eac
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
						<<<<<<< HEAD
						var color = parseInt((255 / sliceData.length)*(a+1))
						=======
						var color =  parseInt((255 / sliceData.length)*(a+1))
						>>>>>>> 60887f0c2a57a4e6ed7337edad0b9d0295080eac
						fseries.push({name:(a+1), data:dataset.slice(sliceData[a],sliceData[a+1]),color :inferno[color]})
						fseries2.push({name:(a+1), data:dataset.slice(sliceData[a],sliceData[a+1]),color :inferno[color]})
					}					
				}
				<<<<<<< HEAD

				var sorted_fseries =[]
				for (var counter = 0; counter < fseries.length;counter++){
					sorted_fseries.push(doSortDates(fseries[counter].data));

				}

				=======
				
				var sorted_fseries =[]
				for (var counter = 0; counter < fseries.length;counter++){
					sorted_fseries.push(doSortDates(fseries[counter].data));
					
				}
				>>>>>>> 60887f0c2a57a4e6ed7337edad0b9d0295080eac
				chartProcessbase("velocity1",fseries,"Velocity Alerts, downslope")
				chartProcessbase("velocity2",fseries2,"Velocity Alerts, across slope")   
			}  
		}
		function chartProcess(id,data_series,name){
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
				// split: true,
				// crosshairs: true
			},
			plotOptions: {
				spline: {
					marker: {
						enabled: true
					}
				}
			},
			yAxis: {
				title: {
					text: 'Displacement'
				},
			},
			credits: {
				enabled: false
			},
			legend: {
				layout: 'vertical',
				align: 'right',
				verticalAlign: 'middle',
				borderWidth: 0,
				itemStyle: {
					color: '#0000'
				},
				itemHoverStyle: {
					color: '#0000'
				},
				itemHiddenStyle: {
					color: '#222'
				}
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
						<<<<<<< HEAD
						text: 'Depth'
						=======
						text: 'DeptH'
						>>>>>>> 60887f0c2a57a4e6ed7337edad0b9d0295080eac
					},
				},
				tooltip: {
					crosshairs: true
				},
				plotOptions: {
					spline: {
						marker: {
							enabled: true
						}
					}
				},
				credits: {
					enabled: false
				},
			// legend: {
			// 	layout: 'vertical',
			// 	align: 'right',
			// 	verticalAlign: 'middle',
			// 	borderWidth: 0,
			// 	itemStyle: {
			// 		color: '#222'
			// 	},
			// 	itemHoverStyle: {
			// 		color: '#E0E0E3'
			// 	},
			// 	itemHiddenStyle: {
			// 		color: '#606063'
			// 	}
			// },
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

				tooltip: {
					headerFormat: '{point.key}',
				// crosshairs: true,
				// split: true,
			},
			yAxis: {
				title: {
					text: 'Depth'
				},
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


					<<<<<<< HEAD
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
			=======
 				// var timeLabels = svg.selectAll(".timeLabel")
     //          	.data(time_index_obj)
     //          	.enter().append("text")
     //            .text(function(d) { return d.time.slice(11,16); })
     //            .attr("x", function(d) {
					// return d.index * 25; })
     //            .attr("y",  function(d) {
					// return 25;})
     //            .style("text-anchor", "middle")
     //            .attr("transform", "translate(11, -6)")
     //            .attr("class", function(d, i) { return ((i >= 7 && i <= 16) ? "timeLabel mono axis axis-worktime" : "timeLabel mono axis"); });

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
>>>>>>> 60887f0c2a57a4e6ed7337edad0b9d0295080eac
}
});


