if(window.foxCavesInjected) {
	chrome.extension.onMessage.removeListener(window.foxCavesInjected);
}
function FC_removeIfExists() {
	try {
		if(window.foxCavesProgressContainer) {
			window.foxCavesProgressContainer.parentNode.removeChild(window.foxCavesProgressContainer);
			window.foxCavesProgressContainer = null;
		}
	} catch(e) { }
}
function FC_createElement(msg) {
	if(window.foxCavesProgressContainer) return;

	var mainDiv = document.createElement("div");
	mainDiv.style.width = "200px";
	mainDiv.style.height = "80px";
	mainDiv.style.top = "50%";
	mainDiv.style.left = "50%";
	mainDiv.style.position = "fixed";
	mainDiv.style.marginLeft = "-100px";
	mainDiv.style.marginTop = "-40px";
	mainDiv.style.backgroundColor = "white";
	mainDiv.style.border = "1px solid black";
	mainDiv.style.display = "table";
	mainDiv.style.color = "black";
	mainDiv.style.zIndex = 1000000000000;
	
	var subDiv = document.createElement("div");
	subDiv.style.display = "table-cell";
	subDiv.style.textAlign = "center";
	subDiv.style.verticalAlign = "middle";
	subDiv.style.color = "black";
	mainDiv.appendChild(subDiv);
	
	if(!msg.text) msg.text = "Processing request to foxCaves...";
	var text = document.createTextNode(msg.text);
	subDiv.appendChild(text);
	window.foxCavesProgressText = text;
	
	var br = document.createElement("br");
	subDiv.appendChild(br);
	
	var progress = document.createElement("progress");
	progress.max = 100;
	progress.value = 0;
	subDiv.appendChild(progress);
	
	window.foxCavesProgressContainer = mainDiv;
	window.foxCavesProgressBar = progress;
	
	document.getElementsByTagName("body")[0].appendChild(mainDiv);
}
FC_removeIfExists();
window.foxCavesProgressBar = null;
window.foxCavesProgressContainer = null;
window.foxCavesProgressText = null;
window.foxCavesInjected = function(msg, source, sendMessage) {
	if(msg.progress) {
		if(msg.progress > 100) {
			FC_removeIfExists();
		} else if(msg.progress < 0) {
			FC_removeIfExists();
			FC_createElement(msg);
		} else {
			FC_createElement(msg);
		
			if(msg.text) {
				window.foxCavesProgressText.nodeValue = msg.text;
			}
			window.foxCavesProgressBar.value = msg.progress;
		}
		
		sendMessage("OK");
	}
};
chrome.extension.onMessage.addListener(window.foxCavesInjected);