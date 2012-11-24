chrome.contextMenus.onClicked.addListener(function(info, tab) {
	switch(info.menuItemId) {
		case "saveFile":
			saveURL(info.srcUrl);
			break;
		case "shortenLink":
			shortenURL(info.linkUrl);
			break;
	}
});

chrome.runtime.onInstalled.addListener(function() {
	chrome.contextMenus.create({"title": "Upload this to your foxCaves", "contexts": ["image", "video", "audio"], "id": "saveFile"});
	chrome.contextMenus.create({"title": "Shorten link with fox.gy", "contexts": ["link"], "id": "shortenLink"});
});