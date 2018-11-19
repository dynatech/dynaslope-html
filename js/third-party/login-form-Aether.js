
$(document).ready(function() { 

	// Initialize all event listeners
    initializeForgotlinkOnClick();
    initializeNoAccountOnClick();
});

function initializeForgotlinkOnClick () {
    $("#forgot-link").click(() => {
        console.log("He forgot!");
        alert("Please contact any Dynaslope S.W.A.T. personnel to retrieve your password.")
    })
}   

function initializeNoAccountOnClick () {
    $("#no-account").click(() => {
        console.log("He forgot!");
        alert("Please contact any Dynaslope S.W.A.T. personnel to request access to DEWS-L site.")
    })
}   