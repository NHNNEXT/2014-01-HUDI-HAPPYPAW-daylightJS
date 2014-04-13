//test 설계
daylight.ui = {};
daylight.ui.TEMLATE = {};
daylight.ui.TEMLATE.checkbox = '<div class="day_checkbox {class}"><input type="checkbox" value="{value}" id="input_{name}_{value}" name="input_{name}"/><label for="input_{name}_{value}"></label></div>';
daylight.ui.TEMLATE.progress = '<div class="day_progress {class}"><div class="progress_bar {striped} {active}" data-value="{value}" data-minvalue="0" data-maxvalue="100" style="width: {value}%"><span class="annotation">{value}% Complete</span></div></div>';
		
daylight.ui.checkbox = function(name, option) {
	if(!option)
		option = {};
	option.name = name;	
	if(!option.value) option.value = "";
	if(!option.class) option.class= "";
	var template = this.TEMLATE.checkbox;
	return daylight.template(option, template);
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
	
	var template = this.TEMLATE.progress;;
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

	if(type === "mousedown" || type === "touchstart") {
		var x = slider.offset().left;
		var percentage = (event.pos().pageX - x) * 100 / width;
		var etarget = daylight(event.target);
		dragDistance.element = element;
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
				//click position < thumb 
				//min_value click_position 위에 있는 최소값
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
	if(dragDistance.element != element)
		return;
		
	
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
	if(!option.multiple) option.multiple = "";
	if(!option.options)
		option.options = [];
	var is_selected_one = false;
	for(var i = 0; i < option.options.length; ++i) {
		var opt = option.options[i];
		if(typeof opt != "object")
			option.options[i] = {text : opt, value : opt};
		else if(opt.value === undefined)
			opt.text = opt.value;
		else if(opt.text === undefined)
			opt.value = opt.text;
		
		if(opt.selected === undefined)
			opt.selected = "";
		else
			is_selected_one = true;
	}
	option.selected_text = option.options[0] ? option.options[0].text : "";
	if(!is_selected_one &&  option.options[0]) option.options[0].selected = "selected";
	var template = daylight("#sample .day_select");
	return daylight.template(option, template);
}
daylight.ui.select.event = function(element, e) {
	var event = daylight.$Event(e);
	var select = daylight(element);
	var menu = select.find(".select_menu");
	var type = event.type;
	var selectElement = select.find("select");
	var title = select.find(".selected_text");
	var options = selectElement.o[0].options;
	if(type == "click") {
		var clickElement = e.target;
		if(title.has(clickElement, true).size >= 1) {
			menu.toggleClass("open", "hidden");
			return;
		}
		if(menu.has(e.target).size < 1)
			return;
		
		var value = clickElement.getAttribute("data-value");
		menu.children().removeClass("selected");
		daylight.addClass(clickElement, "selected");
		for(var i = 0; i < options.length; ++i) {
			var option = options[i];
			option.selected = option.value === value;
			if(option.selected) {
				console.log("selected");
				title.find(".text").text(option.innerText);
			}
		}
		menu.removeClass("open");
		menu.addClass("hidden");
	}
}
daylight.ui.drag = function(name, option) {
	if(!option)
		option = {};
	option.name = name;
	
	
	var template = daylight("#sample .day_drag");
	return daylight.template(option, template);
}
daylight.ui.drag.event = function(element, e, dragDistance) {
	var element_object = daylight(element);
	var event = daylight.$Event(e);

	if(element_object.size == 0)
		return;

	if(event.type == "touchstart" || event.type == "mousedown") {
		var draggable_object = daylight(event.target);
		
	
		if(draggable_object.size == 0)
			return;
		

		if(!draggable_object.hasClass("day_draggable"))
			return;


			
		dragDistance.target = element_object;
		var position = element_object.position();
		dragDistance.element = element;
		dragDistance.stleft = position.left;
		dragDistance.sttop = position.top;
		

	}
	if(!dragDistance.target || dragDistance.target.size == 0)
		return;
	if(dragDistance.element != element)
		return;

	var drag_target = dragDistance.target;
	drag_target.css("left", dragDistance.x + dragDistance.stleft);
	drag_target.css("top",  dragDistance.y + dragDistance.sttop);
	
	//x : 이동한 좌표의 크기
	//y : 이동한 좌표의 크기
	//stx , sty 내가 처음에 누른 위치 : 페이지 기준
	//stleft, sttop : 상대기준으로 position
	//stx - stleft 간격 x
	//sty - sttop : 간격 y
	e.preventDefault();
}
daylight.ui.resize = function(name, option) {
	if(!option)
		option = {};
	option.name = name;
	
	
	var template = daylight("#sample .day_resize");
	return daylight.template(option, template);
}
daylight.ui.resize.event = function(element, e, dragDistance) {
	var element_object = daylight(element);
	var event = daylight.$Event(e);

	if(element_object.size == 0)
		return;

	if(event.type == "touchstart" || event.type == "mousedown") {
		var resizable_object = daylight(event.target);
		
	
		if(resizable_object.size == 0)
			return;
		

		if(!resizable_object.hasClass("day_resizable"))
			return;
			
		dragDistance.target = element_object;
		dragDistance.element = element;
		dragDistance.width = element_object.width();
		dragDistance.height = element_object.height();
	}
	if(!dragDistance.target || dragDistance.target.size == 0)
		return;
	if(dragDistance.element != element)
		return;
	var is_resizable_width = false,
		is_resizable_height = false;
	var resize_target = dragDistance.target;
	
	
	if(resize_target.hasClass("resizable_ns"))
		is_resizable_height = true;
	else if(resize_target.hasClass("resizable_ew"))
		is_resizable_width = true;
	else
		is_resizable_width = is_resizable_height = true;
		
	

	if(is_resizable_width) resize_target.css("width", dragDistance.x + dragDistance.width);
	if(is_resizable_height) resize_target.css("height",  dragDistance.y + dragDistance.height);
	e.preventDefault();
}
daylight("body").click(function(event) {
	var e = daylight.$Event(event);
	var element = e.target;
	var es = daylight(".day_select").has(element, true);
	for(var i = 0; i < es.size; ++i) {
		daylight.ui.select.event(es.o[i], event);
	}
});
daylight("body").drag(function(element, event, dragDistance) {
	var e = daylight.$Event(event);
	var es = daylight(".day_slider").has(element, true);
	for(var i = 0; i < es.size; ++i) {
		daylight.ui.slider.event(es.o[i], event, dragDistance);
	}
	es = daylight(".day_drag").has(element, true);
	for(var i = 0; i < es.size; ++i) {
		daylight.ui.drag.event(es.o[i], event, dragDistance);
	}
	es = daylight(".day_resize").has(element);
	for(var i = 0; i < es.size; ++i) {
		daylight.ui.resize.event(es.o[i], event, dragDistance);
	}
});

daylight("body").dragstart(function(e) {
	var event = daylight.$Event(e);
	var element = event.target;
	es = daylight(".day_draggable, .day_resizable").has(element, true);
	if(es.size > 0) {
		e.preventDefault();
		return false;
	}
});
daylight(window).load(function() {
	daylight(".data-request").each(function(e, index) {
		var type = e.getAttribute("data-type");
		var name = e.getAttribute("data-name");
		var value = e.getAttribute("data-value");
		var className = e.getAttribute("data-class");
		e.outerHTML = daylight.ui[type](name, {value : value, class:className});
	});
});