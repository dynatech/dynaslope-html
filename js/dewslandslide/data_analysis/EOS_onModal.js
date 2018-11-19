
$(document).ready(function(e) {
	$('#tester_id_time').append(performance.now())

	$('.modal-backdrop').remove();
	$('#loading').modal('toggle');
	var values = window.location.href.split("/")
	var category = values[6]
	var site = values[7]
	var to_time = values[9]
	var from_time = values[8]
	var connection_id = values[5]
	var tester_date = values[10]
	$(".box").hide();
	dropdowlistAppendValue()
		if(category == "rain"){
			var from = moment(to_time.slice(0,10)+" " +to_time.slice(13,23)).subtract(13,'days').subtract(1,'hour').format('YYYY-MM-DD HH:mm:ss')
			var to = moment(to_time.slice(0,10)+" " +to_time.slice(13,23)).subtract(1,'hour').format('YYYY-MM-DD HH:mm:ss')
			RainFallProcess(site,from,to)
			console.log(site,from,to)

		}else  if(category == "surficial"){
			var from = moment().subtract(7,'days').format('YYYY-MM-DD')
			var to = moment().add(1,'days').format('YYYY-MM-DD')
			let dataSubmit = { 
				site : (site).toLowerCase(), 
				fdate : from,
				tdate : to
			}

			$.ajax({
				url:"/surficial_page/getDatafromGroundCrackNameUrl/"+site,
				dataType: "json",error: function(xhr, textStatus, errorThrown){
					console.log(errorThrown)},
					success: function(data)
					{
						$('.selectpicker').selectpicker();
						$('.graphGenerator').append('<select class="selectpicker"  id="crackgeneral" data-live-search="true"></select>');
						$(".graphGenerator").append('<h4><span class="glyphicon "></span><b>Superimposed Surficial Graph <select class="selectpicker pull-right" id="surperimpose_days">'+
							'</select></b></h4><br><div id="ground_graph"><div>')
						daysOption('surperimpose')
						SelectdaysOption('surperimpose')
						dropdowDayValue('surperimpose',from,to)
						$('#surperimpose_days').selectpicker('refresh');
						$('#crackgeneral').append('<option value="">Select Crack</option>')
						$('#crackgeneral').selectpicker('hide')
						var result= data
						var crack_name= [];
						for (i = 0; i <  result.length; i++) {
							dropdowlistAppendValue(result[i].crack_id, ((result[i].crack_id).toUpperCase()),'#crackgeneral');
							crack_name.push(result[i].crack_id)
						}
					}
				});

			surficialGraph(dataSubmit)
		}else if(category == "subsurface"){
			$.ajax({
				url:"/api/latestSensorData/"+site,
				dataType: "json",error: function(xhr, textStatus, errorThrown){
					console.log(errorThrown)},
					success: function(data)
					{

						var date1 = moment(data[0].timestamp);
						var date2 = moment(to_time.slice(0,10)+" " +to_time.slice(13,23));
						var duration = moment.duration(date2.diff(date1));

						if(duration._data.days > 0){
							var to = moment(data[0].timestamp).format('YYYY-MM-DD HH:mm:ss')

						}else{
							var to = moment(to_time.slice(0,10)+" " +to_time.slice(13,23)).subtract(1,'hour').format('YYYY-MM-DD HH:mm:ss')

						}
						var from = 'n'
						console.log(from,to)
						$(".graphGenerator").append('<div class="col-md-12 subsurface_analysis_div" id="subsurface_analysis_div"></div>')
						$("#subgeneral").val('column_sub')
						$(".selectpicker").selectpicker('refresh')
						var title = ["Column","Displacement","Velocity"]
						var id_title =["column","dis","velocity"]
						var id_div=[["colspangraph1","colspangraph2"],["dis1","dis2"],["velocity1","velocity2"]]
						for(var a = 0; a < title.length; a++){
							$("#subsurface-breadcrumb").append('<li class="breadcrumb-item" ><b class="breadcrumb-item" data-toggle="collapse" data-target="#'+id_title[a]+'_sub">'+title[a]+' Position</b></li>')
							$("#subsurface_analysis_div").append('<div class="col-md-12 sub"><div id="'+id_title[a]+'_sub" class="collapse in">'+
								'<div class="col-md-6" style="padding-left: 0px;padding-right: 0px;"><div id="'+id_div[a][0]+'"><br></div></div><div class="col-md-6" style="padding-left: 0px;padding-right: 0px;"><div id="'+id_div[a][1]+'"></div></div></div>')
						}

						$.ajax({
							url:"/api/SpecificSiteNum/"+site.slice(0,3),
							dataType: "json",error: function(xhr, textStatus, errorThrown){
								console.log(errorThrown)},
								success: function(data)
								{
									allSensorPosition(site,from,data["0"].data_timestamp)
								}
							})
					}
				});
			
		}else if(category == "pdf"){
			var svg = ['rain','surficial']
			all_column = values[8].split('%20')
			for (var i = 0; i < all_column.length; i++) {
				svg.push('subsurface_'+all_column[i])
			}
			$.post("/../../chart_export/renderCharts", {site: site, svg: svg, connection_id: connection_id})
			.done(function (data) {
				if(data == "Finished") {
					$('#loading').modal("hide");
					window.location.href = "/../../chart_export/viewPDF/Graph Attachment for "+from_time+"_"+to_time+"_"+site.toUpperCase() +".pdf";
				}
			})
			.fail(function (jqXHR, textStatus, errorThrown) {
				console.log(textStatus);
			});
		}
	
});


$(document).ajaxStart(function () {
	$(".bootstrap-select").click(function () {
		$(this).addClass("open");
	});
});
$(document).ajaxStop(function () {
	$(".bootstrap-select").click(function () {
		$(this).addClass("open");
	});


});




function SelectdaysOption(id) {
	$("#"+id+"_days").on("changed.bs.select", function(e, clickedIndex, newValue, oldValue) {
		var values = window.location.href.split("/")
		var category = values[6]
		var site = values[7]
		$('.modal-backdrop').remove();
		$('#loading').modal('toggle');
		var selected_days = ($(this).find('option').eq(clickedIndex).val()).toLowerCase();
		var to_time = values[9]
		var to = moment(to_time.slice(0,10)+" " +to_time.slice(13,23)).add(15,'m').format('YYYY-MM-DD HH:mm:ss')
		var from;
		if(selected_days == "7 days"){
			from = moment(to).subtract(7,'days').format('YYYY-MM-DD HH:mm:ss')
		}else if(selected_days == "10 days"){
			from = moment(to).subtract(10,'days').format('YYYY-MM-DD HH:mm:ss')
		}else if(selected_days == "2 weeks"){
			from = moment(to).subtract(14,'days').format('YYYY-MM-DD HH:mm:ss')
		}else if(selected_days == "1 month"){
			from = moment(to).subtract(30,'days').format('YYYY-MM-DD HH:mm:ss')
		}else if(selected_days == "3 months"){
			from = moment(to).subtract(90,'days').format('YYYY-MM-DD HH:mm:ss')
		}else if(selected_days == "6 months"){
			from = moment(to).subtract(120,'days').format('YYYY-MM-DD HH:mm:ss')
		}else if(selected_days == "1 year"){
			from = moment(to).subtract(1,'year').format('YYYY-MM-DD HH:mm:ss')
		}else if(selected_days == "Customize"){
			from = moment(to).subtract(5,'year').format('YYYY-MM-DD HH:mm:ss')
		}

		
		

		if(category == "rain"){
			RainFallProcess(site,from,to)
		}else  if(category == "surficial"){
			let dataSubmit = { 
				site : (site).toLowerCase(), 
				fdate : from,
				tdate : to
			}

			$.ajax({
				url:"/surficial_page/getDatafromGroundCrackNameUrl/"+site,
				dataType: "json",error: function(xhr, textStatus, errorThrown){
					console.log(errorThrown)},
					success: function(data)
					{
						$('.graphGenerator').empty();
						$('.selectpicker').selectpicker();
						$('.graphGenerator').append('<select class="selectpicker"  id="crackgeneral" data-live-search="true"></select>');
						$(".graphGenerator").append('<h4><span class="glyphicon "></span><b>Superimposed Surficial Graph <select class="selectpicker pull-right" id="surperimpose_days">'+
							'</select></b></h4><br><div id="ground_graph"><div>')
						daysOption('surperimpose')
						SelectdaysOption('surperimpose')
						dropdowDayValue('surperimpose',from,to)
						$('#surperimpose_days').selectpicker('refresh');
						$('#crackgeneral').append('<option value="">Select Crack</option>')
						$('#crackgeneral').selectpicker('hide')
						var result= data
						var crack_name= [];
						for (i = 0; i <  result.length; i++) {
							dropdowlistAppendValue(result[i].crack_id, ((result[i].crack_id).toUpperCase()),'#crackgeneral');
							crack_name.push(result[i].crack_id)
						}
					}
				});

			surficialGraph(dataSubmit)
		}
		
	})
}

function deleteNan(arr) {
	return arr.filter(function(item){ 
		return typeof item == "string" || (typeof item == "number" && item);
	});
}

function getRanges(array) {
	var ranges = [], rstart, rend;
	for (var i = 0; i < array.length; i++) {
		rstart = array[i];
		rend = rstart;
		while (array[i + 1] - array[i] == 1) {

			rend = array[i + 1];
			i++;
		}
		ranges.push(rstart == rend ? rstart+'' : rstart + '-' + rend);
	}
	return ranges;
}

function bouncer(arr) {
	return arr.filter(Boolean);
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

function removeSpecificArray(array, element) {
	const index = array.indexOf(element);
	array.splice(index, 1);
}

function dropdowDayValue(id,fromDate,toDate) {

	var date1 = moment(fromDate);
	var date2 = moment(toDate);
	var diff = date2.diff(date1,'days');

	if(diff == 8 || diff == 7){
		$('#'+id+'_days').val('7 days')
	}else if(diff == 9 || diff == 10){
		$('#'+id+'_days').val('10 days')
	}else if(diff == 13 || diff == 14){
		$('#'+id+'_days').val('2 weeks')
	}else if(diff == 29 || diff == 30){
		$('#'+id+'_days').val('1 months')
	}else if(diff == 89 || diff == 90){
		$('#'+id+'_days').val('3 months')
	}else if(diff == 119 || diff == 120){
		$('#rainfall_days').val('6 months')
	}else if(diff == 365 || diff == 367){
		$('#'+id+'_days').val('1 year')
	}else  {
		$('#'+id+'_days').val('Customize')
	}
	
	
}


function dropdowlistAppendValue(newitemnum, newitemdesc ,id) {
	$(id).append('<option val="'+newitemnum+'">'+newitemdesc+'</option>');
	$(id).selectpicker('refresh'); 
}

function daysOption(id) {
	var day_list_text=["7 days","10 days","2 weeks","1 month","3 months","6 months","1 year","Customize"];
	var day_list_val =["7d","10d","2w","1m","3m","6m","1y","customize"];
	
	$('#'+id+'_days').selectpicker();
	for (var j = 0; j < day_list_text.length; j++) {
		dropdowlistAppendValue(day_list_val[j], day_list_text[j] ,'#'+id+'_days')
	}
}
function RainFallProcess(curSite,fromDate,toDate){
	$('#rainfallgeneral').selectpicker();
	$('#rainfall_days').selectpicker();
	$(".graphGenerator").append('<div class="col-md-12" id="raincharts"></div>')
	$("#raincharts").empty()
	$("#raincharts").append('<ol class="breadcrumb rain-breadcrumb" id="rain-breadcrumb"></ol>')
	$("#raincharts").append('<h4><b>Rainfall Graph</b><select class="selectpicker pull-right rainfall_select"  id="rainfall_days"></select></h4><ol class="breadcrumb rain-breadcrumb" id="rain-breadcrumb"></ol><br>')
	$('.rainfall_select').selectpicker('refresh')
	daysOption('rainfall')
	SelectdaysOption('rainfall')
	dropdowDayValue('rainfall',fromDate,toDate)
	$('#rainfall_days').selectpicker('refresh');
	$(".rain-breadcrumb").hide()
	let dataSubmit = { 
		site : (curSite).toLowerCase(), 
		fdate : fromDate,
		tdate : toDate
	}
	$('.rain_graph_checkbox').empty()
	$.ajax({
		url:"/site_level_page/getDatafromRainPropsUrl/"+curSite.toLowerCase(),
		dataType: "json",error: function(xhr, textStatus, errorThrown){
			console.log(errorThrown)},
			success: function(data)
			{
				var result = data;
				var threshold_data = Math.round( parseFloat(result[0].max_rain_2year) * 10 ) / 10
				getRainSenslope(result[0].rain_senslope , dataSubmit, threshold_data ,'rain_senslope',result[0].rain_senslope);
				getRainArq(result[0].rain_arq , dataSubmit, threshold_data ,'rain_arq',result[0].rain_arq);
				getDistanceRainSite(result[0].RG1, dataSubmit, threshold_data ,'rain1',result[0].RG1+" ("+result[0].d_RG1+"km)");
				getDistanceRainSite(result[0].RG2, dataSubmit , threshold_data,'rain2',result[0].RG2+" ("+result[0].d_RG2+"km)");
				getDistanceRainSite(result[0].RG3, dataSubmit , threshold_data,'rain3',result[0].RG3+" ("+result[0].d_RG3+"km)");

				var ids1 = ['rain_senslope','rain_arq','rain1','rain2','rain3']
				var ids2 = [result[0].rain_senslope,result[0].rain_arq,result[0].RG1,result[0].RG2,result[0].RG3]
				for (var i = 0; i < ids1.length; i++) {
					if( ids2[i] == null){
						removeSpecificArray(ids1, ids1[i]);
						removeSpecificArray(ids2, ids2[i]);
					}
				}
				
				for (var i = 0; i < ids1.length; i++) {
					$("#raincharts").append('<div class="col-md-6 rainGraph "><div  id="'+ids1[i]+'2" class="collapse in"></div></div><div class="col-md-6 rainGraph"><div id="'+ids1[i]+'" class="collapse in"></div><div>')
					
				}
				$("#raincharts").append('<div class="maxPlot" id="cumulativeMax">'+ids1.length+'</div>');
				$("#raincharts").append('<div class="maxPlot" id="cumulativeTime"></div>');
				$(".maxPlot").hide();
			}
		});	

}

function getDistanceRainSite(site,dataSubmit,max_rain,id,distance) { 
	if(site.slice(0,1) == "r" ){
		getRainNoah(site, dataSubmit , max_rain,id,distance);
	}else if(site.length == 4){
		getRainSenslope(site, dataSubmit , max_rain,id,distance);
	}else if(site.length == 6){
		getRainArq(site, dataSubmit , max_rain,id,distance);
	}
}
function getRainSenslope(site,dataSubmit,max_rain,id,distance) {
	console.log("/api/RainSenslope/"+site+"/"+dataSubmit.fdate+"/"+dataSubmit.tdate)
	if(site != null){
		$.ajax({
			url:"/api/RainSenslope/"+site+"/"+dataSubmit.fdate+"/"+dataSubmit.tdate,
			dataType: "json",error: function(xhr, textStatus, errorThrown){
				console.log(errorThrown)},
				success: function(data)
				{
					
					$("#rain-breadcrumb").append('<li class="breadcrumb-item"><a class="breadcrumb-item" data-toggle="collapse in" data-target="#'+id+'"><button type="button">'+site.toUpperCase()+'</button></a></li>')
					dropdowlistAppendValue(id,site.toUpperCase(),'#rainfallgeneral');
					var DataSeries24h=[] , DataSeriesRain=[] , DataSeries72h=[] , negative=[] , nval=[],nlines=[];
					var max = max_rain;
					var max_array_data = [];
					var all_cummulative=[];
					var all_ts=[];
					var colors= ["#0000FF","#FF0000","black"]
					if(data.length != 0){
						var jsonRespo =JSON.parse(data);
						console.log(jsonRespo.length)
						for (i = 0; i < jsonRespo.length; i++) {
							var Data24h=[] ,Datarain=[] ,Data72h=[];
							var date1 = moment(dataSubmit.tdate).subtract(10,'days').subtract(1,'hour');
							var date2 = moment(jsonRespo[i].ts);
							var duration =date2.diff(date1,'hours');

							if( duration >= 0){
								var time =  Date.parse(jsonRespo[i].ts);
								all_ts.push(time)
								all_cummulative.push(parseFloat(jsonRespo[i].rval))
								max_array_data.push(parseFloat(jsonRespo[i].hrs72))
								Data72h.push(time, parseFloat(jsonRespo[i].hrs72));
								Data24h.push(time, parseFloat(jsonRespo[i].hrs24));
								Datarain.push(time, parseFloat(jsonRespo[i].rval));
								DataSeries72h.push(Data72h);
								DataSeries24h.push(Data24h);
								DataSeriesRain.push(Datarain);
								if(jsonRespo[i].rval == null){
									nval.push(i);
								}
							}
							
						}
						var nodata_nval=getRanges(nval)	
						$('#cumulativeTime').append(","+Math.max.apply(null,bouncer(deleteNan(all_ts))))
						$('#cumulativeMax').append(","+Math.max.apply(null,bouncer(deleteNan(all_cummulative))))
						var max_value = (Math.max.apply(null, bouncer(max_array_data)))
						for (var i = 0; i < nodata_nval.length; i++) {
							var num = (nodata_nval[i])
							if(num.search('-') == -1){
								nlines.push({color: 'rgba(68, 170, 213, .2)',width: 2,value: Date.parse(jsonRespo[parseFloat(num)].ts)})
								// negative.push( {from: Date.parse(jsonRespo[parseFloat(num)].ts), to: Date.parse(jsonRespo[parseFloat(num)].ts), color: 'rgba(68, 170, 213, .2)'})
							}else{
								var new_num = num.split("-")
								negative.push( {from: Date.parse(jsonRespo[parseFloat(new_num[0])].ts), to: Date.parse(jsonRespo[parseFloat(new_num[1])].ts), color: 'rgba(68, 170, 213, .2)'})
							}
							
						}
						var divname =["24hrs","72hrs" ,"30mins"];
						var all_raindata =[DataSeries24h,DataSeries72h,DataSeriesRain];
						var color =["red","blue","green"];
						var series_data = [];
						var series_data2 = [];
						negative.push({from: parseFloat(all_raindata[0][all_raindata[0].length-1]),to:Date.parse(dataSubmit.tdate),color:'rgba(68, 170, 213, .2)'})
						for (i = 0; i < divname.length-1; i++) {
							series_data.push({ name: divname[i],step: true, data: all_raindata[i] ,id: divname[i],fillOpacity: 0.4, zIndex:  (divname.length-1)-i, lineWidth: 1, color: colors[i]})
						}
						series_data2.push({ name: divname[2],step: true, data: all_raindata[2],id : divname[2],fillOpacity: 0.4, zIndex: 1, lineWidth: 1, color: colors[2]})
						let dataTableSubmit = { 
							site : site, 
							fdate : moment(dataSubmit.fdate).subtract(9,'days'),
							tdate : dataSubmit.tdate,
							current_site : dataSubmit.site,
							id:id,
							category:'senslope',
							max_rain:max_rain,
							distance:distance
						}
						setTimeout(function(){
							chartProcessRain(series_data,id,'Senslope',site,max_rain,dataTableSubmit,distance,max_value);
							if(all_raindata[2].length != 0){
								chartProcessRain2(series_data2,id,'Senslope',site,max_rain,negative,dataTableSubmit,distance,nlines);
							}else{
								chartProcessRain2(undefined,id,'Senslope',site,max_rain,negative,dataTableSubmit,distance,nlines);
								chartProcessRain(undefined,id,'Senslope',site,max_rain,dataTableSubmit,distance,max_value);
							}
							
						}, 1000);
					}else{
						let dataTableSubmit = { 
							site : site, 
							fdate : moment(dataSubmit.fdate).subtract(9,'days'),
							tdate : dataSubmit.tdate,
							current_site : dataSubmit.site,
							id:id,
							category:'senslope',
							max_rain:max_rain,
							distance:distance
						}
						chartProcessRain(series_data,id,'Senslope',site,max_rain,dataTableSubmit,distance,max_value);
						chartProcessRain2(series_data2,id,'Senslope',site,max_rain,negative,dataTableSubmit,distance,nlines);
					}
				}
			})

}
}

function getRainArq(site,dataSubmit,max_rain,id,distance) {
	if(site != null){
		$.ajax({
			url:"/api/RainARQ/"+site+"/"+dataSubmit.fdate+"/"+dataSubmit.tdate,
			dataType: "json",error: function(xhr, textStatus, errorThrown){
				console.log(errorThrown)},
				success: function(data)
				{

					$("#rain-breadcrumb").append('<li class="breadcrumb-item"><a class="breadcrumb-item" data-toggle="collapse in" data-target="#'+id+'"><button type="button">'+site.toUpperCase()+'</button></a></li>')
					dropdowlistAppendValue(id,site.toUpperCase(),'#rainfallgeneral');
					var DataSeries24h=[] , DataSeriesRain=[] , DataSeries72h=[] , negative=[] , nval=[],nlines=[];
					var max = max_rain;
					var max_array_data = [];
					var all_cummulative=[];
					var all_ts=[];
					var colors= ["#0000FF","#FF0000","black"]
					if(data.length != 0){
						var jsonRespo =JSON.parse(data);
						console.log(jsonRespo.length)
						for (i = 0; i < jsonRespo.length; i++) {
							var Data24h=[] ,Datarain=[] ,Data72h=[];
							var date1 = moment(dataSubmit.tdate).subtract(10,'days').subtract(1,'hour');
							var date2 = moment(jsonRespo[i].ts);
							var duration = date2.diff(date1,'hours');
							if( duration >= 0){
								var time =  Date.parse(jsonRespo[i].ts);
								all_ts.push(time)
								all_cummulative.push(parseFloat(jsonRespo[i].rval))
								max_array_data.push(parseFloat(jsonRespo[i].hrs72));
								Data72h.push(time, parseFloat(jsonRespo[i].hrs72));
								Data24h.push(time, parseFloat(jsonRespo[i].hrs24));
								Datarain.push(time, parseFloat(jsonRespo[i].rval));
								DataSeries72h.push(Data72h);
								DataSeries24h.push(Data24h);
								DataSeriesRain.push(Datarain);
								if(jsonRespo[i].rval == null){
									nval.push(i);
								}
							}
						}
						var nodata_nval=getRanges(nval)	
						$('#cumulativeTime').append(","+Math.max.apply(null,bouncer(deleteNan(all_ts))))
						$('#cumulativeMax').append(","+Math.max.apply(null,bouncer(deleteNan(all_cummulative))))
						var max_value = (Math.max.apply(null, bouncer(max_array_data)))
						for (var i = 0; i < nodata_nval.length; i++) {
							var num = (nodata_nval[i])
							if(num.search('-') == -1){
								nlines.push({color: 'rgba(68, 170, 213, .2)',width: 2,value: Date.parse(jsonRespo[parseFloat(num)].ts)})
								// negative.push( {from: Date.parse(jsonRespo[parseFloat(num)].ts), to: Date.parse(jsonRespo[parseFloat(num)].ts), color: 'rgba(68, 170, 213, .2)'})
							}else{
								var new_num = num.split("-")
								negative.push( {from: Date.parse(jsonRespo[parseFloat(new_num[0])].ts), to: Date.parse(jsonRespo[parseFloat(new_num[1])].ts), color: 'rgba(68, 170, 213, .2)'})
							}
							
						}
						var divname =["24hrs","72hrs" ,"30mins"];
						var all_raindata =[DataSeries24h,DataSeries72h,DataSeriesRain];
						var color =["red","blue","green"];
						var series_data = [];
						var series_data2 = [];
						negative.push({from: parseFloat(all_raindata[0][all_raindata[0].length-1]),to:Date.parse(dataSubmit.tdate),color:'rgba(68, 170, 213, .2)'})
						for (i = 0; i < divname.length-1; i++) {
							series_data.push({ name: divname[i],step: true, data: all_raindata[i] ,id: divname[i],fillOpacity: 0.4, zIndex:  (divname.length-1)-i, lineWidth: 1, color: colors[i]})
						}
						series_data2.push({ name: divname[2],step: true, data: all_raindata[2],id : divname[2],fillOpacity: 0.4, zIndex: 1, lineWidth: 1, color: colors[2]})
						let dataTableSubmit = { 
							site : site, 
							fdate : moment(dataSubmit.fdate).subtract(9,'days'),
							tdate : dataSubmit.tdate,
							current_site : dataSubmit.site,
							id:id,
							category:'arq',
							max_rain:max_rain,
							distance:distance
						}
						setTimeout(function(){
							chartProcessRain(series_data,id,'ARQ',site,max_rain,dataTableSubmit,distance,max_value);
							if(all_raindata[2].length != 0){
								chartProcessRain2(series_data2,id,'ARQ',site,max_rain,negative,dataTableSubmit,distance,nlines);
							}else{
								chartProcessRain2(undefined,id,'ARQ',site,max_rain,negative,dataTableSubmit,distance,nlines);
								chartProcessRain(undefined,id,'ARQ',site,max_rain,dataTableSubmit,distance,max_value);
							}
							
						}, 1000);
					}else{
						let dataTableSubmit = { 
							site : site, 
							fdate : moment(dataSubmit.fdate).subtract(9,'days'),
							tdate : dataSubmit.tdate,
							current_site : dataSubmit.site,
							id:id,
							category:'arq',
							max_rain:max_rain,
							distance:distance
						}
						chartProcessRain(series_data,id,'ARQ',site,max_rain,dataTableSubmit,distance,max_value);
						chartProcessRain2(series_data2,id,'ARQ',site,max_rain,negative,dataTableSubmit,distance,nlines);
					}

				}
			})
}
}

function getRainNoah(site,dataSubmit,max_rain,id,distance) {

	if(site != null){
		var rain_noah_number = site.slice(10,20)
		console.log("/api/RainNoah/"+rain_noah_number+"/"+dataSubmit.fdate+"/"+dataSubmit.tdate)
		$.ajax({
			url:"/api/RainNoah/"+rain_noah_number+"/"+dataSubmit.fdate+"/"+dataSubmit.tdate,
			dataType: "json",error: function(xhr, textStatus, errorThrown){
				console.log(errorThrown)},
				success: function(data)
				{
					
					$("#rain-breadcrumb").append('<li class="breadcrumb-item"><a class="breadcrumb-item" data-toggle="collapse in" data-target="#'+id+'"><button type="button">'+site.toUpperCase()+'</button></a></li>')
					dropdowlistAppendValue(id,site.toUpperCase(),'#rainfallgeneral');
					var DataSeries24h=[] , DataSeriesRain=[] , DataSeries72h=[] , negative=[] , nval=[], nlines=[];
					var max = max_rain;
					var max_array_data = [];
					var all_cummulative=[];
					var all_ts=[];
					var colors= ["#0000FF","#FF0000","black"]
					if(data.length != 0){
						var jsonRespo = JSON.parse(data);
						console.log(jsonRespo.length)
						for (i = 0; i < jsonRespo.length; i++) {
							var Data24h=[] ,Datarain=[] ,Data72h=[];
							var date1 = moment(dataSubmit.tdate).subtract(10,'days').subtract(1,'hour');
							var date2 = moment(jsonRespo[i].ts);
							var duration = date2.diff(date1,'hours');
							if( duration >= 0){
								var time =  Date.parse(jsonRespo[i].ts);
								all_ts.push(time)
								all_cummulative.push(parseFloat(jsonRespo[i].rval))
								max_array_data.push(parseFloat(jsonRespo[i].hrs72));
								Data72h.push(time, parseFloat(jsonRespo[i].hrs72));
								Data24h.push(time, parseFloat(jsonRespo[i].hrs24));
								Datarain.push(time, parseFloat(jsonRespo[i].rval));
								DataSeries72h.push(Data72h);
								DataSeries24h.push(Data24h);
								DataSeriesRain.push(Datarain);
								if(jsonRespo[i].rval == null){
									nval.push(i);
								}
							}
						}
						var nodata_nval=getRanges(nval)
						
						$('#cumulativeTime').append(","+Math.max.apply(null,bouncer(deleteNan(all_ts))))
						$('#cumulativeMax').append(","+Math.max.apply(null,bouncer(deleteNan(all_cummulative))))
						for (var i = 0; i < nodata_nval.length; i++) {
							var num = (nodata_nval[i])
							if(num.search('-') == -1){
								nlines.push({color: 'rgba(68, 170, 213, .2)',width: 2,value: Date.parse(jsonRespo[parseFloat(num)].ts)})
								// negative.push( {from: Date.parse(jsonRespo[parseFloat(num)].ts), to: Date.parse(jsonRespo[parseFloat(num)].ts), color: 'rgba(68, 170, 213, .2)'})
							}else{
								var new_num = num.split("-")
								negative.push( {from: Date.parse(jsonRespo[parseFloat(new_num[0])].ts), to: Date.parse(jsonRespo[parseFloat(new_num[1])].ts), color: 'rgba(68, 170, 213, .2)'})
							}
							
						}
						
						var max_value = (Math.max.apply(null, bouncer(max_array_data)))
						var divname =["24hrs","72hrs" ,"30mins"];
						var all_raindata =[DataSeries24h,DataSeries72h,DataSeriesRain];
						var color =["red","blue","green"];
						var series_data = [];
						var series_data2 =[];
						negative.push({from: parseFloat(all_raindata[0][all_raindata[0].length-1]),to:Date.parse(dataSubmit.tdate),color:'rgba(68, 170, 213, .2)'})
						for (i = 0; i < divname.length-1; i++) {
							series_data.push({ name: divname[i],step: true, data: all_raindata[i] , id: divname[i], fillOpacity: 0.4 , zIndex: (divname.length-1)-i, lineWidth: 1, color: colors[i]})
						}

						
						series_data2.push({ name: divname[2],step: true, data: all_raindata[2] , id: divname[2], fillOpacity: 0.4 , zIndex: 1, lineWidth: 1, color: colors[2]})
						let dataTableSubmit = { 
							site : site, 
							fdate : moment(dataSubmit.fdate).subtract(9,'days'),
							tdate : dataSubmit.tdate,
							current_site : dataSubmit.site,
							id:id,
							category:'noah',
							max_rain:max_rain,
							distance:distance
						}
						setTimeout(function(){
							chartProcessRain(series_data,id,'Noah',site,max_rain,dataTableSubmit,distance,max_value );
							if(all_raindata[2].length != 0){
								chartProcessRain2(series_data2,id,'Noah',site,max_rain,negative,dataTableSubmit,distance,nlines );
							}else{
								chartProcessRain2(undefined,id,'Noah',site,max_rain,negative,dataTableSubmit,distance,nlines);
								chartProcessRain(undefined,id,'Noah',site,max_rain,dataTableSubmit,distance,max_value);
							}
							
						}, 1000);
					}else{
						let dataTableSubmit = { 
							site : site, 
							fdate : moment(dataSubmit.fdate).subtract(9,'days'),
							tdate : dataSubmit.tdate,
							current_site : dataSubmit.site,
							id:id,
							category:'noah',
							max_rain:max_rain,
							distance:distance
						}
						chartProcessRain(series_data,id,'Noah',site,max_rain,dataTableSubmit,distance,max_value );
						chartProcessRain2(series_data2,id,'Noah',site,max_rain,negative,dataTableSubmit,distance,nlines);
					}
				}
			})
}
}

function chartProcessRain(series_data ,id , data_source ,site ,max,dataTableSubmit,distance,max_value ){
	var fdate = dataTableSubmit.fdate;
	var tdate = dataTableSubmit.tdate;
	var date1 = moment(fdate);
	var date2 = moment(tdate);
	var duration = moment.duration(date2.diff(date1));
	var  list_dates =[];
	for (var i = 1; i < duration.asDays(); i++) {
		list_dates.push(site.slice(0,3)+((moment(fdate).add(i,'days').format('YYYY-MM-DD')).replace(/-/g, "")).slice(2,10))
	}
	var cumulative_time = ($('#cumulativeTime').text()).split(",")
	var max_plot_time = [];
	for (var i = 1; i < cumulative_time.length; i++) {
		if(Number(cumulative_time[i]) != NaN){
			max_plot_time.push(cumulative_time[i])
		}
	}
	let dataSubmit = { date:list_dates,table:site}

	if(max_value != -Infinity){
		var maxValue = Math.max(0,(max_value-parseFloat(max)))+parseFloat(max)
	}else{
		if( series_data != undefined){
			var maxValue = Math.max(0,(max_value-parseFloat(max)))+parseFloat(max)
		}else{
			var maxValue = undefined
		}
	}

	var colors= ["#EBF5FB","#0000FF","#FF0000"]
	Highcharts.setOptions({
		global: {
			timezoneOffset: -8 * 60
		},
	});
	$("#"+id).highcharts({
		chart: {
			type: 'line',
			zoomType: 'x',
			panning: true,
			panKey: 'shift',
			height: 300,

		},
		title: {
			text:' <b>Rainfall </b>',
			style: {
				fontSize: '15px'
			}
		},
		subtitle: {
			text: '<b> Source: </b>'+  (distance).toUpperCase(),
			style: {
				fontSize: '10px'
			}
		},
		xAxis: {
			max:Math.max.apply(null,bouncer(deleteNan(max_plot_time))),
			type: 'datetime',
			dateTimeLabelFormats: { 
				month: '%e %b %Y',
				year: '%b'
			},
			title: {
				text: 'Date'
			},
			title: {
				text: 'Date',
			},
			events:{
				afterSetExtremes:function(){
					if (!this.chart.options.chart.isZoomed)
					{                                         
						var xMin = this.chart.xAxis[0].min;
						var xMax = this.chart.xAxis[0].max;
						var zmRange = 0.5;
						zoomEvent(id,zmRange,xMin,xMax)
					}
				}
			}
		},

		yAxis:{
			title: {
				text: 'Value (mm)',
			},
			max: maxValue,
			min: 0,
			plotBands: [{
				value: Math.round( parseFloat(max/2) * 10 ) / 10,
				color: colors[1],
				dashStyle: 'shortdash',
				width: 2,
				zIndex: 0,
				label: {
					text: '24-hr threshold (' + max/2 +')',

				}
			},{
				value: max,
				color: colors[2],
				dashStyle: 'shortdash',
				width: 2,
				zIndex: 0,
				label: {
					text: '72-hr threshold (' + max +')',

				}
			}]

		},
		tooltip: {
			shared: true,
			crosshairs: true
		},

		plotOptions: {
			series: {
				marker: {
					radius: 3
				},
				cursor: 'pointer',
				point: {
					events: {
						click: function () {
							if(this.series.name == "Tag"){
								$("#tagModal").modal("show");
								$("#comment-model").empty();
								$("#comment-model").append('<small>REMARKS: </small>'+this.value)
							}else{
								$("#annModal").modal("show");
								$(".tag").hide();
								$('#tag_ids').tagsinput('removeAll');
								$("#tag_time").val(moment(this.x).format('YYYY-MM-DD HH:mm:ss'))
								$("#tag_value").val(this.y)
								$("#tag_crack").val(this.series.name)
								$("#tag_description").val('rain analysis')
								$("#tag_tableused").val(site)
								$("#tsAnnotation").attr('value',moment(this.category).format('YYYY-MM-DD HH:mm:ss'));
							}
						}
					}
				}

			},
			area: {
				marker: {
					lineWidth: 3,
					lineColor: null 
				}
			}

		},
		legend: {
			enabled: false
		},
		credits: {
			enabled: false
		},
		series:series_data
	},function(chart) { 
		syncronizeCrossHairs(chart,id);

	});


}



function chartProcessRain2(series_data ,id , data_source ,site ,max ,negative,dataTableSubmit,distance,nlines){
	var fdate = dataTableSubmit.fdate;
	var tdate = dataTableSubmit.tdate;
	var date1 = moment(fdate);
	var date2 = moment(tdate);
	var duration = moment.duration(date2.diff(date1));
	var cumulative_time = ($('#cumulativeTime').text()).split(",")
	var max_plot_time = [];
	var cumulative_max = ($('#cumulativeMax').text()).split(",")
	var max_plot_cumulative = [];
	for (var i = 1; i < cumulative_max.length; i++) {
		if(Number(cumulative_max[i]) != NaN){
			max_plot_cumulative.push(cumulative_max[i])
			max_plot_time.push(cumulative_time[i-1])
		}
	}

	var colors= ["#EBF5FB","#0000FF","#FF0000"]
	Highcharts.setOptions({
		global: {
			timezoneOffset: -8 * 60
		}
	});
	$("#"+id+"2").highcharts({
		chart: {
			type: 'column',
			zoomType: 'x',
			panning: true,
			height: 300,
		},
		title: {
			text:' <b>Rainfall </b>',
			style: {
				fontSize: '15px'
			}
		},
		subtitle: {
			text: '<b>Source: </b> '+(distance).toUpperCase(),
			style: {
				fontSize: '10px'
			}
		},
		xAxis: {
			max:Date.parse(tdate),
			plotBands: negative,
			plotLines: nlines,
			type: 'datetime',
			dateTimeLabelFormats: { 
				month: '%e %b %Y',
				year: '%b'
			},
			title: {
				text: 'Date'
			},
			events:{
				afterSetExtremes:function(){
					if (!this.chart.options.chart.isZoomed)
					{                                         
						var xMin = this.chart.xAxis[0].min;
						var xMax = this.chart.xAxis[0].max;
						var zmRange = 0.5;
						zoomEvent(id,zmRange,xMin,xMax,'rain')
					}
				}
			}

		},
		yAxis: {
			max: Math.max.apply(null,bouncer(deleteNan(max_plot_cumulative))),
			min: 0,
			title: {
				text: 'Value (mm)'
			},

		},

		tooltip: {
			shared: true,
			crosshairs: true
		},

		plotOptions: {
			scatter: {
				marker: {
					radius: 5,
					states: {
						hover: {
							enabled: true,
							lineColor: 'rgb(100,100,100)'
						}
					}
				},
				states: {
					hover: {
						marker: {
							enabled: false
						}
					}
				}
			},
			series: {
				marker: {
					radius: 3
				},
				cursor: 'pointer',
			},
			area: {
				marker: {
					lineWidth: 3,
					lineColor: null 
				}
			}

		},
		legend: {
			enabled: false
		},
		credits: {
			enabled: false
		},
		series:series_data
	},function(chart) { 
		syncronizeCrossHairs(chart,id+"2",'rain');

	});

	setTimeout(function(){
		svgChart('rain') 
	}, 5000);
	

}

function surficialGraph(dataTableSubmit) {  
	console.log("/api/GroundDataFromLEWSInRange/"+dataTableSubmit.site+"/"+dataTableSubmit.fdate+"/"+dataTableSubmit.tdate)
	$.ajax({ 
		dataType: "json",
		url: "/api/GroundDataFromLEWSInRange/"+dataTableSubmit.site+"/"+dataTableSubmit.fdate+"/"+dataTableSubmit.tdate,  success: function(data_result) {
			var result_unfiltered = JSON.parse(data_result)
			if(result_unfiltered.length >= 1  ){
				surficialFiltered(result_unfiltered,dataTableSubmit)
			}else{
				surficialChecker(dataTableSubmit)
			}
		}
	});	
}

function surficialChecker(dataTableSubmit){
	$.ajax({ 
		dataType: "json",
		url: "/api/latestGroundData/"+dataTableSubmit.site,  success: function(data_result) {
			let data = { 
				site : dataTableSubmit.site, 
				fdate : data_result[data_result.length-1].timestamp,
				tdate : data_result[0].timestamp
			}
			surficialGraph(data)
			dropdowDayValue('surperimpose',data_result[data_result.length-1].timestamp,data_result[0].timestamp)
			$('#surperimpose_days').selectpicker('refresh');
			
		}
	});
}
function surficialFiltered(result,dataTableSubmit){
	var crackname_process = []
	for (var a = 0; a < result.length; a++) {
		crackname_process.push(result[a].crack_id)
	}
	var slice =[0];
	var data1 =[];
	var data =[];
	var opts = $('#crackgeneral')[0].options;

	var crack_name = removeDuplicates(crackname_process);

	for (var a = 0; a < crack_name.length; a++) {
		var all = []
		for (var i = 0; i < result.length; i++) {
			if(crack_name[a] == result[i].crack_id){
				data1.push(crack_name[a]);
				data.push([Date.parse(result[i].ts) , result[i].meas] );
			}
		}
	}
	for(var a = 0; a < data1.length; a++){
		if(data1[a]!= data1[a+1]){
			slice.push(a+1)
		}
	}
	var series_data=[]


	for(var a = 0; a < crack_name.length; a++){
		series_data.push({name:crack_name[a],data:data.slice(slice[a],slice[a+1]),id:(crack_name[a]).replace(/ /g,""),dashStyle: 'shortdash'})
	}
	$('#ground_graph').empty();
	chartProcessSurficial('ground_graph',series_data,'Surficial Graph',dataTableSubmit)
	$("#tag_series").val(JSON.stringify(series_data))

}
function chartProcessSurficial(id,data_series,name,dataTableSubmit){
	var site = $('#sitegeneral').val();
	var fdate = dataTableSubmit.fdate;
	var tdate = dataTableSubmit.tdate;
	var date1 = moment(fdate);
	var date2 = moment(tdate);
	var duration = moment.duration(date2.diff(date1));
	var  list_dates =[];
	for (var i = 1; i < duration.asDays(); i++) {
		list_dates.push(site+((moment(fdate).add(i,'days').format('YYYY-MM-DD')).replace(/-/g, "")).slice(2,10))
	}
	let dataSubmit = { date:list_dates,table:'gndmeas'}
	Highcharts.setOptions({
		global: {
			timezoneOffset: -8 * 60
		},
	});
	$("#"+id).highcharts({
		chart: {
			type: 'line',
			zoomType: 'x',
			panning: true,
			panKey: 'shift',
			height: 800,
			width:1000
		},
		title: {
			text: name,
		},
		subtitle: {
			text: '<b>Source: </b> ' + (dataTableSubmit.site).toUpperCase()
		},
		yAxis:{
			title: {
				text: 'Displacement (cm)'
			}
		},
		xAxis: {

			type: 'datetime',
			dateTimeLabelFormats: { 
				month: '%e. %b %Y',
				year: '%b'
			},
			title: {
				text: 'Date'
			},
		},
		tooltip: {
			split: true,
			crosshairs: true,
		},
		plotOptions: {
			line: {
				marker: {
					enabled: true
				}
			},
			series: {
				marker: {
					radius: 3
				},
				cursor: 'pointer',
				point: {
					events: {
						click: function () {
							if(this.series.name == "Tag"){
								$("#tagModal").modal("show");
								$("#comment-model").empty();
								$("#comment-model").append('<small>REMARKS: </small>'+this.value)
							}else{
								$("#annModal").modal("show");
								$(".tag").hide();
								$('#tag_ids').tagsinput('removeAll');
								$("#tag_time").val(moment(this.x).format('YYYY-MM-DD HH:mm:ss'))
								$("#tag_value").val(this.y)
								$("#tag_crack").val(this.series.name)
								$("#tag_description").val('ground analysis')
								$("#tag_tableused").val('gndmeas')
								$("#tsAnnotation").attr('value',moment(this.category).format('YYYY-MM-DD HH:mm:ss'));
							}
						}
					}
				}
			},
		},
		credits: {
			enabled: false
		},
		series:data_series
	});
	var chart = $('#'+id).highcharts();
	$( ".highcharts-series-"+(data_series.length-1) ).click(function() {
		var series = chart.series[(data_series.length-1)];
		for (var i = 0; i < label_crack.length; i++) {
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

	var name_site = ((($( "tspan" ).text()).split('.')))
	var extracted_name = (name_site[0]).split(' ');
	$( ".highcharts-contextbutton" ).attr( "visibility", "hidden" );
	$( "#pdfsvg" ).empty();

	
	setTimeout(function(){
		svgChart('surficial') 
	}, 1000);

	
}

function allSensorPosition(site,fdate,tdate) {
	$.ajax({url: "/api/SensorAllAnalysisData/"+site+"/"+fdate+"/"+tdate,
		dataType: "json",
		success: function(result){
			var data = JSON.parse(result);
			columnPosition(data[0].c,site)
			displacementPosition(data[0].d,data[0].v,site)
			$("#reportrange2").popover('hide')
			$("#sub_title").popover('show')
			$(".sub_surface_analysis_checkbox").empty()
			$(".sub_surface_analysis_checkbox").append('<input id="sub_surface_analysis_checkbox" type="checkbox" class="checkbox">'
				+'<label for="sub_surface_analysis_checkbox"> Sub-Surface Analysis Graph</label>')
			$('#sub_surface_analysis_checkbox').prop('checked', true);
			$('input[id="sub_surface_analysis_checkbox"]').on('click',function () {
				if ($('#sub_surface_analysis_checkbox').is(':checked')) {
					$("#subsurface_analysis_div").slideDown()
				}else{
					$("#subsurface_analysis_div").slideUp()
				}
			});	
		}
	});
}
function columnPosition(data_result,site) {
	if(data_result!= "error"){
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
		listDate.sort()
		for(var i = 0; i < AlllistId.length; i++){
			if(AlllistId[i] != AlllistId[i+1]){
				listId.push(AlllistId[i])
			}
		}
		var all_col_data = []
		for(var i = 0; i < listDate.length; i++){
			for(var a = 0; a < data.length; a++){
				if(listDate[i] == data[a].ts){
					fdatadown.push({x:data[a].downslope,y:data[a].depth})
					fdatalat.push({x:data[a].latslope,y:data[a].depth})
					all_col_data.push(data[a].latslope)
					all_col_data.push(data[a].downslope)
				}
			}
		}
		var min_value = (Math.min.apply(null, bouncer(removeDuplicates(all_col_data))))
		var max_value = (Math.max.apply(null, bouncer(removeDuplicates(all_col_data))))
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
			fseries.push({name:listDate[a].slice(0,16), data:fAlldown[a] ,color:inferno[color]})
			fseries2.push({name:listDate[a].slice(0,16),  data:fAlllat[a],color:inferno[color]})
			
		}
		chartProcessInverted("colspangraph1",fseries,"Horizontal Displacement, <br> Downslope (m)",site,min_value,max_value)
		chartProcessInverted("colspangraph2",fseries2,"Horizontal Displacement, <br> Across Slope (m)",site,min_value,max_value)
		$("#column_sub").switchClass("collapse","in");
	}     
}

function displacementPosition(data_result,data_result_v,site) {
	if(data_result != "error"){
		var data = data_result;
		var totalId =[] , listid = [0] ,allTime=[] ,allId=[] , totId = [];
		var fixedId =[] , alldata=[], alldata1=[] , allIdData =[];
		var disData1 = [] 
		var fseries = [], fseries2 = [];
		var c1series =[], c2series =[];
		var d1= [] , d2 =[] , n1=[];
		var ann1data =[] ,ann2data=[] ;
		
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
		for(var i = fixedId.length-1; i >= 0 ; i--){
			var num = fixedId.length-(totId.length*i);
			if(num >= 0 ){
				listid.push(num);
			}
		}
		for(var a = 1; a < (listid.length); a++){
			if(listid[a] != undefined){
				disData1.push(fixedId.slice(listid[a-1],listid[a+1]));
			}
		}
		
		var all_val = [];
		for(var a = 0; a < disData1.length; a++){
			for(var i = 0; i < disData1[0].length; i++){
				d1.push({id:disData1[a][i].id,x:Date.parse(disData1[a][i].ts) ,y:((disData1[a][i].downslope-data[0].cml_base))*1000})
				d2.push({id:disData1[a][i].id,x:Date.parse(disData1[a][i].ts) ,y:((disData1[a][i].latslope-data[0].cml_base))*1000})
				all_val.push(((disData1[a][i].downslope-data[0].cml_base))*1000)
				all_val.push(((disData1[a][i].latslope-data[0].cml_base))*1000)
			}
			if(a <= data_result[0].annotation.length-1){
				ann1data.push({value: ((disData1[a+1][0].latslope-data[0].cml_base))*1000 - (data[0].cml_base*2),width: 0,label: {text: data_result[0].annotation[a].downslope_annotation,style: {color: 'gray'}}})
				ann2data.push({value: ((disData1[a+1][0].latslope-data[0].cml_base))*1000 - (data[0].cml_base*2),width: 0,label: {text: data_result[0].annotation[a].latslope_annotation,style: {color: 'gray'}}})
			}
		}

		var min_value = (Math.min.apply(null, bouncer(removeDuplicates(all_val))))
		var diff = (min_value/data[0].disp.length)
		for(var i = 1; i < disData1.length; i++){
			n1.push({from:((disData1[i][1].downslope-data[0].cml_base)*1000)+.15,to:((disData1[i][1].downslope-data[0].cml_base)*1000)-diff,
				label: {text: data_result[0].annotation[i-1].downslope_annotation,style: {color: '#1c1c1c'}}})
		}


		for(var a = 0; a < data[0].cumulative.length; a++){
			c1series.push({x:Date.parse(data[0].cumulative[a].ts) ,y:((data[0].cumulative[a].downslope-data[0].cml_base)*1000)})
			c2series.push({x:Date.parse(data[0].cumulative[a].ts) ,y:((data[0].cumulative[a].latslope-data[0].cml_base)*1000)})
		}
		
		fseries.push({name:'cumulative', data:c1series,type: 'area',dataLabels:{enabled:false}});
		fseries2.push({name:'cumulative', data:c2series,type: 'area',dataLabels:{enabled:false}});
		for(var a = 1; a < disData1.length+1; a++){
			var color = parseInt((255 / disData1.length)*(a))

			// fseries.push({name:(a-1), data:d1.slice(listid[a],listid[a+1]),color:inferno[color],dataLabels:{enabled:true,format:'{series.name}'}})
			// fseries2.push({name:(a-1), data:d2.slice(listid[a],listid[a+1]),color:inferno[color],dataLabels:{enabled:true,format:'{series.name}'}})
			fseries.push({name:(a-1), data:d1.slice(listid[a],listid[a+1]),color:inferno[color]})
			fseries2.push({name:(a-1), data:d2.slice(listid[a],listid[a+1]),color:inferno[color]})
		}
		velocityPosition(data_result_v,totalId.length,disData1[0],site,n1); 
		
		fseries.push({name:'unselect',dataLabels:{enabled:false}})
		fseries2.push({name:'unselect',dataLabels:{enabled:false}})
		chartProcessDis("dis1",fseries,"Displacement (Downslope)",site,ann1data)
		chartProcessDis("dis2",fseries2,"Displacement (Across Slope)",site,ann2data)

	}     

}
function velocityPosition(data_result,id,date_template,site,ndata) {
	if(data_result != "error"){
		var data = data_result;
		var allTime = [] , dataset= [] , sliceData =[];
		var fseries = [], fseries2 = [] ;
		var l2 =[] , l3=[] , alldataNotSlice=[];
		var date = date_template.slice(date_template.length-7,date_template.length);

		if(data[0].L2.length != 0 || data[0].L3.length != 0){
			var catNum=[];
			for(var a = 0; a < data[0].L2.length; a++){
				allTime.push(data[0].L2[a].ts)
				for (var i = 0; i < date.length; i++) {
					if(date[i].ts == data[0].L2[a].ts ){
						l2.push([Date.parse(data[0].L2[a].ts) , (ndata.length)-(data[0].L2[a].id)])
					}
				}
			}
			for(var a = ndata.length; a > 0 ; a--){
				catNum.push(a)
			}
			
			var symbolD = 'url(http://downloadicons.net/sites/default/files/triangle-exclamation-point-warning-icon-95041.png)';
			for(var a = 0; a < data[0].L2.length; a++){
				fseries.push({ type: 'scatter', zIndex:5, name:'L2',marker:{symbol:symbolD,width: 25,height: 25} , data:l2})
				fseries2.push({type: 'scatter', zIndex:5 ,name:'L2',marker:{symbol:symbolD,width: 25,height: 25} , data:l2})
			}
			for(var a = 0; a < data[0].L3.length; a++){
				allTime.push(data[0].L3[a].ts)
				for (var i = 0; i < date.length; i++) {
					if(date[i].ts == data[0].L3[a].ts ){
						l3.push([Date.parse(data[0].L3[a].ts) , (ndata.length)-(data[0].L3[a].id)]);
					}
				}
			}
			var symbolD1 = 'url(http://en.xn--icne-wqa.com/images/icones/1/3/software-update-urgent-2.png)';
			for(var a = 0; a < data[0].L3.length; a++){
				fseries.push({ type: 'scatter', zIndex:5 , name:'L3',marker:{symbol:symbolD1,width: 25,height: 25} , data:l3})
				fseries2.push({type: 'scatter', zIndex:5,name:'L3',marker:{symbol:symbolD1,width: 25,height: 25} , data:l3})
			}

			var allTime_filtered = removeDuplicates(allTime)
			var timestamp_5hours_pattern =[];
			for (var i = 0; i < 8; i++) {
				timestamp_5hours_pattern.push(moment(date_template[date_template.length-1].ts).subtract(30*i,'minutes').format('YYYY-MM-DD HH:mm:ss'))
			}
			for (var i = 0; i < allTime.length; i++) {
				removeSpecificArray(timestamp_5hours_pattern, allTime[i]);
			}
			
			for (var i = 0; i < timestamp_5hours_pattern.length; i++) {
				allTime.push(timestamp_5hours_pattern[i]);
			}

			for(var i = 0; i < id; i++){
				for(var a = 0; a < allTime.length; a++){
					dataset.push([Date.parse(allTime[a]) , (i)])
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
			
			inferno.reverse()
			for(var a = 0; a < sliceData.length; a++){
				var color = parseInt((255 / sliceData.length)*(a+1))
				fseries.push({name:ndata.length-a, data:dataset.slice(sliceData[a],sliceData[a+1]),color :inferno[color]})
				fseries2.push({name:ndata.length-a, data:dataset.slice(sliceData[a],sliceData[a+1]),color :inferno[color]})
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
			
			inferno.reverse()
			for(var a = 0; a < sliceData.length-1; a++){
				catNum.push((sliceData.length-2)-(a+1)+2)
				var color = parseInt((255 / sliceData.length)*(a+1))
				fseries.push({name:ndata.length-a, data:dataset.slice(sliceData[a],sliceData[a+1]),color :inferno[color]})
				fseries2.push({name:ndata.length-a, data:dataset.slice(sliceData[a],sliceData[a+1]),color :inferno[color]})
			}					
		}
		var sorted_fseries =[]
		for (var counter = 0; counter < fseries.length;counter++){
			sorted_fseries.push(doSortDates(fseries[counter].data));

		}
		chartProcessbase("velocity1",fseries,"Velocity Alerts (Downslope)",site,catNum)
		chartProcessbase("velocity2",fseries2,"Velocity Alerts (Across Slope)",site,catNum)   
	}  
}
function chartProcessDis(id,data_series,name,site,nPlot){

	Highcharts.setOptions({
		global: {
			timezoneOffset: -8 * 60
		},
	});
	$("#"+id).highcharts({
		chart: {
			type: 'line',
			zoomType: 'x',
			panning: true,
			panKey: 'shift',
			height: 800,
			width: 500
		},
		title: {
			text: name,
		},
		
		subtitle: {
			text: '<b>Source: </b> ' + (site).toUpperCase() +'<br><br><b>Note: </b> + - consistently increasing/decreasing trend'
		},
		xAxis: {
			type: 'datetime',
			dateTimeLabelFormats: { 
				month: '%e %b %Y',
				year: '%b'
			},
			title: {
				text: 'Date '
			},
		},
		yAxis:{
			plotBands:nPlot,
			title: {
				text: 'Relative Displacement (mm)'
			}
		},
		tooltip: {
			header:'{point.x:%Y-%m-%d}: {point.y:.2f}',
			
		},
		credits: {
			enabled: false
		},
		legend: {
			enabled: false
		},
		plotOptions: {
			line: {
				marker: {
					enabled: true,
					radius: 1,
				},	
			},

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

function chartProcessInverted(id,data_series,name,site,minVal,maxVal){

	Highcharts.setOptions({
		global: {
			timezoneOffset: -8 * 60
		},
	});
	$("#"+id).highcharts({
		chart: {
			type: 'line',
			zoomType: 'x',
			height: 900,
			width: 500
		},
		title: {
			text: 'Column Position',
		},
		subtitle: {
			text: '<b>Source: </b> '+(site).toUpperCase()
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
		xAxis:{
			min:minVal,
			max:(maxVal + 0.02 ),
			gridLineWidth: 1,
			title: {
				text: name
			}
		},
		yAxis:{

			title: {
				text: 'Depth (m)'
			}
		},
		tooltip: {
			formatter: function() {
				return this.series.name+'<br><b>Depth: </b>' + this.y + '<br><b>Disp: </b>'+this.x;
			}
		},
		credits: {
			enabled: false
		},
		legend: {
			enabled: true
		},
		series:data_series
	});
	
}

function chartProcessbase(id,data_series,name,site,catNum){

	Highcharts.setOptions({
		global: {
			timezoneOffset: -8 * 60
		},
	});
	$("#"+id).highcharts({
		chart: {
			type: 'line',
			zoomType: 'x',
			panning: true,
			panKey: 'shift',
			height: 800,
			width: 500
		},
		title: {
			text: name
		},
		subtitle: {
			text: '<b>Source: </b> ' + (site).toUpperCase()
		},
		

		credits: {
			enabled: false
		},
		xAxis: {
			type: 'datetime',
			dateTimeLabelFormats: { 
				month: '%e %b %Y',
				year: '%b'
			},
			title: {
				text: 'Time'
			}
		},
		legend: {
			enabled: false
		},

		yAxis: {
			categories: catNum,
			title: {
				text: 'Nodes'
			},
			labels: {
				formatter: function () {
					return this.value;
				}
			}
		},
		tooltip: {
			formatter: function () {
				return moment(this.x).format('YYYY-MM-DD HH:mm') 
				;
			}
		},
		plotOptions: {
			line: {
				
				marker: {
					enabled: true,
					radius: 2,
				},
				
			}
		},
		series:data_series
	});

	setTimeout(function(){
		svgChart('subsurface') 
	}, 3000);

	
	
}

/************************/
/**DOWNLOAD SVG PROCESS**/
/************************/

function svgChart(idBox) {
	
	
	var values = window.location.href.split("/")
	var connection_id = values[5]
	var category = values[6]
	var site = values[7]

	var name_site = ((($( "tspan" ).text()).split('.')))
	var extracted_name = (name_site[0]).split(' ');
	$( ".highcharts-contextbutton" ).attr( "visibility", "hidden" );
	

	if(idBox == "rain"){
		$(".highcharts-root").removeAttr("xmlns");
		$(".highcharts-root").removeAttr("version");

		

		var idsSub = $('.collapse').map(function() {
			return this.id;
		}).get();

		var ids0 = []
		var ids1 = []
		for (var i = 0; i < idsSub.length; i++) {
			if(idsSub[i].length < 6 || idsSub[i] == 'rain_arq' || idsSub[i] == 'rain_senslope'){
				ids0.push(idsSub[i])
			}else{
				ids1.push(idsSub[i])
			}
		}
		var ids2 = $('.rainGraph .in').map(function() {
			return this.id;
		}).get();
		var ids4 =[]
		for (var i = 0; i < ids0.length; i++) {
			for (var a = 0; a < ids2.length; a++) {
				if(ids0[i] == ids2[a]){
					ids4.push(ids0[i]);
				}
			}
		}	

		for (var i = 0; i < ids4.length; i++) {
			$( "#"+ids4[i]+" .highcharts-container  .highcharts-root").attr( "x", 760);
			$( "#"+ids4[i]+" .highcharts-container  .highcharts-root").attr( "y", (i) * 300 );
		}


		var ids5 =[]
		for (var i = 0; i < ids0.length; i++) {
			for (var a = 0; a < ids2.length; a++) {
				if(ids1[i] == ids2[a]){
					ids5.push(ids1[i]);
				}
			}
		}	

		for (var i = 0; i < ids5.length; i++) {
			$( "#"+ids5[i]+" .highcharts-container  .highcharts-root").attr( "x", 100);
			$( "#"+ids5[i]+" .highcharts-container  .highcharts-root").attr( "y", (i)*300 );
		}

		var ids = $('.highcharts-container').map(function() {
			return this.id;
		}).get();

		if(ids.length == 4){
			$('#rainBox').attr("height", "1100");
		}else if(ids.length == 5){
			$('#rainBox').attr("height", "1600");
		}

		for (var i = 0; i < ids.length; i++) {
			$("#rainBox").append($('#'+ids[i]).html())
		}


		var all_data=$('#rainAll').html();
	}else if (idBox == "subsurface"){


		$(".highcharts-root").removeAttr("xmlns");
		$(".highcharts-root").removeAttr("version");
		
		var ids0 = ['colspangraph','dis','velocity']
		var idsall = []
		for (var i = 0; i < ids0.length; i++) {
			$( "#"+ids0[i]+"1 .highcharts-container  .highcharts-root").attr( "x", 50 );
			$( "#"+ids0[i]+"1 .highcharts-container  .highcharts-root").attr( "y", i*900 );
			$("#subBox").append($('#'+ids0[i]+'1 .highcharts-container ').html())
		}

		for (var i = 0; i < ids0.length; i++) {
			$( "#"+ids0[i]+"2 .highcharts-container  .highcharts-root").attr( "x", 660 );
			$( "#"+ids0[i]+"2 .highcharts-container  .highcharts-root").attr( "y", i*900 );
			$("#subBox").append($('#'+ids0[i]+'2 .highcharts-container').html())
		}
		
		var all_data= $('#subAll').html();


	}else if (idBox == "surficial"){
		var ids = $('.highcharts-container').map(function() {
			return this.id;
		}).get();


		var all_data= $('#'+ids[0]).html();
		
	}


	$.post("/../chart_export/saveChartSVG", { svg : all_data , site : site , type :category , connection_id:connection_id} )
	.done(function (data) {
		console.log('done')	
		$('#loading').modal('hide');
		$('.modal-backdrop').remove();

		var values = window.location.href.split("/")
		var to_time = values[9]
		var from_time = values[8]
		var t0  = $('#tester_id_time').html();
		var t1 = performance.now();
		var total = [site,(t1 - t0).toFixed(4),from_time,to_time];
		
	})

	
	

}

/*syncronizegraph*/

function syncronizeCrossHairs(chart,id_chart,category) {
	var all_ids = $('#raincharts .collapse ').map(function() {
		return this.id;
	}).get();

	var container = $(chart.container),
	offset = container.offset(),
	x, y, isInside, report;
	container.mousemove(function(evt) {

		x = evt.clientX - chart.plotLeft - offset.left;
		y = evt.clientY - chart.plotTop - offset.top;
		var xAxis = chart.xAxis[0];

		for (var i = 0; i < all_ids.length; i++) {
			if($('#'+all_ids[i]).highcharts() != undefined){
				var xAxis1 = $('#'+all_ids[i]).highcharts().xAxis[0];
				xAxis1.removePlotLine("myPlotLineId");
				xAxis1.addPlotLine({
					value: chart.xAxis[0].translate(x, true),
					width: 1,
					color: 'red',                 
					id: "myPlotLineId"
				})
			}
		}
		
	});


}


function zoomEvent(id_chart,zmRange,xMin,xMax) {

	var all_ids =['rain_senslope','rain_senslope2','rain_arq','rain_arq','rain1','rain12',
	'rain2','rain22','rain3','rain32']
	

	for (var i = 0; i < all_ids.length; i++) {
		if($('#'+all_ids[i]).highcharts() != undefined){
			$('#'+all_ids[i]).highcharts().xAxis[0].isDirty = true;
		}
		
	}
	
	removeSpecificArray(all_ids, id_chart)

	for (var i = 0; i < all_ids.length; i++) {
		if($('#'+all_ids[i]).highcharts() != undefined){
			$('#'+all_ids[i]).highcharts().options.chart.isZoomed = true;
			$('#'+all_ids[i]).highcharts().options.chart.isZoomed = false;
			$('#'+all_ids[i]).highcharts().xAxis[0].setExtremes(xMin, xMax, true);
		}
	}
	
}