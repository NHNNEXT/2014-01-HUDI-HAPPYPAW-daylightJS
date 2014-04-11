//test 설계
daylight.ui = {};
daylight.ui.checkbox = function(name, option) {
	if(!option)
		option = {};
	var template = daylight("#sample .day_checkbox");
	return daylight.template({name : name, "class":option.class}, template);
};
daylight.ui.progress = function(name, option) {
	if(!option)
		option = {};
	var template = daylight("#sample .day_progress");
	return daylight.template({name : name, "class":option.class}, template);	
}
daylight.ui.slider = function(name, option) {
	if(!option)
		option = {};
	var template = daylight("#sample .day_slider");
	return daylight.template({name : name, "class":option.class}, template);	
}
//test Naming
daylight.ui.slider.event = function(element, e, dragDistance) {
	var event = daylight.$Event(e);
	var slider = daylight(element);
	var type = event.type;
	var thumb = slider.find(".thumb");
	var left = parseFloat(thumb.css("left"));
	var width = slider.width();
	if(!left)
		left = 0;

	if(type === "mousedown") {
		dragDistance.stleft = left;
		
	}
	left = dragDistance.stleft + dragDistance.x;

	leftPercentage = left / width * 100
	if(leftPercentage > 100)
		leftPercentage = 100;
	else if(leftPercentage < 0)
		leftPercentage = 0;
	
	thumb.css("left", leftPercentage + "%");
	
		
	
}
daylight.ui.select = function(name, option) {
	
}

daylight("body").click(function() {
	
});

daylight("body").drag(function(element, event, dragDistance) {
	var e = daylight.$Event(event);
	var es = daylight(".day_slider").has(element, true);
	for(var i = 0; i < es.length; ++i) {
		daylight.ui.slider.event(es[i], event, dragDistance);
	}
	
});