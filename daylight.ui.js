//test 설계
daylight.ui = {};
daylight.ui.TEMLATE = {};
daylight.ui.TEMLATE.checkbox = '<div class="day_checkbox {class}"><input type="checkbox" value="{value}" id="input_{name}_{value}" name="input_{name}" value="{value}" {checked}/><label for="input_{name}_{value}"></label></div>';
daylight.ui.TEMLATE.radio = '<div class="day_radio {class}"><input type="radio" value="{value}" id="input_{name}_{value}" name="input_{name}"/><label for="input_{name}_{value}"></label></div>';
daylight.ui.TEMLATE.progress = '<div class="day_progress {class}"><div class="progress_bar {striped} {active}" data-value="{value}" data-minvalue="0" data-maxvalue="100" style="width: {value}%"><span class="annotation">{value}% Complete</span></div></div>';
daylight.ui.TEMLATE.slider = '<div class="day_slider {class}" data-value="40" data-minvalue="0" data-maxvalue="100" ><span class="quantity"></span><span class="thumb thumb_start"></span>{range}</div>';
daylight.ui.checkbox = function(name, option) {
	if(!option)
		option = {};
	option.name = name;	
	if(!option.value) option.value = "";
	if(!option.class) option.class= "";
	option.checked = option.checked ? "checked" : "";
	var template = this.TEMLATE.checkbox;
	return daylight.template(option, template);
};
daylight.ui.radio = function(name, option) {
	if(!option)
		option = {};
	option.name = name;	
	if(!option.value) option.value = "";
	if(!option.class) option.class= "";
	var template = this.TEMLATE.radio;
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
		
	if(option.value === undefined)
		option.value = 40;
	
	var template = this.TEMLATE.progress;
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
	var template =  this.TEMLATE.slider;
	return daylight.template(option, template);	
}
//test Naming
//코드에 thumb, quantity같은 거 있는거 보니 다 test 코드(demo 코드) 같은데 맞지? 그럼 상관없지만 클래스명이 코드에 있는 건 이해안됨.
//이 컴포넌트에서 미리 정의된 클래스명 인가? 
daylight.ui.slider.event = function(element, e, dragDistance) {
	var event = daylight.$Event(e); //event와 같은 이름처럼 제발 예약어 같은 단어는 사용하지 말기.
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
			var max_object = null; //빈객체면 그냥 max_object = {}
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

				//아래 if문 두 개는 함수로 분리할 수도 있는 수준. 그러면서 중복도 없애고.
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

	//return해서 빠져 나갈 코드가 있다면 위로 옮겨서 먼저 체크하고 바로 빠져나가도록 하는 게 더 좋을듯.
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

	var size = thumbs.size();
	if(size == 1) {
		var min = slider.attr("data-minvalue");
		var max = slider.attr("data-maxvalue");
		var value = parseFloat(max) * leftPercentage / 100 + parseFloat(min) * (1 - leftPercentage/ 100);
		slider.attr("data-value", parseInt(value));
		quantity.css("width", parseInt(value) + "%");
	} else if(size > 1) {
		//아래 세줄은 위에 조건문안에 두 줄과 같네?? 하나로 묶을 수도 있을 듯. 
		var min = slider.attr("data-minvalue");
		var max = slider.attr("data-maxvalue");
		var value = parseFloat(max) * leftPercentage / 100 + parseFloat(min) * (1 - leftPercentage/ 100);
		var start = parseFloat(thumbs.o[0].style.left);
		var end = parseFloat(thumbs.o[size - 1].style.left);
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
		if(title.has(clickElement, true).size() >= 1) {
			menu.toggleClass("open", "hidden");
			return;
		}
		if(menu.has(e.target).size() < 1)
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

	if(element_object.size() == 0)
		return;

	if(event.type == "touchstart" || event.type == "mousedown") {
		var draggable_object = daylight(event.target);
			
		if(draggable_object.size() == 0)
			return;

		if(!draggable_object.hasClass("day_draggable"))
			return;

		dragDistance.target = element_object;
		dragDistance.element = element;
		var position = element_object.position();
		dragDistance.stleft = position.left;
		dragDistance.sttop = position.top;
		
	}
	if(!dragDistance.target || dragDistance.target.size() == 0)
		return;
	if(dragDistance.element != element)
		return;
	
	e.preventDefault();
	
	var drag_target = dragDistance.target;
	var x = dragDistance.x + dragDistance.stleft;
	var y = dragDistance.y + dragDistance.sttop;
	if(drag_target.hasClass("draggable_inner")) {
		var parent = drag_target.offsetParent();
		var width = parent.innerWidth();
		var height = parent.innerHeight();
		
		if(x < 0)
			x = 0;
		else if(x + drag_target.outerWidth() > width)
			x = width - drag_target.outerWidth();
		
		if(y < 0)
			y = 0;
		else if(y + drag_target.outerHeight() > height)
			y = height - drag_target.outerHeight();

	}
	drag_target.css("left", x);
	drag_target.css("top", y);
	
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

	if(element == event.target)
		return;
	
	if(event.type == "touchstart" || event.type == "mousedown") {
		var resizable_object = daylight(event.target);
		
		if(!resizable_object.hasClass("day_resizable"))
			return;
			
		dragDistance.target = element_object;
		dragDistance.element = element;
		dragDistance.width = element_object.width();
		dragDistance.height = element_object.height();
	}
	
	
	//앞서 말했지만 return으로 처리되는 건 위로 올려서 먼저 탈출하게 하자
	if(!dragDistance.target || dragDistance.target.size() == 0)
		return;
	if(dragDistance.element != element)
		return;
	var is_resizable_width = false, //길지만 이런 이름들이 더 좋음.
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
	
	if(resize_target.hasClass("resizable_inner")) {
		var parent = resize_target.offsetParent();
		var width = parent.innerWidth();
		var height = parent.innerHeight();
		var pos = resize_target.position();
		if(pos.left + resize_target.outerWidth() > width)
			resize_target.css("width", width - pos.left - (resize_target.outerWidth() - resize_target.innerWidth()));
		
		if(pos.top + resize_target.outerHeight() > height)
			resize_target.css("height", height - pos.top - (resize_target.outerHeight() - resize_target.innerHeight()));

	}
	e.preventDefault();
}
//전반적으로 하드코딩된 데이터들이 너무 많고 함수로 좀더 분리해서 그 함수를 호출하는 식으로 구조 변경하면 좋겠음.
//
daylight.ui.chart = function(name, option) {
	//var option  = option  || {} 와 같은걸까? 
	if(!option)
		option = {};
	option.name = name;
	if(!option.type)
		option.type="circle";
		
	var data = option.data;
	var total = 0;
	for(var i  = 0; i < data.length; ++i) { //자꾸 보여서 또 말하지만 length는 JAVA와 달리 javascript는 매번 계산함으로 미리 계산해둬야 함,
		var type = daylight.checkType(data[i]); //아 check하는 거 뺀거 좋은데.
		if(type == "array") {
			total += data[i][1];
			var name = data[i][0];
			var value = data[i].length == 1 ? name : data[i][1];
			data[i] = {name: name, value: value, scale : data[i][2]};
		}
	}

	if(option.type == "circle") {
		for(var i  = 0; i < data.length; ++i) {
			data[i].pie = [];
			angle = 360 * data[i].value / total;
			if(angle >180) {
				data[i].pie.push({angle1 : 180}); //angle1 은 뭐임..?
				data[i].pie.push({angle1 : angle});
			}else {		
				data[i].pie.push({angle1 : angle});
			}
			data[i].angle = angle;
			data[i].startAngle = i == 0 ? 0 : data[i - 1].startAngle + data[i - 1].angle;
			//으악~!! 이런 데이터가 여기에 갑자기 등장하다니... 밖으로 빼기.
			data[i].color = ["#5491F6", "#DF4A78", "#BF3944", "#DF423F", "#FE9F28","#FFC500", "#D4E14E", "#5376C4"][i];
			data[i].slice = data[i].angle < 180 ? "slice" : "";
			if(!data[i].scale)
				data[i].scale = 1;
		}
	} else if(option.type === "bar-y") {
		option.axis = [];
		var min = option.min || 0;
		var max = option.max || total;
		var piece = option.piece || 10;

		for(var i = 0; i <= piece; ++i) {
			var value = min * i / piece  + max * (piece - i) / piece;
			option.axis.push({"axis_value": value});
		}
		for(var i  = 0; i < data.length; ++i) {
				data[i].percentage = parseInt(1000 *  data[i].value / max) / 10 ;
		}
		option.width = 100 / data.length * 0.6; //별 의미 없는 0.6 , 0.2 이게 뭘 뜻하는지 하나도 모르겠음...주석으로 설명으로 좀더 달아두던가..
		option.margin = 100 / data.length * 0.2;
		option.dist = 100 / piece;
		
	}
	return daylight.template(option, $("#sample .day-chart.chart-" + option.type));
}



daylight(window).load(function() {
	daylight("body").click(function(event) {
		var e = daylight.$Event(event);
		var element = e.target;
		var es = daylight(".day_select").has(element, true);
		for(var i = 0; i < es.size(); ++i) {
			daylight.ui.select.event(es.o[i], event);
		}
	});
	daylight("body").drag(function(element, event, dragDistance) {
		var e = daylight.$Event(event);
		var es = daylight(".day_slider, .day_drag, .day_resize").has(element, true);
		for(var i = 0; i < es.size(); ++i) {
			var element = es.o[i];
			var funcName = [];
			var _callFuncName = [];
			if(daylight.hasClass(element, "day_slider")) _callFuncName.push("slider");
			if(daylight.hasClass(element, "day_drag")) _callFuncName.push("drag");
			if(daylight.hasClass(element, "day_resize")) _callFuncName.push("resize");
			var length = _callFuncName.length;
			for(var j = 0; j < length; ++j)
				daylight.ui[_callFuncName[j]].event(element, event, dragDistance);
				
		}
	});
	daylight(".data-request").each(function(element, index) {
		var type = element.getAttribute("data-type");
		var name = element.getAttribute("data-name");
		var value = element.getAttribute("data-value");
		var className = element.getAttribute("data-class");
		var option = element.getAttribute("data-option");
		if(!option)
			option = {};
		else {
			try {
				option = JSON.parse(option);
			} catch (e) {
				option = {};
			}
		}
		if(value) option.value = value;
		if(className) option.class = className;
		element.outerHTML = daylight.ui[type](name, option);
	});
});