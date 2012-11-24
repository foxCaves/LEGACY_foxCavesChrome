function shortenTabURL() {
	doRequest({req: "shorten"});
}

function screenshotTab() {
	doRequest({req: "screenshot"});
}

function doRequest(obj) {
	if(!obj.tabid) {
		chrome.tabs.getSelected(null, function(tab) {
			obj.tabid = tab.id;
			doRequest(obj);
		});
	} else {
		chrome.extension.sendMessage(obj);
		window.close();
	}
}

document.getElementById("shorten-tab-url").addEventListener("click", shortenTabURL);
document.getElementById("screenshot-tab").addEventListener("click", screenshotTab);