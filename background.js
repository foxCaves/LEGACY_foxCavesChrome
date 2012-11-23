chrome.extension.onMessage.addListener(function(obj, sender, sendResponse) {
	switch(obj.action) {
		case "shorten":
			shortenTabURL(sendResponse);
			break;
		case "screenshot":
			screenshotTab(sendResponse);
			break;
	}
});

function copyToClipboard(text) {
	var clipboard = document.getElementById("clipboard");
	clipboard.value = text;
	clipboard.focus();
	clipboard.select();
	document.execCommand("copy");
}

function shortenTabURL(sendResponse) {
	chrome.tabs.getSelected(null, function(tab) {
		sendAPIRequest("shorten?" + tab.url, function(req) {
			copyToClipboard("https://fox.gy/g" + req.responseText.trim());
			sendResponse("DONE");
			alert("Link shortened. Short link copied to clipboard!");
		});
	});
}

function screenshotTab(sendResponse) {
	chrome.tabs.captureVisibleTab(null, {format: "png"}, function(dataURL) {
		var x = dataURL.lastIndexOf(",");
		if(!x) x = dataURL.lastIndexOf(";");
		var data = Base64Binary.decodeArrayBuffer(dataURL.substr(x + 1));
		
		chrome.tabs.getSelected(null, function(tab) {
			var filename = tab.title + ".png";
			sendAPIRequest("create?" + filename, function(req) {
				if(req.status != 200) {
					alert("Error: " + req.responseText);
					return;
				}
				
				var file = req.responseText.split("\n");
				var fileInfo = file[1].split(">");
				var fileid = fileInfo[0];
				
				copyToClipboard("https://fox.gy/v" + fileid);
				sendResponse("DONE");
				alert("Screenshot upladed. Link copied to clipboard!");
			}, "PUT", data);
		});
	});
}

function sendAPIRequest(url, callback, method, body) {
	if(!method) method = "GET";
	if(!body) body = null;
	
	var req = new XMLHttpRequest();
	req.open(method, "https://foxcav.es/api/" + url, true);
	req.onload = function() {
		if(req.status == 403) {
			chrome.tabs.create({
				url: "https://foxcav.es/login"
			});
			return;
		}
		callback(req);
	};
	req.send(body);
}
