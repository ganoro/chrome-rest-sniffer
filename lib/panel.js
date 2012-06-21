var Session = Backbone.Model.extend({
	idAttribute : 'sid'
});

var SessionListView = Backbone.View.extend({
	el : '#api_list',
	initialize : function() {
		this.render();
	},
	render : function() {
		var compiled_template = _.template($("#session_entry").html());
		var computed = compiled_template(this.model.toJSON());
		$(this.el).prepend(computed);
		return this;
	}
});

var SessionDetailsView = Backbone.View.extend({
	el : '#main_view',
	initialize : function() {
		this.render();
	},
	render : function() {
		var compiled_template = _.template($("#main_view_template").html());
		var computed = compiled_template(this.model.toJSON());
		$(this.el).html(computed);
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

var SessionRouter = Backbone.Router.extend({
	routes : {
		"s/:sid" : "showSession"
	},
	showSession : function(sid) {
		var s = collection.get(sid);
		new SessionDetailsView({
			model : s
		});
	}
});
var app_router = new SessionRouter();
Backbone.history.start();

function getRequestParams(req) {
	return [];
}

function getResponseParams(res) {
	
	
	return [];
}

function getLabel(status) {
	if (status == "200") {
		return "label-success";
	} else {
		return "label-imortant";
	}
}

function add(p, request) {

	var req = request.request;
	var res = request.response;
	var timings = request.timings;
	var startedDateTime = request.startedDateTime.getTime();
	var u = req.url.split('/');
	var name = u[u.length - 1].split("?");

	// resolve action
	var dir = URI(req.url).search("").toString();
	dir = dir.substr(dir.indexOf(p) + p.length);
	dir = dir.substr(0, dir.length - 1);
	
	var time = parseInt(timings.send) + parseInt(timings.wait)
			+ parseInt(timings.receive);
	var now = moment(request.startedDateTime).format("h:mm:ss A");
	
	var s = new Session({
		sid : startedDateTime,
		url : req.url,
		method : req.method,
		name : name[0],
		action : dir,

		req_cookies : req.cookies,
		req_parameters : getRequestParams(req),
		req_headers : req.headers,

		res_status : res.status,
		res_label : getLabel(res.status),
		res_badge : "badge-success",
		res_statusText : res.statusText,
		res_content : res.content,
		res_timings : time,
		datetime : now,
		res_parameters : getResponseParams(res),
		res_headers : res.headers
	});

	collection.add(s);
}
