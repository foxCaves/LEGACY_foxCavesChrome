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

function openNewTab(url) {
	chrome.tabs.create({
		url: "https://foxcav.es" + url
	});
}

document.getElementById("shorten-tab-url").addEventListener("click", function() { doRequest({req: "shorten"}); });
document.getElementById("screenshot-tab").addEventListener("click", function() { doRequest({req: "screenshot"}); });
document.getElementById("open-my-files").addEventListener("click", function() { openNewTab("/myfiles") });
document.getElementById("open-my-links").addEventListener("click", function() { openNewTab("/mylinks") });