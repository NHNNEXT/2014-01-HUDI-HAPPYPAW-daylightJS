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


tools.keyframes.init = function() {
	this.mode.easy.init();
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