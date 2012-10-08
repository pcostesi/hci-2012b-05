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
		console.log("Rendering: " + this.templateName);
		$(this.el).html(this.template(this.model.toJSON()));
        return this;
	},


});

// Main search view.
MindTrips.SearchView = MindTrips.BaseView.extend({
	templateName: "search",
});

MindTrips.FlightListView = MindTrips.BaseView.extend({
	templateName: "flightlist",
});

MindTrips.MapView = MindTrips.BaseView.extend({
	templateName: "map",

	initialize: function(selector){

	},
});

MindTrips.BreadcrumView = MindTrips.BaseView.extend({
	initialize: function(history){
		this.history = history;
	},

	render: function(eventName){
		//rendering of <a href="#history" class="breadcrum">history</a>
	},
});


// Router (controllers).
MindTrips.AppRouter = Backbone.Router.extend({
 
    routes: {
        "" : "search"
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

function initialize() {
	var mapOptions = {
    	center: new google.maps.LatLng(-33, 151),
        zoom: 8,
        disableDefaultUI: true,
        mapTypeId: google.maps.MapTypeId.ROADMAP
    };
    var map = new google.maps.Map(document.getElementById("map_canvas"),mapOptions);
}

function codeAddress() {
   	var address = document.getElementById("address").value;
    geocoder.geocode( { 'address': address}, function(results, status) {
      	if (status == google.maps.GeocoderStatus.OK) {
        	map.setCenter(results[0].geometry.location);
        	var marker = new google.maps.Marker({ map: map, position: results[0].geometry.location});
      	} else {
        	alert("Geocode was not successful for the following reason: " + status);
      	}
    });
}

function addHiddenToReturn(){
    $("#return-dates").addClass("hidden");
}
function removeHiddenToReturn(){
    $("#return-dates").removeClass("hidden");
}



// On load:
$(function(){
	MindTrips.templates.loadTemplates(["search"], function(){
		var router = new MindTrips.AppRouter();
    	var history = Backbone.history.start();
	});

});