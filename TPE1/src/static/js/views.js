
// Create the namespace
MindTrips = window.MindTrips || {}

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

    setupAutocomplete: function(){
    	this.$("[data-mapcomplete]").mapcomplete({
    		source: function(request, response){
    			// Airports: 
                var airportsByName = API.Geo.getAirportsByName({
    				name: request.term,
    			}).done(function(data){
    				console.log(data);
    				var result = _.map(data['airports'], function(elem){
    					var label = elem['description'] + " (" + elem['airportId'] +")";
    					return {
    						label: label,
    						choice: {
    							lat: elem['latitude'],
    							lng: elem['longitude'],
    							data: elem,
    						},
    						value: label,
    					};
    				});
            		response(result);
    			});
    		},
        	delay: 300,
    	});
    },

    bind: function(){
        console.log("calling bind on LandingView");
        
        // setup div / viewport change.
        this.setupToggleMinimized();
        this.setupAutocomplete();

        this.$("[data-date-picker]").datepicker();
    },
});

MindTrips.LanguagesView = MindTrips.BaseView.extend({
    templateName: "languages",

    tagName: "ul",

    initialize: function(){
        var that = this;
        var deferred = API.Misc.getLanguages();
        deferred.done(function(data){
            that.languages = data;
            that.trigger("set");
        });
    },

    ready: function(callback){
        this.on('set', callback);
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

MindTrips.AirlineView = MindTrips.BaseView.extend({
});
