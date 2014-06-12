tools.timer = {
	prevTime:0,
	bPause: true,
	time: 0
};
tools.timer.layerTimer = function(time) {
	var layers = tools.timeline.layers;
	var length = layers.length;
	for(var i = 0; i < length; ++i) {
		layers[i].timer(time);
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
	console.log(dt, this.time, tools.timeline.totalTime);
	
	this.time += dt;
	
	this.time  = tools.timeline.totalTime === this.time ||  tools.timeline.totalTime == 0 ? tools.timeline.totalTime : this.time % tools.timeline.totalTime;
	tools.nowTime = parseInt(tools.timer.time * 10) / 10;
	
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

	
	if(tools.nowTime < 0)
		tools.nowTime = 0;

	this.prevTime = Date.now() / 1000;
	this.time = tools.nowTime;		
	requestAnimFrame(this.timer.bind(this));
}
tools.timer.pause = function() {
	console.debug("PAUSE TIMER");
	tools.timer.bPause = true;
	if(!tools.timeline)
		return;
	if(tools.nowTime > tools.timeline.totalTime) {
	
		tools.nowTime = tools.timeline.totalTime;
		tools.timer.layerTimer(tools.nowTime);
		tools.setting.refresh();
		tools.keyframes.refreshTime();
	}
}