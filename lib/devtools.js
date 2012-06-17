(function($) {

	function isRestRequest(url) {
		return url.indexOf("://www.managekit.net/crm/managekit/sohorest") != -1
				|| url.indexOf("://www.managekit.net/crm/managekit/rest") != -1;
	}

	chrome.devtools.panels.create("API Sniffer", "images/logo.png",
			"panel.html", function(panel) {
				panel.onShown.addListener(function(window) {
					panelWindow = window;
				});
			});
	
	chrome.devtools.network.onRequestFinished.addListener(function(request) {

		if (isRestRequest(request.request.url)) {
			panelWindow.foo(request);
		}
	});

})(jQuery);
