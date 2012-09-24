(function($) {

	/***** google analystics ********/
	var _gaq = _gaq || [];
	_gaq.push([ '_setAccount', 'UA-34756305-1' ]);
    _gaq.push(['_trackEvent', 'popup', 'viewed']);

	(function() {
		var ga = document.createElement('script');
		ga.type = 'text/javascript';
		ga.async = true;
		ga.src = 'https://ssl.google-analytics.com/ga.js';
		var s = document.getElementsByTagName('script')[0];
		s.parentNode.insertBefore(ga, s);
	})();

	/***** popup ********/
	var localStorageProviders = null;
	var providers = null;

	var Provider = Backbone.Model.extend({
		idAttribute : 'pid',

		initialize : function() {
			this.bind('change', function() {
				localStorageProviders = JSON.stringify(providers.toJSON());
				propagateSettings();
			});
		}
	});

	var ProviderListView = Backbone.View.extend({
		el : '#providers_table',

		initialize : function() {
			this.render();
			var model = this.model;
			$('#chk_' + this.model.get("pid")).click(function() {
			    _gaq.push(['_trackEvent', this.id, 'clicked']);
				model.set("checked", !model.get("checked"));
			});
			$('#name_' + this.model.get("pid")).bind("DOMSubtreeModified", function() {
				_gaq.push(['_trackEvent', this.id, 'clicked']);
				var t = $('#name_' + model.get("pid")).html();
				model.set("name", t);
			});
			$('#endpoint_' + this.model.get("pid")).bind("DOMSubtreeModified", function() {
				_gaq.push(['_trackEvent', this.id, 'clicked']);
				var t = stripHTML($('#endpoint_' + model.get("pid")).html());
				$('#endpoint_' + this.model.get("pid")).html(t);
				model.set("endpoint", t);
			});
		},

		render : function() {
			computed = renderTemplate("#provider_entry", this.model.toJSON());
			$(this.el).prepend(computed);
			return this;
		}
	});

	var Providers = Backbone.Collection.extend({
		model : Provider,
		initialize : function() {
			this.bind("add", function(s) {
				new ProviderListView({
					model : s
				});
			});
		}
	});

	function renderTemplate(template_id, data_json) {
		var template = $(template_id).html();
		var parsed = Ashe.parse(template, data_json);
		return parsed;
	}

	function propagateSettings() {
		chrome.extension.sendRequest({
			'providers' : providers
		});
		localStorage.setItem('api_sniffer.providers', localStorageProviders);
	}

	function loadSettings() {
		localStorageProviders = localStorage.getItem('api_sniffer.providers');
		if (localStorageProviders == null) {
			ps = [ {
				pid : 1,
				checked : false,
				name : "Facebook API",
				endpoint : "graph.facebook.com"
			}, {
				pid : 2,
				checked : true,
				name : "Twiiter API",
				endpoint : "api.twitter.com"
			} ];
			localStorageProviders = JSON.stringify(ps);
		}
		providers = new Providers;

		// for each - create provider
		$.each(JSON.parse(localStorageProviders), function(i, data) {
			data.endpoint = stripHTML(data.endpoint);
			providers.add(data);
		});

		// send provides list to background
		propagateSettings();
	}

	function stripHTML(text) {
		return text != null ? text.replace(/(<([^>]+)>)/ig, "") : "";
	}

	// boostrap the popup window
	loadSettings();

	$(document).ready(function() {
		setTimeout(function() {
			$('#alert_message').fadeOut("slow");
		}, 5000);
		$("#alert_close").focus(function() {
			$("#api_name").focus();
		});
		$('#btnCreate').click(function() {
			var length = providers.length;
			var name = $.trim($('#api_name').val());
			var endpoint = $.trim($('#api_endpoint').val());
			if (name.length == 0 || endpoint.length == 0) {
				alert("invalid input");
				return false;
			}

			providers.add({
				pid : length + 1,
				checked : true,
				name : name,
				endpoint : endpoint
			});

			localStorageProviders = JSON.stringify(providers.toJSON());
			localStorage.setItem('api_sniffer.providers', localStorageProviders);

			return false; // don't trigger form post
		});
	});

}(jQuery));
