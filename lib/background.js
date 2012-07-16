(function($) {

	chrome.extension.onRequest.addListener(function(request, sender,
			sendResponse) {
		apiProviders = request.providers;
		console.log(apiProviders);
	});

}(jQuery));
