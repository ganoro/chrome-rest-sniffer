(function($) {
	
	function isRestRequest(url) {
		var m = matches(url, "://www.managekit.net/crm/managekit/sohorest");
		if (m) return m;
		m = matches(url, "://www.managekit.net/crm/managekit/rest");
		if (m) return m;
	}
	
	function matches(url, pattern) {
		return url.indexOf(pattern) != -1 ? pattern : null;
	}
	

	chrome.devtools.panels.create("API Sniffer", "images/logo.png",
			"panel.html", function(panel) {
				panel.onShown.addListener(function(window) {
					panelWindow = window;
				});
			});
	
	chrome.devtools.network.onRequestFinished.addListener(function(request) {
		var filtered = isRestRequest(request.request.url);
		if (filtered) {
			request.getContent(function(content) {
				panelWindow.add(filtered, request, content);
			})
			
			
		}
	});

})(jQuery);
