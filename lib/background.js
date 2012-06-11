

chrome.webRequest.onBeforeSendHeaders.addListener(function(details) {
	if (isRestRequest(details.url)) {
		var u = details.url.split('/');
		var r = new Request({
			id : details.requestId,
			url : details.url,
			method : details.method,
			name : u[u.length - 1],
			headers : details.requestHeaders,
			parameters : getParams(details)
		});
		console.log(r);
	}
	return {
		requestHeaders : details.requestHeaders
	};
}, {
	urls : [ "<all_urls>" ]
}, [ "requestHeaders" ]);

chrome.webRequest.onCompleted.addListener(function(details) {
	if (isRestRequest(details.url)) {
		var r = new Response({
			requestId : details.requestId,
			parameters : getParams(details),
			headers : details.responseHeaders
		});
		console.log(r);
	}
}, {
	urls : [ "<all_urls>" ]
}, [ "responseHeaders" ]);

