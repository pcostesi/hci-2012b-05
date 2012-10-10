var FlightsAPI = {

    BASE_URL: "http://eiffel.itba.edu.ar/hci/service2/",

    getLanguages: function(callback) {
        this.call("Misc", { method: "GetLanguages" }, callback);
    },

    getCurrencies: function(callback, options) {
        var data = options || {};
        data.method = "GetCurrencies";
        this.call("Misc", data, callback);
    },

    getCurrencyById: function(id, callback) {
        this.call("Misc", { method: "GetCurrencyById", id: id }, callback);
    },

    getCurrenciesRatio: function(id1, id2, callback) {
        this.call("Misc", { method: "GetCurrenciesRatio", id1: id1, id2: id2 }, callback);
    },

    getAirlines: function(callback, options) {
        var data = options || {};
        data.method = "GetAirlines";
        this.call("Misc", data, callback);
    },

    getAirlineById: function(id, callback) {
        this.call("Misc", { method: "GetAirlineById", id: id }, callback);
    },

    getAirlinesByName: function(name, callback) {
        this.call("Misc", { method: "GetAirlinesByName", name: name }, callback);
    },

    getCountryById: function(id, callback) {
        this.call("Geo", { method: "GetCountryById", id: id }, callback);
    },

    getCountries: function(callback, options) {
        var data = options || {};
        data.method = "GetCountries";
        this.call("Geo", data, callback);
    },

    getCities: function(callback, options) {
        var data = options || {};
        data.method = "GetCities";
        this.call("Geo", data, callback);
    },

    getCityById: function(id, callback) {
        this.call("Geo", { method: "GetCityById", id: id }, callback);
    },

    getCitiesByName: function(name, callback) {
        this.call("Geo", { method: "GetCitiesByName", name: name }, callback);
    },

    getCitiesByPosition: function(lat, lng, callback, options) {
        var data = options || {};
        data.method = "GetCitiesByPosition";
        data.latitude = lat;
        data.longitude = lng;
        this.call("Geo", data, callback);
    },

    getAirports: function(callback, options) {
        var data = options || {};
        data.method = "GetAirports";
        this.call("Geo", data, callback);
    },

    getAirportById: function(id, callback) {
        this.call("Geo", { method: "GetAirportById", id: id }, callback);
    },

    getAirportsByName: function(name, callback) {
        this.call("Geo", { method: "GetAirportsByName", name: name }, callback);
    },

    getAirportsByPosition: function(lat, lng, callback, options) {
        var data = options || {};
        data.method = "GetAirportsByPosition";
        data.latitude = lat;
        data.longitude = lng;
        this.call("Geo", data, callback);
    },

    validateCreditCard: function(number, exp_date, callback, options) {
        var data = options || {};
        data.method = "ValidateCreditCard";
        data.number = number;
        data.exp_date = exp_date;
        this.call("Booking", data, callback);
    },

    call: function(service, data, callback) {
        var url = this.BASE_URL + service + ".groovy";
        $.ajax(url, {
            data: data,
            dataType: "jsonp",
            success: function(result) {
                console.log("Called method " + service + "." + data.method);
                console.log(result.meta);
                delete result.meta;
                callback(result);
            }
        });
    }

};
