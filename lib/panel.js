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

		$('.shorten25').shorten({
			width : 100
		});
		$('.shorten75').shorten({
			width : 220
		});
		$('.shorten75').each(function() {
			$(this).addClass("coder");
		});

		$('#req_headers_table').hide();
		$('#res_headers_table').hide();
		$('#req_cookies_table').hide();
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
		"s/:sid" : "showSession",
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

function toggleTable(section) {
	var tip = $('#' + section + '_tip');
	var table = $('#' + section + '_table');
	$(table).toggle();
	$(tip[0]).html($(tip[0]).html() == "hide" ? "show" : "hide");
}

function endsWith(str, suffix) {
	return str.indexOf(suffix, str.length - suffix.length) !== -1;
}

function getRequestParams(req) {
	var r = [];
	for ( var i = 0; i < req.queryString.length; i++) {
		var e = req.queryString[i];
		r.push({
			name : e.name,
			value : e.value
		});
	}

	if (req.postData === undefined) {
	} else {
		if (req.postData.text === undefined) {
		} else {
			var post = $.parseJSON(req.postData.text);
			objectFlat(post, r, '');
		}
	}
	return r;
}

function objectFlat(obj, result, prefix) {
	if (prefix.length > 0) {
		prefix = prefix + ".";
	}
	$.each(obj, function(key, value) {
		if (value instanceof Array) {
			$.each(value, function(key1, value1) {
				objectFlat(value1, result, prefix + key + '.' + key1);
			});
		} else if (typeof (value) != 'object') {
			result.push({
				name : prefix + key,
				value : value
			});
		} else {
			objectFlat(value, result, prefix + key);
		}
	});
}

/**
 * Filters Cookie from headers array
 * 
 * @param headers
 * @returns array of headers w/o Cookie
 */
function getRequestHeaders(headers) {
	var h = [];
	for ( var i = 0; i < headers.length; i++) {
		var e = headers[i];
		if (e.name != 'Cookie') {
			h.push(e);
		}
	}
	return h;
}

function getResponseParams(content) {
	var post = $.parseJSON(content);
	var r = [];
	objectFlat(post, r, '');
	return r;
}

function getLabel(status) {
	if (status == "200") {
		return "label-success";
	} else {
		return "label-imortant";
	}
}

function add(p, request, content) {

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
		req_headers : getRequestHeaders(req.headers),

		res_status : res.status,
		res_label : getLabel(res.status),
		res_badge : "badge-success",
		res_statusText : res.statusText,
		res_content : res.content,
		res_timings : time,
		datetime : now,
		res_parameters : getResponseParams(content),
		res_headers : res.headers
	});

	collection.add(s);

	mixpanel.track(name[0], flatten({
		req : s.get("req_parameters"),
		res : s.get("res_parameters"),
		status : s.get("res_status")
	}));
}

function flatten(obj, includePrototype, into, prefix) {
	into = into || {};
	prefix = prefix || "";

	for ( var k in obj) {
		if (includePrototype || obj.hasOwnProperty(k)) {
			var prop = obj[k];
			if (prop && typeof prop === "object"
					&& !(prop instanceof Date || prop instanceof RegExp)) {
				flatten(prop, includePrototype, into, prefix + k + "_");
			} else {
				into[prefix + k] = prop;
			}
		}
	}

	return into;
}
