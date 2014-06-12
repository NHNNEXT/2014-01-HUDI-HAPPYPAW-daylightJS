tools.keyframes = {

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
tools.keyframes.mode = {easy:{}, expert:{}};
(function() {
	tools.keyframes.mode.easy = {
	};
	var easy = tools.keyframes.mode.easy;
	easy.init = function() {
		this.dlHead = $(".datl-scenes-head");		
	};
})();
(function() {
	tools.keyframes.mode.expert = {
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
	var expert = tools.keyframes.mode.expert;
	expert.init = function() {
		this.dlKeyframes = $(".day-keframes");
		this.dlTimelineTotalTime = $(".day-keyframes-timeline-totalTime");
		this.dlHead = $(".day-keyframes-head");
		this.dlLine = $(".day-keyframes-line");
		this.dlkeyframesGroups = $(".day-keyframes-groups");
		this.dlkeyframesGroup = $(".day-keyframes-group");
		this.dlTimeLabel = $(".day-tools-timeline-time");
		this.keyframeTimeTemplate = $(".day-keyframes-time").ohtml();
		this.keyframes = [];
		
		this.initKeyframesTime();
		this.refreshAll();
		this.dlTimelineTotalTime.on("endresize", function(e) {
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
			
			if(tools.timeline)
				tools.timeline.totalTime = count * tools.keyframes.dist / 100;
			
			dlSelf.css("width", width +"px");
			 
		});
		this.dlKeyframes.click(function(e) {
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
	}
	expert.initKeyframesTime = function() {
		var sKeyFrameTimeTemplate = this.keyframeTimeTemplate;
		var sKeyframeTemplate = this.keyframeTemplate;
		var arr = [];
		var keyframes = [];
		var i,j;
		for(i = 0; i < 20; ++i) {
			var totalMilliSeconds = i * 50;
			var time = tools.keyframes.getTime(totalMilliSeconds);
			arr.push({time:time, left:i * 100});
			for(j = 0; j < 5; ++j) {
				keyframes.push({left:(i*5+j) * 20, index:(i*5+j)});
			}
		}
		this.dlkeyframesGroups.css("width",  tools.keyframes.keyframeLength * 5 * 20 + "px");
		
		this.dlHead.css("width", tools.keyframes.keyframeLength * 100 + "px");
		this.dlHead.template(arr, sKeyFrameTimeTemplate);
		this.keyframeGroupTemplate = this.keyframeGroupTemplate.replace("{keyframes}", daylight.template(keyframes, sKeyframeTemplate));
	}
	expert.refreshTime = function() {
		this.dlLine.css("left", tools.nowTime * 200 + "px");
		var time = tools.keyframes.getTime(tools.nowTime * 100);
		this.dlTimeLabel.html(time);
	}
	expert.refreshAll = function() {
		if(!tools.timeline)
			return;
			
		this.dlTimelineTotalTime.css("width",tools.timeline.totalTime * this.dist * this.keyframeWidth +"px");
		var length = tools.keyframes.dlkeyframesGroup.size();
		var layerLength = tools.timeline.layers.length;
		var dist = layerLength - length;
		if(dist > 0) {
			var keyframeGroups = daylight.repeat(this.keyframeGroupTemplate, dist);
			this.dlkeyframesGroups.append(keyframeGroups);
			//add
		} else if(tools.timeline.layers.length < length) {
			// remove
		}
		var keyframeGroup, children;
		var layer;
		var time;
		var propertyValue;
		var i, j, motions, time, motionsLength;
		
		this.dlkeyframesGroup.find(".has-keyframe").removeClass("has-keyframe");
		
		this.dlkeyframesGroup = tools.keyframes.dlkeyframesGroups.find(".day-keyframes-group");
		
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
	expert.refreshLayer = function() {
		if(!tools.timeline)
			return;
			
		
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
		var keyframeGroup = this.dlkeyframesGroup.get(index);
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
})();
tools.keyframes.init = function() {
	this.mode.expert.init();
};
tools.keyframes.refreshTime = function() {
	console.debug("refreshTime");
}
tools.keyframes.initKeyframesTime = function() {
	console.debug("initKeyframesTime");
}
tools.keyframes.refresh = function() {
	console.debug("refresh");
}
tools.keyframes.refreshLayer = function(layer) {
	console.debug("refreshLayer");
}