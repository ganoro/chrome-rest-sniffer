(function($) {

	var Provider = Backbone.Model.extend({
		idAttribute : 'pid',

		initialize : function() {
			this.bind('change', function() {
				chrome.extension.sendRequest({
					'providers' : providers
				});
			});
		}
	});

	var ProviderListView = Backbone.View.extend({
		el : '#providers_table',

		initialize : function() {
			this.render();
			var model = this.model;
			$('#chk_' + this.model.get("pid")).click(function() {
				model.set("checked", !model.get("checked"));
			});
			$('#name_' + this.model.get("pid")).bind(
					"DOMSubtreeModified",
					function() {
						model
								.set("name", $('#name_' + model.get("pid"))
										.html());
					});
			$('#endpoint_' + this.model.get("pid")).bind(
					"DOMSubtreeModified",
					function() {
						model.set("endpoint",
								$('#endpoint_' + model.get("pid")).html());
					});
		},

		render : function() {
			var compiled_template = _.template($("#provider_entry").html());
			var computed = compiled_template(this.model.toJSON());
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

	var providers = new Providers;
	providers.add([ new Provider({
		pid : 1,
		checked : false,
		name : "Facebook API",
		endpoint : "api.facebook.com"
	}), new Provider({
		pid : 2,
		checked : true,
		name : "Twiiter API",
		endpoint : "api.twitter.com"
	}) ]);

	$(document).ready(function() {
		setTimeout(function() {
			$('#alert_message').fadeOut("slow");
		}, 5000);
		$("#alert_close").focus(function() {
			$("#api_name").focus();
		});
	});
	
	// send provides list to background
	chrome.extension.sendRequest({
		'providers' : providers
	});	
}(jQuery));
