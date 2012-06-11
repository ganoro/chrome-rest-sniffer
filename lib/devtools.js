chrome.devtools.panels.create("API Sniffer", "images/logo.png", "panel.html",
		function(panel) {
			console.log(panel);
		});

var Session = Backbone.Model.extend({
	defaults : {
		"id" : "1",
		"name" : "name",
		"url" : "http://sohoos.com",
		"method" : "GET",
		"req_parameters" : [],
		"req_headers" : [],
		"res_parameters" : [],
		"res_headers" : []
	}
});

var Sessions = Backbone.Collection.extend({
	model : Session
});

collection = new Sessions;

SearchView = Backbone.View.extend({
	initialize : function() {
		this.render();
	},
	render : function() {
		var template = _.template($("#request_template").html(), {});
		this.el.html(template);
	}
});

chrome.devtools.network.onRequestFinished.addListener(function(request) {
	console.log(request.request.url);
});


