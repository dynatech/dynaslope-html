$(document).ready(function(e) {
	$(function() {
		$('#date-discovered').daterangepicker({
			singleDatePicker: true,
			showDropdowns: true,
		}, 
		function(start, end, label) {

		});
	});
	$('input[name="submit"]').on('click',function(){
		var site_column = $('#site-column-name').val();
		var node_id = $('#node-id').val();
		var date_discovered = Date.parse($('#date-discovered').val());
		var post_ts = moment().format('YYYY-MM-DD HH:mm:ss');
		var flagger_name = $('#flagger').val();
		var status = $('#status-select').val();
		var comment = $('#comment-text').val();
		
		var dataSubmit = [post_ts,moment(date_discovered).format('YYYY-MM-DD'),flagger_name,site_column,node_id,status,comment,'1']
		$.post("../node_report_page/getAllSubmitData", {data : dataSubmit} ).done(function(data){});
	});
});
