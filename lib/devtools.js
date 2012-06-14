(function($) {

	var Session = Backbone.Model.extend({
		idAttribute : 'sid'
	});

	var SessionListView = Backbone.View.extend({
		el : '#api-list',
		initialize : function() {
			this.render();
		},
		render : function() {
			var compiled_template = _.template($("#session_entry").html());
			this.el.html(compiled_template(this.model.toJSON()));
			return this;
		}
	});

	var Sessions = Backbone.Collection.extend({
		model : Session,
		initialize : function() {
			this.bind("add", function(s) {
				new SessionListView({
					model : s
				});
			});
		}
	});

	var collection = new Sessions;

	var app = {

		isRestRequest : function(url) {
			return url.indexOf("://www.managekit.net/crm/managekit/sohorest") != -1
					|| url.indexOf("://www.managekit.net/crm/managekit/rest") != -1;
		},

		getRequestParams : function(req) {
			return [];
		},

		getResponseParams : function(res) {
			return [];
		},

		run : function() {

			var app = this;

			chrome.devtools.panels.create("API Sniffer", "images/logo.png",
					"panel.html", function(panel) {
						app.panelDoc = panel;
						console.log(panel);
					});

			chrome.devtools.network.onRequestFinished.addListener(function(
					request) {

				chrome.extension.sendRequest({
					greeting : "hello"
				}, function(response) {
					// alert(response.farewell);
				});

				if (app.isRestRequest(request.request.url)) {
					chrome.extension.sendRequest("api.sniffer.SessionCreated",
							request);

					var req = request.request;
					var res = request.response;
					var timings = request.timings;
					var startedDateTime = request.startedDateTime.getTime();
					var u = req.url.split('/');

					var s = new Session({
						sid : startedDateTime,
						url : req.url,
						method : req.method,
						name : u[u.length - 1],

						req_cookies : req.cookies,
						req_parameters : app.getRequestParams(req),
						req_headers : req.headers,

						res_status : res.status,
						res_statusText : res.statusText,
						res_content : res.content,
						res_timings : timings,
						res_parameters : app.getResponseParams(res),
						res_headers : res.headers
					});
					collection.add(s);
				}
			});

		}

	};
	app.run();

})(jQuery);
