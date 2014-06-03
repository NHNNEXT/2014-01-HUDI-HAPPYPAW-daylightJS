//네임스페이스가 tools 라는 이름인데 너무 흔하지 않을까? 좀더 유니크했으면 더 좋았을 거 같음.

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
	menuActions : {
		
	},
	tmp: {
		//boolean의 변수는 보통 is보다는 b를 prefix로 사용. is는 동사임으로 boolean을 리턴하는 함수의 prefix로 적당.
		isCreateLayer: false,
		isRemoveLayer: false,
		isAddMotion: false,
		isRemoveMotion: false
	},
	getLayer: function() {
		if(!this.nowSelectElement)
			return;
		
		var timeline = this.timeline;
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
		tools.timeline.addClass("animationPause");
		this.is_pause = !this.is_pause;
		if(!this.is_pause) {
			this.prevTime = Date.now();
			//이게 전역에 크로스브라우징 해결한 함수를 추가한 방법인데 좋은 거 같아.
			//그런데 전역함수에 뭔가 추가한다는 건 좀 위험한 편이지. 누군가 수정할 수도 있고. 잘못알고 이걸 쓸 수도 있고.
			//그래서 daylight 라이브러리에 추가해두는 것도 좋을 거 같다.
			requestAnimFrame(this.timer.bind(this));
		}
	},
	key: {},
	inputNodeNames: ["INPUT", "SELECT"],
};
tools.size = "-6px";  //라이브러리에 어떻게 이런 상수가 박혀 있지.. -6이 뭘까..size라는 이름이라도 구체적이였다면 더 좋있을 걸.
{
	var relative = "relative", none = "none", absolute = "absolute", block="block",center="center", left="left", hidden="hidden";

	//아래는 참 참신하다. 괜찮은 방법이야.
	//음. 그런데 key값으로 selector문자열이 아니고 어떤 css속성이 들어갈 수도 있을 거 같아. 
	//지금은 더 복잡해질 수도 있을 거 같고. 하지만 관리측면에서는 나을 수도 있고. 한 번 생각해봐. 나도 이렇게 써보진 않아서 뭐라 말하기 그렇다.
		tools.css = {
			"POSITION_Absolute" : {'position:absolute' : ['.day-ratate-area','.day-transform-figure div', '.day-figure div']},
			"BORDER_RADIUS" : {'0px!important' : [ , , , ]},
			"DISPLAY" : {'display : none' , [,,,,]}
		};
	// 	tools.css = {
	// 	".day-rotate-area": {
	// 		position:"absolute",
	// 		padding:"20px",
	// 		cursor:"move",
	// 		display: "none", 
	// 		border:"0px!important",
	// 		"border-radius":"0px!important",
	// 		background:"transparent!important",
	// 		"z-index":0
	// 	},
	// 	".day-transform-figure, .day-figure": {
	// 		position: "absolute",
	// 		border:"1px solid #72BCEB!important",
	// 		"border-radius":"0px!important",
	// 		display: "none"
	// 	},
	// 	".day-transform-figure": {
	// 		position: "relative",
	// 		cursor: "auto",
	// 		display: block,
	// 		width: "100%",
	// 		height: "100%"
	// 	},
	// 	".day-rotate-area.show, .day-figure.show": {
	// 		display: "block"
	// 	},
	// 	".day-transform-figure div, .day-figure div" : {
	// 		position: "absolute",
	// 		width: "8px",
	// 		height: "8px",
	// 		background:"#fff",
	// 		border:"1px solid #72BCEB!important",
	// 		"border-radius":"50%",
	// 		"z-index":3
	// 	},
	// 	".day-transform-figure, .day-transform-figure div": {
	// 		border: "1px solid #E24E58"
	// 	},
	// 	".day-transform-figure .nw, .day-figure .nw" : {top:0, left:0, "margin-left":tools.size, "margin-top":tools.size},
	// 	".day-transform-figure .origin, .day-figure .origin" : {"margin-left":tools.size, "margin-top":tools.size},
	// 	".day-transform-figure .n, .day-figure .n" : {top:0, left:"50%", "margin-left":tools.size, "margin-top":tools.size},
	// 	".day-transform-figure .ne, .day-figure .ne" : {top:0, right:0, "margin-right":tools.size, "margin-top":tools.size},
	// 	".day-transform-figure .w, .day-figure .w" : {top:"50%", left:0, "margin-left":tools.size, "margin-top":tools.size},
	// 	".day-transform-figure .e, .day-figure .e" : {top:"50%", right:0, "margin-right":tools.size, "margin-top":tools.size},
	// 	".day-transform-figure .sw, .day-figure .sw" : {bottom:0, left:0, "margin-left":tools.size, "margin-bottom":tools.size},
	// 	".day-transform-figure .s, .day-figure .s" : {bottom:0, left:"50%", "margin-left":tools.size, "margin-bottom":tools.size},
	// 	".day-transform-figure .se, .day-figure .se" : {bottom:0, right:0, "margin-right":tools.size, "margin-bottom":tools.size},
	// 	".AnimationTools": {position:relative, overflow:hidden},
	// 	".ids" :{width:"10%", position:relative, "padding":0, "list-style":none, float:left},
	// 	".ids li" :{position:relative, height:"30px", "line-height":"30px"},
	// 	".timeline" :{float:left, width:"80%", "position":"relative", "padding":0, "list-style":none},
	// 	".timeline li" :{height:"30px", position:relative,  "border-left":"1px solid #ccc"},
	// 	".motion" : {"border-radius":"50%",top:"50%", "width":"10px", "height":"10px", "margin":"-5px 0px 0px -5px", "background":"#f55", position:absolute},
	// 	".motion .tip" : {display:none, "border-radius":"4px",top:"-15px",left:"50%","text-align":center, "width":"50px", "height":"20px", "line-height":"20px", "margin":"-10px 0px 0px -25px", "background":"#000", position:absolute, color:"#fff", "font-size":"12px"},
	// 	".motion:hover .tip":{display:block}
		
	// };
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
	tools.timeline = timeline;
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
	//함수와 다른 변수선언간은 앞/뒤로 한 줄 좀 띄워쓰면 가독성 좋아짐.
	//이하 $(document), $(window)로 이벤트 등록하는 부분은 그루핑해서 별도 함수로 분리하는 게 더 좋겠음. (init이 너무 길어.)
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
	
	//tools와 menu, setting은 아주 적절하게 분리한 듯. 각각의 기능구현이 독립적이도록 구현시 계속 노력.
	//이런 관점에서 init()함수를 들여다보면 웬지 바로 위 이벤트 등록하는 부분이 아래 initMenu, setting.init()과 너무 수준이 다른느낌임. 
	//init이라는 함수 하나는 비슷한 레벨(수준)의 기능들이 쭉 나열되는 수준이 좋겠음. 위에는 이벤트 등록으로 너무 디테일하고 아래는 추상적으로 메소드만 딱 호출한 것이라 밸런스가 맞지 않는 느낌.
	tools.initMenu();
	tools.setting.init();
	tools.keyframes.init();

	$(window).resize(function() {
		$("body").css("min-height", $("body").scrollHeight() );
	});
	//리사이즈 함수호출을 하네? 
	$(window).resize();
}
tools.refresh = function() {
	tools.getLayer().timer(tools.nowTime);
}
tools.refreshLayer = function() {
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
	
		
	//tools.init() 이후에는 this.figure로 접근가능해야 하는데? 왜 this를 사용하지 않지.. 
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

	//daylight에서는 hash table모양의 object 인자는 받지 않나?
	//한방에 css속성을 넣어주면 좋겠는데..
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


