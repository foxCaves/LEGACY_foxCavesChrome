chrome.contextMenus.onClicked.addListener(function(info, tab) {
	switch(info.menuItemId) {
		case "saveFile":
			saveURL(info.srcUrl, tab.id);
			break;
		case "shortenLink":
			shortenURL(info.linkUrl, tab.id);
			break;
		case "shortenFile":
			shortenURL(info.srcUrl, tab.id);
			break;
	}
});

chrome.runtime.onInstalled.addListener(function() {
	chrome.contextMenus.create({"title": "Upload this files to your foxCaves", "contexts": ["image", "video", "audio"], "id": "saveFile"});
	chrome.contextMenus.create({"title": "Shorten link to this file with fox.re", "contexts": ["image", "video", "audio"], "id": "shortenFile"});
	chrome.contextMenus.create({"title": "Shorten link with fox.re", "contexts": ["link"], "id": "shortenLink"});
});