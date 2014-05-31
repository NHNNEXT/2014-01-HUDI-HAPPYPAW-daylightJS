//공사중...

//test 설계
daylight.ui = {};
daylight.ui.TEMPLATE = {};
daylight.ui.TEMPLATE.checkbox = '<div class="day_checkbox {class}"><input type="checkbox" value="{value}" id="input_{name}_{value}" name="input_{name}" value="{value}" {checked}/><label for="input_{name}_{value}"></label></div>';
daylight.ui.TEMPLATE.radio = '<div class="day_radio {class}"><input type="radio" value="{value}" id="input_{name}_{value}" name="input_{name}"/><label for="input_{name}_{value}"></label></div>';
daylight.ui.TEMPLATE.progress = '<div class="day_progress {class}"><div class="progress_bar {striped} {active}" data-value="{value}" data-minvalue="0" data-maxvalue="100" style="width: {value}%"><span class="annotation">{value}% Complete</span></div></div>';
daylight.ui.TEMPLATE.slider = '<div class="day_slider {class}" data-value="40" data-minvalue="0" data-maxvalue="100" ><span class="quantity"></span><span class="thumb thumb_start"></span>{range}</div>';
daylight.ui.TEMPLATE.chart = {};
daylight.ui.TEMPLATE.chart.circle= '<div class="day-chart chart-circle">			<div class="day-chart-data-labels">				{data}				<div class="label">					<span class="label-color" style="background:{color}"></span><span class="label-title">{name}</span>				</div>							{/data}			</div>			<div class="day-chart-pies">			{data}			<div class="day-chart-data {slice}"  data="{value}" style="-webkit-transform:rotate({startAngle}deg) scale({scale});">				{pie}				<div class="pie" style="-webkit-transform:rotate({angle1}deg); background:{color};"></div>				{/pie}			</div>			{/data}			</div>		</div>';

daylight.ui.EVENT = {};
daylight.ui.EVENT.resize = new Event('resize');
daylight.ui.EVENT.drag = new Event('drag');
daylight.ui.EVENT.change = new Event('change');
//daylight.ui.EVENT.drag = new Event('drag');


daylight.ui.templateHTML = function(option, template) {
	var temp = daylight.template(option, template);
	var element = daylight.parseHTML(temp);
	return element[0];
}
daylight.ui.checkbox = function(name, option) {
	option = option || {};
	option.name = name;
	if(!option.hasOwnProperty("value")) option.value = "";
	if(!option.hasOwnProperty("class")) option.class= "";
	option.checked = option.checked ? "checked" : "";
	var template = this.TEMPLATE.checkbox;
	return this.templateHTML(option, template);
};
daylight.ui.radio = function(name, option) {
	option = option || {};
	option.name = name;	
	if(!option.hasOwnProperty("value")) option.value = "";
	if(!option.hasOwnProperty("class")) option.class= "";
	var template = this.TEMPLATE.radio;
	return this.templateHTML(option, template);
};
daylight.ui.progress = function(name, option) {
	option = option || {};
	option.name = name;
	if(option.animation)
		option.active = "active";
	if(option.stripe)
		option.striped = "progress_striped";
		
	if(option.value === undefined)
		option.value = 40;
	
	var template = this.TEMPLATE.progress;
	return this.templateHTML(option, template);
}
daylight.ui.slider = function(name, option) {
	option = option || {};
	option.name = name;
	option.range = "";
	if(option.type === "range") {
		option.range = '<span class="thumb thumb_end"></span>';
	}
	var template =  this.TEMPLATE.slider;
	return this.templateHTML(option, template);
}
//test Naming
daylight.ui.slider.event = function(e) {
	var element = e.dragObject;
	var o_event = daylight.$Event(e);
	var dragDistance = e.dragInfo;

	var slider = daylight(element);
	var type = o_event.type;
	var thumbs = slider.find(".thumb");
	var quantity = slider.find(".quantity");
	var width = slider.width();

	if(type === "dragstart") {
		var x = slider.offset().left;
		var percentage = (o_event.pos().pageX - x) * 100 / width;
		var etarget = daylight(o_event.target);
		dragDistance.element = element;
		console.log(etarget.o[0]);
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

	var size = thumbs.size();
	if(size == 1) {
		var min = slider.attr("data-minvalue");
		var max = slider.attr("data-maxvalue");
		var value = parseFloat(max) * leftPercentage / 100 + parseFloat(min) * (1 - leftPercentage/ 100);
		slider.attr("data-value", parseInt(value));
		quantity.css("width", parseInt(value) + "%");
	} else if(size > 1) {
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
	option = option || {};
	option.name = name;
	var is_selected_one = false;
	
	if(!option.multiple) option.multiple = "";	
	var options = option.options = option.options || [];
	var optionsLen = options.length;
	for(var i = 0; i < optionsLen; ++i) {
		var opt = options[i];
		if(typeof opt != "object")
			options[i] = {text : opt, value : opt};
		else if(opt.value === undefined)
			opt.text = opt.value;
		else if(opt.text === undefined)
			opt.value = opt.text;
		
		if(opt.selected === undefined)
			opt.selected = "";
		else
			is_selected_one = true;
	}
	option.selected_text = options[0] ? options[0].text : "";
	if(!is_selected_one &&  options[0]) options[0].selected = "selected";
	var template = daylight("#sample .day_select");
	
	var element = this.templateHTML(option, template);
	
	$(element).find("select").on("change", function() {
		this.dispatchEvent(daylight.ui.EVENT.change);
		//daylight.ui.select.event(this);
	});
	return element;
}
daylight.ui.select.event = function(element, e) {
	var o_event = daylight.$Event(e);
	var select = daylight(element);
	var menu = select.find(".select_menu");
	var type = o_event.type;
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
	option = option || {};
	option.name = name;
	
	var template = daylight("#sample .day_drag");
	return daylight.template(option, template);
}
daylight.ui.drag.event = function(e) {
	var element_object = daylight(e.dragObject);
	var o_event = daylight.$Event(e);
	var dragDistance = e.dragInfo;

	if(element_object.size() == 0)
		return;

	if(o_event.type == "touchstart" || o_event.type == "mousedown") {
		var draggable_object = daylight(o_event.target);
			
		if(draggable_object.size() == 0)
			return;

		if(!draggable_object.hasClass("day_draggable"))
			return;

		dragDistance.target = element_object;//바뀌는 대상
		dragDistance.element = element;
		dragDistance.change_target = draggable_object;
		var position = element_object.position();
		dragDistance.stleft = parseFloat(element_object.css("left")) || position.left;
		dragDistance.sttop = parseFloat(element_object.css("top")) || position.top;
		
	}
	if(!dragDistance.target || dragDistance.target.size() == 0)
		return;
	if(!dragDistance.target.equal(element_object))
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
	option = option || {};
	option.name = name;
	
	var template = daylight("#sample .day_resize");
	return daylight.template(option, template);
}
daylight.ui.resize.event = function(e) {
	var element_object = daylight(e.dragObject);
	var o_event = daylight.$Event(e);
	var dragDistance = e.dragInfo;

	
	if(o_event.type == "dragstart") {
		var resizable_object = daylight(o_event.target);
		
		if(!resizable_object.hasClass("day_resizable"))
			return;
			
		dragDistance.target = element_object;
		//dragDistance.element = element;
		dragDistance.change_target = resizable_object;
		dragDistance.width = element_object.width();
		dragDistance.height = element_object.height();
		dragDistance.is_resizable = true;
	}
	if(!dragDistance.is_resizable)
		return;
		
	if(!dragDistance.target || dragDistance.target.size() == 0)
		return;


	if(!dragDistance.target.equal(element_object))
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

	dragDistance.target.trigger("resize");
	
	//var x = dragDistance.x
	var currentStyle = resize_target.css();
	
	//test
	var transform = currentStyle["transform"] || currentStyle["-webkit-transform"];
	var x = dragDistance.x;
	var y = dragDistance.y;
	if(transform.indexOf("matrix") != -1) {
		var matrix = daylight.parseJSON(transform.replace("matrix(", "[").replace(")", "]"));
		var m = matrix;
		var a = [dragDistance.x , dragDistance.y, 0];
		mat2d.invert(m,m);
		var xy = [m[0] * a[0] + m[2] * a[1] + m[4] * a[2], m[1] * a[0] + m[3] * a[1] + m[5] * a[2]];
		x = xy[0];
		y = xy[1];
		console.log(x, y);
	}
	if(is_resizable_width) resize_target.css("width", x + dragDistance.width);
	if(is_resizable_height) resize_target.css("height",  y + dragDistance.height);
	
	e.preventDefault();
	

	
	if(!resize_target.hasClass("resizable_inner"))
		return;
		
	var parent = resize_target.offsetParent();
	var width = parent.innerWidth();
	var height = parent.innerHeight();
	var pos = resize_target.position();
	if(pos.left + resize_target.outerWidth() > width)
		resize_target.css("width", width - pos.left - (resize_target.outerWidth() - resize_target.innerWidth()));
	
	if(pos.top + resize_target.outerHeight() > height)
		resize_target.css("height", height - pos.top - (resize_target.outerHeight() - resize_target.innerHeight()));


}
daylight.ui.chart = function(name, option) {
	option = option || {};
	option.name = name;
	if(!option.type)
		option.type="circle";
		
	var datas = option.data;
	var total = 0;
	var datasLength = datas.length;
	for(var i  = 0; i < datasLength; ++i) {
		var data = datas[i];
		var type = daylight.checkType(data);
		if(type == "array") {
			total += data[1];
			var name = data[0];
			var value = data.length == 1 ? name : data[1];
			datas[i] = {name: name, value: value, scale :data[2]};
		} else if(type === "number") {
			total += data;
			var name = data;
			var value = data;
			datas[i] = {name: name, value: value, scale :0};			
		}
	}

	if(option.type == "circle") {
		for(var i  = 0; i < datasLength; ++i) {
			var data = datas[i];
			data.pie = [];
			angle = 360 *data.value / total;
			if(angle >180) {
				data.pie.push({angle1 : 180});
				data.pie.push({angle1 : angle});
			}else {
				data.pie.push({angle1 : angle});
			}
			data.angle = angle;
			data.startAngle = i == 0 ? 0 : datas[i - 1].startAngle + datas[i - 1].angle;

			//test용.
			data.color = ["#5491F6", "#DF4A78", "#BF3944", "#DF423F", "#FE9F28","#FFC500", "#D4E14E", "#5376C4"][i];

			data.slice =data.angle < 180 ? "slice" : "";
			if(!data.scale)
				data.scale = 1;
				
		}
		return daylight.template(option, daylight.ui.TEMPLATE.chart.circle);
	} else if(option.type === "bar-y") {
		option.axis = [];
		var min = option.min || 0;
		var max = option.max || total;
		var piece = option.piece || 10;

		for(var i = 0; i <= piece; ++i) {
			var value = min * i / piece  + max * (piece - i) / piece;
			option.axis.push({"axis_value": value});
		}
		for(var i  = 0; i < datasLength; ++i) {
			var data = datas[i];
			data.percentage = parseInt(1000 * data.value / max) / 10 ;
		}
		option.width = 100 / datasLength * 0.6;//가로 크기를 60%로 설정 하지만 60%도 상당히 크다.. max-width를 정하자.
		option.margin = 100 / datasLength * 0.2;//좌우 마진을 20%로 설정
		option.dist = 100 / piece;//y축의 간격이다. 갯수만큼 나눈다.
	}
	return daylight.template(option, $("#sample .day-chart.chart-" + option.type));
}

daylight.UI = {};


