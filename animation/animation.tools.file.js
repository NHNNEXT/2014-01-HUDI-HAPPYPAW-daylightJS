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
tools.file.createElement = function(timeline, json) {
	var element = daylight.createElement(json.name, {id:json.id, class:json.className});
	
	if(json.hasOwnProperty("motions")) {
		tools.file.createLayer(timeline, element, json);
	}
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
		layer.totalTime = json.totalTime;
		if(timeline.totalTime < layer.totalTime) {
			timeline.totalTime = layer.totalTime;
		}
		layer.properties = json.properties || [];
	}
}
tools.file.createTimeline = function(json) {
	var elTimeline = daylight.createElement(json.name, {id:json.id, class:json.className});
	document.body.appendChild(elTimeline);
	console.log(elTimeline);
	var timeline = new daylight.Timeline(elTimeline);
	
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
tools.file.loadJSON = function(json) {
	try {
		json = JSON.parse(json);
		if(!json.hasOwnProperty("timelines"))
			return;
			
		var timelines = json.timelines;
		var timelinesLength = timelines.length;
		for(var i = 0; i < timelinesLength; ++i) {
			var elTimeline = this.createTimeline(timelines[0]);
			tools.timelines.push(elTimeline);
			tools.timeline = elTimeline;
		}
	} catch(e){
		console.log(e);
		console.log(e.stack);
		throw new Error("잘못된 형식입니다.");
	}
	tools.setting.refreshLayerWindow();
	tools.refreshStatus();
	tools.keyframes.refresh();
}

tools.file.saveJSON = function() {
	var timelines = daylight.map(tools.timelines, function() {
		return this.exportToJSON(true);	
	});
	var json = {timelines: timelines};
	
	return JSON.stringify(json);
}

tools.file.test = function() {

tools.file.loadJSON('{"timelines":[{"name":"DIV","id":"","className":"car daylightAnimationTimeline daylightAnimationLayer","motions":[{"time":1,"count":3}],"totalTime":1,"properties":[],"childNodes":[{"name":"DIV","id":"","className":"covers daylightAnimationLayer","motions":[{"time":0,"ty":"0px","count":3},{"time":0.25,"ty":"-10px","count":2},{"time":0.5,"ty":"0px","count":2},{"time":1,"ty":"0px","count":2}],"totalTime":1,"properties":["ty"],"childNodes":[{"name":"DIV","id":"","className":"cover-top","childNodes":[{"name":"DIV","id":"","className":"window front","childNodes":[{"name":"DIV","id":"","className":"face","childNodes":[{"name":"DIV","id":"","className":"head","childNodes":[],"style":{"opacity":"1","width":"40px","height":"10px","border-radius":"90px 90px 0px 0px","color":"rgb(0, 0, 0)","background-color":"rgb(51, 51, 51)","border-left":"0px none rgb(0, 0, 0)","margin-left":"-20px","left":"25px","border-top":"0px none rgb(0, 0, 0)","border-right":"0px none rgb(0, 0, 0)","border-bottom":"0px none rgb(0, 0, 0)","-webkit-transform-origin":"20px 5px"}},{"name":"DIV","id":"","className":"eye daylightAnimationLayer","motions":[{"time":0,"ty":"0px","count":3},{"time":0.5,"ty":"-4px","count":2},{"time":1,"ty":"0px","count":2}],"totalTime":1,"properties":["ty"],"childNodes":[],"style":{"opacity":"1","width":"10px","height":"5px","border-radius":"40px 40px 0px 0px","color":"rgb(0, 0, 0)","border-left":"2px solid rgb(51, 51, 51)","left":"10px","border-top":"2px solid rgb(51, 51, 51)","top":"20px","border-right":"2px solid rgb(51, 51, 51)","border-bottom":"0px none rgb(0, 0, 0)","-webkit-transform":"matrix(1, 0, 0, 1, 0, 0)","-webkit-transform-origin":"7px 3.5px"}}],"style":{"opacity":"1","width":"50px","height":"50px","border-radius":"50%","color":"rgb(0, 0, 0)","background-color":"rgb(226, 182, 150)","border-left":"0px none rgb(0, 0, 0)","left":"30px","border-top":"0px none rgb(0, 0, 0)","top":"20px","border-right":"0px none rgb(0, 0, 0)","border-bottom":"0px none rgb(0, 0, 0)","-webkit-transform-origin":"25px 25px"}},{"name":"DIV","id":"","className":"neck","childNodes":[],"style":{"opacity":"1","width":"10px","height":"30px","color":"rgb(0, 0, 0)","background-color":"rgb(226, 182, 150)","border-left":"0px none rgb(0, 0, 0)","left":"50px","border-top":"0px none rgb(0, 0, 0)","top":"50px","border-right":"0px none rgb(0, 0, 0)","border-bottom":"0px none rgb(0, 0, 0)","-webkit-transform-origin":"5px 15px"}}],"style":{"opacity":"1","width":"90px","height":"80px","color":"rgb(0, 0, 0)","background-color":"rgb(227, 227, 227)","border-left":"2px solid rgb(136, 111, 136)","left":"10px","border-top":"2px solid rgb(136, 111, 136)","top":"15px","border-right":"2px solid rgb(136, 111, 136)","border-bottom":"2px solid rgb(136, 111, 136)","-webkit-transform-origin":"47px 42px"}},{"name":"DIV","id":"","className":"window back","childNodes":[],"style":{"opacity":"1","width":"90px","height":"80px","color":"rgb(0, 0, 0)","background-color":"rgb(227, 227, 227)","border-left":"2px solid rgb(136, 111, 136)","border-top":"2px solid rgb(136, 111, 136)","top":"15px","border-right":"2px solid rgb(136, 111, 136)","right":"20px","border-bottom":"2px solid rgb(136, 111, 136)","-webkit-transform-origin":"47px 42px"}}],"style":{"opacity":"1","width":"250px","height":"100px","color":"rgb(0, 0, 0)","background-color":"rgb(119, 111, 136)","border-left":"0px none rgb(0, 0, 0)","margin-left":"125px","border-top":"0px none rgb(0, 0, 0)","border-right":"0px none rgb(0, 0, 0)","margin-right":"125px","border-bottom":"0px none rgb(0, 0, 0)","-webkit-transform-origin":"125px 50px"}},{"name":"DIV","id":"","className":"cover","childNodes":[],"style":{"opacity":"1","width":"500px","height":"100px","color":"rgb(0, 0, 0)","background-color":"rgb(119, 111, 136)","border-left":"0px none rgb(0, 0, 0)","border-top":"0px none rgb(0, 0, 0)","border-right":"0px none rgb(0, 0, 0)","border-bottom":"10px solid rgb(90, 90, 116)","-webkit-transform-origin":"250px 55px"}}],"style":{"opacity":"1","width":"500px","height":"100px","color":"rgb(0, 0, 0)","border-left":"0px none rgb(0, 0, 0)","border-top":"0px none rgb(0, 0, 0)","border-right":"0px none rgb(0, 0, 0)","border-bottom":"0px none rgb(0, 0, 0)","-webkit-transform":"matrix(1, 0, 0, 1, 0, 0)","-webkit-transform-origin":"250px 50px"}},{"name":"DIV","id":"","className":"wheels","childNodes":[{"name":"DIV","id":"","className":"wheel-inner front","childNodes":[],"style":{"opacity":"1","width":"110px","height":"55px","border-radius":"120px 120px 0px 0px","color":"rgb(0, 0, 0)","background-color":"rgb(0, 0, 0)","border-left":"0px none rgb(0, 0, 0)","margin-left":"-5px","left":"50px","border-top":"0px none rgb(0, 0, 0)","border-right":"0px none rgb(0, 0, 0)","border-bottom":"0px none rgb(0, 0, 0)","-webkit-transform-origin":"55px 27.5px"}},{"name":"DIV","id":"","className":"wheel-inner back","childNodes":[],"style":{"opacity":"1","width":"110px","height":"55px","border-radius":"120px 120px 0px 0px","color":"rgb(0, 0, 0)","background-color":"rgb(0, 0, 0)","border-left":"0px none rgb(0, 0, 0)","border-top":"0px none rgb(0, 0, 0)","border-right":"0px none rgb(0, 0, 0)","margin-right":"-5px","right":"60px","border-bottom":"0px none rgb(0, 0, 0)","-webkit-transform-origin":"55px 27.5px"}},{"name":"DIV","id":"","className":"wheel front daylightAnimationLayer","motions":[{"origin":"50% 49%","time":0,"rotate":"0deg","count":3},{"rotate":"-360deg","time":1,"origin":"50% 49%","count":2}],"totalTime":1,"properties":["origin","rotate"],"childNodes":[{"name":"DIV","id":"","className":"dot-fixed","childNodes":[{"name":"DIV","id":"","className":"line vertical","childNodes":[],"style":{"opacity":"1","width":"5px","height":"25px","color":"rgb(0, 0, 0)","background-color":"rgb(221, 221, 221)","border-left":"0px none rgb(0, 0, 0)","left":"22.5px","border-top":"0px none rgb(0, 0, 0)","top":"12.5px","border-right":"0px none rgb(0, 0, 0)","border-bottom":"0px none rgb(0, 0, 0)","-webkit-transform-origin":"2.5px 12.5px"}},{"name":"DIV","id":"","className":"line horizontal","childNodes":[],"style":{"opacity":"1","width":"25px","height":"5px","color":"rgb(0, 0, 0)","background-color":"rgb(221, 221, 221)","border-left":"0px none rgb(0, 0, 0)","left":"12.5px","border-top":"0px none rgb(0, 0, 0)","top":"22.5px","border-right":"0px none rgb(0, 0, 0)","border-bottom":"0px none rgb(0, 0, 0)","-webkit-transform-origin":"12.5px 2.5px"}}],"style":{"opacity":"1","width":"50px","height":"50px","border-radius":"50%","color":"rgb(0, 0, 0)","background-color":"rgb(255, 255, 255)","border-left":"0px none rgb(0, 0, 0)","left":"25px","border-top":"0px none rgb(0, 0, 0)","top":"25px","border-right":"0px none rgb(0, 0, 0)","border-bottom":"0px none rgb(0, 0, 0)","-webkit-transform-origin":"25px 25px"}}],"style":{"opacity":"1","width":"100px","height":"100px","border-radius":"50%","color":"rgb(0, 0, 0)","background-color":"rgb(124, 127, 118)","border-left":"0px none rgb(0, 0, 0)","left":"50px","border-top":"0px none rgb(0, 0, 0)","top":"5px","border-right":"0px none rgb(0, 0, 0)","border-bottom":"0px none rgb(0, 0, 0)","-webkit-transform":"matrix(1, 0, 0, 1, 0, 0)","-webkit-transform-origin":"50px 49px"}},{"name":"DIV","id":"","className":"wheel back daylightAnimationLayer","motions":[{"origin":"50% 49%","time":0,"rotate":"0deg","count":3},{"rotate":"-360deg","time":1,"origin":"50% 49%","count":2}],"totalTime":1,"properties":["origin","rotate"],"childNodes":[{"name":"DIV","id":"","className":"dot-fixed","childNodes":[{"name":"DIV","id":"","className":"line vertical","childNodes":[],"style":{"opacity":"1","width":"5px","height":"25px","color":"rgb(0, 0, 0)","background-color":"rgb(221, 221, 221)","border-left":"0px none rgb(0, 0, 0)","left":"22.5px","border-top":"0px none rgb(0, 0, 0)","top":"12.5px","border-right":"0px none rgb(0, 0, 0)","border-bottom":"0px none rgb(0, 0, 0)","-webkit-transform-origin":"2.5px 12.5px"}},{"name":"DIV","id":"","className":"line horizontal","childNodes":[],"style":{"opacity":"1","width":"25px","height":"5px","color":"rgb(0, 0, 0)","background-color":"rgb(221, 221, 221)","border-left":"0px none rgb(0, 0, 0)","left":"12.5px","border-top":"0px none rgb(0, 0, 0)","top":"22.5px","border-right":"0px none rgb(0, 0, 0)","border-bottom":"0px none rgb(0, 0, 0)","-webkit-transform-origin":"12.5px 2.5px"}}],"style":{"opacity":"1","width":"50px","height":"50px","border-radius":"50%","color":"rgb(0, 0, 0)","background-color":"rgb(255, 255, 255)","border-left":"0px none rgb(0, 0, 0)","left":"25px","border-top":"0px none rgb(0, 0, 0)","top":"25px","border-right":"0px none rgb(0, 0, 0)","border-bottom":"0px none rgb(0, 0, 0)","-webkit-transform-origin":"25px 25px"}}],"style":{"opacity":"1","width":"100px","height":"100px","border-radius":"50%","color":"rgb(0, 0, 0)","background-color":"rgb(124, 127, 118)","border-left":"0px none rgb(0, 0, 0)","border-top":"0px none rgb(0, 0, 0)","top":"5px","border-right":"0px none rgb(0, 0, 0)","right":"60px","border-bottom":"0px none rgb(0, 0, 0)","-webkit-transform":"matrix(1, 0, 0, 1, 0, 0)","-webkit-transform-origin":"50px 49px"}}],"style":{"opacity":"1","width":"500px","color":"rgb(0, 0, 0)","border-left":"0px none rgb(0, 0, 0)","border-top":"0px none rgb(0, 0, 0)","top":"154px","border-right":"0px none rgb(0, 0, 0)","border-bottom":"0px none rgb(0, 0, 0)","-webkit-transform-origin":"250px 0px"}}],"style":{"opacity":"1","width":"500px","height":"100px","color":"rgb(0, 0, 0)","border-left":"0px none rgb(0, 0, 0)","margin-left":"-250px","left":"632.5px","border-top":"0px none rgb(0, 0, 0)","top":"150px","border-right":"0px none rgb(0, 0, 0)","border-bottom":"0px none rgb(0, 0, 0)","-webkit-transform-origin":"250px 50px"}}]}');
	
}