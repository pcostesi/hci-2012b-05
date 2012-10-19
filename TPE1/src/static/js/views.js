
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
        var today = new Date();
        today.setDate(today.getDate() + 2);
        this.$("[data-date-picker]").datepicker();
        var departureDate = this.$("[data-date-picker='departure']");
        var returnDate = this.$("[data-date-picker='return']");
        departureDate.datepicker("option", {
            minDate: today,
            onSelect: function(dateText, inst){
                console.log("setting min date to " + dateText);
                returnDate.datepicker("option", {
                    minDate: dateText,
                });
            },
        });
        returnDate.datepicker("option", {
            minDate: today,
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
        var map = this.$("[data-mapcomplete]");
        map.mapcomplete({
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
                id: elem['airportId'],
            },
            value: label,
        };
    });
    response(result);
});
},
select: function(elem, ui){
    $(this).data("map-option", ui.item.choice);
}
});
    },

    setupSubmitButton: function(){
        var that = this;
        var dpDeparture = this.$('[data-date-picker="departure"]');
        var dpReturn = this.$('[data-date-picker="return"]');
        this.$(".search-button").click(function(){
            var departureDate = dpDeparture.datepicker("getDate");
            var returnDate = dpReturn.datepicker("getDate");
            var from = that.$('[data-mapcomplete="from"]').val();
            MindTrips.router.navigate("search", true);
        });
    },

    bind: function(){
        console.log("calling bind on LandingView");
        this.setupToggleMinimized();
        this.setupAutocomplete();
        this.setupDatepickers();
        this.setupOneWayFlight();
        this.setupSubmitButton();
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
    this.title = this.title || "SFO \u2708 MIA";

},

drawMarkers: function(){
// XXX: WE REALLY NEED THIS.
// noop now. WE NEED TO CODE THIS ASAP.
},

bind: function(){
    console.log("calling bind on map");
    var canvas = this.$(".map-canvas").get(0);
    if (this.map === undefined){
        this.map = new google.maps.Map(canvas, this.mapOptions);
        console.log("map successfully bound");
    }
    this.drawMarkers();
    this.$(".map-overlay").text(this.title);
},
});

MindTrips.FlightListView = MindTrips.BaseView.extend({
    templateName: "flightlist",

    initialize: function(){
// HARDCODED
var that = this;

var dep = Date.today().add(2).days();
API.Booking.getOneWayFlights({
    from: "BUE",
    to: "MIA",
    dep_date: dep.toString("yyyy-MM-dd"),
    adults: 1,
    children: 0,
    infants: 0,
}).done(function(data){
    that.collection = data['flights'];
    console.log(data);
    that.render();
});
},

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
                height: 480,
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
        var reviews = API.Review.getAirlineReviews({airline_id:airlineId});
        reviews.done(function(rev){
            console.log(rev['reviews']);
            that.render();
        });
    },

    bind: function(){
    },
});

MindTrips.PaymentView = MindTrips.BaseView.extend({
    templateName: "payment",
    initialize: function(flightId){
        var that = this;
        that.render();
    },

    bind: function(){
        var that = this;
        this.$(".confirm-button").click(function(){
            var card_type = that.$("select#card_type").val();
            var card_number = that.$("#card_number").val();
            if (that.isValidCreditCard(card_type, card_number)) {
                var card_exp_date = that.$("#card_exp_month").val() + that.$("#card_exp_year").val();
                var card_scode = that.$("#card_scode").val();
                API.Booking.validateCreditCard({
                    number: card_number,
                    exp_date: card_exp_date,
                    sec_code: card_scode,
                }).done(function(data){
                    if (data['valid']){
                        alert("Su vuelo ha sido confirmado");
                   } else {
                    alert("La informacion de la tarjeta no es correcta");
                };
            });
            } else{
                alert("La informacion de la tarjeta no es correcta");
            };
        });
}, 
isValidCreditCard: function(card_type, card_number) {
    if (card_type == "Visa") {
        var re = /^4\d{15}$/;
    } else if (card_type == "MC") {

        var re = /^5[1-5]\d{14}$/;
    } else if (card_type == "AmEx") {

        var re = /^3[4,7]\d{13}$/;
    } else if (card_type == "Diners") {

        var re = /^3[0,6,8]\d{14}$/;
    }
    if (re == null || !re.test(card_number)) return false;

    card_number = card_number.split("-").join("");

    var checksum = 0;
    for (var i=(2-(card_number.length % 2)); i<=card_number.length; i+=2) {
        checksum += parseInt(card_number.charAt(i-1));
    }

    for (var i=(card_number.length % 2) + 1; i<card_number.length; i+=2) {
        var digit = parseInt(card_number.charAt(i-1)) * 2;
        if (digit < 10) { checksum += digit; } else { checksum += (digit-9); }
    }
    if ((checksum % 10) == 0) return true; else return false;
},

});