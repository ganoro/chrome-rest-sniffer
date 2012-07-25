(function($) {

	var providers = $.parseJSON(localStorage.getItem('api_sniffer.providers'));

	function isRestRequest(url) {
		var result = null;
		$.each(providers, function(i, provider) {
			if (provider.checked) {
				result = url.indexOf(provider.endpoint) != -1 ? provider : null;
				return result ==  null;
			}
		});
		return result;
	}

	chrome.devtools.panels.create("API Sniffer", "images/logo32.png", "panel.html",
			function(panel) {
				panel.onShown.addListener(function(window) {
					panelWindow = window;
					window.setProviders(providers);
				});
			});

	chrome.devtools.network.onRequestFinished.addListener(function(request) {
		var filtered = isRestRequest(request.request.url);
		if (filtered) {
			request.getContent(function(content) {
				panelWindow.add(filtered, request, content);
			});
		}
	});

})(jQuery);
