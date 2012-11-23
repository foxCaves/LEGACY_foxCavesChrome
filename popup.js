function shortenTabURL() {
	doRequest({action: "shorten"});
}

function screenshotTab() {
	doRequest({action: "screenshot"});
}

function doRequest(obj) {
	document.getElementById("actions").style.display = "none";
	document.getElementById("loading").style.display = "";
	chrome.extension.sendMessage(obj, function(reply) {
		document.getElementById("actions").style.display = "";
		document.getElementById("loading").style.display = "none";
	});
}

window.onload = function(e) {
	document.getElementById("shorten-tab-url").addEventListener("click", shortenTabURL);
	document.getElementById("screenshot-tab").addEventListener("click", screenshotTab);
}