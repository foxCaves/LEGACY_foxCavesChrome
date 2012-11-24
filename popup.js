function shortenTabURL() {
	doRequest({dorequest: "shorten"});
}

function screenshotTab() {
	doRequest({dorequest: "screenshot"});
}

function doRequest(obj) {
	if(!obj.tabid) {
		chrome.tabs.getSelected(null, function(tab) {
			obj.tabid = tab.id;
			chrome.extension.sendMessage(obj);
		});
	} else {
		chrome.extension.sendMessage(obj);
	}
	window.close();
}

window.onload = function(e) {
	document.getElementById("shorten-tab-url").addEventListener("click", shortenTabURL);
	document.getElementById("screenshot-tab").addEventListener("click", screenshotTab);
}