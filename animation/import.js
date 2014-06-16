(function(daylight) {
	var animation = daylight.animation;
	function errorMessage(message) {
		alert(message);
		return;
	}
	function getStyle(properties) {
		var style = "";
		properties.position = properties.position || "relative";
		for(var property in properties) {
			style += property +":" + properties[property] +";";
		}
		return style;
	}
	function createLayer(timeline, element, json) {
		var motions = json.ms || json.motions || 0;
		
		if(!motions)
			return;
			
		var layer = timeline.createLayer(element);
		var totalTime = json.tt || json.totalTime || 0;
		var properties = json.p || json.p || {};
		var style = json.s || json.style || {};
		
		layer.motions = motions;
		layer.totalTime = totalTime < timeline.totalTime ? timeline.totalTime : totalTime;
		if(timeline.totalTime < layer.totalTime) {
			timeline.totalTime = layer.totalTime;
		}
		if(style) {
			var motions = {
				time: 0,
				fill: "add"
			}
			for(var property in style) {
				motions[property] = style[property];
			}
			layer.addMotion(motions);
		}

	}

	function createElement(json) {
		
		var name = json.n || json.name;
		if(!name)
			return errorMessage("잘못된 형식입니다.");
			
		var id = json.i || json.id;
		var className = json.cn || json.className;
		var style = json.s || json.style || {};
		
		var element = daylight.createElement(name, {id:id, class:className});
		style = getStyle(style);
		
		element.setAttribute("style", style);
		element.setAttribute("data-style", style);
	
		return element;
	}
	function create(json, timeline) {
		if(!timeline)
			return;
					
		var element = createElement(json);
		
		createLayer(timeline, element, json);
		createchildNodes(json, timeline);
		
		
		return element;
	}
	function createchildNodes(json, timeline) {
		var childNodes = json.cns || json.childNodes || 0;
		var childLength = childNodes.length;
		var value = "";
		
		for(var i = 0; i < childLength; ++i) {
			value = childNodes[i];
			if(typeof value !== "object")
				element.insertAdjacentHTML("beforeend", value);
			else
				element.appendChild(create(childNodes[i], timeline));
		}	
	}
	
	animation.importJSON = function(json) {

		
		var name = json.n || json.name;
		if(!name)
			return errorMessage("잘못된 형식입니다.");
			

		var scenes = json.ss || json.scenes || [0];
		
		var element = createElement(json);
		var timeline = new daylight.Timeline(element);
		timeline.scenes = scenes;
		
		create(json, timeline);
		createchildNodes(json, timeline);
		return timeline;
	}
})(daylight);