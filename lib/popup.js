(function($) {
	
	var Provider = Backbone.Model.extend({
		idAttribute : 'sid'
	});
	
	var ProviderListView = Backbone.View.extend({
		el : '#api_list',

		initialize : function() {
			this.render();
		},

		render : function() {
			var compiled_template = _.template($("#session_entry").html());
			var computed = compiled_template(this.model.toJSON());
			$(this.el).prepend(computed);
			return this;
		},
	});
	
	var Providers = Backbone.Collection.extend({
		model : Provider,
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
	
	
	
	
	$(document).ready(function() {
		setTimeout(function() {
			$('#alert_message').fadeOut("slow");
		}, 5000);
		$("#alert_close").focus(function() {
			$("#api_name").focus();
		});
	});

}(jQuery));
