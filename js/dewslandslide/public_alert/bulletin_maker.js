/****
 *
 *	Created by Kevin Dhale dela Cruz
 *	JS file for automated PDF rendering;
 *	File dependent on PhantomJS library
 *	
****/

var webPage = require('webpage');
var args = require('system').args;
var page = require('webpage').create();

page.viewportSize = { width: 1275, height: 1650 };
page.paperSize = { width: (8.5/0.55) + 'in', height: (11/0.55) + 'in'/*, border: (0.5/0.55) + 'in' */};
page.settings.dpi = 300;
//FOR UBUNTU
page.zoomFactor = 0.55;

page.onResourceError = function(resourceError) {
    console.error(resourceError.url + ': ' + resourceError.errorString);
};

page.onError = function (msg, trace) {
    console.log(msg);
    trace.forEach(function(item) {
        console.log('  ', item.file, ':', item.line);
    });
};

page.onConsoleMessage = function(msg, lineNum, sourceId) {
  console.log('CONSOLE: ' + msg + ' (from line #' + lineNum + ' in "' + sourceId + '")');
};

phantom.onError = function(msg, trace) {
  var msgStack = ['PHANTOM ERROR: ' + msg];
  if (trace && trace.length) {
    msgStack.push('TRACE:');
    trace.forEach(function(t) {
      msgStack.push(' -> ' + (t.file || t.sourceURL) + ': ' + t.line + (t.function ? ' (in function ' + t.function +')' : ''));
    });
  }
  console.error(msgStack.join('\n'));
  phantom.exit(1);
};

page.open( args[1], function(status) {

	var line = args[1];
	var editList = args[2];

	if (status === 'success') {

		console.log("Page " + args[1] + " loaded...");

		var substring = "edit";
		if( line.indexOf(substring) !== -1 ) {
			page.evaluate(function (editList) {
				// var params = edits.split("/");
				var edits = decodeURIComponent(editList).split("**");
				// var edits = editList.split("\\");
				document.getElementById("bulletin_number").innerText = edits[0];
				document.getElementById("alert_description").innerText = edits[1];
				document.getElementById("validity").innerText = edits[2];
				document.getElementById("recommended_response").innerText = edits[3];
				document.getElementById("next_reporting").innerText = edits[4];
				document.getElementById("recommended_response_2").innerText = edits[5];
				document.getElementById("next_bulletin").innerText = edits[6];
			}, editList);
		};

		window.setTimeout(function () {
			// use ./../filename.pdf for relative paths
			page.render("bulletin.pdf");
			console.log("Capturing finished...");
			console.log("Exiting...");
			console.log("Success.");
			phantom.exit();
		}, 3000);
		
	} else {

		console.log("Error opening url \"" + page.reason_url
        	+ "\": " + page.reason
        );
		phantom.exit();	
	}

});