(function($) {

	var Session = Backbone.Model.extend({
		idAttribute : 'sid',

		defaults : {
			method : "GET",
		}
	});

	var Sessions = Backbone.Collection.extend({
		model : Session,

		initialize : function() {
			this.bind("add", function(s) {
				alert(s.get("sid"));
			});
		}
	});

	var collection = new Sessions;

	var SearchView = Backbone.View.extend({
		initialize : function() {
			this.render();
		},
		render : function() {
			var template = _.template($("#request_template").html(), {});
			this.el.html(template);
		}
	});

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
						console.log(panel);
					});

			chrome.devtools.network.onRequestFinished.addListener(function(
					request) {

				if (app.isRestRequest(request.request.url)) {
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
