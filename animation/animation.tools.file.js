tools.file = {
	loadJSONTemplate: '<div class="day-tool day-tool-dialog day-tool-load"><h1>LOAD</h1><textarea></textarea><div class="day-btn-area"><button class="day-btn day-btn-load">Load</button><button class="day-btn day-btn-cancel">Cancel</button></div></div>',
	saveJSONTemplate: '<div class="day-tool day-tool-dialog day-tool-save"><h1>SAVE</h1><textarea></textarea><div class="day-btn-area"><button class="day-btn day-btn-cancel">Cancel</button></div></div>',
};
tools.file.init = function(){
	daylight("body").append(this.loadJSONTemplate);
	daylight("body").append(this.saveJSONTemplate);
	daylight(".day-tool.day-tool-load").click(function(e) {
		var dlLoadArea = $(this);
		var eTarget = e.target;
		var dlTarget = daylight(eTarget);
		if(dlTarget.hasClass("day-btn-load")) {
			var dlTextarea = dlLoadArea.find("textarea");
			var json = dlTextarea.val();
			dlTextarea.val("");
			try {
				tools.file.loadJSON(json);
				dlLoadArea.removeClass("show");
			} catch(e) {
				alert("잘못된 형식입니다.");
			}
		} else if(dlTarget.hasClass("day-btn-cancel")) {
			dlLoadArea.find("textarea").val("");
			dlLoadArea.removeClass("show");
		}
	});
	daylight(".day-tool.day-tool-save").click(function(e) {
		var dlLoadArea = $(this);
		var eTarget = e.target;
		var dlTarget = daylight(eTarget);
		if(dlTarget.hasClass("day-btn-cancel")) {
			dlLoadArea.find("textarea").val("");
			dlLoadArea.removeClass("show");
		}
	});
}
tools.file.getStyle = function(properties) {
	var style = "";
	properties.position = properties.position || "relative";
	for(var property in properties) {
		style += property +":" + properties[property] +";";
	}
	return style;
}
tools.file.createElement = function(timeline, json) {
	var element = daylight.createElement(json.name, {id:json.id, class:json.className});
	
	if(json.hasOwnProperty("motions")) {
		tools.file.createLayer(timeline, element, json);
	}
	
	var properties = json.style || {};
	var style = this.getStyle(properties);
	
	element.setAttribute("style", style);
	element.setAttribute("data-style", style);	
	
	if(!json.hasOwnProperty("childNodes"))
		return element;

	var childNodes = json.childNodes;
	var childLength = childNodes.length;
	var value = "";
	for(var i = 0; i < childLength; ++i) {
		value = json.childNodes[i];
		if(typeof value !== "object")
			element.insertAdjacentHTML("beforeend", value);
		else
			element.appendChild(this.createElement(timeline, json.childNodes[i]));
	}

	return element;
}
tools.file.createLayer = function(timeline, element, json) {
	var layer = timeline.createLayer(element);
	if(json.motions) {
		layer.motions = json.motions;
		layer.totalTime = json.totalTime < timeline.totalTime ? timeline.totalTime : json.totalTime;
		if(timeline.totalTime < layer.totalTime) {
			timeline.totalTime = layer.totalTime;
		}
		layer.properties = json.properties || [];
		if(json.style) {
			var motions = {
				time: 0,
				fill: "add"
			}
			for(var property in json.style) {
				motions[property] = json.style[property];
			}
			layer.addMotion(motions);
		}
	}
}
tools.file.createTimeline = function(json) {
	var elTimeline = daylight.createElement(json.name, {id:json.id, class:json.className});
	var properties = json.style || {};
	var style = this.getStyle(properties);
	
	elTimeline.setAttribute("style", style);
	elTimeline.setAttribute("data-style", style);
	
	document.body.appendChild(elTimeline);
	console.log(elTimeline);
	var timeline = new daylight.Timeline(elTimeline);
	timeline.scenes = json.scenes || [0];
	
	if(json.hasOwnProperty("motions")) {
		this.createLayer(timeline, elTimeline, json);
	}
	
	if(!json.hasOwnProperty("childNodes"))
		return timeline;

	var childNodes = json.childNodes;
	var childLength = childNodes.length;
	var value = "";
	
	for(var i = 0; i < childLength; ++i) {
		value = json.childNodes[i];
		if(typeof value !== "object")
			elTimeline.insertAdjacentHTML("beforeend", value);
		else
			elTimeline.appendChild(this.createElement(timeline, json.childNodes[i]));
	}

	
	
	return timeline;
}
tools.file.loadTimeline = function(json) {
	var elTimeline = this.createTimeline(json);
	tools.timelines.push(elTimeline);
	tools.timeline = elTimeline;
}
tools.file.newDocument = function() {
	tools.timelines = [];
	this.loadJSON({name:"DIV",id:"", className: "", totalTime: 0, style: {width: "500px", height: "500px", left:"10%", top: "10%"}, motions:[]});
	
	
}
tools.file.checkLayerEasyMode = function(layer, scenes) {
	//layer에 들어가 있는 시간이 씬에 있는 시간이 맞는지 확인 일치 없으면 전문가 모드 전부 일치하면 이지 모드 
	var motions = layer.motions;
	var motionsLength = motions.length;
	var time = 0;
	for(var i = 0; i < motionsLength; ++i) {
		time = motions[i].time;
		if(time !== 0 && scenes.indexOf(time) === -1)
			return;
	}
	return true;
}
tools.file.checkTimelineEasyMode = function(timeline) {
	var scenes = timeline.scenes = timeline.scenes || [0];
	var layerTimes;
	var layer;
	var bEasyMode = false;
	for(var i = 0; i < timeline.layers; ++i) {
		layer = timeline.layers[i];
		bEasyMode = this.checkLayerEasyMode(layer, scenes);
		if(!bEasyMode)
			return false;
		
	}
	
	return true;
}
tools.file.loadJSON = function(json) {
	tools.nowSelectElement = null;
	for(var i = 0; i < tools.timelines.length; ++i) {
		tools.timelines[i].reset();
	}
	tools.timelines = [];
	
	var figure = tools.figure;
	$("body").prepend(figure);
	figure.removeClass("show");
	
	try {
		if(typeof json !== "object")		
			json = JSON.parse(json);
		$(".daylightAnimationTimeline").remove();
		
		if(!json.hasOwnProperty("timelines")) {
			if(!json.hasOwnProperty("name"))
				return;
				
			tools.file.loadTimeline(json);
		} else {
			var timelines = json.timelines;
			var timelinesLength = timelines.length;
			for(var i = 0; i < timelinesLength; ++i) {
				this.loadTimeline(timelines[i]);
			}
		}
	} catch(e){
		console.log(e);
		console.log(e.stack);
		throw new Error("잘못된 형식입니다.");
	}
	tools.nowSelectElement = null;
	tools.mode = this.checkTimelineEasyMode(tools.timeline) ? "easy" : "expert";
	tools.timer.layerTimer(0);
	tools.setting.refreshLayerWindow();
	tools.refreshStatus();
	tools.keyframes.refresh();
}

tools.file.saveJSON = function() {
	tools.nowSelectElement = null;
	var figure = tools.figure;
	$("body").prepend(figure);
	figure.removeClass("show");
	$("body").prepend(tools.rotateArea);
	tools.rotateArea.removeClass("show");
	var timelines = daylight.map(tools.timelines, function() {
		return this.exportToJSON(true);	
	});
	var json = {timelines: timelines};
	
	return JSON.stringify(json);
}
