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

    engine: Mustache,
 
    // This is done so we can skip validation errors.
    load: function(names) {
        var that = this;
        var count = 0;
        var errorHandler = function(){
            console.log("Error loading templates.");
            that.templates = {};
        }
        var deferreds = _.map(names, function(name){
            console.log('Loading template: <' + name + ">");
            var route = 'static/template/' + that.language + '/' + name + '.html';
            return $.get(route).pipe(function(data){    
                count++;
                that.loadTemplate(name, data);
                console.log('Template: <' + name + "> loaded.");
                return that.get(name);
            });
        });
        var deferred = $.when(deferreds);
        deferred.fail(errorHandler);
        return deferred;
    },

    loadTemplate: function(name, data) {
        // Store the *compiled* version of the templates.
        console.log('Compiling template: <' + name + ">");
        this.templates[name] = this.engine.compile(data);
        return this.templates[name];
    },

    setLanguage: function(lang){
        var old = this.language;
        var router = MindTrips.router;
        this.language = lang.toLowerCase();
        var that = this;
        var target = Backbone.history.fragment;
        console.log("Navigating to loading screen");
        router.navigate("loading", true);
        this.load(_.keys(this.templates))
            .done(function(){
                console.log("navigating to <" + target + ">");
                router.navigate(target, true);
            }).fail(function(){
                console.log("Falling back");
                router.navigate(target);
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
        this.fadeIn(landingView);
    },

    search: function(params){
        // if data -> decode data and inflate models
        var mapView = new MindTrips.MapView(-34.615853, -58.433298);
        var flightListView = new MindTrips.FlightListView();
        this.fadeIn(mapView, flightListView);
    },

    payment: function(flightId){

    },

    airline: function(airlineId){

    },


});

// On load:
$(function(){
	var tpl = MindTrips.templates.load(["map", "landing", "languages", "flightlist", "airline"]);


    tpl.done(function(){
        console.log("Loading init point");
        MindTrips.router = new MindTrips.AppRouter();
        Backbone.history.start();


        var languagesView = new MindTrips.LanguagesView();
        languagesView.ready(function(){
            $("#languages").html(languagesView.render().el);
        });

        var omnisearch = new MindTrips.OmniSearch($("#omnisearch"));
    });

});