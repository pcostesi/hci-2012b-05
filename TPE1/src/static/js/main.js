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
        var deferred = $.Deferred();
        var that = this;
        var count = 0;
        var errorHandler = function(){
            console.log("Error loading templates.");
            that.templates = {};
            deferred.reject();
        }
        _.each(names, function(name){
            console.log('Loading template: <' + name + ">");
            var route = 'static/template/' + that.language + '/' + name + '.html';
            var req = $.get(route, function(data){    
                count++;
                that.loadTemplate(name, data);
                console.log('Template: <' + name + "> loaded.");
                if (count == names.length){
                    deferred.resolve();
                }
            });
            req.fail(errorHandler);
        });
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


// Base view with some boilerplate methods.
MindTrips.BaseView = Backbone.View.extend({
	templateName: "base",

	template: function(data){
		var tpl = MindTrips.templates.get(this.templateName);
		return tpl(data);
	},

    bind: function(el){},

    render: function (eventName) {
        if (this.model != undefined){
            var data = this.model.toJSON();
        }
        return this.renderData(eventName, data);
    },

    renderData: function (eventName, data) {
        console.log("Rendering: <" + this.templateName + 
            "> for event <" + eventName + "> with data <" + 
            data + ">");
        this.$el.html(this.template(data));
        this.bind();
        return this;
    },

});


MindTrips.LandingView = MindTrips.BaseView.extend({
    templateName: "landing",

    setupToggleMinimized: function(){
        var searchbox = this.$("#searchbox");
        var about = this.$("#site-description");

        var handler = function(){
            if (!$(this).hasClass("minimized")) return;
            console.log("toggling minimized values");
            searchbox.toggleClass("minimized");
            about.toggleClass("minimized");
        }
        searchbox.click(handler);
        about.click(handler);
        console.log("'.minimized' handlers successfully bound.")
        return this;
    },

    bind: function(){
        console.log("calling bind on LandingView");
        
        // setup div / viewport change.
        this.setupToggleMinimized();

        this.$("[data-date-picker]").datepicker();
    },
});

MindTrips.LanguagesView = MindTrips.BaseView.extend({
    templateName: "languages",

    tagName: "ul",

    initialize: function(){

        var deferred = API.Misc.getLanguages();
        deferred.done(function(data){
            this.languages = data;
        });
        deferred.fail(function(){
        this.languages = {
        "languages": [
                {"languageId": "EN", "name": "English"},
                {"languageId": "ES", "name": "Spanish"}
            ]
        }

        });
    },

    bind: function(){
        this.$("[data-language]").click(function(){
            var language = $(this).data("language");
            MindTrips.templates.setLanguage(language);
            return false;
        });
    },

    render: function(eventName){
        return this.renderData(eventName, this.languages);
    }
});

MindTrips.MapView = MindTrips.BaseView.extend({
    templateName: "map",

    // The map will not be ready to use until it has been rendered.
    initialize: function(lat, lng, title){
        this.mapOptions = {
          center: new google.maps.LatLng(lat, lng),
          zoom: 8,
          mapTypeId: google.maps.MapTypeId.ROADMAP
        };
        
    },

    bind: function(){
        console.log("calling bind on map");
        var canvas = this.$(".map-canvas").get(0);
        this.map = new google.maps.Map(canvas, this.mapOptions);
        this.$(".map-overlay").text(this.title);
        console.log("map successfully bound");
    },
});

MindTrips.FlightListView = MindTrips.BaseView.extend({
    templateName: "flightlist",

    render: function(eventName){
        var flights = [
            {name: "Avianca", currency: "U$S", price: 1000, adults: 5, children: 3},
            {name: "lolAirlines", currency: "U$S", price: 100, adults: 3, children: 7},
        ]; 
        return this.renderData(eventName, {flights:flights});
    }
});


MindTrips.AppRouter = Backbone.Router.extend({
    routes: {
        ""                  : "main",
        "search"            : "search",
        "flight/:id/pay"    : "payment",
        "airline/:id"       : "airline",
    },

    anchor: 'main',

    // this is too dirty...
    searchFilters: {},

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

    search: function(){
        var mapView = new MindTrips.MapView(0, 0);
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
	var tpl = MindTrips.templates.load(["map", "landing", "languages", "flightlist"]);


    tpl.done(function(){
        console.log("Loading init point");
        MindTrips.router = new MindTrips.AppRouter();
        Backbone.history.start();


        var languagesView = new MindTrips.LanguagesView();
        $("#languages").html(languagesView.render().el);
    });

});