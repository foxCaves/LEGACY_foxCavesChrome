chrome.contextMenus.onClicked.addListener(function(info, tab) {
	switch(info.menuItemId) {
		case "saveFile":
			//chrome.extension.sendRequest({dorequest: true, type: "savefile", dataUrl: info.linkUrl});
			saveURL(info.srcUrl);
			break;
		case "shortenLink":
			//chrome.extension.sendRequest({dorequest: true, type: "shortenurl", linkUrl: info.linkUrl});
			shortenURL(info.linkUrl);
			break;
	}
});

chrome.runtime.onInstalled.addListener(function() {
	chrome.contextMenus.create({"title": "Upload this to your foxCaves", "contexts": ["image", "video", "audio"], "id": "saveFile"});
	chrome.contextMenus.create({"title": "Shorten link with fox.gy", "contexts": ["link"], "id": "shortenLink"});
});