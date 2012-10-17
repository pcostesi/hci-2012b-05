(function($) {

    var BASE_URL = "http://eiffel.itba.edu.ar/hci/service2/";

    var isFunction = function(obj) {
        return typeof(obj) === "function";
    };

    var call = function(service, data, options) {
        var url = BASE_URL + service + ".groovy";

        if (isFunction(options)) {
            var callback = options;
            options = {};
        } else {
            options = options || {};
        }

        options.url      = url;
        options.data     = data;
        options.dataType = options.dataType || "jsonp";
        options.success  = options.success || callback;

        return $.ajax(options);
    };

    var API = {};

    API.Misc = {
        
        getLanguages: function(data, options) {
            data = data || {};
            data.method = "GetLanguages";
            return call("Misc", data, options);
        },

        getCurrencies: function(data, options) {
            data = data || {};
            data.method = "GetCurrencies";
            return call("Misc", data, options);
        },

        getCurrencyById: function(data, options) {
            data = data || {};
            data.method = "GetCurrencyById";
            return call("Misc", data, options);
        },

        getCurrenciesRatio: function(data, options) {
            data = data || {};
            data.method = "GetCurrenciesRatio";
            return call("Misc", data, options);
        },

        getAirlines: function(data, options) {
            data = data || {};
            data.method = "GetAirlines";
            return call("Misc", data, options);
        },

        getAirlineById: function(data, options) {
            data = data || {};
            data.method = "GetAirlineById";
            return call("Misc", data, options);
        },

        getAirlinesByName: function(data, options) {
            data = data || {};
            data.method = "GetAirlinesByName";
            return call("Misc", data, options);
        }
    
    };

    API.Geo = {

        getCountryById: function(data, options) {
            data = data || {};
            data.method = "GetCountryById";
            return call("Geo", data, options);
        },

        getCountries: function(data, options) {
            data = data || {};
            data.method = "GetCountries";
            return call("Geo", data, options);
        },

        getCities: function(data, options) {
            data = data || {};
            data.method = "GetCities";
            return call("Geo", data, options);
        },

        getCityById: function(data, options) {
            data = data || {};
            data.method = "GetCityById";
            return call("Geo", data, options);
        },

        getCitiesByName: function(data, options) {
            data = data || {};
            data.method = "GetCitiesByName";
            return call("Geo", data, options);
        },

        getCitiesByPosition: function(data, options) {
            data = data || {};
            data.method = "GetCitiesByPosition";
            return call("Geo", data, options);
        },

        getAirports: function(data, options) {
            data = data || {};
            data.method = "GetAirports";
            return call("Geo", data, options);
        },

        getAirportById: function(data, options) {
            data = data || {};
            data.method = "GetAirportById";
            return call("Geo", data, options);
        },

        getAirportsByName: function(data, options) {
            data = data || {};
            data.method = "GetAirportsByName";
            return call("Geo", data, options);
        },

        getAirportsByPosition: function(data, options) {
            data = data || {};
            data.method = "GetAirportsByPosition";
            return call("Geo", data, options);
        },

        getCitiesAndAirportsByName: function(data, options) {
            data = data || {};
            data.method = "GetCitiesAndAirportsByName";
            return call("Geo", data, options);
        }

    };

    API.Booking = {

        validateCreditCard: function(data, options) {
            data = data || {};
            data.method = "ValidateCreditCard";
            return call("Booking", data, options);
        },

        getOneWayFlights: function(data, options) {
            data = data || {};
            data.method = "GetOneWayFlights";
            return call("Booking", data, options);
        },

        bookFlight: function(data, options) {
            data = data || {};
            data.method = "BookFlight";
            options = options || {};
            options.type = "POST";
            return call("Booking", data, options);
        }

    };

    API.Review = {

        getAirlineReviews: function(data, options) {
            data = data || {};
            data.method = "GetAirlineReviews";
            return call("Review", data, options);
        },

        reviewAirline: function(data, options) {
            data = data || {};
            data.method = "ReviewAirline";
            options = options || {};
            options.type = "POST";
            return call("Review", data, options);
        }

    };

    window.API = API;

})(jQuery);