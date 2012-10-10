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
    loadTemplates: function(names, callback, error) {
 
        var that = this;
 
        var loadTemplate = function(index) {
            var name = names[index];
            console.log('Loading template: ' + name);
            var req = $.get('static/template/' + that.language + '/' + name + '.html', function(data) {
                // Store the *compiled* version of the templates.
                that.templates[name] = Mustache.compile(data);
                index++;
                if (index < names.length) {
                    loadTemplate(index);
                } else {
                    callback();
                }
            });
            req.fail(error || function(){console.log("ERR")});
        }
 
        loadTemplate(0);
    },

    setLanguage: function(lang, router){
        var old = this.language;
        this.language = lang;
        var that = this;
        var target = Backbone.history.fragment;
        console.log("Navigating to loading screen");
        router.navigate("loading", true);
        this.loadTemplates(_.keys(this.templates), function(){
            console.log("navigating to <" + target + ">");
            router.navigate(target, true);
        }, function(){
            console.log("Falling back");
            Backbone.history.fragment = target;
            that.setLanguage(old, router); 
        });
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
MindTrips.SearchBoxView = MindTrips.BaseView.extend({
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
          center: new google.maps.LatLng(-31.23855, -53.54235),
          zoom: 4,
          mapTypeId: google.maps.MapTypeId.ROADMAP,
          panControl: false,
          zoomControl: false,
          mapTypeControl: false,
          scaleControl: true,
          streetViewControl: false,
          overviewMapControl: false,
        };
        var map = new google.maps.Map(mapdiv, mapOptions);
        var marker = new google.maps.Marker({
            map: map,
            position: new google.maps.LatLng(-27.6645,-48.545)
        });
        var marker2 = new google.maps.Marker({
            map: map,
            position: new google.maps.LatLng(-34.8126,-58.5397)
        });
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

    initialize: function(payment, pax){
        this.flight = payment;
        this.model = {pax:pax, toJSON: function(){return this;}};
    },

});

// Router (controllers).
MindTrips.AppRouter = Backbone.Router.extend({
 
    routes: {
        "loading": "loading",
        "" : "search",
        "flight/:flight/pay" : "payment",
        "flights/:from/to/:to" : "flights",
        "flights" : "flights",

    },

    showView: function(selector, view) {
        if (this.currentView)
            this.currentView.close();
        this.render(selector, view);
        this.currentView = view;
        return view;
    },

    render: function(selector, view){
        $(selector).html(view.render().el);
        return view;
    },

    loading: function(){
        if (this.currentView)
            this.currentView.close();
        this.currentView = null;
        var opts = {
          lines: 13, // The number of lines to draw
          length: 7, // The length of each line
          width: 4, // The line thickness
          radius: 10, // The radius of the inner circle
          corners: 1, // Corner roundness (0..1)
          rotate: 0, // The rotation offset
          color: '#000', // #rgb or #rrggbb
          speed: 1, // Rounds per second
          trail: 60, // Afterglow percentage
          shadow: false, // Whether to render a shadow
          hwaccel: false, // Whether to use hardware acceleration
          className: 'spinner', // The CSS class to assign to the spinner
          zIndex: 2e9, // The z-index (defaults to 2000000000)
          top: 'auto', // Top position relative to parent in px
          left: 'auto' // Left position relative to parent in px
        };
        var target = document.getElementById('main');
        var spinner = new Spinner(opts).spin(target);
    },

    search: function() {
    	var airportNames = [];

        $("#main").html("<div id='main-box'></div><div id='main-results'></div>");

    	this.render("#main-box", new MindTrips.SearchBoxView());
    	$("[data-date-picker]").each(function(){
			$(this).datepicker();
		});
		$("#go-dates").change(checkDates);
		$("#return-tags").change(checkOrigin);
		FlightsAPI.getAirports(function(data){parseAirports(data,airportNames)});

        var from = "EZE";
        var to = "BRA";
        var results = new MindTrips.FlightListView(from, to);
        console.log($("#main-results"));
        this.render("#main-results", results);
        $("[name='more1']").click(function(){showSelectDepartures(1)});
        $("[name='less1']").click(function(){showStaticDepartures(1)});
        var map = new MindTrips.MapView($("#map_canvas"), from, to);
        $("[name='confirm']").each(function(){
            $(this).click(function(){
                MindTrips.router.navigate("flight/PanAm/pay", true);
            });
        });

		
    },

    flights: function(from, to){


    },

    payment: function(flight) {
        var pax = [{kind: "Adulto", class: "Primera"}, {kind: "Adulto", class: "Primera"}];
        this.showView("#main", new MindTrips.PaymentView(flight, pax));
    },
 
});

function parseAirports(data,airportNames){
	for(i=0;i<data.airports.length;i++){
		airportNames[i]=data.airports[i].description;
	}
	$("[autocomplete-tags]").each(function(){
			$(this).autocomplete( { source:airportNames});
		});
}


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
	alert("entros")
    $("#return-dates").addClass("hidden");
}
function removeHiddenToReturn(){
    $("#return-dates").removeClass("hidden");
}

function showSelectDepartures(num){
	$("#flight-time-dep-"+num).addClass("hidden");
	$("#flight-time-selector-dep-"+num).removeClass("hidden");
	$("#flight-time-ret-"+num).addClass("hidden");
	$("#flight-time-selector-ret-"+num).removeClass("hidden");
	$("#more"+num).addClass("hidden");
	$("#less"+num).removeClass("hidden");
}

function showStaticDepartures(num){
	$("#flight-time-dep-"+num).removeClass("hidden");
	$("#flight-time-selector-dep-"+num).addClass("hidden");
	$("#flight-time-ret-"+num).removeClass("hidden");
	$("#flight-time-selector-ret-"+num).addClass("hidden");
	$("#more"+num).removeClass("hidden");
	$("#less"+num).addClass("hidden");
}



// On load:
$(function(){
	MindTrips.templates.loadTemplates(["search", "selector", "payment"], function(){
		var router = new MindTrips.AppRouter();
        MindTrips.router = router;
//        var history = Backbone.history.start({pushState: true});
        var history = Backbone.history.start();
        // set up the language links.
        $("[data-language]").each(function(){
            var language = $(this).data("language");
            $(this).click(function(){
                MindTrips.templates.setLanguage(language, router);
                return false;
            });
        });
	});

});