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