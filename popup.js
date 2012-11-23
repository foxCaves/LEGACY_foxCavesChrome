function shortenTabURL() {
	doRequest({type: "shorten"});
}

function screenshotTab() {
	doRequest({type: "screenshot"});
}

function doRequest(obj, callback) {
	document.getElementById("actions").style.display = "none";
	document.getElementById("loading").style.display = "";
	var port = chrome.extension.connect({name: "bgcallback"});
	port.onDisconnect.addListener(function() {
		document.getElementById("actions").style.display = "";
		document.getElementById("loading").style.display = "none";
		document.getElementById("progress").value = "0";
	});
	if(callback) {
		port.onMessage.addListener(callback);
	}
	port.onMessage.addListener(function(msg) {
		if(msg.progress) {
			document.getElementById("progress").value = msg.progress;
		}
	});
	port.postMessage(obj);
}

window.onload = function(e) {
	document.getElementById("shorten-tab-url").addEventListener("click", shortenTabURL);
	document.getElementById("screenshot-tab").addEventListener("click", screenshotTab);
}