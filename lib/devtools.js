(function($) {
	
	// For simple requests:
	chrome.extension.onMessageExternal.addListener(
	  function(request, sender, sendResponse) {
	    if (sender.id == blacklistedExtension)
	      return;  // don't allow this extension access
	    else if (request.getTargetData)
	      sendResponse({targetData: targetData});
	    else if (request.activateLasers) {
	      var success = activateLasers();
	      sendResponse({activateLasers: success});
	    }
	  });
	
	function isRestRequest(url) {
		/* managekit */
		var m = matches(url, "managekit.net/crm/managekit/sohorest");
		if (m) return m;
		m = matches(url, "managekit.net/crm/managekit/rest");
		if (m) return m;

		/* sohoos */
		m = matches(url, "sohoos.com/crm/managekit/rest");
		if (m) return m;
		var m = matches(url, "sohoos.com/crm/managekit/sohorest");
		if (m) return m;

		/* sohooslab */
		m = matches(url, "sohooslab.com/crm/managekit/rest");
		if (m) return m;
		var m = matches(url, "sohooslab.com/crm/managekit/sohorest");
		if (m) return m;

		/* sohobit */
		m = matches(url, "sohobit.com/crm/managekit/rest");
		if (m) return m;
		var m = matches(url, "sohobit.com/crm/managekit/sohorest");
		if (m) return m;
	}
	
	function matches(url, pattern) {
		return url.indexOf(pattern) != -1 ? pattern : null;
	}
	

	chrome.devtools.panels.create("API Sniffer", "images/logo32.png",
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
