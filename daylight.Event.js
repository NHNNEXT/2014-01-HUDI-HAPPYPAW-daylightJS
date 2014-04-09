
daylight.$Browser = function() {
	var agent = userAgent;
	var browserList = ["msie 10", "msie 9", "msie 8", "msie 7", "msie 6", "msie"];
	var browser = {
    ie6 : agent.indexOf('msie 6') != -1,
    ie7 : agent.indexOf('msie 7') != -1,
    ie8 : agent.indexOf('msie 8') != -1,
    ie9 : agent.indexOf('msie 9') != -1,
    ie10 : agent.indexOf('msie 10') != -1,
    ie : agent.indexOf('msie') != -1,
    chrome : agent.indexOf('chrome') != -1,
    opera : !!window.opera,
    safari : agent.indexOf('safari') != -1,
    safari3 : agent.indexOf('applewebkir/5') != -1,
    mac : agent.indexOf('mac') != -1,

    firefox : agent.indexOf('firefox') != -1
	};
	var is_ie = false;
	for(var i  in browser) {
		if(browser[i]) {
			return true;
		}
	}
	
	return is_ie ? "Internet Explorer" : "chrome"
  
}
daylight.$Event = function(e) {
	var cl = arguments.callee;
	if (e instanceof cl) return e;
	if (!(this instanceof cl)) return new cl(e);
	
	
	if(e === undefined) e = window.event;
	var element = e.target || e.srcElement;
	if (element.nodeType == 3) // defeat Safari bug
		element = element.parentNode;
	var currentElement = e.currentTarget || element;
	
	this.element = element;
	this.currentElement = currentElement;
	this.type = e.type;
	this._event = e;
}
var _touch = function(e) {
	var te = {};
	if (e.touches) {
		te.changes = e.changedTouches;
		te.touches = e.touches;
		te.length = te.touches.length;
	}
	return te;
}, _pos = function(e, bGetOffset) {
	var body = document.body;
	var documentElement = document.documentElement;
	var left = body.scrollLeft || documentElement.scrollLeft;
	var top = body.scrollTop || documentElement.scrollTop;
	
	var pos = {
		clientX : e.clientX,
		clientY : e.clientY,
		pageX   : e.pageX,
		pageY   : e.pageY,
		layerX  : e.offsetX || e.layerX 
		layerY  : e.offsetY || e.layerY //ie6 layerY
	};
	return pos;
}, _touchOne = function(e) {

	if (e.touches) {
		var xy = (e.type == "touchend") ? _pos(e.changedTouches[0]) : _pos(e.touches[0]);
		return xy;
	}
	return {};
}

daylight.$Event.prototype.pos = function(bGetOffset) {
	return _pos(this._event, bGetOffset);
}
daylight.$Event.prototype.mouse = function(bGetOffset) {
	//return _pos(this._event, bGetOffset);
}
daylight.$Event.prototype.touch = function(e) {
	return _touch(this._event);
}

daylight.$Event.prototype.key = function() {
	var keycode = e.keyCode || e.charCode;
	return keycode;
}
daylight.$E = {
	pos : function(e) {return _pos(e); },
	touch : function(e) {return _touch(e);},
	cross : function(e) {
		var is_mobile = e.touches != undefined;
		if(is_mobile) return _touchOne(e);
		else return _pos(e);
	}
}