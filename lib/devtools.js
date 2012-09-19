(function($) {

	// store pending requests until panel is created
	var que = [];

	var providers = $.parseJSON(localStorage.getItem('api_sniffer.providers'));

	function isRestRequest(url) {
		var result = null;
		$.each(providers, function(i, provider) {
			if (provider.checked) {
				result = url.indexOf(provider.endpoint) != -1 ? provider : null;
				return result == null;
			}
		});
		return result;
	}

	chrome.devtools.panels.create("REST Sniffer", "images/logo32.png", "panel.html",
			function(panel) {
				panel.onShown.addListener(function(window) {
					panelWindow = window;
					window.setProviders(providers);
					while (que.length > 0) {
						var event = que.pop();
						panelWindow.add(event.filtered, event.request, event.content);
					}
				});
			});

	chrome.devtools.network.onRequestFinished.addListener(function(request) {
		var filtered = isRestRequest(request.request.url);
		if (filtered) {
			request.getContent(function(content) {
				if (typeof panelWindow === "undefined") {
					que.push({
						filtered : filtered,
						request : request,
						content : content
					});
				} else {
					panelWindow.add(filtered, request, content);
				}
			});
		}
	});

})(jQuery);
