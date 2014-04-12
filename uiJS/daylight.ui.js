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
	option.name = name;
	if(option.animation)
		option.active = "active";
	if(option.stripe)
		option.striped = "progress_striped";
		
	if(!option.value)
		option.value = 40;
	
	var template = daylight("#sample .day_progress");
	return daylight.template(option, template);	
}
daylight.ui.slider = function(name, option) {
	if(!option)
		option = {};
	option.name = name;
	option.range = "";
	if(option.type === "range") {
		option.range = '<span class="thumb thumb_end"></span>';
	}
	var template = daylight("#sample .day_slider");
	return daylight.template(option, template);	
}
//test Naming
daylight.ui.slider.event = function(element, e, dragDistance) {
	var event = daylight.$Event(e);
	var slider = daylight(element);
	var type = event.type;
	var thumbs = slider.find(".thumb");
	var quantity = slider.find(".quantity");
	var width = slider.width();

	if(type === "mousedown") {
		var x = slider.offset().left;
		var percentage = (event.pos().pageX - x) * 100 / width;
		var etarget = daylight(event.target);
		if(etarget.hasClass("thumb")) {
			dragDistance.target = etarget;
			dragDistance.index = thumbs.index(etarget);
		} else {
			var min_value = 10000;
			var min_object = null;
			var min_index = 1000;
			var min_left = 0;
					
			var max_value = 10000;
			var max_object = null;
			var max_index = -10000;
			var max_left = 0;
			
			thumbs.each(function(e, index) {
				var left = parseFloat(this.style.left);
				if(!left)
					left = 0;
					
				var dist = percentage - left;
				//dist < 0 누른 곳보다 뒤에 있다.
				//click position < thumb position
				//min_value click_position 위에 있는 최소값
				console.log(dist);
				if(min_value >= Math.abs(dist) && dist <= 0 && min_index > index) {
					min_value = dist;
					min_object = this;
					min_index = index;
					min_left = left;
				}
				if(max_value >= Math.abs(dist) && dist >= 0 && max_index < index ) {
					max_value = dist;
					max_object = this;
					max_index = index;
					max_left = left;
				}
			});
			if(!max_object || Math.abs(max_value) > Math.abs(min_value)) {
				dragDistance.index = min_index;
				dragDistance.target = daylight(min_object);
			} else {
				dragDistance.index = max_index;
				dragDistance.target = daylight(max_object);
			}				

		}
		dragDistance.stleft = percentage * width / 100;
		
	}
	var thumb = dragDistance.target;
	if(!thumb)
		return;
		
	
	var left = parseFloat(thumb.css("left"));
	if(!left)
		left = 0;
		
		
	left = dragDistance.stleft + dragDistance.x;

	leftPercentage = left / width * 100;
	
	if(leftPercentage > 100)
		leftPercentage = 100;
	else if(leftPercentage < 0)
		leftPercentage = 0;
	

	var next = thumbs.o[dragDistance.index + 1];
	var prev = thumbs.o[dragDistance.index - 1];
	if((!next || !(next = parseFloat(next.style.left)) || (next >= leftPercentage))
	&& (!prev || !(prev = parseFloat(prev.style.left)) || (prev <= leftPercentage)))
		thumb.css("left", leftPercentage + "%");

	
	if(thumbs.size == 1) {
		var min = slider.attr("data-minvalue");
		var max = slider.attr("data-maxvalue");
		var value = parseFloat(max) * leftPercentage / 100 + parseFloat(min) * (1 - leftPercentage/ 100);
		slider.attr("data-value", parseInt(value));
		quantity.css("width", parseInt(value) + "%");
	} else if(thumbs.size > 1) {
		var min = slider.attr("data-minvalue");
		var max = slider.attr("data-maxvalue");
		var value = parseFloat(max) * leftPercentage / 100 + parseFloat(min) * (1 - leftPercentage/ 100);
		var start = parseFloat(thumbs.o[0].style.left);
		var end = parseFloat(thumbs.o[thumbs.size - 1].style.left);
		if(!start)
			start = 0;
		if(!end)
			end = 0;
		slider.attr("data-value1", parseInt(start));
		slider.attr("data-value2", parseInt(end));
		quantity.css("width", (end - start) + "%");
		quantity.css("left", start + "%");
	}
}
daylight.ui.select = function(name, option) {
	if(!option)
		option = {};
	option.name = name;
	var template = daylight("#sample .day_select");
	return daylight.template(option, template);
}
daylight.ui.select.event = function(element, e) {
	var event = daylight.$Event(e);
	var select = daylight(element);
	var menu = select.find(".select_menu");
	var type = event.type;
	var selectElement = select.find("select");
	var title = select.find(".selected_text .title");
	var options = selectElement.o[0].options;
	if(type == "click") {
		var clickElement = e.target;
		if(title.has(clickElement, true).length >= 1) {
			menu.toggleClass("open");
			return;
		}
		if(menu.has(e.target).length < 1)
			return;
		
		var value = clickElement.getAttribute("data-value");
		menu.children().removeClass("selected");
		daylight.addClass(clickElement, "selected");
		for(var i = 0; i < options.length; ++i) {
			var option = options[i];
			option.selected = option.value === value;
			if(option.selected)
				title.find(".text").text(option.innerText);
		}
		menu.removeClass("open");
	}
	
	//for(var i = 0; i < 
}
daylight("body").click(function(event) {
	var e = daylight.$Event(event);
	var element = e.target;
	var es = daylight(".day_select").has(element, true);
	for(var i = 0; i < es.length; ++i) {
		daylight.ui.select.event(es[i], event);
	}
});
daylight("body").drag(function(element, event, dragDistance) {
	var e = daylight.$Event(event);
	var es = daylight(".day_slider").has(element, true);
	for(var i = 0; i < es.length; ++i) {
		daylight.ui.slider.event(es[i], event, dragDistance);
	}
});