
// Create the namespace
MindTrips = window.MindTrips || {}
var MindTrips = MindTrips;


MindTrips.BaseModel = Backbone.Model.extend({});

FlightInfo = Backbone.Model.extend({});
FlightPerson = Backbone.Model.extend({});
FlightCompanie = Backbone.Model.extend({});
Flight = Backbone.Model.extend({});
SelectedFlights = Backbone.Model.extend({});
Flights = Backbone.Collection.extend({
	model:Flight
});



MindTrips.BaseCollection = Backbone.Collection.extend({});


MindTrips.Airline = MindTrips.BaseModel.extend({});
MindTrips.Reviews = MindTrips.BaseModel.extend({});
MindTrips.City = MindTrips.BaseModel.extend({});
