// Create the namespace
MindTrips = window.MindTrips || {}

//markup = $('#_template-test').html().replace(/\s\s+/g, '');
//template = Mustache.compile(markup);
//$("#view").html(template({world:text}));
$(function(){
	$("input[data-date-picker]").each(function(){
		$(this).datepicker();
	});
	$("input[name='round-trip' value='round']").click(addHiddenToReturn);
	$("input[name='round-trip' value='one-way']").click(removeHiddenToReturn);

})