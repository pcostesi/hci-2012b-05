(function($){
    Gootils = window.Gootils || {};

    var getEndpoint = function(endpoint, options){
        var result = [endpoint + "?"];
        for (var key in options) {
            result.push(key + "=" + encodeURIComponent(options[key]));
        };

        return result.join("&");
    };

    Gootils.shorten = function(url, callback){
        var endpoint = "https://www.googleapis.com/urlshortener/v1/url";
        var deferred = $.Deferred();
        var data = {longUrl: url};
        var handler = function(data, textStatus, jqXHR){
            deferred.resolve(data['id'], data['longUrl'], data['id'] + ".qr")
        };

        if (callback){
            deferred.done(callback);
        }

        var xhr = $.ajax({
            type: 'POST',
            contentType: "application/json",
            url: endpoint,
            success: handler,
            data: JSON.stringify(data),
            dataType: "json"
        });

        xhr.error(function(){deferred.reject(url)});
        return deferred.promise();
    };

    Gootils.expand = function(url, callback, full){
        var endpoint = "https://www.googleapis.com/urlshortener/v1/url";
        var deferred = $.Deferred();
        var data = {shortUrl: url};
        if (full){
            data['projection'] = "FULL";
        }
        var handler = function(data, textStatus, jqXHR){
            deferred.resolve(data['longUrl'], data['id'], data)
        };

        if (callback){
            deferred.done(callback);
        }

        var xhr = $.get(endpoint, handler);

        xhr.error(function(){deferred.reject(url)});
        return deferred.promise();    
    }

    Gootils.qr = function(url, options){
        var size = (options && options["size"]) || 100;
        var endpoint = "https://chart.googleapis.com/chart"
        var data = {
            "chs": size + "x" + size,
            "cht": "qr",
            "chl": url,
        };
        return getEndpoint(endpoint, data);
    };

    Gootils.map = function(options){
        var endpoint = "http://maps.google.com/maps/api/staticmap";
        var size = options['width'] + "x" + options['height'];
        if (undefined !== options['size']){
            size = options['size'] + "x" + options['size'];
        }

        var data = {
            center: options['lat'] + "," + options['lng'],
            size: size,
            zoom: options['zoom'] || 8,
            sensor: false,
        };
        return getEndpoint(endpoint, data);
    };


})(jQuery)