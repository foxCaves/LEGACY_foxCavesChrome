chrome.extension.onMessage.addListener(function(obj, sender, sendResponse) {
	console.log(obj);
	switch(obj.action) {
		case "shorten":
			shortenTabURL();
			break;
		case "screenshot":
			screenshotTab();
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

function shortenTabURL() {
	chrome.tabs.getSelected(null, function(tab) {
		sendAPIRequest("shorten?" + tab.url, function(req) {
			copyToClipboard("https://fox.gy/g" + req.responseText.trim());
			alert("Link shortened. Short link copied to clipboard!");
		});
	});
}

function screenshotTab() {
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
