tools.keyframes = {
	scale:1,
	dlHead:null,
	dlGroup: null,
	dlKeyframes:null,
	dlLine: null,
	dlTimeLabel: null,
	timelineTemplate: "",
	keyframeTemplate: '<div class="day-keyframe" style="left:{left}px"></div>',
	keyframeTimeTemplate: ""
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
	tools.keyframes.dlGroup = $(".day-keyframes-gorup");
	tools.keyframes.dlHead = $(".day-keyframes-head");
	tools.keyframes.dlLine = $(".day-keyframes-line");
	tools.keyframes.dlTimeLabel = $(".day-tools-timeline-time");
	tools.keyframes.dlBtnInit = $(".day-tools-timeline-btn-init");
	tools.keyframes.keyframeTimeTemplate = $(".day-keyframes-time").ohtml();
	tools.keyframes.initKeyframesTime();
	tools.keyframes.keyframes = tools.keyframes.dlGroup.find(".day-keyframe");


	$(".day-keframes").click(function(e) {
		var target = e.target;
		var index = tools.keyframes.keyframes.index(target);
		if(index == -1)
			return;
		//key프레임 하나 하나 클릭했을 때 
		tools.nowTime = index * 10 / 100;
		tools.keyframes.refresh();

		tools.refreshTimeline();

	});
	$(".btn-preview").click(function(e) {
		tools.timeline.init().start();
		tools.nowTime = 0;
	});	
};
tools.keyframes.refresh = function() {
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
	for(i = 0; i < 20; ++i) {
		var totalMilliSeconds = i * 50;
		var time = tools.keyframes.getTime(totalMilliSeconds);
		arr.push({time:time, left:i * 100});
		for(j = 0; j < 5; ++j) {
			keyframes.push({left:(i*5+j) * 20});
		}
	}
	tools.keyframes.dlHead.css("width", 20 * 100 + "px");
	tools.keyframes.dlHead.template(arr, sKeyFrameTimeTemplate);
	tools.keyframes.dlGroup.template(keyframes, sKeyframeTemplate);
}

tools.keyframes.refreshLayer = function() {
	
}