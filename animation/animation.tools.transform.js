(function(tools) {
	var dimensionType = ["px", "em", "%"]
	function _abspx(a, p100) {
		var v = parseFloat(a);
		if(p100 && a.indexOf("%") > -1)
			return v * p100 / 100;
		else
			return v;
	}
	var transform = tools.transform = {};
	transform.translate = function(x, y) {
		
	}
	tools.setTransformFigure = function() {
		//console.debug("set TRANSFORM FIGURE");
		var dlElement = $(tools.nowSelectElement);
		var offsetParentPos = dlElement.offsetParent().offset();
		var pos = dlElement.position();
		var width = dlElement.innerWidth();
		var height = dlElement.innerHeight();
		var style = dlElement.attr("style");
		var top = pos.top;
		var left = pos.left;
		var figure = tools.rotateArea;
		
		dlElement.parent().append(figure);
		figure.attr("style", style);
		
		var cssObject = {};
	
		function setPos(pos) {
			cssObject[pos] = ((parseFloat(dlElement.css(pos)) || 0) - 20) + "px";
		}
		
		figure.addClass("show");
		if(dlElement.css("right") === "auto")
			setPos("left");
		else
			setPos("right");
	
		if(dlElement.css("bottom") === "auto")
			setPos("top");
		else
			setPos("bottom");
					
		
		cssObject.margin = dlElement.css("margin");
		cssObject.width = width + "px";
		cssObject.height = height + "px";
		figure.css(cssObject);
		
		
		tools.setOrigin();
	
	}
	transform.moveOrigin = function(e) {
		var info = e.dragInfo;
		var x = e.dragX
		var y = e.dragY;
		var dlNowSelectElement = tools.nowSelectElement;
		if(!dlNowSelectElement)
			return;
			
		var width = dlNowSelectElement.width();
		var height = dlNowSelectElement.height();
		var origins = info.origin.split(" ");
		

		var ox = _abspx(origins[0], width);
		var oy = _abspx(origins[0], height);
		
		ox += x;
		oy += y;
		ox = ox / width * 100 + "%";
		oy = oy / height * 100 + "%";

		var origin = ox +" " + oy;
		var motion = {time:tools.nowTime, origin: origin, fill:"add"};
		tools.getLayer().addMotion(motion);
		
	}
	
	
	tools.setTranslate = function(x, y) {
		if(!tools.nowSelectElement)
			return;
			
			
		var layer = tools.getLayer();
		var motion = {time:tools.nowTime};
		motion.tx = parseFloat(x) + "px";
		motion.ty = parseFloat(y) + "px";
		tools.setting.refreshItem("tx", motion.tx);
		tools.setting.refreshItem("ty", motion.ty);
		motion.fill = "add";
		layer.addMotion(motion);
	}
	tools.addTranslate = function(x, y) {
	
	}
	
	transform.rotate = function(e) {
		console.debug("rotate");
		
		var info = e.dragInfo;
		var layer = tools.getLayer();
		
		var motion = tools.getNowMotion();	
		
		var origin = motion.origin;
		var dlElement = tools.nowSelectElement;
		//var style = dlElement.css();
		origin = origin || "50% 50%";
		
	
		var dlOrigin = tools.transformFigure.find(".origin");
		var offset = dlOrigin.offset();
		var dx = info.stx - offset.left;
		var dy = info.sty - offset.top;
		var m1 = Math.sqrt(dx * dx + dy * dy);
		
		var dx2 = e.pageX - offset.left;
		var dy2 = e.pageY - offset.top;
		var m2 = Math.sqrt(dx2 * dx2 + dy2 * dy2);	
		
		// cos세타를 구하기 위한 내적 공식
		var dot = (dx * dx2 + dy * dy2) / m1 / m2;
		
		motion = {time : tools.nowTime};
		var deg = 180 * Math.acos(dot) / Math.PI;
		motion.rotate = parseFloat(info.rotate) + deg + "deg";
		tools.setting.refreshItem("rotate", motion.rotate);
		motion.fill = "add";
		tools.getLayer().addMotion(motion);
	}
	
	transform.scale = function(e) {
	
		var info = e.dragInfo;
		var btn = $(e.dragElement);
		var classes = btn.getClass();
		var pos = classes[0];
		var bPosS = pos.indexOf("s") != -1;
		var bPosW = pos.indexOf("w") != -1;
		var bPosE = pos.indexOf("e") != -1;
		var bPosN = pos.indexOf("n") != -1;
		
		var is_transform = !!tools.selectedMenu.transform;
		var is_shift = !!tools.key.is_shift;
		console.debug("SCALE", bPosE);
	
	}
	tools.setOrigin = function(e) {
		var motion = tools.getMotion(tools.nowTime);
		var figure = tools.transformFigure;
		var dlElement = tools.nowSelectElement;
		
		
		var origin = motion.origin;
	
		var style = dlElement.css();
		origin = origin || "50% 50%";
		if(!origin || origin === "none")
			return;
		
	/*
		motion.origin = motion.origin || origin;
		motion.fill = "add";
		
		tools.getLayer().addMotion(motion);
	*/
		
		figure.css("-webkit-transform-origin", origin);
		origin = origin.split(" ");
		var dlOrigin = figure.find(".origin");
		dlOrigin.css({
			left: origin[0],
			top: origin[1]
		});
	
	}
})(tools);