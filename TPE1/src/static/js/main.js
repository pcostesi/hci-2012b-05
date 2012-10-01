// Create the namespace
MindTrips = window.MindTrips || {}

markup = $('#_template-test').html().replace(/\s\s+/g, '');
template = Mustache.compile(markup);
var text = "";
for (var i = 0; i < 1000; i++) {
	text += " lorem ipsum ";
}


$("#view").html(template({world:text}));
$("#dates").datepicker();