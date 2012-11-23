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
			case "savefile":
				saveFile(msg.dataUrl, msg.filename, port);
				break;
			case "shortenurl":
				shortenURL(msg.linkUrl, port);
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
		shortenURL(tab.url, port);
	});
}

function shortenURL(url, port) {
	sendAPIRequest("shorten?" + url, function(req) {
		copyToClipboard("https://fox.gy/g" + req.responseText.trim());
		if(port) port.disconnect();
		alert("Link shortened. Short link copied to clipboard!");
	}, port);
}

function saveURL(url) {
	var x = url.lastIndexOf("/");
	var filename = url.substr(x + 1);
	x = url.indexOf("?");
	if(x && x >= 0) filename = filename.substring(0, x - 1);
	
	var req = new XMLHttpRequest();
	req.responseType = "arraybuffer";
	req.open("GET", url, true);
	req.onload = function() {
		if(req.status != 200) {
			alert("Error downloading file to reupload");
			return;
		}
		saveFile(req.response, filename, null);
	};
	req.send(null);
}

function saveFile(data, filename, port) {
	sendAPIRequest("create?" + filename, function(req) {
		if(req.status != 200) {
			alert("Error: " + req.responseText);
			return;
		}
		
		var file = req.responseText.split("\n");
		var fileInfo = file[1].split(">");
		var fileID = fileInfo[0];
		
		copyToClipboard("https://fox.gy/v" + fileID);
		if(port) port.disconnect();
		alert("File uploaded. Link copied to clipboard!");
	}, port, "PUT", data);
}

function saveDataURL(dataURL, filename, port) {
	var x = dataURL.lastIndexOf(",");
	if((!x) || x < 0) x = dataURL.lastIndexOf(";");
	var data = Base64Binary.decodeArrayBuffer(dataURL.substr(x + 1));
	
	saveFile(data, filename, port);
}

function screenshotTab(port) {
	chrome.tabs.captureVisibleTab(null, {format: "png"}, function(dataURL) {
		chrome.tabs.getSelected(null, function(tab) {
			var filename = tab.title + ".png";
			saveDataURL(dataURL, filename, port);
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
		if(req.status == 401) {
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
