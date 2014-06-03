var tools = {
	nowselectedMenu:"",
	nowSelectElement: "",
	
	figure: null,
	transformFigure: null,
	rotateArea: null,
	dlTool: null,
	selectedMenu : {		
		"pointer": true,
		"transform": false,
		"shape": false
	},
	nowTime : 0,
	timelines: [],
	menuActions : {
		
	},
	tmp: {
		isCreateLayer: false,
		isRemoveLayer: false,
		isAddMotion: false,
		isRemoveMotion: false
	},
	getLayer: function() {
		if(!this.nowSelectElement)
			return;
		
		var timeline = this.timelines[0];
		var layer = timeline.getLayer(this.nowSelectElement); 
		if(!layer) {
			layer = timeline.createLayer(this.nowSelectElement);
			this.tmp.isCreateLayer = true;
		}
		return layer;
	},
	getTimeMotion: function(time) {
		var layer = this.getLayer();
		if(!layer)
			return;
			
		var motion = layer.getTimeMotion(time) || {time: time};
		return motion;
	},
	getMotion: function(time) {
		var layer = this.getLayer();
		if(!layer)
			return;
			
		var motion = layer.getMotion(time) || {time: time};
		return motion;
	},
	getNowMotion: function() {
		return this.getTimeMotion(this.nowTime);
	},
	pause: function() {
		if(!tools.timeline)
			return;
			
		tools.timeline.addClass("animationPause");
		this.is_pause = !this.is_pause;
		if(!this.is_pause) {
			this.prevTime = Date.now();
			requestAnimFrame(this.timer.bind(this));
		}
	},
	key: {},
	inputNodeNames: ["INPUT", "SELECT"],
};
tools.size = "-6px";
{
	var relative = "relative", none = "none", absolute = "absolute", block="block",center="center", left="left", hidden="hidden";
	tools.css = {
		".day-rotate-area": {
			position:"absolute",
			padding:"20px",
			cursor:"move",
			display: "none", 
			border:"0px!important",
			"border-radius":"0px!important",
			background:"transparent!important",
			"z-index":0
		},
		".day-transform-figure, .day-figure": {
			position: "absolute",
			border:"1px solid #72BCEB!important",
			"border-radius":"0px!important",
			display: "none"
		},
		".day-transform-figure": {
			position: "relative",
			cursor: "auto",
			display: block,
			width: "100%",
			height: "100%"
		},
		".day-rotate-area.show, .day-figure.show": {
			display: "block"
		},
		".day-transform-figure div, .day-figure div" : {
			position: "absolute",
			width: "8px",
			height: "8px",
			background:"#fff",
			border:"1px solid #72BCEB!important",
			"border-radius":"50%",
			"z-index":3
		},
		".day-transform-figure, .day-transform-figure div": {
			border: "1px solid #E24E58"
		},
		".day-transform-figure .nw, .day-figure .nw" : {top:0, left:0, "margin-left":tools.size, "margin-top":tools.size},
		".day-transform-figure .origin, .day-figure .origin" : {"margin-left":tools.size, "margin-top":tools.size},
		".day-transform-figure .n, .day-figure .n" : {top:0, left:"50%", "margin-left":tools.size, "margin-top":tools.size},
		".day-transform-figure .ne, .day-figure .ne" : {top:0, right:0, "margin-right":tools.size, "margin-top":tools.size},
		".day-transform-figure .w, .day-figure .w" : {top:"50%", left:0, "margin-left":tools.size, "margin-top":tools.size},
		".day-transform-figure .e, .day-figure .e" : {top:"50%", right:0, "margin-right":tools.size, "margin-top":tools.size},
		".day-transform-figure .sw, .day-figure .sw" : {bottom:0, left:0, "margin-left":tools.size, "margin-bottom":tools.size},
		".day-transform-figure .s, .day-figure .s" : {bottom:0, left:"50%", "margin-left":tools.size, "margin-bottom":tools.size},
		".day-transform-figure .se, .day-figure .se" : {bottom:0, right:0, "margin-right":tools.size, "margin-bottom":tools.size},
		".AnimationTools": {position:relative, overflow:hidden},
		".ids" :{width:"10%", position:relative, "padding":0, "list-style":none, float:left},
		".ids li" :{position:relative, height:"30px", "line-height":"30px"},
		".timeline" :{float:left, width:"80%", "position":"relative", "padding":0, "list-style":none},
		".timeline li" :{height:"30px", position:relative,  "border-left":"1px solid #ccc"},
		".motion" : {"border-radius":"50%",top:"50%", "width":"10px", "height":"10px", "margin":"-5px 0px 0px -5px", "background":"#f55", position:absolute},
		".motion .tip" : {display:none, "border-radius":"4px",top:"-15px",left:"50%","text-align":center, "width":"50px", "height":"20px", "line-height":"20px", "margin":"-10px 0px 0px -25px", "background":"#000", position:absolute, color:"#fff", "font-size":"12px"},
		".motion:hover .tip":{display:block}
		
	};
}
tools.objectToCSS = function(css) {
	var html = "";
	for(var selector in css) {
		html += selector +"{";
		html += daylight.animation.objectToCSS(css[selector]);
		html += "}";
	}
	return html;
};

tools.init = function(timeline) {
	
	//tools.timeline = timeline;
	//tools.timelines = [timeline];
	if(timeline)
		timeline.pause();
	this.figure = $(".day-figure");
	this.rotateArea = $(".day-rotate-area");
	this.transformFigure = $(".day-transform-figure");
	this.shapeFigure = $(".day-shape-figure");
	this.dlTool = $(".day-tool");
	var styleElement = document.createElement("style");
	var styleHTML = '<style class="daylightAnimationToolsStyle">\n';
	styleHTML += this.objectToCSS(this.css);
	styleHTML += "</style>";
	$("head").append(styleHTML);

	$(".AnimationTools").template(timeline, $(".AnimationTools"));
	function executeMenuActionWithEvent(funcName, e) {
		for(var menuItem in tools.selectedMenu) {
			if(tools.selectedMenu[menuItem]) {
				if(tools.menuActions[menuItem] && tools.menuActions[menuItem][funcName])
					tools.menuActions[menuItem][funcName](e);
			}
		}
	}
	$(document).drag();
	$(document).on("dragstart", function(e) {
		tools.timer.pause();
		executeMenuActionWithEvent("dragstart", e);
	});
	$(document).on("drag", function(e) {
		executeMenuActionWithEvent("drag", e);
		if(tools.inputNodeNames.indexOf(e.target.nodeName) == -1) {
			e.preventDefault();
			e.returnValue = false;
		}
	});
	$(document).on("dragend", function(e) {
		executeMenuActionWithEvent("dragend", e);
	});
	$(window).keyup(tools.keyup);
	$(window).keydown(tools.keydown);
	
	this.initMenu();
	this.setting.init();
	this.keyframes.init();
	this.file.init();
	
	$(window).resize(function() {
		$("body").css("min-height", $("body").scrollHeight() );
	});
	$(window).resize();
}
tools.refresh = function() {
	tools.getLayer().timer(tools.nowTime);
}
tools.refreshLayer = function() {
	if(!tools.timeline)
		return;
		
	
	var layer = tools.getLayer();
	layer.timer(tools.nowTime);
	if(tools.tmp.isCreateLayer || tools.tmp.isRemoveLayer) {
		console.debug("Create Layer");
		tools.keyframes.refresh();
		tools.tmp.isCreateLayer = tools.tmp.isRemoveLayer = false;
		tools.tmp.isCreateMotion = tools.tmp.isRemoveMotion = false;
	}
	else {
		console.debug("add Motion");
		tools.keyframes.refreshLayer(layer);
		tools.tmp.isCreateMotion = tools.tmp.isRemoveMotion = false;
	}
}
tools.refreshTimeline = function() {
	if(!tools.timeline)
		return;
	var layers = tools.timeline.layers;
	var length = layers.length;
	var now = tools.nowTime;
	for(var i = 0; i < length; ++i) {
		layers[i].timer(now);
	}

	
	tools.refreshStatus();

	tools.setting.refresh();
}
tools.setFigure = function() {
	
		
	var figure = tools.figure;
	if(!tools.nowSelectElement) {
		figure.removeClass("show");
		return;
	}
		
	
	var dlElement = tools.nowSelectElement;
	var offsetParentPos = dlElement.offsetParent().offset();
	var pos = dlElement.offset();
	var width = dlElement.innerWidth();
	var height = dlElement.innerHeight();
	dlElement.parent().prepend(tools.figure);
	
	var top = pos.top - offsetParentPos.top;
	var left = pos.left - offsetParentPos.left;
	
	figure.addClass("show");
	figure.attr("style", "");
	figure.css("left", dlElement.css("left"));
	figure.css("top", dlElement.css("top") + "");
	figure.css("bottom", dlElement.css("bottom"));
	figure.css("right", dlElement.css("right"));
	figure.css("margin", dlElement.css("margin"));
	
	figure.css("width", width+"px");
	figure.css("height", height+"px");
	
	
}
tools.setShapeFigure = function() {
	var figure = tools.shapeFigure;
	if(!tools.nowSelectElement) {
		figure.removeClass("show");
		return;
	}
		
	
	var dlElement = tools.nowSelectElement;
	var width = dlElement.outerWidth() + 2;
	var height = dlElement.outerHeight() + 2;
	dlElement.parent().prepend(figure);
	

	var offsetParentPos = dlElement.offsetParent().offset();
	var pos = dlElement.offset();
	dlElement.parent().prepend(figure);
	
	var top = pos.top - offsetParentPos.top;
	var left = pos.left - offsetParentPos.left;
	
	figure.addClass("show");
	figure.attr("style", "");
	figure.css("left", dlElement.css("left"));
	figure.css("top", dlElement.css("top") + "");
	figure.css("bottom", dlElement.css("bottom"));
	figure.css("right", dlElement.css("right"));
	
	figure.css("margin-top", parseFloat(dlElement.css("margin-top")) - 1 + "px");
	figure.css("margin-left", parseFloat(dlElement.css("margin-left")) - 1 + "px");
	figure.css("margin-right", parseFloat(dlElement.css("margin-right")) - 1 + "px");
	figure.css("margin-bottom", parseFloat(dlElement.css("margin-bottom")) - 1 + "px");	
	figure.css("width", width+"px");
	figure.css("height", height+"px");
}
tools.keydown = function(e) {
	if(tools.setting.items.has(e.target, true).size() > 0) {
		tools.setting.keydown(e);
		return;
	}
		
	var key = $.Event(e).key();
	
	var multiple = key.shift ? 5 : 1;
	
	if(key.up)
		tools.addPosition(0, -multiple);
	else if(key.down)
		tools.addPosition(0, multiple);
	else if(key.left)
		tools.addPosition(-multiple, 0);
	else if(key.right)
		tools.addPosition(multiple, 0);	
	
	tools.key = key;
	
	if(key.keyCode === 32) {
		e.preventDefault();
		e.returnValue = false;
	}
}
tools.keyup = function(e) {
	if(tools.setting.items.has(e.target, true).size() > 0) {
		tools.setting.keyup(e);
		return;
	}
	
	var key = $.Event(e).key();
	
	var keyCode = key.keyCode;
	console.debug("keycode", keyCode);
	switch(keyCode) {
	case 27://esc
		tools.figure.removeClass("show");
		tools.rotateArea.removeClass("show");
		tools.nowSelectElement = null;
		break;
	case 32://space
		if(tools.timer.bPause)
			tools.timer.start();
		else
			tools.timer.pause();
			
		break;
	}
	switch(key.character) {
	case "T":
		//변형

		tools.selectedMenu.transform = !tools.selectedMenu.transform;
		
		break;
	case "D":
		//삭제
		if(!tools.timeline)
			break;
		
		var layers = tools.timeline.layers;
		var layer = tools.getLayer()
		var index = layers.indexOf(layer);
		
		if(index !== -1) {
			layers.splice(index, 1);
		}
		if(tools.nowSelectElement) {
			tools.nowSelectElement.remove();
			tools.nowSelectElement = null;
		}
		tools.setting.refreshLayerWindow();
		break;
	}
	tools.refreshStatus();
	tools.refreshMenu();
	tools.key = key;
}


