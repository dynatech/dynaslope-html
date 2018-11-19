
$(document).ready(function () {
	let option1 = {
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

	let chart1 = Highcharts.chart('container', option1);

	let option2 = {
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

	let chart2 = Highcharts.chart('container2', option2);

	$('#button').click(function () {
		let d3_svg = $("#d3_container")[0].innerHTML;
		let charts = [ chart1.getSVG(), chart2.getSVG(), d3_svg ];
		//let charts = [ d3_svg ];
		console.log(charts);
		
		$.post("/../chart_export/renderChart", { charts : charts } )
		.done(function (data) {
			if(data == "Finished")
			{
				window.open("/temp/charts_render/compiled.pdf", '_blank', 'fullscreen=yes');
			}
		})
	});

});
