
// Create the namespace
MindTrips = window.MindTrips || {}
var MindTrips = MindTrips;


(function($){
    $.widget("ui.divcomplete", $.ui.autocomplete, {
        _renderItem: function( ul, item ){
            return $("<li>").
                data( "item.autocomplete", item ).
                append($("<a>").html(item.label)).
                appendTo(ul);
        },
    });

    $.widget("ui.mapcomplete", $.ui.autocomplete, {
		_renderItem: function( ul, item ){
			var url = Gootils.map({
				lat: item.choice.lat,
				lng: item.choice.lng,
				zoom: item.choice.zoom || 9,
				size: 100,
			});
			var main = $("<div class='mapcomplete'>");
			var content = $("<div class='mapcomplete-content'></div>");
			main.html("<img src='" + url + "'></img>");
			main.append(content.html(item.label));
			content.append("<div class='clearfix'></div>");
            return $("<li>").
                data( "item.autocomplete", item ).
                append($("<a>").append(main)).
                appendTo(ul);
        },
    });
})(jQuery);


/* OmniSearch is a router-trigger. It does HEAVY use of API.Misc and such,
 * and it's also highly coupled with MindTrips.AppRouter. Avoid touching this.
 */
MindTrips.OmniSearch = function(jqSelector){

    jqSelector.addClass("omnisearch");
    var airlineTpl = Mustache.compile('<div><img src="{{&logo}}" alt="{{name}}"></img>{{name}}</div>');
    var cityTpl = Mustache.compile('<div class="mapcomplete"><img src="{{&url}}" alt="{{name}} - ({{cityId}})"></img><div class="mapcomplete-content">{{name}}</div></div>');
    
    var airlineToListItem = function(elem){
        var label = airlineTpl(elem);
        var choice = {route: "/airline/" + elem['airlineId']};
        var value = elem['name'];
        return {label: label, choice: choice, value: value};
    };
    var cityToListItem = function(elem){
        var label = cityTpl({
            url: Gootils.map({
                size: 64,
                lat: elem['latitude'],
                lng: elem['longitude'],
                zoom: 9,
            }),
            name: elem['name'],
            cityId: elem['cityId'],
        });
        var choice = {route: "/city/" + elem['cityId']};
        var value = elem['name'];
        return {label: label, choice: choice, value: value};
    };

    var source = function(request, response){
        var airlines = API.Misc.getAirlinesByName({name: request.term});;
        var cities = API.Geo.getCitiesByName({name: request.term});
        var cities = cities.pipe(function(data){
            return _.map(data['cities'], cityToListItem);
        });
        var airlines = airlines.pipe(function(data){
            return _.map(data['airlines'], airlineToListItem);
        });

        $.when(airlines, cities).done(function(airlines, cities){
            var result = [].concat(airlines, cities)
            response(result);
        });
    };

    var select = function(event, ui){
        if ("route" in ui.item.choice){
            MindTrips.router.navigate(ui.item.choice.route, true);
        }
        return false;
    };

    jqSelector.divcomplete({
        source: source,
        select: select,
        delay: 300,
        appendTo: $("#header"),
    });
};
