// Patch a cleanup method
Backbone.View.prototype.close = function () {
    if (this.beforeClose) {
        this.beforeClose();
    }
    this.remove();
    this.unbind();
};


// Create the namespace
MindTrips = window.MindTrips || {}
var MindTrips = MindTrips;

// Templates and template loader. Works only when you're not using file://
MindTrips.templates = {
 
    // Hash of preloaded templates for the app
    templates: {},

    language: "es",
 
    // Recursively pre-load all the templates for the app.
    // This implementation should be changed in a production environment:
    // All the template files should be concatenated in a single file.
    loadTemplates: function(names, callback) {
 
        var that = this;
 
        var loadTemplate = function(index) {
            var name = names[index];
            console.log('Loading template: ' + name);
            $.get('static/template/' + that.language + '/' + name + '.html', function(data) {
                that.templates[name] = Mustache.compile(data);
                index++;
                if (index < names.length) {
                    loadTemplate(index);
                } else {
                    callback();
                }
            });
        }
 
        loadTemplate(0);
    },
 
    // Get template by name from hash of preloaded templates
    get: function(name) {
        return this.templates[name] || function(data){
        	return "WARNING: couldn't load template " + name;
        };
    }
 
};


// Base view with some boilerplate methods. Should work for most views.
MindTrips.BaseView = Backbone.View.extend({
	templateName: "base",

	model: {
		toJSON: function(){
			return "";
		}
	},

	template: function(data){
		var tpl = MindTrips.templates.get(this.templateName);
		return tpl(data);
	},

	render: function (eventName) {
		console.log("Rendering: " + this.templateName + " for event " + eventName);
		$(this.el).html(this.template(this.model.toJSON()));
        return this;
	},


});

// Main search view.
MindTrips.SearchView = MindTrips.BaseView.extend({
	templateName: "search",
});

MindTrips.FlightListView = MindTrips.BaseView.extend({
	templateName: "selector",

    initialize: function(from, to){
        this.from = from;
        this.to = to;
    },

});

MindTrips.MapView = MindTrips.BaseView.extend({

    template: Mustache.compile("<div id='map_canvas_main'></div><div id='map_overlay'></div>"),
    message: Mustache.compile("{{from}} &#x2708; {{to}}"),

	initialize: function(selector, from, to){
        this.from = from;
        this.to = to;
        this.selector = selector;
        selector.html(this.template());
        var mapdiv = document.getElementById('map_canvas_main');
        var mapOptions = {
          center: new google.maps.LatLng(-34.397, 150.644),
          zoom: 1,
          mapTypeId: google.maps.MapTypeId.ROADMAP,
          panControl: false,
          zoomControl: false,
          mapTypeControl: false,
          scaleControl: true,
          streetViewControl: false,
          overviewMapControl: false,
        };
        var map = new google.maps.Map(mapdiv, mapOptions);
        this.render();
        console.log("Map created");
    },

    render: function(eventName){
        console.log("Rendering map");
        $("#map_overlay").html(this.message(this));
    }

});

MindTrips.BreadcrumView = MindTrips.BaseView.extend({
	initialize: function(history){
		this.history = history;
	},

	render: function(eventName){
		//rendering of <a href="#history" class="breadcrum">history</a>
	},
});

MindTrips.PaymentView = MindTrips.BaseView.extend({
    templateName: "payment",

    initialize: function(payment){

    },

});

// Router (controllers).
MindTrips.AppRouter = Backbone.Router.extend({
 
    routes: {
        "test": "test",
        "" : "search",
        "flight/:flight/payment" : "payment",
        "flights/:from/to/:to" : "flights",

    },

    test: function(){
        $("#main").html("");
    },

    showView: function(selector, view) {
        if (this.currentView)
            this.currentView.close();
        $(selector).html(view.render().el);
        this.currentView = view;
        return view;
    },
 
    search: function() {
    	this.showView("#main", new MindTrips.SearchView());
    	$("[data-date-picker]").each(function(){
			$(this).datepicker();
		});
		$("[name='round-trip' value='round']").click(addHiddenToReturn);
		$("[name='round-trip' value='one-way']").click(removeHiddenToReturn);
		$("#go-dates").change(checkDates);
		$("#return-tags").change(checkOrigin);
    },

    flights: function(from, to){
        this.showView("#main", new MindTrips.FlightListView(from, to));
        var map = new MindTrips.MapView($("#map_canvas"), from, to);
    },

    payment: function(flight) {
        this.showView("#main", new MindTrips.PaymentView(flight));
    },
 
});


// I don't know what to do with these.
function checkDates(){
	initial = new Date($("input[id='go-dates']").val());
	$("input[id='return-dates']").datepicker("option", "minDate", initial);
}
function checkOrigin(){
	destination = $("input[id='return-tags']").val();
	origin = $("input[id='origin-tags']").val();
	alert(origin);
	alert(destination);
	if(origin == destination){
		alert("son iguales");
	}
}

function addHiddenToReturn(){
    $("#return-dates").addClass("hidden");
}
function removeHiddenToReturn(){
    $("#return-dates").removeClass("hidden");
}



// On load:
$(function(){
	MindTrips.templates.loadTemplates(["search", "selector", "payment"], function(){
		var router = new MindTrips.AppRouter();
//        var history = Backbone.history.start({pushState: true});
        var history = Backbone.history.start();
        window.router = router;
	});

});