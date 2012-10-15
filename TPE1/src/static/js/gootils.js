(function($){
	Gootils = window.Gootils || {};
	
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
	    return deferred;
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
		return deferred;	
	}

	Gootils.qr = function(url, options){
		var size = (options && options["size"]) || 300;
		var endpoint = "https://chart.googleapis.com/chart"
		var data = {
			"chs": size + "x" + size,
			"cht": "qr",
			"chl": url,
		};
		var result = [endpoint + "?"];
		for (var key in data) {
			result.push(key + "=" + encodeURIComponent(data[key]));
		};

		return result.join("&");
	};



})(jQuery)