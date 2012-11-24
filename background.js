chrome.extension.onMessage.addListener(function(msg, sender, sendMessage) {
	switch(msg.req) {
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
		default:
			return;
	}
	sendMessage("OK");
});

function showAlert(text) {
	var notification = window.webkitNotifications.createNotification('icon.png', 'foxCaves', text);
	notification.show();
	window.setTimeout(function() {
		notification.cancel();
	}, 5000);
}

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
		showAlert("Link shortened. Short link copied to clipboard!");
	}, tabid);
}

function saveURL(url, tabid) {
	chrome.tabs.executeScript(tabid, {file: "loader.js"}, function(res) {	
		alert("EXEC");
		var x = url.lastIndexOf("/");
		var filename = url.substr(x + 1);
		x = url.indexOf("?");
		if(x && x >= 0) filename = filename.substring(0, x - 1);
		
		_setDisplayProgressText("Downloading from website...", 0.5, 0, tabid);
		
		var req = new XMLHttpRequest();
		req.responseType = "arraybuffer";
		req.open("GET", url, true);
		req.onload = function() {
			if(req.status != 200) {
				showAlert("Error downloading file to reupload");
				return;
			}
			saveFile(req.response, filename, tabid, 0.5, 0.5);
		};
		req.addEventListener("loadstart", function(evt) { uploadStart(evt, 0.5, 0, tabid); }, false);
		req.addEventListener("progress", function(evt) { uploadProgress(evt, 0.5, 0, tabid); }, false);
		req.addEventListener("load", function(evt) { uploadComplete(evt, 0.5, 0, tabid); }, false);
		req.send(null);
	});
}

function saveFile(data, filename, tabid, progress_mult, progress_offset) {
	sendAPIRequest("create?" + filename, function(req) {
		if(req.status != 200) {
			showAlert("Error: " + req.responseText);
			return;
		}
		
		var file = req.responseText.split("\n");
		var fileInfo = file[1].split(">");
		var fileID = fileInfo[0];
		
		copyToClipboard("https://fox.gy/v" + fileID);
		showAlert("File uploaded. Link copied to clipboard!");
	}, tabid, "PUT", data, progress_mult, progress_offset);
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

function _setDisplayProgressText(text, mult, offset, tabid) {
	if(offset <= 0) offset = -1;
	chrome.tabs.sendMessage(tabid, {progress: offset, text: text});
}

function _setDisplayProgress(progress, mult, offset, tabid) {
	chrome.tabs.sendMessage(tabid, {progress: ((progress * mult) + (offset * 100))});
}

function uploadStart(evt, mult, offset, tabid) {
	_setDisplayProgress(0, mult, offset, tabid);
}

function uploadComplete(evt, mult, offset, tabid) {
	if(offset + mult >= 1) {
		_setDisplayProgressText("foxCaves server is processing...", mult, offset + mult, tabid);
	}
	_setDisplayProgress(100, mult, offset, tabid);
}

function uploadProgress(evt, mult, offset, tabid) {
	if(evt.lengthComputable) {
		_setDisplayProgress((evt.loaded / evt.total) * 100.0, mult, offset, tabid);
	}
}

function sendAPIRequest(url, callback, tabid, method, body, progress_mult, progress_offset, dontloadloader) {
	if(!method) method = "GET";
	if(!body) body = null;
	if(!progress_mult) progress_mult = 1;
	if(!progress_offset) progress_offset = 0;
	
	if(progress_offset <= 0 && !dontloadloader) {
		chrome.tabs.executeScript(tabid, {file: "loader.js"}, function(res) {
			sendAPIRequest(url, callback, tabid, method, body, progress_mult, progress_offset, true);
		});
		return;
	}

	_setDisplayProgressText("Uploading to foxCaves...", progress_mult, progress_offset, tabid);

	var req = new XMLHttpRequest();
	req.open(method, "https://foxcav.es/api/" + url, true);
	req.onload = function() {
		if(req.status == 401) {
			chrome.tabs.create({
				url: "https://foxcav.es/login"
			});
			if(progress_mult + progress_offset >= 1) {
				_setDisplayProgress(101, 1, 0, tabid);
			}
			return;
		}
		callback(req);
		if(progress_mult + progress_offset >= 1) {
			_setDisplayProgress(101, 1, 0, tabid);
		}
	};
	
	req.upload.addEventListener("loadstart", function(evt) { uploadStart(evt, progress_mult, progress_offset, tabid); }, false);
	req.upload.addEventListener("progress", function(evt) { uploadProgress(evt, progress_mult, progress_offset, tabid); }, false);
	req.upload.addEventListener("load", function(evt) { uploadComplete(evt, progress_mult, progress_offset, tabid); }, false);
	
	req.send(body);
}
