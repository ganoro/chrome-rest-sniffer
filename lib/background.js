chrome.webRequest.onCompleted.addListener(function(details) {
	if (details.url.indexOf("://www.managekit.net/crm/managekit/rest") != -1) {
		alert(details.url);
	}
}, {
	urls : [ "<all_urls>" ]
});

