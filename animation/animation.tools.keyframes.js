tools.keyframes = {
	scale:1,
	dlHead:null,
	dlkeyframesGroups: null,
	dlkeyframesGroup: null,
	dlKeyframes:null,
	dlLine: null,
	dlTimeLabel: null,
	timelineTemplate: "",
	keyframeTemplate: '<div class="day-keyframe" style="left:{left}px" data-index="{index}"></div>',
	keyframeTimeTemplate: "",
	keyframeGroupTemplate: '<div class="day-keyframes-group">{keyframes}</div>',
	dist: 10,
	keyframeLength: 20,
	keyframeWidth: 20,
};
tools.keyframes.getTime = function(totalMilliSeconds) {
	var m = parseInt(totalMilliSeconds / 60 / 100) % 60;
	var s = parseInt(totalMilliSeconds / 100) % 60;
	var ms = totalMilliSeconds % 100;
	ms = ms >= 10 ? ms : "0" + ms;
	m = m >= 10 ? m : "0" + m;
	s = s >= 10 ? s : "0" + s;
	return m +":" + s + ":" + ms;
}
tools.keyframes.init = function() {
	//이런구조에서 이걸 다 쓰기보다..
	//var _htKF = tools.keyframes;  라고 저장해놔도 좋겠음.
	// _htKF.dlKeyframes = ...
	tools.keyframes.dlKeyframes = $(".day-keframes");
	tools.keyframes.dlTimelineTotalTime = $(".day-keyframes-timeline-totalTime");
	tools.keyframes.dlHead = $(".day-keyframes-head");
	tools.keyframes.dlLine = $(".day-keyframes-line");
	tools.keyframes.dlkeyframesGroups = $(".day-keyframes-groups");
	tools.keyframes.dlkeyframesGroup = $(".day-keyframes-group");
	tools.keyframes.dlTimeLabel = $(".day-tools-timeline-time");
	tools.keyframes.dlBtnInit = $(".day-tools-timeline-btn-init");
	
	
	
	tools.keyframes.keyframeTimeTemplate = $(".day-keyframes-time").ohtml();
	tools.keyframes.keyframes = [];
	
	tools.keyframes.initKeyframesTime();
	tools.keyframes.refresh();

	
	tools.keyframes.dlTimelineTotalTime.on("endresize", function(e) {
		var dlSelf = $(this);
		var width = dlSelf.width();
		
		//반올림 처리하기
		var keyframeWidth = tools.keyframes.keyframeWidth;
		var tmp = width % keyframeWidth;
		var count = 0;
		if(tmp >= keyframeWidth / 2)
			count = parseInt(width / keyframeWidth) + 1
		else
			count = parseInt(width / keyframeWidth);
		
		width = count * keyframeWidth;
		
		tools.timeline.totalTime = count * tools.keyframes.dist / 100;
		
		dlSelf.css("width", width +"px");
		 
	});
	tools.keyframes.dlKeyframes.click(function(e) {
		var target = e.target;
		if(!daylight(target).hasClass("day-keyframe"))
			return;
		var index = parseFloat(target.getAttribute("data-index"));
		if(!index && index !== 0)
			return;
			
		//key프레임 하나 하나 클릭했을 때 
		tools.nowTime = parseInt(index * 10) / 100;
		tools.keyframes.refreshTime();

		tools.refreshTimeline();
	});
	$(".btn-preview").click(function(e) {
		tools.timeline.init().start();
		tools.nowTime = 0;
	});	
};
tools.keyframes.refreshTime = function() {
	tools.keyframes.dlLine.css("left", tools.nowTime * 200 + "px");
	var time = tools.keyframes.getTime(tools.nowTime * 100);
	tools.keyframes.dlTimeLabel.html(time);
}
tools.keyframes.initKeyframesTime = function() {
	var sKeyFrameTimeTemplate = tools.keyframes.keyframeTimeTemplate;
	var sKeyframeTemplate = tools.keyframes.keyframeTemplate;
	var arr = [];
	var keyframes = [];
	var i,j;
	for(i = 0; i < 20; ++i) { //20은 뭐지..쌩뚱맞음. 뒤에 100, 5도 다 마찬가지.
		var totalMilliSeconds = i * 50;
		var time = tools.keyframes.getTime(totalMilliSeconds);
		arr.push({time:time, left:i * 100});
		for(j = 0; j < 5; ++j) {
			keyframes.push({left:(i*5+j) * 20, index:(i*5+j)});
		}
	}
	tools.keyframes.dlkeyframesGroups.css("width",  tools.keyframes.keyframeLength * 5 * 20 + "px");
	
	//이런것도 같은 레벨의 컨텍스트라면 this를 사용할 수 있을텐데.
	//this.dlHead.css(.... this.keyfrmaeLenght...)
	tools.keyframes.dlHead.css("width", tools.keyframes.keyframeLength * 100 + "px");
	tools.keyframes.dlHead.template(arr, sKeyFrameTimeTemplate);
	tools.keyframes.keyframeGroupTemplate = tools.keyframes.keyframeGroupTemplate.replace("{keyframes}", daylight.template(keyframes, sKeyframeTemplate));
}
tools.keyframes.refresh = function() {
	var length = tools.keyframes.dlkeyframesGroup.size();
	var layerLength = tools.timeline.layers.length;
	var dist = layerLength - length;
	if(dist > 0) {
		var keyframeGroups = daylight.repeat(tools.keyframes.keyframeGroupTemplate, dist);
		tools.keyframes.dlkeyframesGroups.append(keyframeGroups);
		//add
	} else if(tools.timeline.layers.length < length) {
		// remove
	}
	var keyframeGroup, children;
	var layer;
	var time;
	var propertyValue;
	var i, j, motions, time, motionsLength;
	
	tools.keyframes.dlkeyframesGroup.find(".has-keyframe").removeClass("has-keyframe");
	
	tools.keyframes.dlkeyframesGroup = tools.keyframes.dlkeyframesGroups.find(".day-keyframes-group");
	
	for(i = 0; i < layerLength; ++i) {
		keyframeGroup = tools.keyframes.dlkeyframesGroup.get(i);
		layer = tools.timeline.layers[i];
		children = keyframeGroup.children;		

		daylight.each(layer.motions, function() {
			var time = this.time < 0 ? 0 : this.time;
			var index = Math.round(time * 10);
			daylight.addClass(children[index], "has-keyframe");
		});
		
	}	
}
tools.keyframes.refreshLayer = function(layer) {
	var type = daylight.type(layer);
	var index = -1;
	if(type === "number") {
		index = layer;
		layer = tools.timeline.layers[index];
		if(!layer)
			return;
	} else {
		index = tools.timeline.layers.indexOf(layer);
		if(index == -1)
			return;
	}
	
	
	var keyframeGroup = tools.keyframes.dlkeyframesGroup.get(index);
	var children = keyframeGroup.children;
	var childrenLength = children.length;
	for(var i = 0; i < childrenLength; ++i) {
		daylight.removeClass(children[i], "has-keyframe");
	}

	daylight.each(layer.motions, function() {
		var time = this.time;
		var index = Math.round(time * 10);
		daylight.addClass(children[index], "has-keyframe");
	});
}