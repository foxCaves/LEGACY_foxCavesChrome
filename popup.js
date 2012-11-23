function shortenTabURL() {
	chrome.extension.sendMessage({action: "shorten"});
}

function screenshotTab() {
	chrome.extension.sendMessage({action: "screenshot"});
}

window.onload = function(e) {
	document.getElementById("shorten-tab-url").addEventListener("click", shortenTabURL);
	document.getElementById("screenshot-tab").addEventListener("click", screenshotTab);
}