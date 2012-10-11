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
 
    // Recursively pre-load all the templates for the app.
    // This implementation should be changed in a production environment:
    // All the template files should be concatenated in a single file.
    // This is done so we can skip validation errors.
    load: function(names, callback, error) {
        var that = this;
        var count = 0;
        var errorHandler = function(){
            console.log("Error loading templates.");
            that.templates = {};
            if (error){
                error();
            }
        }
        _.each(names, function(name){
            console.log('Loading template: <' + name + ">");
            var route = '/static/template/' + that.language + '/' + name + '.html';
            var req = $.get(route, function(data){    
                count++;
                that.loadTemplate(name, data);
                console.log('Template: <' + name + "> loaded.");
                if (count == names.length){
                    callback();
                }
            });
            req.fail(errorHandler);
        });
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


// Base view with some boilerplate methods.
MindTrips.BaseView = Backbone.View.extend({
	templateName: "base",

	template: function(data){
		var tpl = MindTrips.templates.get(this.templateName);
		return tpl(data);
	},

    bind: function(eventName){},

    render: function (eventName) {
        if (this.model != undefined){
            var data = this.model.toJSON();
        }
        return this.renderData(eventName, data);
    },

    renderData: function (eventName, data) {
        console.log("Rendering: <" + this.templateName + "> for event <" + eventName + ">");
        $(this.el).html(this.template(data));
        return this;
    },

});


MindTrips.LandingView = MindTrips.BaseView.extend({
    templateName: "landing",

    bind: function(eventName){
        console.log("calling bind");
        var searchbox = $("#searchbox");
        var about = $("#site-description");

        var handler = function(){
            if (!$(this).hasClass("minimized")) return;
            console.log("toggling minimized values");
            searchbox.toggleClass("minimized");
            about.toggleClass("minimized");
        }
        searchbox.click(handler);
        about.click(handler);
    },
});

MindTrips.AppRouter = Backbone.Router.extend({
    routes: {
        ""                  : "main",
        "search"            : "search",
        "flight/:id/pay"    : "payment",
    },

    anchor: 'main',

    render: function(view){
        console.log("Anchoring view to " + this.anchor);
        $('#' + this.anchor).html(view.render().el);
        if (view.bind){
            view.bind();
        }
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
        _.each(arguments, function(view){
            if (view.bind){
                view.bind();
            }
        });
        $(next).fadeIn(1000);
        current.hide(700, function(){
            $(this).remove();
        });
        return arguments;
    },

    main: function(){
        this.fadeIn(new MindTrips.LandingView());
    },

    search: function(){
        
    },

    payment: function(flightId){

    },

});

// On load:
$(function(){
	MindTrips.templates.load(["map", "landing"], function(){
        console.log("Loading init point");
        MindTrips.router = new MindTrips.AppRouter();
        Backbone.history.start();

        // set up the language links.
        $("[data-language]").each(function(){
            var language = $(this).data("language");
            $(this).click(function(){
                MindTrips.templates.setLanguage(language);
                return false;
            });
        });
	});

});