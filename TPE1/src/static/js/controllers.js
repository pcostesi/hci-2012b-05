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
_.extend(MindTrips, Backbone.Events);

MindTrips.flightInfo = {};
MindTrips.Traveller = {};
// Templates and template loader. Works only when you're not using file://
MindTrips.templates = {
 
    // Hash of preloaded templates for the app
    templates: {},

    language: "es",

    engine: Mustache,
    // This is done so we can skip validation errors.
    load: function(names) {
        var that = this;
        var errorHandler = function(){
            console.log("Error loading templates.");
        }
        var deferreds = _.map(names, function(name){
            console.log('Loading template: <' + name + ">");
            var route = 'static/template/' + that.language + '/' + name + '.html';
            return $.get(route).done(function(data){    
                that.loadTemplate(name, data);
                console.log('Template: <' + name + "> loaded.");
            });
        });
        var deferred = $.when.apply($, deferreds);
        deferred.fail(errorHandler);
        return deferred.promise();
    },

    loadTemplate: function(name, data) {
        // Store the *compiled* version of the templates.
        console.log('Compiling template: <' + name + ">");
        this.templates[name] = this.engine.compile(data);
        return this.templates[name];
    },

    setLanguage: function(lang){
        var old = this.language;
        this.language = lang.toLowerCase();
        if (this.language == old){
            return;
        }
        var that = this;
        var target = Backbone.history.fragment;
        console.log("Navigating to loading screen");
        this.load(_.keys(this.templates))
            .done(function(){
                console.log("navigating to <" + target + ">");
                MindTrips.trigger("template:reload", "language:" + lang);
            }).fail(function(){
                console.log("Falling back");
                that.setLanguage(old); 
            });
    },
 
    // Get template by name from hash of preloaded templates
    get: function(name) {
        return this.templates[name] || function(data){
        	return "WARNING: couldn't load template " + name;
        };
    }
 
};



MindTrips.AppRouter = Backbone.Router.extend({
    routes: {
        ""                  : "main",
        "search"            : "search",
        "search/*params"    : "search",
        "flight/:id/pay"    : "payment",
        "airline/:id"       : "airline",
        "city/:id"          : "city",
    },

    anchor: 'main',

    render: function(view){
        console.log("Anchoring view to " + this.anchor);
        $('#' + this.anchor).html(view.render().el);
        return view;
    },

    fadeIn: function(){
        console.log("Fading in new view(s)");
        var current = $("#" + this.anchor + " > *");
        var next = _.map(arguments, function(view){
            var elem = view.render().el;
            return elem;
        });
        $(next).hide();
        $("#" + this.anchor).append(next);
        $(next).fadeIn(500);
        current.hide(300, function(){
            $(this).remove();
        });
        return arguments;
    },

    main: function(){
        var landingView = new MindTrips.LandingView();
        var mapView = new MindTrips.LandingMapView(13.6216,17.9087);
        this.fadeIn(landingView, mapView);
        MindTrips.filters = {};
    },

    search: function(params){
        if (params){
            console.log(params);
        }
        // if data -> decode data and inflate models
        var mapView = new MindTrips.MapView(-34.615853, -58.433298);
        var flightListView = new MindTrips.FlightListView();
        this.fadeIn(mapView, flightListView);
    },

    payment: function(flightId){
        var payment = new MindTrips.PaymentView(flightId);
        this.fadeIn(payment);
    },

    airline: function(airlineId){
        var airline = new MindTrips.AirlineView(airlineId);
        var comments = new MindTrips.CommentsView(airlineId);
        this.fadeIn(airline, comments);
    },
    
    city: function(cityId){
        this.fadeIn(new MindTrips.CityView(cityId));
    },
});

// On load:
$(function(){
	var tpl = MindTrips.templates.load(["city", "review", "map", "landing", "languages", "flightlist", "airline", "payment","landingmap"]);


    tpl.done(function(){
        console.log("Loading init point");
        MindTrips.router = new MindTrips.AppRouter();
        Backbone.history.start();

        var languagesView = new MindTrips.LanguagesView();
        $("#languages").html(languagesView.el);
        
        var omnisearch = new MindTrips.OmniSearch($("#omnisearch"));
    });

});