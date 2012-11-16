var Session = Backbone.Model.extend({
	idAttribute : 'sid'
});

var SessionListView = Backbone.View.extend({
	initialize : function(s) {
		var pid = s.model.get("pid");
		this.el = '#api_list' + pid;
		this.render();
	},

	render : function() {
		_gaq.push(['_trackEvent', 'panel', 'render_list_entry']);

		var computed = renderTemplate("#session_entry", this.model.toJSON());
		$(this.el).prepend(computed);
		return this;
	},
});

var SessionDetailsView = Backbone.View.extend({
	initialize : function(s) {
		var pid = s.model.get("pid");
		this.el = '#main_view' + pid;
		this.render(pid);
	},
	render : function(pid) {
		_gaq.push(['_trackEvent', 'panel', 'render_full_details']);

		var computed = renderTemplate("#main_view_template", this.model.toJSON())
		$(this.el).html(computed);

		$('.shorten25').shorten({
			width : 80
		});
		$('.shorten75').shorten({
			width : 220
		});
		$('.shorten75').each(function() {
			$(this).addClass("coder");
		});

		// hide all extra tables
		$('.hidden').hide();

		// show tooltip
		$('#fullurl').tipsy({gravity: 'n', fade: true, html: true, delayOut: 4000});

		hideProvidersExcept(pid);

		$(this.el).show();

		// set the model of the element as selcted
		collection.meta('selected', this.model.get("sid"));

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
			if (this.length == 1) {
				new SessionDetailsView({
					model : s
				});
			}
		});
		this._meta = {};
	},
	meta : function(prop, value) {
		if (value === undefined) {
			return this._meta[prop];
		} else {
			this.activate(this._meta[prop], value);
			this._meta[prop] = value;
		}
	},

	activate : function(previous, current) {
		if (previous != undefined) {
			$('#list_entry_' + previous).removeClass("active");
		}
		$('#list_entry_' + current).addClass("active");
	}
});

var collection = new Sessions;

var SessionRouter = Backbone.Router.extend({
	routes : {
		"s/:sid" : "showSession",
		"t/:tid" : "showTab",
		"load/:sid" : "loadInClient",
		"info" : "info",
		"install" : "install"
	},
	showSession : function(sid) {
		var s = collection.get(sid);
		new SessionDetailsView({
			model : s
		});
	},
	showTab : function(tid) {
		hideProvidersExcept(tid);
	},
	
	loadInClient : function (sid) {
		_gaq.push(['_trackEvent', 'integration', 'load_in_client']);

		var s = collection.get(sid);
		var headersString = stringifyHeaders(s.get("req_headers"));
		var message = { 'payload': 'create', 'data': { 'headers': headersString, 'url': s.get("url"), 'method': s.get("method"), "payload" : s.get("req_data") } };
		chrome.extension.sendMessage("hgmloofddffdnphfgcellkdfbfbjeloo", message, function(response) {});
	},
	
	info : function() {
		_gaq.push(['_trackEvent', 'integration', 'info']);

		window.open("https://sites.google.com/site/restsniffer/integration-with-advanced-rest-client");
	},
	
	install : function() {
		_gaq.push(['_trackEvent', 'integration', 'install']);

		window.open("https://chrome.google.com/webstore/detail/advanced-rest-client/hgmloofddffdnphfgcellkdfbfbjeloo");
	}
});
var app_router = new SessionRouter();
Backbone.history.start();

function renderTemplate(template_id, data_json) {
	var template = $(template_id).html();
	var parsed = Ashe.parse(template, data_json);
	return parsed;
}

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
		if (typeof req.postData.text != "undefined") {
			var post = req.postData.text;
			try {
				post = $.parseJSON(req.postData.text);
				objectFlat(post, r, '');
			} catch (e) {
				// can't parse json
				// post remains as is
			}
		}
	}
	return r;
}

function objectFlat(obj, result, prefix) {
	if (obj == null) {
		return;
	}

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

/**
 * Create a string from headers (format is X : Y) 
 * @param headers
 */
function stringifyHeaders(headers) {
	var h = "";
	for ( var i = 0; i < headers.length; i++) {
		var e = headers[i];
		if (typeof(e.name) !== "undefined" && e.name.trim().length != 0) {
			h += (e.name + " : " + e.value + "\n");
		}
		
	}
	return h;
}

function getResponseParams(content) {
	try {
		var json = $.parseJSON(content);
		str = JSON.stringify(json, undefined, 2);
		return syntaxHighlight(str);
	} catch (e1) {
		// can't parse json
		// try xml
		try {
			$.parseXML(content);
			return content;
		} catch (e2) {
			// can't parse xml
			// use as is
			console.log("error parsing response: " + content);
			return "undefined" + content;
		}
	}
}

function syntaxHighlight(json) {
	if (typeof json != 'string') {
		json = JSON.stringify(json, undefined, 2);
	}
	json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
	return json
			.replace(
					/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g,
					function(match) {
						var cls = 'number';
						if (/^"/.test(match)) {
							if (/:$/.test(match)) {
								cls = 'key';
							} else {
								cls = 'string';
							}
						} else if (/true|false/.test(match)) {
							cls = 'boolean';
						} else if (/null/.test(match)) {
							cls = 'null';
						}
						return '<span class="' + cls + '">' + match + '</span>';
					});
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
	dir = dir.substr(dir.indexOf(p.endpoint) + p.endpoint.length);
	dir = dir.substr(0, dir.length - 1);

	var time = parseInt(timings.send) + parseInt(timings.wait) + parseInt(timings.receive);
	var now = moment(request.startedDateTime).format("h:mm:ss A");

	var s = new Session({
		sid : startedDateTime,
		pid : p.pid,
		url : req.url,
		method : req.method,
		name : name[0],
		action : dir,

		req_cookies : req.cookies,
		req_parameters : getRequestParams(req),
		req_headers : req.headers,
		req_data : (typeof(req.postData) !== "undefined") ? req.postData.text : "",
				

		res_status : res.status,
		res_label : getLabel(res.status),
		res_badge : "badge-success",
		res_statusText : res.statusText,
		res_content : res.content,
		res_timings : time,
		datetime : now,
		res_parameters : getResponseParams(content),
		res_headers : res.headers,
	});

	collection.add(s);
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

var globalProviders = [];

/**
 * show providers in panel page
 * 
 * @todo should be in a view?
 * 
 * @param providers
 */
function setProviders(providers) {
	globalProviders = providers;

	// if already rendered - quit
	if ($.trim($("#tabs_list").html()).length != 0) {
		return;
	}
	var firstActive = true;
	$.each(providers, function(i, data) {
		if (!data.checked) {
			return;
		}
		data = $.extend(data, {
			'active' : (firstActive ? true : false)
		});
		var computed = renderTemplate("#tab_list_template", data);
		$("#tabs_list").append(computed);

		computed = renderTemplate("#tab_view_template", data);
		$("#tabs_view").append(computed);

		firstActive = false;
	});
}

function hideProvidersExcept(pid) {
	$.each(globalProviders, function(i, data) {
		if (!data.checked) {
			return;
		}
		var n = $('#navbar-' + data.pid);
		var e = $('#tab' + data.pid);
		if (data.pid != pid) {
			e.hide();
			n.removeClass('active');
		} else {
			e.show();
			n.addClass('active');
		}
	});
}
