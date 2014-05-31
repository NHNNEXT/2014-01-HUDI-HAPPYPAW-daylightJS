tools.timer = {
	prevTime:0,
	bPause: true,
	time: 0
};

tools.timer.timer = function() {
	if(tools.timer.bPause)
		return;
	
	var now = Date.now() / 1000;
	var dt = now - tools.timer.prevTime;
	
	tools.timer.time += dt;
	
	tools.timer.time  = tools.timeline.totalTime === tools.timer.time ? tools.timeline.totalTime : tools.timer.time % tools.timeline.totalTime;
	tools.nowTime = parseInt(tools.timer.time * 10) / 10;
	var layers = tools.timeline.layers;
	var length = layers.length;
	var now = tools.nowTime;
	for(var i = 0; i < length; ++i) {
		layers[i].timer(now);
	}
	tools.refreshSetting();
	tools.keyframes.refresh();
	
	tools.timer.prevTime = Date.now() / 1000;
	requestAnimFrame(tools.timer.timer);
}
tools.timer.start = function() {
	console.debug("START TIMER");
	tools.timer.bPause = false;

	
	if(tools.nowTime < 0)
		tools.nowTime = 0;

	tools.timer.prevTime = Date.now() / 1000;
	tools.timer.time = tools.nowTime;		
	requestAnimFrame(tools.timer.timer);
}
tools.timer.pause = function() {
	console.debug("PAUSE TIMER");
	tools.timer.bPause = true;	
}