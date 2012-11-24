chrome.extension.onMessage.addListener(function(msg, sender, sendMessage) {
	switch(msg.dorequest) {
		case "shorten":
			shortenTabURL(msg.tabid);
			break;
		case "screenshot":
			screenshotTab(msg.tabid);
			break;
		case "savefile":
			saveFile(msg.dataUrl, msg.filename, msg.tabid);
			break;
		case "shortenurl":
			shortenURL(msg.linkUrl, msg.tabid);
			break;
	}
	sendMessage("OK");
});

function copyToClipboard(text) {
	var clipboard = document.getElementById("clipboard");
	clipboard.value = text;
	clipboard.focus();
	clipboard.select();
	document.execCommand("copy");
}

function shortenTabURL(tabid) {
	chrome.tabs.get(tabid, function(tab) {
		shortenURL(tab.url, tabid);
	});
}

function shortenURL(url, tabid) {
	sendAPIRequest("shorten?" + url, function(req) {
		copyToClipboard("https://fox.gy/g" + req.responseText.trim());
		alert("Link shortened. Short link copied to clipboard!");
	}, tabid);
}

function saveURL(url, tabid) {
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
		saveFile(req.response, filename, tabid);
	};
	req.send(null);
}

function saveFile(data, filename, tabid) {
	sendAPIRequest("create?" + filename, function(req) {
		if(req.status != 200) {
			alert("Error: " + req.responseText);
			return;
		}
		
		var file = req.responseText.split("\n");
		var fileInfo = file[1].split(">");
		var fileID = fileInfo[0];
		
		copyToClipboard("https://fox.gy/v" + fileID);
		alert("File uploaded. Link copied to clipboard!");
	}, tabid, "PUT", data);
}

function saveDataURL(dataURL, filename, tabid) {
	var x = dataURL.lastIndexOf(",");
	if((!x) || x < 0) x = dataURL.lastIndexOf(";");
	var data = Base64Binary.decodeArrayBuffer(dataURL.substr(x + 1));
	
	saveFile(data, filename, tabid);
}

function screenshotTab(tabid) {
	chrome.tabs.captureVisibleTab(null, {format: "png"}, function(dataURL) {
		chrome.tabs.getSelected(null, function(tab) {
			var filename = tab.title + ".png";
			saveDataURL(dataURL, filename, tab.id);
		});
	});
}

function _setUploadProgress(progress, tabid) {
	chrome.tabs.sendMessage(tabid, {progress: progress});
}

function uploadStart(evt, tabid) {
	_setUploadProgress(0, tabid);
}

function uploadComplete(evt, tabid) {
	_setUploadProgress(100, tabid);
}

function uploadProgress(evt, tabid) {
	if(evt.lengthComputable) {
		_setUploadProgress((evt.loaded / evt.total) * 100.0, tabid);
	}
}

function sendAPIRequest(url, callback, tabid, method, body) {
	if(!method) method = "GET";
	if(!body) body = null;
	
	chrome.tabs.executeScript(tabid, {file: "loader.js"}, function(res) {
		_setUploadProgress(-1, tabid);
	
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
			_setUploadProgress(101, tabid);
		};
		
		req.upload.addEventListener("loadstart", function(evt) { uploadStart(evt, tabid); }, false);
		req.upload.addEventListener("progress", function(evt) { uploadProgress(evt, tabid); }, false);
		req.upload.addEventListener("load", function(evt) { uploadComplete(evt, tabid); }, false);
		
		req.send(body);
	});
}
