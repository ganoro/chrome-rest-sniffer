(function($) {

	var providers = $.parseJSON(localStorage.getItem('api_sniffer.providers'));

	function isRestRequest(url) {
		var result = null;
		$.each(providers, function(i, provider) {
			if (provider.checked) {
				result = url.indexOf(provider.endpoint) != -1 ? provider : null;
				alert (url + " " +  provider.endpoint + " " + result);
				return result == null;
			}
		});
		return result;
		// /* managekit */
		// var m = matches(url, "managekit.net/crm/managekit/sohorest");
		// if (m)
		// return m;
		// m = matches(url, "managekit.net/crm/managekit/rest");
		// if (m)
		// return m;
		//
		// /* sohoos */
		// m = matches(url, "sohoos.com/crm/managekit/rest");
		// if (m)
		// return m;
		// var m = matches(url, "sohoos.com/crm/managekit/sohorest");
		// if (m)
		// return m;
		//
		// /* sohooslab */
		// m = matches(url, "sohooslab.com/crm/managekit/rest");
		// if (m)
		// return m;
		// var m = matches(url, "sohooslab.com/crm/managekit/sohorest");
		// if (m)
		// return m;
		//
		// /* sohobit */
		// m = matches(url, "sohobit.com/crm/managekit/rest");
		// if (m)
		// return m;
		// var m = matches(url, "sohobit.com/crm/managekit/sohorest");
		// if (m)
		// return m;
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
