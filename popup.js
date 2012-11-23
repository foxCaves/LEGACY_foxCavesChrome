function shortenTabURL() {
	chrome.tabs.getSelected(null, function(tab) {
		sendAPIRequest("shorten?" + tab.url, function(req) {
			prompt("Heres your link", "https://fox.gy/g" + req.responseText.trim());
		});
	});
}

function screenshotDone(data) {
	console.log(data);
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
				
				prompt("Heres your file", "https://fox.gy/v" + fileid);
			}, "PUT", data);
		});
	});
}

window.onload = function(e) {
	document.getElementById("shorten-tab-url").addEventListener("click", shortenTabURL);
	document.getElementById("screenshot-tab").addEventListener("click", screenshotTab);
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
