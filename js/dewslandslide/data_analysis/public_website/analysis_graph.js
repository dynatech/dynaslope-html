
$(document).ajaxStart(function () {

	$('#loading').modal('toggle');


});
$(document).ajaxStop(function () {
	$('#loading').modal('toggle');
	
});



$(document).ready(function(e) {
	var start = moment().subtract(90, 'days');
	var end = moment(start).add(5,'days');
	var category_set = ['rain','subsurface','surficial'];
	for (var i = 0; i < category_set.length; i++) {
		datetimeProcess(category_set[i],start,end)
	}
	RainFallProcess('mag',start.format('YYYY-MM-DD'),end.format('YYYY-MM-DD'))


})

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

function bouncer(arr) {
	return arr.filter(Boolean);
}

function deleteNan(arr) {
	return arr.filter(function(item){ 
		return typeof item == "string" || (typeof item == "number" && item);
	});
}

function dropdowlistAppendValue(newitemnum, newitemdesc ,id) {
	$(id).append('<option val="'+newitemnum+'">'+newitemdesc+'</option>');
	$(id).selectpicker('refresh'); 
}

function datetimeProcess(category,start,end){
	if( category == 'rain'){
		var cb = cb_rain;
		cb_rain(start,end);
	}else if(category == 'surficial' ){
		var cb = cb_surficial;
		cb_surficial(start,end);
	}else if(category == 'subsurface'){
		var cb = cb_subsurface;
		cb_subsurface(start,end);
	}

	$('#reportrange'+category).daterangepicker({
		maxDate: moment(),
		autoUpdateInput: true,
		startDate: start,
		endDate: end,
		opens: "left",
		ranges: {
			'Today': [moment(), moment()],
			'Yesterday': [moment().subtract(1, 'days'), moment().subtract(1, 'days')],
			'Last 7 Days': [moment().subtract(6, 'days'), moment()],
			'Last 30 Days': [moment().subtract(29, 'days'), moment()],
			'This Month': [moment().startOf('month'), moment().endOf('month')],
			'Last Month': [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')]
		}
	}, cb);
}

function cb_rain(start,end) {
	$('#reportrangerain span').html(start.format('YYYY-MM-DD') + ' - ' + end.format('YYYY-MM-DD'));
	$('#rainfallGraph').empty()
	RainFallProcess('mag',start.format('YYYY-MM-DD'),end.format('YYYY-MM-DD'))

}

function cb_surficial(start,end) {
	$('#reportrangesurficial span').html(start.format('YYYY-MM-DD') + ' - ' + end.format('YYYY-MM-DD')); 
	let dataSubmit = { 
		site : 'mag', 
		fdate : start.format('YYYY-MM-DD'),
		tdate : end.format('YYYY-MM-DD')
	}

	$.ajax({
		url:"/surficial_page/getDatafromGroundCrackNameUrl/mag",
		dataType: "json",error: function(xhr, textStatus, errorThrown){
			console.log(errorThrown)},
			success: function(data)
			{
				$('.selectpicker').selectpicker();
				$('#surficialGraph').append('<select class="selectpicker"  id="crackgeneral" data-live-search="true"></select>');
				$("#surficialGraph").append('<div id="ground_graph"><div>')
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


function cb_subsurface(start,end) {
	
	$('#reportrangesubsurface span').html(start.format('YYYY-MM-DD') + ' - ' + end.format('YYYY-MM-DD')); 
	$.ajax({url: "/api/SiteDetails/mag", dataType: "json",success: function(result){
		for (var i = 0; i < result.length; i++) {
			$("#subsurface").append('<div class="col-md-12 sub"><div id="column_sub" class="collapse in">'+
		'<div class="col-md-6" style="padding-left: 0px;padding-right: 0px;"><div id="colspangraph1'+i+'"><br></div></div><div class="col-md-6" style="padding-left: 0px;padding-right: 0px;"><div id="colspangraph2'+i+'"></div></div></div>')
			allSensorPosition(result[i].name,start.format('YYYY-MM-DD'),end.format('YYYY-MM-DD'),i)
		}
	}})
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

/*RAINFALL*/

function RainFallProcess(curSite,fromDate,toDate){
	let dataSubmit = { 
		site : (curSite).toLowerCase(), 
		fdate : fromDate,
		tdate : toDate
	}

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
				getDistanceRainSite(result[0].RG1, dataSubmit, threshold_data ,'rain1',result[0].RG1+" ( "+result[0].d_RG1+"km )");
				getDistanceRainSite(result[0].RG2, dataSubmit , threshold_data,'rain2',result[0].RG2+" ( "+result[0].d_RG2+"km )");
				getDistanceRainSite(result[0].RG3, dataSubmit , threshold_data,'rain3',result[0].RG3+" ( "+result[0].d_RG3+"km )");

				var ids1 = ['rain_senslope','rain_arq','rain1','rain2','rain3']
				var ids2 = [result[0].rain_senslope,result[0].rain_arq,result[0].RG1,result[0].RG2,result[0].RG3]
				for (var i = 0; i < 1; i++) {
					if( ids2[i] == null){
						removeSpecificArray(ids1, ids1[i]);
						removeSpecificArray(ids2, ids2[i]);
					}
				}
				
				for (var i = 0; i < 1; i++) {
					$("#rainfallGraph").append('<div class="col-md-6 rainGraph ">'+
						'<div  id="'+ids1[i]+'2" class="collapse in" style="display: none;"></div></div><div class="col-md-6 rainGraph">'+
						'<div id="'+ids1[i]+'" class="collapse in" style="display: none;"></div><div>')
					
				}
				$('#with_data').hide()
				$("#rainfallGraph").append('<div class="maxPlot" id="cumulativeMax">'+ids1.length+'</div>');
				$("#rainfallGraph").append('<div class="maxPlot" id="cumulativeTime"></div>');
				$(".maxPlot").hide();
				setTimeout(function(){
					rainFiltering(ids1)
				}, 5000);
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
	if(site != null){
		$.ajax({
			url:"/api/RainSenslope/"+site+"/"+dataSubmit.fdate+"/"+dataSubmit.tdate,
			dataType: "json",error: function(xhr, textStatus, errorThrown){
				console.log(errorThrown)},
				success: function(data)
				{
					$("#rain-breadcrumb").append('<li class="breadcrumb-item"><a class="breadcrumb-item" data-toggle="collapse in" data-target="#'+id+'"><button type="button">'+site.toUpperCase()+'</button></a></li>')
					
					var DataSeries24h=[] , DataSeriesRain=[] , DataSeries72h=[] , negative=[] , nval=[];
					var max = max_rain;
					var max_array_data = [];
					var all_cummulative=[];
					var all_ts=[];
					if(data.length != 0){
						var jsonRespo =JSON.parse(data);
						var colors= ["#0000FF","#FF0000","#0000"]
						for (i = 0; i < jsonRespo.length; i++) {
							var Data24h=[] ,Datarain=[] ,Data72h=[];
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
						var nodata_nval=getRanges(nval)	
						for (var i = 0; i < nodata_nval.length; i++) {
							var num = (nodata_nval[i])
							if(num.search('-') == -1){
								negative.push( {from: Date.parse(jsonRespo[parseFloat(num)].ts), to: Date.parse(jsonRespo[parseFloat(num)].ts), color: 'rgba(68, 170, 213, .2)'})
							}else{
								var new_num = num.split("-")
								negative.push( {from: Date.parse(jsonRespo[parseFloat(new_num[0])].ts), to: Date.parse(jsonRespo[parseFloat(new_num[1])].ts), color: 'rgba(68, 170, 213, .2)'})
							}
							
						}
						$('#cumulativeTime').append(","+Math.max.apply(null,bouncer(deleteNan(all_ts))))
						$('#cumulativeMax').append(","+Math.max.apply(null,bouncer(deleteNan(all_cummulative))))
						var max_value = (Math.max.apply(null, bouncer(max_array_data)))
						var divname =["24hrs","72hrs" ,"15mins"];
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
							fdate : dataSubmit.fdate,
							tdate : dataSubmit.tdate,
							current_site : dataSubmit.site
						}
						setTimeout(function(){
							chartProcessRain(series_data,id,'Senslope',site,max_rain,dataTableSubmit,distance,max_value);
							if(all_raindata[2].length != 0){
								chartProcessRain2(series_data2,id,'Senslope',site,max_rain,negative,dataTableSubmit,distance);
							}else{
								chartProcessRain2(undefined,id,'Senslope',site,max_rain,negative,dataTableSubmit,distance);
								chartProcessRain(undefined,id,'Senslope',site,max_rain,dataTableSubmit,distance,max_value);
							}
							
						}, 1000);
					}else{
						let dataTableSubmit = { 
							site : site, 
							fdate : dataSubmit.fdate,
							tdate : dataSubmit.tdate,
							current_site : dataSubmit.site
						}
						chartProcessRain(series_data,id,'Senslope',site,max_rain,dataTableSubmit,distance,max_value);
						chartProcessRain2(series_data2,id,'Senslope',site,max_rain,negative,dataTableSubmit,distance);
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
					var DataSeries24h=[] , DataSeriesRain=[] , DataSeries72h=[] , negative=[] , nval=[];
					var max = max_rain;
					var max_array_data = [];
					var all_cummulative=[];
					var all_ts=[];
					if(data.length != 0){
						var jsonRespo =JSON.parse(data);
						var colors= ["#0000FF","#FF0000","#0000"]
						for (i = 0; i < jsonRespo.length; i++) {
							var Data24h=[] ,Datarain=[] ,Data72h=[];
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
						var nodata_nval=getRanges(nval)	
						for (var i = 0; i < nodata_nval.length; i++) {
							var num = (nodata_nval[i])
							if(num.search('-') == -1){
								negative.push( {from: Date.parse(jsonRespo[parseFloat(num)].ts), to: Date.parse(jsonRespo[parseFloat(num)].ts), color: 'rgba(68, 170, 213, .2)'})
							}else{
								var new_num = num.split("-")
								negative.push( {from: Date.parse(jsonRespo[parseFloat(new_num[0])].ts), to: Date.parse(jsonRespo[parseFloat(new_num[1])].ts), color: 'rgba(68, 170, 213, .2)'})
							}
							
						}
						$('#cumulativeTime').append(","+Math.max.apply(null,bouncer(deleteNan(all_ts))))
						$('#cumulativeMax').append(","+Math.max.apply(null,bouncer(deleteNan(all_cummulative))))
						var max_value = (Math.max.apply(null, bouncer(max_array_data)))						
						var divname =["24hrs","72hrs" ,"15mins"];
						var all_raindata =[DataSeries24h,DataSeries72h,DataSeriesRain];
						var color =["red","blue","green"];
						var series_data = [];
						var series_data2 = [];
						negative.push({from: parseFloat(all_raindata[0][all_raindata[0].length-1]),to:Date.parse(dataSubmit.tdate),color:'rgba(68, 170, 213, .2)'})
						for (i = 0; i < divname.length-1; i++) {
							series_data.push({ name: divname[i],step: true, data: all_raindata[i],id : divname[i],fillOpacity: 0.4, zIndex: (divname.length-1)-i, lineWidth: 1, color: colors[i]})
						}
						series_data2.push({ name: divname[2],step: true, data: all_raindata[2],id : divname[2],fillOpacity: 0.4, zIndex: 1, lineWidth: 1, color: colors[2],})
						let dataTableSubmit = { 
							site : site, 
							fdate : dataSubmit.fdate,
							tdate : dataSubmit.tdate,
							current_site : dataSubmit.site
						}
						setTimeout(function(){
							chartProcessRain(series_data,id,'ARQ',site,max_rain,dataTableSubmit,distance,max_value );
							
							if(all_raindata[2].length != 0){
								chartProcessRain2(series_data2,id,'ARQ',site,max_rain,negative,dataTableSubmit,distance );
							}else{
								chartProcessRain2(undefined,id,'ARQ',site,max_rain,negative,dataTableSubmit,distance);
								chartProcessRain(undefined,id,'ARQ',site,max_rain,dataTableSubmit,distance,max_value );
							}
						}, 1000);
					}else{
						let dataTableSubmit = { 
							site : site, 
							fdate : dataSubmit.fdate,
							tdate : dataSubmit.tdate,
							current_site : dataSubmit.site
						}
						chartProcessRain(series_data,id,'ARQ',site,max_rain,dataTableSubmit,distance,max_value );
						chartProcessRain2(series_data2,id,'ARQ',site,max_rain,negative,dataTableSubmit,distance );
					}

				}
			})
	}
}

function getRainNoah(site,dataSubmit,max_rain,id,distance) {
	if(site != null){
		var rain_noah_number = site.slice(10,20)
		$.ajax({
			url:"/api/RainNoah/"+rain_noah_number+"/"+dataSubmit.fdate+"/"+dataSubmit.tdate,
			dataType: "json",error: function(xhr, textStatus, errorThrown){
				console.log(errorThrown)},
				success: function(data)
				{
					$("#rain-breadcrumb").append('<li class="breadcrumb-item"><a class="breadcrumb-item" data-toggle="collapse in" data-target="#'+id+'"><button type="button">'+site.toUpperCase()+'</button></a></li>')
					var DataSeries24h=[] , DataSeriesRain=[] , DataSeries72h=[] , negative=[] , nval=[];
					var max = max_rain;
					var max_array_data = [];
					var all_cummulative=[];
					var all_ts=[];
					if(data.length != 0){
						var jsonRespo = JSON.parse(data);
						var colors= ["#0000FF","#FF0000","#0000"]
						for (i = 0; i < jsonRespo.length; i++) {
							var Data24h=[] ,Datarain=[] ,Data72h=[];
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
						var nodata_nval=getRanges(nval)	
						for (var i = 0; i < nodata_nval.length; i++) {
							var num = (nodata_nval[i])
							if(num.search('-') == -1){
								negative.push( {from: Date.parse(jsonRespo[parseFloat(num)].ts), to: Date.parse(jsonRespo[parseFloat(num)].ts), color: 'rgba(68, 170, 213, .2)'})
							}else{
								var new_num = num.split("-")
								negative.push( {from: Date.parse(jsonRespo[parseFloat(new_num[0])].ts), to: Date.parse(jsonRespo[parseFloat(new_num[1])].ts), color: 'rgba(68, 170, 213, .2)'})
							}
							
						}
						$('#cumulativeTime').append(","+Math.max.apply(null,bouncer(deleteNan(all_ts))))
						$('#cumulativeMax').append(","+Math.max.apply(null,bouncer(deleteNan(all_cummulative))))
						var max_value = (Math.max.apply(null, bouncer(max_array_data)))
						var divname =["24hrs","72hrs" ,"15mins"];
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
							fdate : dataSubmit.fdate,
							tdate : dataSubmit.tdate,
							current_site : dataSubmit.site
						}
						setTimeout(function(){
							chartProcessRain(series_data,id,'Noah',site,max_rain,dataTableSubmit,distance,max_value );
							if(all_raindata[2].length != 0){
								chartProcessRain2(series_data2,id,'Noah',site,max_rain,negative,dataTableSubmit,distance );
							}else{
								chartProcessRain2(undefined,id,'Noah',site,max_rain,negative,dataTableSubmit,distance);
								chartProcessRain(undefined,id,'Noah',site,max_rain,dataTableSubmit,distance,max_value );
							}
							
						}, 1000);
					}else{
						let dataTableSubmit = { 
							site : site, 
							fdate : dataSubmit.fdate,
							tdate : dataSubmit.tdate,
							current_site : dataSubmit.site
						}
						chartProcessRain(series_data,id,'Noah',site,max_rain,dataTableSubmit,distance,max_value );
						chartProcessRain2(series_data2,id,'Noah',site,max_rain,negative,dataTableSubmit,distance );
					}
				}
			})
}
}

function chartProcessRain(series_data ,id , data_source ,site ,max,dataTableSubmit,distance,max_value ){
	$("#with_data").append(id+',')
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
			width:500

		},
		title: {
			text:' <b>Rainfall Data </b>',
			style: {
				fontSize: '15px'
			}
		},
		subtitle: {
			text: 'Source : <b>'+  (distance).toUpperCase()+'</b>',
			style: {
				fontSize: '10px'
			}
		},
		xAxis: {
			min:Date.parse(fdate),
			max:Date.parse(tdate),
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
					text: '24hrs threshold (' + max/2 +')',

				}
			},{
				value: max,
				color: colors[2],
				dashStyle: 'shortdash',
				width: 2,
				zIndex: 0,
				label: {
					text: '72hrs threshold (' + max +')',

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
	});


}



function chartProcessRain2(series_data ,id , data_source ,site ,max ,negative,dataTableSubmit,distance ){
	var fdate = dataTableSubmit.fdate;
	var tdate = dataTableSubmit.tdate;
	var date1 = moment(fdate);
	var date2 = moment(tdate);
	var duration = moment.duration(date2.diff(date1));
	var  list_dates =[];
	for (var i = 1; i < duration.asDays(); i++) {
		list_dates.push(site.slice(0,3)+((moment(fdate).add(i,'days').format('YYYY-MM-DD')).replace(/-/g, "")).slice(2,10))
	}
	let dataSubmit = { date:list_dates,table:site}
	Highcharts.setOptions({
		global: {
			timezoneOffset: -8 * 60
		}
	});
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
	$("#"+id+"2").highcharts({
		chart: {
			type: 'column',
			zoomType: 'x',
			panning: true,
			height: 300,
			width:500
		},
		title: {
			text:' <b>Rainfall Data </b>',
			style: {
				fontSize: '15px'
			}
		},
		subtitle: {
			text: 'Source : <b>'+(distance).toUpperCase()+'</b>',
			style: {
				fontSize: '10px'
			}
		},
		xAxis: {
			min:Date.parse(fdate),
			max:Date.parse(tdate),
			plotBands: negative,
			type: 'datetime',
			dateTimeLabelFormats: { 
				month: '%e %b %Y',
				year: '%b'
			},
			title: {
				text: 'Date'
			},

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
	});


	
	
}

function rainFiltering(id_format){
	var graph_with_data = $('#with_data').html().split(",")
	var with_data_default =[];
	for (var i = 0; i < id_format.length; i++) {
		for (var a = 0; a < graph_with_data.length; a++) {
			if(id_format[i] == graph_with_data[a]){
				with_data_default.push(id_format[i])
			}
		}
	}	

	$("#"+with_data_default[0]).show();
	$("#"+with_data_default[0]+"2").show();
}


/*Surficial Graph*/

function surficialGraph(dataTableSubmit) {  
	$.ajax({ 
		dataType: "json",
		url: "/api/GroundDataFromLEWSInRange/"+dataTableSubmit.site+"/"+dataTableSubmit.fdate+"/"+dataTableSubmit.tdate,  success: function(data_result) {
			var result = JSON.parse(data_result)
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
	});	
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
			text: 'Source: ' + (dataTableSubmit.site).toUpperCase()
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
	
}

/*Surficial Graph*/

function allSensorPosition(site,fdate,tdate,i) {
	$.ajax({url: "/api/SensorAllAnalysisData/"+site+"/"+fdate+"/"+tdate,
		dataType: "json",
		success: function(result){
			var data = JSON.parse(result);
			columnPosition(data[0].c,site,i)	
		}
	});
}
function columnPosition(data_result,site,iId) {
	if(data_result!= "error"){
		var data = data_result;
		var AlllistId = [] ,  AlllistDate = [];
		var listId = [] , listDate = [];
		var fdatadown= [] , fnum= [] ,fAlldown =[] ,fseries=[] ;
		var fseries2=[] , fdatalat= [],fAlllat =[] ;

		for(var i = 0; i < data.length; i++){
			AlllistId.push(data[i].id);
		}
		let parameters_data = { 
			start_data: data[0], 
			last_date : data[data.length-1],
			data_all : data
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
		for(var i = 0; i < listDate.length; i++){
			for(var a = 0; a < data.length; a++){
				if(listDate[i] == data[a].ts){
					fdatadown.push({x:data[a].downslope,y:data[a].depth})
					fdatalat.push({x:data[a].latslope,y:data[a].depth})
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
			fseries.push({name:listDate[a].slice(0,16), data:fAlldown[a] ,color:inferno[color]})
			fseries2.push({name:listDate[a].slice(0,16),  data:fAlllat[a],color:inferno[color]})
			
		}
		chartProcessInverted("colspangraph1"+iId,fseries,"Displacement (m)",site,'Dowslope Movement',parameters_data,iId)
		chartProcessInverted("colspangraph2"+iId,fseries2,"Displacement (m)",site, 'Across-Slope Movement', parameters_data,iId)
		$("#column_sub").switchClass("collapse","in");
	}     
}

function chartProcessInverted(id,data_series,name,site,header,parameters_data,iId){
	var all_down =[] , all_lat = [];
	
	for (var i = 0; i < parameters_data.data_all.length; i++) {
		all_down.push(parameters_data.data_all[i].downslope)
		all_lat.push(parameters_data.data_all[i].latslope)
	}
	var filter_down =(removeDuplicates(all_down)).sort()
	var filter_lat=(removeDuplicates(all_lat)).sort()

	var to_yplot = parameters_data.last_date.id
	if(id == "colspangraph1"+iId){
		var to_xplot = parseFloat((filter_down[filter_down.length-1]))+3;
		var from_xplot = parseFloat((filter_down[filter_down.length-1])) - .5;
		var x_nameplot = 'US'
		var y_nameplot = 'DS'

	}else{
		var to_xplot = parseFloat((filter_lat[filter_lat.length-1]))+3;
		var from_xplot = parseFloat((filter_lat[filter_lat.length-1])) - .5;
		var x_nameplot = 'L'
		var y_nameplot = 'R'
	}

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
			text: header,
		},
		subtitle: {
			text: 'Source: '+(site).toUpperCase()
		},
		plotOptions: {
			line: {
				marker: {
					enabled: true,
				},
			},
			series: {
				lineWidth: 1,
				states: {
                hover: {
                    enabled: true,
                    lineWidth: 8
                }
            }
			}
		},
		xAxis:{
			gridLineWidth: 1,
			title: {
				text: name
			},
			labels: {
				step: 2
			}, minRange: 5,
			plotBands: [{from: from_xplot,to: to_xplot,label: {
				text: x_nameplot,
				style: {color: '#999999'},y: 20}}],

			},
			yAxis:{
				title: {
					text: 'Depth from Surface (m)'
				},
				plotBands: [{
					from: 0,
					to: -1,
					label: {
						text: y_nameplot,
						style: {
							color: '#999999'
						},
						x: 80
					}
				},
				],
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

