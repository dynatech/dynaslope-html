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
var zoom = typeof args[3] == "undefined" ? 1 : args[3];

page.viewportSize = { width: 1275, height: 1650 };
//page.viewportSize = { width: 1650, height: 1275};
//page.paperSize = { height: (8.5/0.55) + 'in', width: (11/0.55) + 'in'/*, border: (0.5/0.55) + 'in' */};
page.paperSize = { height: (8.5/zoom) + 'in', width: (11/zoom) + 'in'/*, border: (0.5/0.55) + 'in' */};
page.settings.dpi = 300;
//FOR UBUNTU
//page.zoomFactor = args[3] == "" ? 1 : args[3];
page.zoomFactor = zoom;


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

	if (status === 'success') {

		console.log("Page " + args[1] + " loaded...");

		window.setTimeout(function () {
			// use ./../filename.pdf for relative paths
			page.render(args[2]);
			console.log("Capturing finished...");
			console.log("Exiting...");
			console.log("Success.");
			phantom.exit();
		}, 1000);
		
	} else {

		console.log("Error opening url \"" + page.reason_url
        	+ "\": " + page.reason
        );
		phantom.exit();	
	}

});