
// Create the namespace
MindTrips = window.MindTrips || {}

// Base view with some boilerplate methods.
MindTrips.BaseView = Backbone.View.extend({

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

    setupDatepickers: function(){
        this.$("[data-date-picker]").datepicker();
        var departureDate = this.$("[data-date-picker='departure']");
        var returnDate = this.$("[data-date-picker='return']");
        departureDate.datepicker("option", {
            minDate: new Date(),
            onSelect: function(dateText, inst){
                console.log("setting min date to " + dateText);
                returnDate.datepicker("option", {
                    minDate: dateText,
                });
            },
        });
        returnDate.datepicker("option", {
            minDate: new Date(),
        });
    },

    setupOneWayFlight: function(){
        var that = this;
        this.$("input[name='round-trip']").change(function(){
            if (that.$(this).val() == "one-way"){
                that.$("[data-date-picker='return']").datepicker("disable");
                that.$(".return input").attr("disabled", true);    
            } else {
                that.$("[data-date-picker='return']").datepicker("enable");
                that.$(".return input").attr("disabled", false);
            }  
            that.$(".return").toggleClass("disabled");
        });
    },

    setupAutocomplete: function(){
    	this.$("[data-mapcomplete]").mapcomplete({
            delay: 300,
            source: function(request, response){
                // Airports: 
                var airportsByName = API.Geo.getAirportsByName({
                    name: request.term,
                }).done(function(data){
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
        });
    },

    bind: function(){
        console.log("calling bind on LandingView");
        this.setupToggleMinimized();
        this.setupAutocomplete();
        this.setupDatepickers();
        this.setupOneWayFlight();
    },
});

MindTrips.LanguagesView = MindTrips.BaseView.extend({
    templateName: "languages",

    tagName: "ul",

    initialize: function(){
        var that = this;
        API.Misc.getLanguages().done(function(data){
            that.languages = data;
            that.render();
            that.trigger("set");
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
        var flights = this.collection || [];
        return this.renderData(eventName, {flights:flights});
    }
});

MindTrips.CityView = MindTrips.BaseView.extend({
    templateName: "city",

    initialize: function(cityId){
        var that = this;
        var city = API.Geo.getCityById({id:cityId});
        city.done(function(data){
            var city = data['city'];
            city['url'] = Gootils.map({
                lat: city['latitude'],
                lng: city['longitude'],
                width: 640,
                height: 200,
                zoom: 9,
            });
            that.model = new MindTrips.City(city);
            that.render();
        });
    },

});

MindTrips.AirlineView = MindTrips.BaseView.extend({
    templateName: "airline",

    initialize: function(airlineId){
        var that = this;
        var airline = API.Misc.getAirlineById({id:airlineId});
        airline.done(function(data){
            that.model = new MindTrips.Airline(data['airline']);
            that.render();
        });
    },
});

MindTrips.CommentsView = MindTrips.BaseView.extend({
    templateName: "review",
    initialize: function(airlineId){
        var that = this;
        var reviews = API.Review.getAirlineReviews({airline_id:airlineId})
        reviews.done(function(rev){
            console.log(rev['reviews']);
            that.render();
        });
    },

    bind: function(){
        var that = this;
        this.$("[data-publish-button]").click(function(){

        });
    },
});