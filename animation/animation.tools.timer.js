tools.timer = {
	prevTime:0,
	bPause: true,
	time: 0
};
tools.timer.layerTimer = function(time, is_not_transition) {
	var layers = tools.timeline.layers;
	var length = layers.length;
	for(var i = 0; i < length; ++i) {
		layers[i].timer(time, is_not_transition);
	}
}
tools.timer.timer = function() {
	if(this.bPause)
		return;
	
	if(!tools.timeline.totalTime) {
		this.pause();
		return;
	}
	var now = Date.now() / 1000;
	var dt = now - tools.timer.prevTime;
	
	this.time += dt;
	
	if(tools.timeline.totalTime  <= this.time) {
		this.time =  tools.timeline.totalTime;
		this.pause();
		return;
	}
	
	tools.nowTime = tools.timer.time;//= parseInt(tools.timer.time * 10) / 10;
	
	var now = tools.nowTime;
	
	
	this.layerTimer(now);
	
	tools.setting.refresh();
	tools.keyframes.refreshTime();
	
	this.prevTime = Date.now() / 1000;
	requestAnimFrame(this.timer.bind(this));
}
tools.timer.start = function() {
	console.debug("START TIMER");
	this.bPause = false;
	tools.cancelSelect();
	if(tools.nowTime === tools.timeline.totalTime)
		tools.nowTime = 0;
	
	if(tools.nowTime < 0)
		tools.nowTime = 0;

	this.prevTime = Date.now() / 1000;
	this.time = tools.nowTime;		
	requestAnimFrame(this.timer.bind(this));
}
tools.timer.pause = function() {
	console.debug("PAUSE TIMER");
	tools.timer.bPause = true;
	var timeline = tools.timeline;
	if(!timeline)
		return;
		
	if(!timeline.is_finish) {
		timeline.stop();
		timeline.reset();
	}
	
	if(tools.nowTime > tools.timeline.totalTime) {
		tools.nowTime = tools.timeline.totalTime;
	}
	tools.keyframes.refreshTime(true);
	tools.timer.layerTimer(tools.nowTime);
	tools.setting.refresh();

}