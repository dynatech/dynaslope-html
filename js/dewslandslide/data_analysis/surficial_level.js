
$(document).ready(function(e) {
	$(document).ajaxStart(function () {
		$('#loading').modal('toggle');
	});
	$(document).ajaxStop(function () {
		$('#loading').modal('toggle');
	});

	$('.tag').hide()
	$('[data-toggle="popover"]').popover();   
	$('.crack_id_form').hide()
	$(".panel_alert").hide();
	$("#nav-tab-container").hide();
	allListSite();
	var per_site_name=[];
	$.get("../site_level_page/getAllSiteNamesPerSite").done(function(data){
		var per_site = JSON.parse(data);
		for (i = 0; i <  per_site.length; i++) {
			per_site_name.push(per_site[i].name)
		}
	})
	$('#submit').on('click',function(){
		if($("#sitegeneral").val() != ""){
			$(".panel_alert").hide();			
			var subSites =[];
			var curSite = $("#sitegeneral").val();
			var fromDate = $('#reportrange span').html().slice(0,10);
			var toDate = $('#reportrange span').html().slice(13,23);
			$("#nav-tab-container").slideDown();
			$("#graphS1").empty()
			$("#graphS4").empty()
			$("#alert_div").empty()
			$("#graphS1").append('<table id="ground_table" class="display table" cellspacing="0" width="100%"></table>');
			$('#new_data_save').empty()
			$('#new_data_save').append(' <button id="newData_meas"  type="button"  class="btn btn-info ">'+
				'<span class="glyphicon glyphicon-pencil" aria-hidden="true"></span> SAVE</button>')
			$('.crack_id_form').show()
			$("#popover_note").popover('show')
			$("#crackgeneral").empty();
			$("#graph1").empty();
			document.getElementById("header-site").innerHTML = curSite.toUpperCase()+" Site Overview"
			for (i = 0; i <  per_site_name.length; i++) {
				var siteCode = per_site_name[i].slice(0,3)
				if( curSite == siteCode) {
					subSites.push(per_site_name[i])
				}
			}
			crackIdProcess(curSite,fromDate,toDate)
		}else{
			$("#errorMsg").modal('show')
		}
	});
	var start = moment().subtract(7, 'days'); 
	var end = moment();

	$('#reportrange').daterangepicker({
		maxDate: new Date(),
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


	function allListSite(){
		$('#sitegeneral').empty();
		$.get("../site_level_page/getAllSiteNames").done(function(data){
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
	}
	function cb(start, end) {
		$('#reportrange span').html(start.format('YYYY-MM-DD') + ' - ' + end.format('YYYY-MM-DD'));   

	}

	$('#newData_timestamp').daterangepicker({
		singleDatePicker: true,
		showDropdowns: true,
		timePicker: true,
		startDate: end,
		timePickerIncrement: 30,
		locale: {
			format: 'YYYY-MM-DD HH:mm:00'
		}
	}, 
	function(start, end, label) {
		var years = moment().diff(start, 'years');

	});

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

	function crackIdProcess(cursite,from,to,stat){
		$("#crackgeneral").empty();
		$('#saveTAG').empty()
		$('#saveTAG').append('<div class="form-group tag_ids"><label>Tags</label>'+
			'<input type="text" class="form-control" id="tag_ids" placeholder="Ex: #AccelDrift or #Drift" data-role="tagsinput" value="">'+
			'</div><div class="form-group"><label for="formGroupExampleInput">Timestamp</label>'+
			'<input type="text" class="form-control" id="tag_time" disabled=""></div>'+
			'<div class="form-group"><label for="formGroupExampleInput2">Remarks</label>'+
			'<textarea class="form-control comment" rows="5" id="comment"></textarea></div>'+
			'<p id="modal_trigger"><button type="button"  class="btn-sm btn-success pull-right" id="tag_submit">'+
			'<span class="glyphicon glyphicon-ok" aria-hidden="true"></span> SAVE</button><br></p>')
		let dataSubmit = { 
			site : cursite, 
			fdate : from,
			tdate : to
		}
		$.post("/surficial_page/getDatafromGroundCrackName", {data : dataSubmit} ).done(function(data_result){
			if(stat == "done"){
				$("#note_stat").html("Save")
				$("#saveMsg").modal("show");
				setTimeout(function(){
					$("#saveMsg").modal("hide");
				},1000)

			}
			var result= JSON.parse(data_result)
			var crack_name= [];
			for (i = 0; i <  result.length; i++) {
				crack_name.push((result[i].crack_id).toUpperCase())
			}

			var select = document.getElementById('crackgeneral');

			$("#crackgeneral").append('<option value="">Select Crack</option>');
			var i;
			for (i = 0; i < crack_name.length; i++) {
				var opt = crack_name[i];
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
			dataTableProcess(dataSubmit,crack_name)
			$("#crackgeneral").change(function () {
				var current_crack = $(this).find("option:selected").text();
				$("#graph1").append('<div id="analysisVelocity" ></div><div id="analysisDisplacement" ></div><div id="analysisVAT" ></div>');
				$("#popover_note").popover('destroy')
				surficialAnalysis(cursite,current_crack)
			});
		});
	}

	function dataTableProcess(dataSubmit,crack_name) {  
		$.post("/surficial_page/getDatafromGroundLatestTime", {data : dataSubmit} ).done(function(data_result){
			var result= JSON.parse(data_result);
			var last_goodData_unfiltered =[];
			for (i = 0; i < result.length; i++) {
				last_goodData_unfiltered.push(result[i].timestamp)
			}
			var last_goodData = removeDuplicates(last_goodData_unfiltered)
			let dataTableSubmit = { 
				site : dataSubmit.site, 
				fdate : dataSubmit.fdate,
				tdate : dataSubmit.tdate,
				crack_name:crack_name,
				last:last_goodData,
				all_data_last:result,
			}
			surficialMeasurement(dataTableSubmit)
			surficialGraph(dataTableSubmit)

		});

	}

	function surficialMeasurement(dataSubmit) {  
		$.post("../surficial_page/getDatafromGroundData", {data : dataSubmit} ).done(function(data_result){
			var result= JSON.parse(data_result);
			$( "#show-option" ).tooltip({
				show: {
					effect: "slideDown",
					delay: 150
				}
			});
			var result= JSON.parse(data_result);
			var columns_date =[]; 
			var columns_date_tooltip =[]; 

			columns_date.push({title:'Crack ID'});
			for (i = dataSubmit.last.length; i > 0; i--) {
				if(dataSubmit.all_data_last[i-1].meas_type == "ROUTINE"){
					var color ="color:#4066e2"
				}else if(dataSubmit.all_data_last[i-1].meas_type == "EVENT"){
					var color ="color:#38bee6"
				}else{
					var color ="color:#30eab1"
				}	

				columns_date.push({title:'<center><span id="show-option"  style='+color+' aria-hidden="true" title="'+dataSubmit.all_data_last[i-1].weather+"/"
					+dataSubmit.all_data_last[i-1].meas_type+'">'+moment(dataSubmit.last[i-1]).format('D MMM YYYY HH:mm')+'</span></center>'});
			}

			var dataTable_process_1 = []
			var dataTable_process_1result =[]
			var dataTable_process_1result_time =[]
			for (a = 0; a < dataSubmit.crack_name.length; a++) {
				for (b = 0; b < result.length; b++) {
					if(dataSubmit.crack_name[a] == result[b].crack_id){
						dataTable_process_1.push(result[b].crack_id)
						dataTable_process_1result_time.push(result[b].timestamp)
						dataTable_process_1result.push(result[b])
					}
				}
			}

			var dataTable_timestamp_1=[]
			for (aa = 0; aa < dataSubmit.crack_name.length; aa++) {
				for (bb = 0; bb < dataSubmit.last.length; bb++) {
					dataTable_timestamp_1.push([dataSubmit.last[bb],dataSubmit.crack_name[aa]])
				}
			}
			
			var dataTable_timestamp_2 = []
			for (cc = dataSubmit.crack_name.length; cc > 0; cc--) {
				dataTable_timestamp_2.push( dataTable_timestamp_1.length-(cc*dataSubmit.last.length))
			}		
			surficialDataTable(dataSubmit,dataTable_timestamp_2,columns_date)
			
		});
	}

	function surficialDataTable(dataSubmit,totalSlice,columns_date) {  
		$.ajax({ 
			dataType: "json",
			url: "/api/last10GroundData/"+dataSubmit.site,  success: function(data_result) {
				var result = JSON.parse(data_result)
				var organize_ground_data = []
				var ground_data_all =[]
				var allgather_ground_data =[]
				var allts_data = []
				var table_id_list =[]
				var crackID_withData =[]
				for(var a = 0; a < result.length; a++){
					crackID_withData.push(result[a].crack_id)
					allgather_ground_data.push(result[a].crack_id)
					allts_data.push(result[a].crack_id)
					for(var b = dataSubmit.last.length; b > 0; b--){
						table_id_list.push(result[a].crack_id+b)
						allgather_ground_data.push(result[a][dataSubmit.last[b-1]])
						allts_data.push(dataSubmit.last[b-1])
					}
				}

				var total_crackID = dataSubmit.crack_name.length
				for(var c = 0; c < crackID_withData.length; c++){
					dataSubmit.crack_name.splice(dataSubmit.crack_name.indexOf(crackID_withData[c]), 1 ) 
				}

				for(var d = 0; d < dataSubmit.crack_name.length; d++){
					var no_Data_meas=[]
					no_Data_meas.push("<center>"+dataSubmit.crack_name[d]+"</center>")
					for(var e = 0; e < columns_date.length; e++){
						no_Data_meas.push("<center><i>nd</i></center>")
					}
					organize_ground_data.push(no_Data_meas)

				}

				var slice_num_meas=[]

				for(var e = 0; e < allgather_ground_data.length; e++){
					for(var f = 0; f < crackID_withData.length; f++){
						if(crackID_withData[f] == allgather_ground_data[e]){
							slice_num_meas.push(e)
						}
					}
				}

				var differnce =[];
				var ts_difference =[];
				var total_alert_per_ts=[];
				var tooltip_data=[];
				var color_alert = [];
				var id_null_data= [];
				var id_null_ts= [];
				for(var aa = allgather_ground_data.length-1; aa > 0; aa--){
					var d1 = allgather_ground_data[aa]
					var d2 = allgather_ground_data[aa-1]
					var diff = (d2-d1)
					differnce.push(allgather_ground_data[aa]+"-"+allgather_ground_data[aa-1]+"="+(allgather_ground_data[aa]-allgather_ground_data[aa-1]))
					var now = moment(allts_data[aa]);
					var end = moment(allts_data[aa-1]); 
					if((d2 == "nd" || d1 == "nd" ) || (d2 == "nd" && d1 == "nd") ){
						var roundoff2 = "nd"
					}else{
						var duration = moment.duration(now.diff(end));
						var hours = duration.asHours();
						ts_difference.push(allts_data[aa]+"-"+allts_data[aa-1]+"="+hours)
						var roundoff2 =Math.abs(Math.round((diff/hours)*1000)/1000);
					}
					total_alert_per_ts.push(roundoff2)
					tooltip_data.push(roundoff2+"/"+d2+"/"+d1+"/"+aa+"/"+allts_data[aa]+"_"+allts_data[aa-1])
					if(d1 == "nd"){
						id_null_data.push(aa)
						id_null_ts.push(allts_data[aa])
					}
				}

				var ground_data_insert =[]
				var ts_null_data = []

				for(var ab = 0; ab < result.length; ab++){
					ground_data_insert.push(result[ab].crack_id)
					ts_null_data.push(result[ab].crack_id)
					for(var bb = dataSubmit.last.length; bb > 0; bb--){
						ground_data_insert.push(result[ab][dataSubmit.last[bb-1]])
						ts_null_data.push({ts:dataSubmit.last[bb-1],meas:result[ab][dataSubmit.last[bb-1]]})
					}
				}
				total_alert_per_ts.reverse()
				tooltip_data.reverse()
				var convert = getRanges(id_null_data.map(parseFloat).reverse())

				for (var i = 0; i < convert.length; i++) {
					if(convert[i].search('-') == -1){
						var num_id = parseFloat(convert[i])
						if( $.isNumeric(ground_data_insert[num_id+1]) == true && $.isNumeric(ground_data_insert[num_id-1]) == true && num_id+1 <= ground_data_insert.length-1){
							var d1 = ground_data_insert[num_id-1]
							var d2 = ground_data_insert[num_id+1]
							var diff = (d2-d1)
							var now = moment(ts_null_data[num_id-1].ts);
							var end = moment(ts_null_data[num_id+1].ts); 
							var duration = moment.duration(now.diff(end));
							var hours = duration.asHours();
							var roundoff2 =Math.abs(Math.round((diff/hours)*1000)/1000);
							total_alert_per_ts[num_id] = roundoff2;
							tooltip_data[num_id]= roundoff2+"/"+d2+"/"+d1+"/"+(num_id+1)+"/"+ts_null_data[num_id+1].ts+"_"+ts_null_data[num_id-1].ts
								// console.log(roundoff2+"/"+d2+"/"+d1+"/"+(num_id+1)+"/"+ts_null_data[num_id+1].ts+"_"+ts_null_data[num_id-1].ts)
							}

						}else{
							var new_num = convert[i].split("-").map(parseFloat);
							// console.log(new_num[0]-1,new_num[0]-1,parseFloat(ground_data_insert[new_num[0]-1]),parseFloat(ground_data_insert[new_num[0]-1]))
							if(parseFloat(ground_data_insert[new_num[1]+1]) != NaN && parseFloat(ground_data_insert[new_num[0]-1]) != NaN && new_num[1]+1 <= ground_data_insert.length-1){
								var d1 = ground_data_insert[new_num[0]-1]
								var d2 = ground_data_insert[new_num[1]+1]
								var diff = (d2-d1)
								var now = moment(ts_null_data[new_num[0]-1].ts);
								var end = moment(ts_null_data[new_num[1]+1].ts); 
								var duration = moment.duration(now.diff(end));
								var hours = duration.asHours();
								var roundoff2 =Math.abs(Math.round((diff/hours)*1000)/1000);
								total_alert_per_ts[new_num[1]] = roundoff2;
								tooltip_data[new_num[1]] = roundoff2+"/"+d2+"/"+d1+"/"+(new_num[1])+"/"+ts_null_data[new_num[1]+1].ts+"_"+ts_null_data[new_num[0]-1].ts
								// console.log(roundoff2+"/"+d2+"/"+d1+"/"+(new_num[1]+1)+"/"+ts_null_data[new_num[1]+1].ts+"_"+ts_null_data[new_num[0]-1].ts)
							}
						}
					}

					for(var ac = 0; ac < ground_data_insert.length; ac++){
						ground_data_all.push('<center><b title="'+tooltip_data[ac-1]+'">'+ ground_data_insert[ac]+' </b></center>')
					}
					var ground_differnce = differnce;

					slice_num_meas.push(allgather_ground_data.length)
					for(var g = 0; g < slice_num_meas.length; g++){
						organize_ground_data.push(ground_data_all.slice(slice_num_meas[g],slice_num_meas[g+1]))
					}
					organize_ground_data.pop();

					MeasTable(dataSubmit,organize_ground_data,columns_date)

					var td_number_id =[]
					var tableId_withData = Math.abs(crackID_withData.length-total_crackID)
					for(var h = tableId_withData; h < total_crackID; h++){
						td_number_id.push(h)
					}
					var organiz_divId = []
					for(var i = 0 ; i < td_number_id.length ; i++){
						for(var j = 0  ; j < dataSubmit.last.length+1 ; j++){
							organiz_divId.push("td-"+td_number_id[i]+"-"+(j))
						}
					}

					// gndmeasTableStats(dataSubmit,totalSlice,columns_date)


					organiz_divId.reverse()
					total_alert_per_ts.reverse()
					var color_alert =[]
					for(var k = 0 ; k < total_alert_per_ts.length ; k++){
						if(total_alert_per_ts[k] >= 1.8 ){
							color_alert.push("#ff6666")
						}else if(total_alert_per_ts[k] >= 0.250 && total_alert_per_ts[k]<= 1.79 ){
							color_alert.push("#ffb366")
						}else if(total_alert_per_ts[k] <= 0.249 && total_alert_per_ts[k] >= 0  ){
							color_alert.push('#99ff99')
						}else if(total_alert_per_ts[k] == "nd"){
							color_alert.push('#fff')
						}else{
							color_alert.push('#fff')

						}
					}
					for(var l = 0 ; l < organiz_divId.length ; l++){	
						$('#'+organiz_divId[l]).attr('bgcolor',color_alert[l])
					}
					var color_label =[]
					for(var m = 0 ; m < slice_num_meas.length-1 ; m++){
						color_label.push(color_alert[(slice_num_meas[m])])
					}

					var color_alert_list=["#99ff99","#ffb366","#ff6666"]
					var label_color = removeDuplicates(color_label);
					gndmeasTableStats(dataSubmit,totalSlice,columns_date)

					for(var n = 0 ; n < label_color.length ; n++){
						if(label_color[n] == "#99ff99"){
							$("#A0").show();
							$("#A0").empty();
							$("#A0").append('<div class="panel-heading text-center"><strong>NO SIGNIFICANT GROUND MOVEMENT</strong></div>');
						}else if(label_color[n] == "#ffb366"){
							$("#A0").empty();
							$("#A0").hide();
							$("#A1").show();
							$("#A1").empty();
							$("#A1").append('<div class="panel-heading text-center"><strong><b> ALERT!! </b>SIGNIFICANT GROUND MOVEMENT OBSERVE IN THE LAST 24 HOURS</strong></div>');
						}else if(label_color[n] == "#ff6666"){
							$("#A0").empty();
							$("#A0").hide();
							$("#A1").empty();
							$("#A1").hide();
							$("#A2").show();
						}
					}
				}
			});	
}
function MeasTable(dataSubmit,organize_ground_data,columns_date) {
	$('#ground_table').DataTable({
		data: organize_ground_data,
		columns: columns_date,
		"processing": true ,
		"paging":   false,
		"searching": false, 
		"createdRow": function ( row, data, index ) {
			for(var a = dataSubmit.last.length; a > 1 ; a--){
				$('td', row).eq(a).attr('id', 'td-' + index +'-'+ a );
				$('tr', row).eq(a).attr('class', 'td-class-'+ a );
				$('td', row).eq(a).attr('data-container', 'body');
				$('td', row).eq(a).attr('data-toggle', 'tooltip');
				$('td', row).eq(a).attr('data-original-title', '');
				$('td', row).eq(a).attr('bgcolor', '');

			}
		}
	});
}
function gndmeasTableStats(dataTableSubmit,totalSlice,columns_date){
	var site = dataTableSubmit.site;
	var from = dataTableSubmit.fdate;
	var to = dataTableSubmit.tdate;
	var table = $('#ground_table').DataTable();
	$('#newData_meas').click(function(){
		var timestamp = $('#newData_timestamp').val();
		var meas_type =$('#newData_type').val().toUpperCase();
		var observer_name=$('#newData_observer').val().toUpperCase();
		var weather = $('#newData_weather').val().toUpperCase();
		var allNewData_crack = $('.entry_crack').map(function() {
			return this.id;
		}).get();

		var allNewData_meas = $('.entry_meas').map(function() {
			return this.id;
		}).get();
		var data =[]
		var all_meas_from_val = []
		for (var i = 0; i < allNewData_crack.length; i++) {
			data.push({
				timestamp: timestamp,
				meas_type: meas_type,
				site_id: site.toUpperCase(),
				crack_id: $('#'+allNewData_crack[i]).val(),
				observer_name:observer_name,
				meas: $('#'+allNewData_meas[i]).val(),
				weather: weather
			})
			all_meas_from_val.push($('#'+allNewData_meas[i]).val())
			all_meas_from_val.push($('#'+allNewData_crack[i]).val())
		}
		if(meas_type != "" && weather != "" && all_meas_from_val.includes("") == false){
			$("#graphS1").empty()
			$("#graphS1").append('<table id="ground_table" class="display table" cellspacing="0" width="100%"></table>');
			var timestamp = $('#newData_timestamp').val(moment().format('YYYY-MM-DD HH:00:00'));
			var meas_type =$('#newData_type').val("");
			var weather = $('#newData_weather').val(" ");
			$('#insert_meas').empty();
			$('#insert_meas').append(' <div class="col-sm-6"><div class="form-group"><input type="text" class="form-control entry_crack" id="entry_crack1" '+
				'name="entry_crack" value="" placeholder="Crack ID" required></div></div><div class="col-sm-6 nopadding"><div class="form-group">'+
				'<div class="input-group"><input type="number" class="form-control entry_meas" id="entry_meas1" name="entry_meas" value="" placeholder="Measurement" required>'+
				'<div class="input-group-btn"><button class="btn btn-success" type="button"  onclick="insert_meas();"> <span class="glyphicon glyphicon-plus" aria-hidden="true">'+
				'</span> </button></div></div></div>');
			AddMeasProcess(data,'new')
		}else{
			$("#note_stat").html("Error insert")
			$("#saveMsg").modal("show");
		}
		
		
	});

	$('#ground_table tbody').on( 'click', 'td', function () {
		$(".dataInput").prop('disabled', true);
		var cell_crack_name = $(this).parent().find('td')
		var crack_id_cell = cell_crack_name[0].innerHTML.split(">")[2].split(" ")[0]
		if(crack_id_cell != ""){
			var table_cell_value = table.cell( this ).data().split('"')
			var cell_data = table_cell_value[1].split('/')
			var time_stamp = cell_data[4].split('_')
			$("#crack_id_data").val(crack_id_cell);
			$("#timestamp_data").val(time_stamp[0])
			$("#meas").val(cell_data[2])

			var m_data = cell_data[2];
			var t_data = time_stamp[0];

			$("#groundModal").modal("show")
			if(m_data != "nd"){
				$("#buttons_div").empty();
				$("#buttons_div").append('<button id="edit_meas"  type="button"  class="btn btn-success btn-sm">'+
					'<span class="glyphicon glyphicon-pencil" aria-hidden="true"></span> EDIT</button>'+
					' <button id="delete_meas"  type="button"  class="btn btn-danger btn-sm">'+
					'<span class="glyphicon glyphicon-remove" aria-hidden="true"></span> DELETE</button>')
				var c_data = crack_id_cell;
			}else{
				$("#buttons_div").empty();
				$("#buttons_div").append('<button id="add_meas"  type="button"  class="btn btn-success ">'+
					'<span class="glyphicon glyphicon-pencil" aria-hidden="true"></span> ADD </button>')
				var c_data = "none";
				$(".dataInput").prop('disabled', false);
				$("#meas").val(' ');
			}

			var dataSubmit = {timestamp : t_data , crack_id : c_data , site:site}

			$.post("/surficial_page/getAllGroundMeasID/", {dataSubmit:dataSubmit} ).done(function(data){
				var result = JSON.parse(data)
				var id_data = result[0].id;

				$('#edit_meas').click(function(){
					$(".dataInput").prop('disabled', false);
					$("#buttons_div").empty();
					$("#buttons_div").append('<button id="save_meas"  type="button"  class="btn btn-info btn-sm">'+
						'<span class="glyphicon glyphicon-ok" aria-hidden="true"></span> SAVE</button>')

					$('#save_meas').click(function(){
						$("#groundModal").modal("hide")
						var t_data = $("#timestamp_data").val();
						var c_data = $("#crack_id_data").val();
						var m_data = $("#meas").val();
						var dataSubmit = {
							timestamp : t_data , 
							crack_id : c_data , 
							site:site , id:id_data,
							meas:m_data
						}
						if(c_data != "" && m_data != ""){
							$.post("/surficial_page/EditGroundMeas/", {dataSubmit:dataSubmit} ).done(function(result_edited){
								// console.log(result_edited)
								$("#graphS1").empty()
								$("#graphS1").append('<table id="ground_table" class="display table" cellspacing="0" width="100%"></table>');
								crackIdProcess(site,from,to,"done")

							});
						}else{
							$("#note_stat").html("Error insert")
							$("#saveMsg").modal("show");
						}


					});

				});

				$('#delete_meas').click(function(){
					$("#graphS1").empty()
					var dataSubmit = {id:id_data}
					$.post("/surficial_page/DeleteGroundMeas/", {dataSubmit:dataSubmit} ).done(function(result_edited){
						// console.log(result_edited)
						$("#groundModal").modal("hide")
						$("#graphS1").empty()
						$("#graphS1").append('<table id="ground_table" class="display table" cellspacing="0" width="100%"></table>');
						crackIdProcess(site,from,to,"done")


					});
				});
				$('#add_meas').click(function(){
					if(result[0] != "" || $("#crack_id_data").val() != "" || $("#meas").val() == ""){
						AddMeasProcess(result[0],"old",$("#crack_id_data").val(),$("#meas").val())
					}else{
						$("#groundModal").modal("hide")
						$("#note_stat").html("Error insert")
						$("#saveMsg").modal("show");
					}

				});

			});	
		}
	});	
}

function AddMeasProcess(data,category,crack,meas){
	var site = $("#sitegeneral").val();
	var from = $('#reportrange span').html().slice(0,10);
	var to = $('#reportrange span').html().slice(13,23);
	if(category != "new"){
		var dataSubmit = [{
			timestamp:data.timestamp,
			meas_type:data.meas_type,
			site_id:data.site_id,
			crack_id:crack,
			observer_name:data.observer_name,
			meas:meas,
			weather:data.weather
		}]
	}else{
		var dataSubmit = data
	}
	$("#graphS1").empty()
	$("#graphS1").append('<table id="ground_table" class="display table" cellspacing="0" width="100%"></table>');
	$('#insert_meas').empty();
	$('#insert_meas').append(' <div class="col-sm-6"><div class="form-group"><input type="text" class="form-control entry_crack" id="entry_crack1" '+
		'name="entry_crack" value="" placeholder="Crack ID" required></div></div><div class="col-sm-6 nopadding"><div class="form-group">'+
		'<div class="input-group"><input type="number" class="form-control entry_meas" id="entry_meas1" name="entry_meas" value="" placeholder="Measurement" required>'+
		'<div class="input-group-btn"><button class="btn btn-success" type="button"  onclick="insert_meas();"> <span class="glyphicon glyphicon-plus" aria-hidden="true">'+
		'</span> </button></div></div></div>');
	$('#new_data_save').empty()
	$('#new_data_save').append(' <button id="newData_meas"  type="button"  class="btn btn-info ">'+
		'<span class="glyphicon glyphicon-pencil" aria-hidden="true"></span> SAVE</button>')

	$.post("/surficial_page/AddGroundMeas/", {dataSubmit:dataSubmit} ).done(function(result){
		console.log(result)
		if( category != "new"){
			$("#groundModal").modal("hide")
		}
		$(".panel_alert").hide();
		$("#note_stat").html("SAVE")
		$("#saveMsg").modal("show");
		crackIdProcess(site,from,to,"done")
		
	}).fail(
	function(jqXHR, textStatus, errorThrown) {
		if(textStatus == "error"){
			$("#note_stat").html("Error insert")
			$("#saveMsg").modal("show");
			crackIdProcess(site,from,to,"error")
		}

	});
}



function surficialGraph(dataTableSubmit) {  
	var time = moment().format('HH:mm:ss')
	$.ajax({ 
		dataType: "json",
		url: "/api/GroundDataFromLEWSInRange/"+dataTableSubmit.site+"/"+dataTableSubmit.fdate+" "+time+"/"+dataTableSubmit.tdate+" "+time,  success: function(data_result) {
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
				series_data.push({name:crack_name[a],data:data.slice(slice[a],slice[a+1]),id:(crack_name[a]).replace(/ /g,"")})
			}

			chartProcess2('ground_graph',series_data,'Superimpose Surficial Graph',dataTableSubmit,result)
			$("#tag_series").val(JSON.stringify(series_data))
			
		}
	});	
}
function surficialAnalysis(site,crack_id) {  
	$.ajax({ 
		dataType: "json",
		url: "/api/GroundVelocityDisplacementData/"+site+"/"+crack_id,success: function(result) {
			if(result.slice(0,1) != "I"){
				var ground_analysis_data = JSON.parse(result)
				var dvt = [];
				var vGraph =[] ;
				var dvtgnd = [];
				var dvtdata = ground_analysis_data["dvt"];
				var catdata= [];
				var up =[];
				var down =[];
				var line = [];
				var series_data_vel =[];
				var series_data_dis =[];
				var a_time =[], v_time = [];
				var vatSeries=[];
				for(var i = 0; i < dvtdata.gnd["surfdisp"].length; i++){
					dvtgnd.push([dvtdata.gnd["ts"][i],dvtdata.gnd["surfdisp"][i]]);
					catdata.push(i);
				}
				for(var i = 0; i < dvtdata.interp["surfdisp"].length; i++){
					dvt.push([dvtdata.interp["ts"][i],dvtdata.interp["surfdisp"][i]]);
				}
				var last =[];
				for(var i = 0; i < ground_analysis_data["av"].v.length; i++){
					var data = [];
					data.push( ground_analysis_data["av"].v[i] , ground_analysis_data["av"].a[i]);
					vGraph.push(data);
				}

				for(var i = ground_analysis_data["av"].v.length-1; i < ground_analysis_data["av"].v.length; i++){
					last.push([ground_analysis_data["av"].v[i],ground_analysis_data["av"].a[i]]);
				}

				for(var i = 0; i < ground_analysis_data["av"].v_threshold.length; i++){
					up.push([ground_analysis_data["av"].v_threshold[i],ground_analysis_data["av"].a_threshold_up[i],ground_analysis_data["av"].a_threshold_down[i]]);
					line.push([ground_analysis_data["av"].v_threshold[i],ground_analysis_data["av"].a_threshold_line[i]]);
				}
				
				for (var i = 0; i < ground_analysis_data["vat"].a_n.length; i++) {
					a_time.push([ground_analysis_data["vat"].ts_n[i],ground_analysis_data["vat"].a_n[i]])
					v_time.push([ground_analysis_data["vat"].ts_n[i],ground_analysis_data["vat"].v_n[i]])
				}
				vatSeries.push({name:'acceleration',data:a_time,id:'dataseries',type:'line'})
				vatSeries.push({name:'velocity',data:v_time,id:'dataseries',type:'line',yAxis: 1})
				chartProcessSurficialAnalysis2('analysisVAT',vatSeries,'Velocity and  Acceleration Vs Time Chart of '+crack_id,site)

				var series_data_name_vel =[vGraph,up,down,line,last];
				var series_name =["Data","Threshold","TL","LPoint"];
				series_data_vel.push({name:series_name[0],data:series_data_name_vel[0],id:'dataseries',type:'line'})
				series_data_vel.push({name:series_name[2],data:series_data_name_vel[3],type:'line'})
				series_data_vel.push({name:series_name[3],data:series_data_name_vel[4],type:'line',
					marker: { symbol: 'url(https://www.highcharts.com/samples/graphics/sun.png)'} })
				series_data_vel.push({name:series_name[1],data:series_data_name_vel[1],type:'arearange', lineWidth: 0, fillOpacity: 0.2,zIndex: 0})

				// $('#surficialgeneral').val('analysisVelocity')
				// $('#surficialgeneral').selectpicker('refresh')
				chartProcessSurficialAnalysis3('analysisVelocity',series_data_vel,'Velocity Acceleration Chart of '+crack_id,site)
				series_data_dis.push({name:series_name[0],data:dvtgnd,type:'scatter'})
				series_data_dis.push({name:'Interpolation',data:dvt,marker:{enabled: true, radius: 0}})
				chartProcessSurficialAnalysis('analysisDisplacement',series_data_dis,' Displacement Interpolation Chart of '+crack_id,site)
			}else{
				$("#analysisVelocity").empty()
				$("#analysisVelocity").append('<div class="text-center"> <h3>No Data</h3> </div>')
				$("#analysisDisplacement").empty()
				$("#analysisDisplacement").append('<div class="text-center"> <h3>No Data</h3> </div>')
			}
		}
	});	
}

function piezometer(dataSubmit){
	$("#graphS4").append('<div id="fred_div"></div>');
	$("#graphS4").append('<div id="temp_div"></div>');
	$.ajax({
		dataType: "json",
		url: "/api/PiezometerAllData/ltesapzpz",success: function(result) { 
			var freq_data=[] , temp_data =[];
			var freqDataseries =[] ,tempDataseries =[];
			for(var i = 0; i < result.length; i++){
				var time = Date.parse(result[i].timestamp)
				var freq = [time,parseFloat(result[i].freq)]
				var temp = [time,parseFloat(result[i].temp)]
				freq_data.push(freq)
				temp_data.push(temp)
			}

			freqDataseries.push({name:'frequency',data:freq_data})
			tempDataseries.push({name:'Temperature',data:temp_data})
			chartProcess('fred_div',freqDataseries,'Piezometer frequency')
			chartProcess('temp_div',tempDataseries,'Piezometer Temperature')
		} 
	});	
}

function chartProcess(id,data_series,name){
	Highcharts.setOptions({
		global: {
			timezoneOffset: -8 * 60
		},
	});
	$("#"+id).highcharts({
		chart: {
			type: 'spline',
			zoomType: 'x',
				// height: 800,
				width:$("#analysisDisplacement").width()
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
				shared: true,
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
			series:data_series
		});
}

function chartProcessSurficialAnalysis(id,data_series,name,site){
	Highcharts.setOptions({
		global: {
			timezoneOffset: -8 * 60
		},
	});
	$("#"+id).highcharts({
		chart: {
			type: 'spline',
			zoomType: 'x',
			panning: true,
			panKey: 'shift',
			width:750
		},
		title: {
			text: name,
		},
		subtitle: {
			text: 'Source: '+ (site).toUpperCase()
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
		yAxis:{
			title: {
				text: 'Displacement(cm) '
			}
		},
		tooltip: {
			header:'{point.x:%Y-%m-%d}: {point.y:.2f}',
			shared: true,
			crosshairs: true
		},
		plotOptions: {
			line: {
				marker: {
					enabled: true
				}
			}
		},
		credits: {
			enabled: false
		},
		series:data_series
	});
	$("#analysisVelocity").addClass("in");

}
function chartProcessSurficialAnalysis2(id,data_series,name,site){
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
			width:750
		},
		title: {
			text: name,
		},
		subtitle: {
			text: 'Source: '+ (site).toUpperCase()
		},
		xAxis: {
			type: 'datetime',
			dateTimeLabelFormats: { 
				month: '%e. %b %Y',
				year: '%b'
			},
			title: {
				text: 'Time(Days)'
			},
		},
		yAxis: [{ 

			title: {
				text: 'Velocity (cm/day)',
				style: {
					color: Highcharts.getOptions().colors[1]
				}
			}
		}, { 
			title: {
				text: 'Acceleration (cm/days^2)',
				style: {
					color: Highcharts.getOptions().colors[0]
				}
			},
			labels: {

				style: {
					color: Highcharts.getOptions().colors[0]
				}
			},
			opposite: true
		}],
		tooltip: {
			header:'{point.x:%Y-%m-%d}: {point.y:.2f}',
			shared: true,
			crosshairs: true
		},
		plotOptions: {
			line: {
				marker: {
					enabled: false
				}
			}
		},
		credits: {
			enabled: false
		},
		series:data_series
	});
}
function chartProcessSurficialAnalysis3(id,data_series,name,site){
	Highcharts.setOptions({
		global: {
			timezoneOffset: -8 * 60
		},
	});
	$("#"+id).highcharts({
		chart: {
			type: 'spline',
			zoomType: 'x',
			panning: true,
			panKey: 'shift',
			width:750
		},
		title: {
			text: name,
		},
		subtitle: {
			text: 'Source: '+ (site).toUpperCase()
		},
		xAxis: {
			title: {
				text: 'Velocity(cm/day)'
			},
		},
		yAxis:{
			title: {
				text: 'Acceleration(cm/day^2)'
			}
		},
		tooltip: {
			header:'{point.x:%Y-%m-%d}: {point.y:.2f}',
			shared: true,
			crosshairs: true
		},
		plotOptions: {
			line: {
				marker: {
					enabled: true
				}
			}
		},
		credits: {
			enabled: false
		},
		series:data_series
	});

}

function chartProcess2(id,data_series,name,dataTableSubmit,allDataResult){
	var site = $('#sitegeneral').val();
	var fdate = dataTableSubmit.fdate;
	var tdate = dataTableSubmit.tdate;
	var date1 = moment(fdate);
	var date2 = moment(tdate);
	var duration = moment.duration(date2.diff(date1));
	var  list_dates =[];
	
	for (var i = 0; i < allDataResult.length; i++) {
		list_dates.push(site+((moment(allDataResult[i].ts).format('YYYY-MM-DD')).replace(/-/g, "")).slice(2,10))
	}
	if(allDataResult.length != 0){
		var dataSubmit = {table:'gndmeas',from_id:allDataResult[0].id,to_id:allDataResult[allDataResult.length-1].id,site:site}
	}else{
		var dataSubmit = {table:'gndmeas',from_id:'0',to_id:'0',site:site}
	}

	$.post("/node_level_page/getAllgintagsNodeTagIDTry/", {data : dataSubmit} ).done(function(data){
		$('#'+id).empty();
		var result_unfiltered = JSON.parse(data)

		var all_cracks = [];

		for (var i = 0; i < result_unfiltered.length; i++) {
			all_cracks.push(result_unfiltered[i].crack_id)
		}

		var all_collected_tags =[]
		var filtered_crack_id = removeDuplicates(all_cracks);

		for (var i = 0; i < filtered_crack_id.length; i++) {
			var list = []
			for (var a = 0; a < result_unfiltered.length; a++) {
				if( filtered_crack_id[i] == result_unfiltered[a].crack_id){
					list.push({x:Date.parse(result_unfiltered[a].timestamp),text:"",value:result_unfiltered[a].remarks,title:result_unfiltered[a].tag_name,
						id:result_unfiltered[a].gintags_id,ref_id:result_unfiltered[a].tag_id_fk,table_id:result_unfiltered[a].id})
				}
			}
			all_collected_tags.push(list)
		}

		for (var a = 0; a < filtered_crack_id.length; a++) {
			data_series.push({name:'Tag',type:'flags',data:all_collected_tags[a],onSeries:filtered_crack_id[a],width:100,showInLegend: false,visible:true})
		}
		var result = [];
		for (var i = 0; i < result_unfiltered.length; i++) {
			if (result_unfiltered[i].tag_description == "ground analysis") {
				result.push(result_unfiltered[i])
			}
		}
		
		data_series.push({name:'Tag'})

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
				height: 400,
				width:$("#ground_graph").width()
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
				min:Date.parse(dataTableSubmit.fdate),
				max:Date.parse(dataTableSubmit.tdate),
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
								$("#tag_time").val(moment(this.x).format('YYYY-MM-DD HH:mm:ss'))
								$('#tag_ids').tagsinput('removeAll');
								$("#tag_value").val(this.id)
								$("#tag_crack").val(this.series.name)
								$("#tag_description").val('ground analysis')
								$("#tag_tableused").val('gndmeas')
								$("#tag_id").val(this.ref_id)
								$('#tag_table_id').val(this.table_id)
								$('#tag_hash').val(this.title)
								$('#tag_comments').val(this.value)
								$("#tsAnnotation").attr('value',moment(this.category).format('YYYY-MM-DD HH:mm:ss'));
								if(this.series.name == "Tag"){
									$("#tagModal").modal("show");
									$("#comment-model").empty();
									$("#comment-model").append('<small>REMARKS: </small>'+this.value+'<br><br><button type="button" class="btn btn-danger delete_tag " id="delete_tag">'
										+'<span class="glyphicon glyphicon-trash" aria-hidden="true"></span> Delete</button>&nbsp;<button type="button" class="btn btn-info edit_tag" id="edit_tag">'
										+'<span class="glyphicon glyphicon-pencil" aria-hidden="true"></span> Edit</button>')
								}else{
									$("#annModal").modal("show");
									
								}
								submittedMeas(dataTableSubmit,allDataResult,'surficial');
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
			for (var i = 0; i < all_cracks.length; i++) {
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

	});

}

function submittedMeas(dataTableSubmit,allDataResult,category){
	var host = window.location.host;
	$('#tag_submit').click(function(){
		var tag_name = $("#tag_ids").tagsinput("items");
		var tag_description = $("#tag_description").val();
		var timestamp = moment().format('YYYY-MM-DD HH:mm:ss');
		var tagger = $("#current_user_id").val();
		var table_element_id = $("#tag_value").val();
		var table_used = $("#tag_tableused").val();
		var remarks = $("#comment").val();
		var dataSubmit = [];
		for (var i = 0; i < tag_name.length; i++) {
			dataSubmit.push({ 
				'tag_name' : tag_name[i], 
				'tag_description' : tag_description,
				'timestamp' : timestamp,
				'tagger' : tagger,
				'table_element_id' : table_element_id,
				'table_used' :  table_used,
				'remarks' : remarks
			})
		}
		saveUpdateTag(dataSubmit,dataTableSubmit,allDataResult,category)
	});
	$('#delete_tag').on( "click", function(){
		$("#comment-model").empty();
		$("#comment-model").append('<label>Comments:</label><textarea id="issue"></textarea><br><br><button type="button" class="btn btn-danger delete_tag " id="delete_tag_comment">'
			+'<span class="glyphicon glyphicon-trash" aria-hidden="true"></span> Delete</button>')
		
		$('#delete_tag_comment').on( "click", function(){
			var gintags_id =  $("#tag_value").val();
			var tag_name_id = $("#tag_id").val();
			var timestamp = moment().format('YYYY-MM-DD HH:mm:ss');
			var tagger = $("#current_user_id").val();
			var table_element_id = $("#tag_table_id").val();
			var table_used = $("#tag_tableused").val();
			var remarks = $("#tag_comments").val();
			var issue = $('#issue').val();
			var status = 'deleted';
			let dataSubmit = { 
				'gintags_id' :gintags_id,
				'tag_name_id' : tag_name_id, 
				'timestamp' : timestamp,
				'tagger' : tagger,
				'table_element_id' : table_element_id,
				'table_used' :  table_used,
				'remarks' : remarks,
				'issue' : issue,
				'status': status
			}
			
			if( ($('#issue').val()).length != 0 ){
				$("#tagModal").modal("hide");
				$.post("http://"+host+"/generalinformation/removeGintagsId",{gintags:dataSubmit}).done(function(data) { 
					if(data == "true"){
						modalTemplate(dataTableSubmit,allDataResult,category)
					}

				})
			}
		});
		
	});
	$('.edit_tag').click(function(){
		$("#tagModal").modal("hide");
		var hash_tag = $("#tag_hash").val();
		var remarks_tag = $("#tag_comments").val();
		$("#tag_ids").tagsinput('add', hash_tag);
		$(".comment").val(remarks_tag)
		$("#modal_trigger").empty();
		$('#modal_trigger').append('<div class="form-group"><label for="formGroupExampleInput2">Comments</label>'+
			'<textarea class="form-control comment" rows="3" id="issue"></textarea></div>'+
			'<br><button type="button"  class="btn-sm btn-success pull-right" id="tag_update"><span class="glyphicon glyphicon-ok" aria-hidden="true"></span>'+
			' UPDATE</button><br>')
		$("#annModal").modal("show");
		$('#tag_update').on( "click", function(){
			var gintags_id =  $("#tag_value").val();
			var tag_name = $("#tag_ids").tagsinput("items");
			var tag_name_id = $("#tag_id").val();
			var tag_description = $("#tag_description").val();
			var timestamp = moment().format('YYYY-MM-DD HH:mm:ss');
			var tagger = $("#current_user_id").val();
			var table_element_id = $("#tag_table_id").val();
			var table_used = $("#tag_tableused").val();
			var remarks = $("#comment").val();
			var issue = $("#issue").val();
			var status = 'update';
			var dataSubmit = [];
			for (var i = 0; i < tag_name.length; i++) {
				dataSubmit.push({ 
					'gintags_id' :gintags_id,
					'tag_name': tag_name[i],
					'tag_description':tag_description,
					'tag_name_id' : tag_name_id, 
					'timestamp' : timestamp,
					'tagger' : tagger,
					'table_element_id' : table_element_id,
					'table_used' :  table_used,
					'remarks' : remarks,
					'issue':issue,
					'status': status
				})
			}
			
			if( ($('#issue').val()).length != 0 ){
				$("#annModal").modal("hide");
				$.post("http://"+host+"/generalinformation/updateGintagsId",{gintags:dataSubmit[0]}).done(function(data) { 
					if(data == "true"){
						if(tag_name.length > 1){
							var added_tag = [];
							for (var i = 1; i < dataSubmit.length; i++) {
								added_tag.push(dataSubmit[i])
							}
							saveUpdateTag(added_tag,dataTableSubmit,allDataResult,category)
						}else{
							modalTemplate(dataTableSubmit,allDataResult,category)
						}
						
					}
				})

				

			}
			
		});
	});
}

function saveUpdateTag(dataSubmit,dataTableSubmit,allDataResult,category) {
	var host = window.location.host;
	$.post("http://"+host+"/generalinformation/insertGinTags",{gintags: dataSubmit})
	.done(function(data) { 
		modalTemplate(dataTableSubmit,allDataResult,category)
	})
}

function modalTemplate(dataTableSubmit,allDataResult,category){
	$('#saveTAG').empty()
	$('#saveTAG').append('<div class="form-group tag_ids"><label>Tags</label>'+
		'<input type="text" class="form-control" id="tag_ids" placeholder="Ex: #AccelDrift or #Drift" data-role="tagsinput" value="">'+
		'</div><div class="form-group"><label for="formGroupExampleInput">Timestamp</label>'+
		'<input type="text" class="form-control" id="tag_time" disabled=""></div>'+
		'<div class="form-group"><label for="formGroupExampleInput2">Remarks</label>'+
		'<textarea class="form-control comment" rows="5" id="comment"></textarea></div>'+
		'<p id="modal_trigger"><button type="button"  class="btn-sm btn-success pull-right" id="tag_submit">'+
		'<span class="glyphicon glyphicon-ok" aria-hidden="true"></span> SAVE</button><br></p>')
	$("#ground_graph").empty();
	$("#graphS2").empty();
	$("#graphS2").append('<div id="ground_graph" ></div>');
	$("#annModal").modal("hide");
	var series_data_tag = JSON.parse($("#tag_series").val())
	if( category == 'surficial'){
		chartProcess2('ground_graph',series_data_tag,'Superimposed Surficial Graph',dataTableSubmit,allDataResult)
	}else if (category == 'rain'){
		// let category = {tag : 'fromTag' , selectedDay:$('#rainfall_days .rainfall_select .btn .pull-left').val()}

	}
}


});





var meas_all = 1;
function insert_meas() {

	meas_all++;
	var objTo = document.getElementById('insert_meas')
	var divtest = document.createElement("div");
	divtest.setAttribute("class", "form-group removeclass"+meas_all);
	var rdiv = 'removeclass'+meas_all;
	divtest.innerHTML = '<div class="col-sm-6 nopadding"><div class="form-group"> <input type="text" class="form-control entry_crack" id="entry_crack'+ meas_all +'" name="entry_crack" value="" placeholder="Crack ID" required></div></div>'+
	'<div class="col-sm-6 nopadding"><div class="form-group"><div class="input-group">'+
	'<input type="number" class="form-control entry_meas" id="entry_meas'+ meas_all +'" name="entry_meas" value="" placeholder="Measurement" required><div class="input-group-btn"> <button class="btn btn-danger" type="button" onclick="remove_meas_fields('+ meas_all +');"> <span class="glyphicon glyphicon-minus" aria-hidden="true"></span> </button></div></div></div></div><div class="clear"></div>';

	objTo.appendChild(divtest)
}
function remove_meas_fields(rid) {
	$('.removeclass'+rid).remove();
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