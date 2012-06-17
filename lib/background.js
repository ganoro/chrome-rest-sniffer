chrome.extension.onRequest.addListener(function(request, sender, sendResponse) {
	alert("background: listen");
	
	chrome.tabs.getSelected(null, function(tab) {
		alert("background: sent");
		chrome.tabs.sendRequest(tab.id, {
			greeting : "hello"
		}, function(response) {
			console.log(response.farewell);
		});
	});
});