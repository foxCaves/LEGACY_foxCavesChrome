chrome.extension.onConnect.addListener(function(port) {
	if(port.name != "bgcallback") return;
	var handshakeListener;
	handshakeListener = function(msg) {
		port.onMessage.removeListener(handshakeListener);
		switch(msg.type) {
			case "shorten":
				shortenTabURL(port);
				break;
			case "screenshot":
				screenshotTab(port);
				break;	
		}
	}
	port.onMessage.addListener(handshakeListener);
});

function copyToClipboard(text) {
	var clipboard = document.getElementById("clipboard");
	clipboard.value = text;
	clipboard.focus();
	clipboard.select();
	document.execCommand("copy");
}

function shortenTabURL(port) {
	chrome.tabs.getSelected(null, function(tab) {
		sendAPIRequest("shorten?" + tab.url, function(req) {
			copyToClipboard("https://fox.gy/g" + req.responseText.trim());
			port.disconnect();
			alert("Link shortened. Short link copied to clipboard!");
		}, port);
	});
}

function screenshotTab(port) {
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
				port.disconnect();
				alert("Screenshot upladed. Link copied to clipboard!");
			}, port, "PUT", data);
		});
	});
}

function _setUploadProgress(progress, port) {
	port.postMessage({progress: progress});
}

function uploadStart(evt, port) {
	_setUploadProgress(0, port);
}

function uploadComplete(evt, port) {
	_setUploadProgress(100, port);
}

function uploadProgress(evt, port) {
	if(evt.lengthComputable) {
		_setUploadProgress((evt.loaded / evt.total) * 100.0, port);
	}
}

function sendAPIRequest(url, callback, port, method, body) {
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
	if(port) {
		req.upload.addEventListener("loadstart", function(evt) { uploadStart(evt, port); }, false);
		req.upload.addEventListener("progress", function(evt) { uploadProgress(evt, port); }, false);
		req.upload.addEventListener("load", function(evt) { uploadComplete(evt, port); }, false);
	}
	req.send(body);
}
