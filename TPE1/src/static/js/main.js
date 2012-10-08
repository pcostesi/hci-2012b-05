// Create the namespace
MindTrips = window.MindTrips || {}

//markup = $('#_template-test').html().replace(/\s\s+/g, '');
//template = Mustache.compile(markup);
//$("#view").html(template({world:text}));
$(function(){
	$("[data-date-picker]").each(function(){
		$(this).datepicker();
	});
	$("[name='round-trip' value='round']").click(addHiddenToReturn);
	$("[name='round-trip' value='one-way']").click(removeHiddenToReturn);
	$("#go-dates").change(checkDates);
	$("#return-tags").change(checkOrigin);
})
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