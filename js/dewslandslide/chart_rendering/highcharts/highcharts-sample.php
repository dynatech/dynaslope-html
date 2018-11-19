<script src="https://code.jquery.com/jquery-3.1.1.min.js"></script>
<script src="https://code.highcharts.com/highcharts.js"></script>
<script src="https://code.highcharts.com/modules/exporting.js"></script>
<script src="https://code.highcharts.com/modules/offline-exporting.js"></script>

<style type="text/css">
	#container, #container2 {
		min-width: 310px;
		max-width: 800px;
		height: 400px;
		margin: 0 auto
	}
</style>

<button id="button" type="button">Export chart</button>
<div id="container"></div>
<div id="container2"></div>

<script type="text/javascript">
	let chart1 = {
	    title: {
	        text: 'Solar Employment Growth by Sector, 2010-2016'
	    },

	    subtitle: {
	        text: 'Source: thesolarfoundation.com'
	    },

	    yAxis: {
	        title: {
	            text: 'Number of Employees'
	        }
	    },
	    legend: {
	        layout: 'vertical',
	        align: 'right',
	        verticalAlign: 'middle'
	    },

	    plotOptions: {
	        series: {
	            pointStart: 2010
	        }
	    },

	    series: [{
	        name: 'Installation',
	        data: [43934, 52503, 57177, 69658, 97031, 119931, 137133, 154175]
	    }, {
	        name: 'Manufacturing',
	        data: [24916, 24064, 29742, 29851, 32490, 30282, 38121, 40434]
	    }, {
	        name: 'Sales & Distribution',
	        data: [11744, 17722, 16005, 19771, 20185, 24377, 32147, 39387]
	    }, {
	        name: 'Project Development',
	        data: [null, null, 7988, 12169, 15112, 22452, 34400, 34227]
	    }, {
	        name: 'Other',
	        data: [12908, 5948, 8105, 11248, 8989, 11816, 18274, 18111]
	    }],
	    exporting: {
     	   enabled: false // hide button
    	}
	};

	Highcharts.chart('container', chart1);

	let chart2 = {
	    chart: {
	        type: 'spline',
	        inverted: true
	    },
	    title: {
	        text: 'Atmosphere Temperature by Altitude'
	    },
	    subtitle: {
	        text: 'According to the Standard Atmosphere Model'
	    },
	    xAxis: {
	        reversed: false,
	        title: {
	            enabled: true,
	            text: 'Altitude'
	        },
	        labels: {
	            formatter: function () {
	                return this.value + 'km';
	            }
	        },
	        maxPadding: 0.05,
	        showLastLabel: true
	    },
	    yAxis: {
	        title: {
	            text: 'Temperature'
	        },
	        labels: {
	            formatter: function () {
	                return this.value + '°';
	            }
	        },
	        lineWidth: 2
	    },
	    legend: {
	        enabled: false
	    },
	    tooltip: {
	        headerFormat: '<b>{series.name}</b><br/>',
	        pointFormat: '{point.x} km: {point.y}°C'
	    },
	    plotOptions: {
	        spline: {
	            marker: {
	                enable: false
	            }
	        }
	    },
	    series: [{
	        name: 'Temperature',
	        data: [[0, 15], [10, -50], [20, -56.5], [30, -46.5], [40, -22.1],
	            [50, -2.5], [60, -27.7], [70, -55.7], [80, -76.5]]
	    }],
	    exporting: {
	    	scale:1, 
     	   enabled: false // hide button
    	}
	};

	Highcharts.chart('container2', chart2);

	console.log(chart1);

	$('#button').click(function () {
		[chart1, chart2].forEach(function (chart) {
			chart.exportChartLocal({
				type: 'application/pdf',
				filename: chart.title.textStr
			});
		})
	});
</script>