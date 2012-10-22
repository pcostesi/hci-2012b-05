
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
            MindTrips.router.navigate("search/"+departureDate+"/"+returnDate+"/"+from+"/", true);
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
        zoom: 3,
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

MindTrips.LandingMapView = MindTrips.BaseView.extend({
    templateName: "landingmap",

initialize: function(lat, lng){
    this.mapOptions = {
        center: new google.maps.LatLng(lat, lng),
        zoom: 2,
        mapTypeId: google.maps.MapTypeId.ROADMAP
    };
    var that = this;
    API.Geo.getCities({
        page_size: 120,
    }).done(function(data){
        that.getDealsFromCity(data);
    });

},

getDealsFromCity: function(data){
    var num = parseInt(Math.random()*data.cities.length);
    console.log(data);
    currentcity = data.cities[num];
    tittle = currentcity.name;
    this.$(".map-overlay").text(this.$(".map-overlay").html() + " " +tittle );
    var that = this;
    API.Booking.getFlightDeals({
        from: currentcity.cityId,
    }).done(function(deals){
        console.log(deals);
        that.drawMarkers(deals);
        var loc = new google.maps.LatLng(currentcity.latitude,currentcity.longitude);
        new google.maps.Marker({
                position: loc,
                map: that.map,
        });
    });

},
drawMarkers: function(deals){
    deals = deals.deals;
    var yellow = '/static/img/yellow-dot.png';
    var green = '/static/img/green-dot.png';
    var blue = '/static/img/blue-dot.png';
    var that = this;
    for(i=0; i< deals.length; i++){
        var pos = new google.maps.LatLng(deals[i].cityLatitude,deals[i].cityLongitude);
        var color = "";
        if(deals[i].price < 1000){
            color = green;
        }else if (deals[i].price < 1500){
            color = blue;
        }else{
            color = yellow
        }
        new google.maps.Marker({
                position: pos,
                map: that.map,
                title: deals[i].cityName,
                icon: color,
        });
    }
},

bind: function(){
    console.log("calling bind on map");
    var canvas = this.$(".landing-map-canvas").get(0);
    if (this.map === undefined){
        this.map = new google.maps.Map(canvas, this.mapOptions);
        console.log("map successfully bound");
    }
},
});



MindTrips.FlightListView = MindTrips.BaseView.extend({
    templateName: "flightlist",

    initialize: function(){
        // HARDCODED
        var that = this;
        this.collection = {};
        this.flightstatus = null;
        var dep = Date.today().add(2).days();
        API.Booking.getRoundTripFlights({
            from: "TUC",
            to: "COR",
            dep_date: dep.toString("yyyy-MM-dd"),
            ret_date: dep.toString("yyyy-MM-dd"),
            adults: 1,
            children: 1,
            infants: 0,
        }).done(function(data){
            that.flights = that.makeReadableFlightData(data);
            that.setCollections();
        });
    },

    setCollections: function(){
        this.collection.flights = JSON.parse(JSON.stringify(this.flights));
        if(this.flightstatus != null){
            this.collection.flightstatus = this.flightstatus;
        }
        this.render();
        if(this.flights.models.length >0){
            this.reviewHighlited();
        }
    },

    bind: function(){
        this.setUpSelectButton();
        this.setUpFinishButton();
        this.setUpOrderButtons();
    },

    setUpOrderButtons: function(){
        var that = this;
        this.$("*[price]").click(function(){
            that.orderByPrice();
        });
        this.$("*[scale]").click(function(){
            that.orderByScale();
        });
        this.$("*[airline]").click(function(){
            that.orderByName();
        });
        this.$("*[duration]").click(function(){
            that.orderByDuration();
        });

    },

    setUpFinishButton: function(){
        var that = this;
        this.$(".finish-button").click(function(){
            alert("entro");
            if(that.flightstatus.inbound != null && that.flightstatus.outbound != null){
                MindTrips.flightInfo = that.flightstatus;
                console.log(MindTrips.flightInfo);
                MindTrips.router.navigate("flight/:id/pay", true);
            }
        });
    },

    setUpSelectButton: function(){
        var that = this;
        this.$(".confirm-button").click(function(){
            var id = $(this).attr("data-flight-no");
            var elem = that.$("#"+id);
            if(that.flightstatus == null){
                that.flightstatus = {};
            }
            data = that.flightstatus;
            if(!elem.hasClass("flight-selected")){
                if(elem.attr("status") == "inbound" && data.inbound != null) return;
                if(elem.attr("status") == "outbound" && data.outbound != null) return;
                that.addToFinalFare(id, elem.attr("status"));
            }else{
                var deleted = {};
                if(elem.attr("status") == "inbound"){
                    deleted = data.inbound;
                    delete data.inbound;
                }else{
                    deleted = data.outbound;
                    delete data.outbound;
                }
                that.decFinalFare(deleted);
                elem.removeClass("highlited");         
            }
        });
    },
    addToFinalFare: function(id, status){
        var flight = this.getFlightById(id);
        if(status == "inbound"){
            this.flightstatus.inbound = flight;
        }else{
            this.flightstatus.outbound = flight;
        }
        this.setFinalFare(flight);
    },

    decFinalFare: function(flight){
        if(flight.adult != null){
            data.adult.price =  data.adult.price - flight.adult.price;
        }
        if(flight.children != null){
            data.children.price = data.children.price - flight.children.price;
        }
        if(flight.infant != null){
            data.infant.price = data.infant.price - flight.infant.price;
        }
        data.taxes = (parseFloat(data.taxes) - parseFloat(flight.taxes)).toFixed(2);
        data.charges = (parseFloat(data.charges) - parseFloat(flight.charges)).toFixed(2);
        data.total = (parseFloat(data.total) - parseFloat(flight.total)).toFixed(2);
        this.setCollections();
    },

    setFinalFare: function(flight){
        var data = this.flightstatus;
        if(data.currency == null){
            this.initFinalPrice(flight);
        }
        if(flight.adult != null){
            data.adult.price =  data.adult.price + flight.adult.price;
        }
        if(flight.children != null){
            data.children.price = data.children.price + flight.children.price;
        }
        if(flight.infant != null){
            data.infant.price = data.infant.price + flight.infant.price;
        }
        data.taxes = (parseFloat(data.taxes) + parseFloat(flight.taxes)).toFixed(2);
        data.charges = (parseFloat(data.charges) + parseFloat(flight.charges)).toFixed(2);
        data.total = (parseFloat(data.total) + parseFloat(flight.total)).toFixed(2);
        this.setCollections();
    },

    initFinalPrice: function(flight){
        var data = this.flightstatus;
        if(flight.adult != null){
            data.adult = {};
            data.adult.quantity = flight.adult.quantity;
            data.adult.price = 0;
            var information = new Array();
            for(k=0; k<data.adult.quantity; k++){
                var info = {};
                info.type = "adult"+k;
                information.push(info);
            }
            data.adult.array = information;
        }
        if(flight.children != null){
            data.children = {};
            data.children.quantity = flight.children.quantity;
            var information = new Array();
            for(k=0; k<data.children.quantity; k++){
                var info = {};
                info.type = "children"+k;
                information.push(info);
            }
            data.children.array = information;
            data.children.price = 0;
        }
        if(flight.infant != null){
            data.infant = {};
            data.infant.quantity= flight.infant.quantity;
            data.infant.price= 0;
            var information = new Array();
            for(k=0; k<data.infant.quantity; k++){
                var info = {};
                info.type = "infant"+k;
                information.push(info);
            }
            data.infant.array = information;
        }
        data.currency = flight.currency;
        data.total =0;
        data.charges =0;
        data.taxes =0;
    },

    getFlightById: function(id){
        var array = this.collection.flights;
        for(i=0; i<array.length; i++){
            if(array[i]['code'] == id){
                return array[i];
            }
        }
    },

    makeReadableFlightData: function(data){
        var flights = new Flights();
        for(i=0; i<data.flights.length; i++){
            var flight = new Flight();         
            var actualflight = data.flights[i];
            if(actualflight.price.adults != null){
                flight.set("adult", this.makeReadablePersonInfo(data.flights[i].price.adults));
            }
            if(actualflight.price.children != null){
                flight.set("children", this.makeReadablePersonInfo(data.flights[i].price.children));
            }
            if(actualflight.price.infants != null){
                flight.set("infant", this.makeReadablePersonInfo(data.flights[i].price.infants));
            }
            flight.set("currency", data.currencyId);
            flight.set("total", actualflight.price.total.total);
            flight.set("taxes", actualflight.price.total.taxes);
            flight.set("charges", actualflight.price.total.charges);
            flight.set("fare", actualflight.price.total.fare);
            if(actualflight.outboundRoutes != null){
                this.makeReadableFlightInfo("outboundRoutes", actualflight, data, flight);
            }
            if(actualflight.inboundRoutes != null){
                this.makeReadableFlightInfo("inboundRoutes", actualflight, data, flight);
            }
            flights.add(flight);
        }
        return flights;

    },

    makeReadablePersonInfo: function(route){
        var person = new FlightPerson();
        person.set("quantity" , route.quantity);
        person.set("price", route.baseFare);
        return person;
    },

    makeReadableFlightInfo: function(route, actualflight, data, flight){
        if(actualflight[route][0].segments.length == 1){
            var actualscale = actualflight[route][0].segments[0];
            var airId = this.getAirlineLogo(actualscale.airlineId,data);
            flight.set("code", actualscale.flightId);
            var companiesdata = new FlightCompanie();
                companiesdata.set("logo", airId);
                companiesdata.set("name", actualscale.airlineName);
            flight.set("companies", companiesdata);
            var flightdata = new FlightInfo();
                flightdata.set("deptime", actualscale.departure.date);
                flightdata.set("deptimezone", actualscale.departure.timezone);
                flightdata.set("arrtime", actualscale.arrival.date);
                flightdata.set("arrtimezone", actualscale.arrival.timezone);
                flightdata.set("duration", actualscale.duration);
                flightdata.set("scale", 0);
            if(route == "outboundRoutes"){
                flight.set("outbound", flightdata);
            }else{
                flight.set("inbound", flightdata);
            }
        }
    },

    getAirlineLogo: function(airlineId,data){
        //Podria hacer una estructura copada pero no van a ser tantos vuelos
        for(w = 0; w< data.filters[0].values.length; w++){
            if(data.filters[0].values[w].id == airlineId){
                return data.filters[0].values[w].logo;
            }
        }
        
    },

    orderByPrice: function(){
        var flights = this.flights;
        flights.comparator = function(elem){
            return elem.get("total");
        }
        flights.sort();
        this.setCollections();
    },

    orderByScale: function(){
        var flights = this.flights;
            flights.comparator = function(elem){
                if(elem.get("outbound")!= null){
                    return elem.get("outbound").get("scale");
                }else{
                    return elem.get("inbound").get("scale");
                }
            }
            flights.sort();
            this.setCollections();
    },

    orderByDuration: function(){
        var flights = this.flights;
        flights.comparator = function(elem){
                if(elem.get("outbound")!= null){
                    return elem.get("outbound").get("duration");
                }else{
                    return elem.get("inbound").get("duration");
                }
            }
            flights.sort();
            this.setCollections();
    },

    reviewHighlited: function(){
        var data = this.flightstatus;
        this.$("*[buttonorder]").removeClass("hidden");
        if(data == null) return;
        var id = {};
        if(data.inbound != null){
            id = data.inbound.code;
            this.$("#"+id).toggleClass("flight-selected");
        }
        if(data.outbound != null){
            id=data.outbound.code;
            this.$("#"+id).toggleClass("flight-selected");
        }
    },

    orderByName: function(){
        var flights = this.flights;
        flights.comparator = function(elem){
            return elem.get("companies").get("name");
        }
        flights.sort();
        this.setCollections();
    },


    render: function(eventName){
        var data = this.collection.flightstatus || [];

        var flights = this.collection.flights || [];
        return this.renderData(eventName, {flights:flights, flightstatus:data});
    },
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
        this.airlineId = airlineId;
        var reviews = API.Review.getAirlineReviews({airline_id:airlineId});
        reviews.done(function(rev){
            console.log(rev['reviews']);
            that.render();
        });
    },

});

MindTrips.PaymentView = MindTrips.BaseView.extend({
    templateName: "payment",
    initialize: function(flightId){
        var that = this;
        console.log(MindTrips.flightInfo);
        this.collection = MindTrips.flightInfo;
        that.render();
    },

    bind: function(){
        var that = this;
        API.Geo.getCities({
            page_size: 120,
        }).done(function(data){
            var cities = new Array();
            for(i=0;i<data.cities.length;i++){
                cities[i]=data.cities[i].name;
            }
            that.$("#city").autocomplete({source:cities})
        })
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
                        that.grabAllData();     
                   } else {
                    alert("La informacion de la tarjeta no es correcta");
                };
            });
            } else{
                alert("La informacion de la tarjeta no es correcta");
            };
        });
}, 

    grabAllData: function(){
        this.completed = false;
        this.completed2 = false;
        var data = this.collection;
        var tosend = {};
        tosend.flightId = data.outbound.code;
        var passengers = new Array();
        this.grabPersonData(data.adult,passengers,tosend);
        this.grabPersonData(data.children,passengers,tosend);
        this.grabPersonData(data.infant,passengers,tosend);
        this.grabPaymentDetails(data,tosend);
        console.log(tosend);
        this.completed2 = true;
        this.sendRequest(data,tosend);

    },

    grabPaymentDetails: function(data,tosend){
        var creditCard = {};
        var that = this;
        creditCard.number =  this.$("#card_number").val();
        creditCard.expiration = that.$("#card_exp_month").val() + that.$("#card_exp_year").val();
        creditCard.securityCode = that.$("#card_scode").val();
        creditCard.firstName = that.$("#card_owner_name").val();
        creditCard.lastName = that.$("#card_owner_surname").val();
        tosend.creditCard = creditCard;
        var billingAddress = {};
        billingAddress.street = that.$("#contact_street").val();
        billingAddress.floor = that.$("#floor").val();
        billingAddress.apartment = that.$("#apartment").val();
        billingAddress.postalCode = that.$("#postal_code").val();
        tosend.billingAddress = billingAddress;
        API.Geo.getCitiesByName({
            name: that.$("#city").val(),
        }).done(function(data){
            that.completed = true;
            var city = data.cities[0];
            tosend.billingAddress.country = city.countryId;
            tosend.billingAddress.City = city.cityId;
            tosend.billingAddress.state = city.name;
            that.sendRequest(data,tosend);    
        });

        var contact = {};
        contact.email = that.$("#contact_email").val();
        var tel = new Array();
        tel.push(that.$("#contact_tel").val());
        contact.phones = tel;
        tosend.contact = contact;
    },

    sendRequest: function(data,tosend){
        if(this.completed == true && this.completed2 == true){
            API.Booking.bookFlight(tosend).done(function(data){
                console.log(data);
            });
            if(data.outbound != null){
                tosend.flightId = data.outbound.code;
                API.Booking.bookFlight(tosend).done(function(data){
                    console.log(data);
                });
            }
        }
    },
    grabPersonData: function(data, passengers, tosend){
        if(data != null){
            for(i=0;i< data.array.length; i++){
                var person = {};
                var actual = data.array[i].type;
                this.$('*['+actual+']').each(function(data){
                    var name = $(this).attr("name");
                    if( name == 'firstName'){
                        person.firstName = $(this).val();
                    }else if(name == 'lastName'){
                        person.lastName = $(this).val();
                    }else if(name == 'idNumber'){
                        person.idNumber = $(this).val();
                    }
                });
                var day = this.$('*['+actual+'dateday]').val();
                var year = this.$('*['+actual+'dateyear]').val();
                var month = this.$('*['+actual+'datemonth]').val();
                person.birthdate = year+'-'+month+'-'+day;
                person.idType = 1;
                passengers.push(person);
            }
            tosend.passengers = passengers;
        }
    },
isValidCreditCard: function(card_type, card_number) {
    return true;
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
    render: function(eventName){
        var info = this.collection || [];
        console.log(info);
        return this.renderData(eventName, {payment:info});
    },

});
