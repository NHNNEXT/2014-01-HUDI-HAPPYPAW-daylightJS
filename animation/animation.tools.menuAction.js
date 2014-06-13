
tools.menuActions.pointer = {};
tools.menuActions.pointer.dragstart = function(e) {

	if($(".daylightAnimationTimeline, .day-rotate-area, .day-figure").has(e.dragElement, true).size() <= 0)
		return;
	
	if($(".day-figure, .day-rotate-area").has(e.dragElement, true).size() == 0) {
		tools.nowSelectElement = $(e.dragElement);
		tools.setting.refresh();
	}
	if($(".day-tool").has(e.dragElement, true).size() > 0)
		return;

	if(!tools.timeline)
		return;		
		
	if(!tools.nowSelectElement)
		return;
	
	console.log("pointer dragstart");
	tools.setFigure();
	var is_transform = tools.selectedMenu.transform;
	if(!is_transform) {
		e.dragInfo.owidth = tools.nowSelectElement.css("width");
		e.dragInfo.oheight = tools.nowSelectElement.css("height");
		e.dragInfo.otop = tools.nowSelectElement.css("top");
		e.dragInfo.oleft = tools.nowSelectElement.css("left");
		e.dragInfo.obottom = tools.nowSelectElement.css("bottom");
		e.dragInfo.oright = tools.nowSelectElement.css("right");
	} else {
		var motion = tools.getNowMotion();
		
		//고칠 수 있는 부분, transform은 전부 상속되어야하는 형태
		e.dragInfo.tx = motion.tx || motion["tx?a"] || 0;
		e.dragInfo.ty = motion.ty || motion["ty?a"] || 0;
		e.dragInfo.scale = motion.scale || motion["scale?a"] || "1,1";
		e.dragInfo.rotate = motion.rotate || motion["rotate?a"] || "0deg";
		tools.setTransformFigure();
	}
	
	tools.setting.refreshLayerWindow();

};
tools.menuActions.pointer.drag = function(e) {
	if($(".daylightAnimationTimeline, .day-rotate-area, .day-figure").has(e.dragElement, true).size() <= 0)
		return;
	
	if($(".day-tool").has(e.dragElement, true).size() > 0)
		return;
		
	
	if(!tools.timeline)
		return;
		
		
	if(!tools.nowSelectElement)
		return;
		
	var dlResizeDot = tools.figure.children().has(e.dragElement, true);
	if(dlResizeDot.size() > 0) {
		if(dlResizeDot.hasClass("origin"))
			tools.moveTransformOrigin(e);
		else
			tools.resize(e);
		return;
	}
	
	dlResizeDot = tools.transformFigure.children().has(e.dragElement, true);
	if(dlResizeDot.size() > 0) {
		tools.scale(e);
	}
	else if(tools.rotateArea.equal(e.dragElement)) {
		tools.transform.rotate(e);
	} else {	
		tools.dragMouse(e);
	}
	
	
	
	if(tools.selectedMenu.transform) {
		tools.refresh();
		tools.setTransformFigure();
	}
}
tools.menuActions.pointer.dragend = function(e) {
	if($(".daylightAnimationTimeline, .day-rotate-area").has(e.dragElement, true).size() <= 0)
		return;
		
	tools.refreshLayer();
}


tools.menuActions.shape = {};
tools.menuActions.shape.dragstart = function(e) {
	if(tools.dlTool.has(e.dragElement, true).size() > 0)
		return;
	
	var size = $(".daylightAnimationShape").size();
	console.log("-" + size);
	
	if(!tools.timeline)
		return;		
		
	var shape = daylight.createElement("div", {class:"daylightAnimationShape day-shape" + (size + 1)});
	e.dragInfo.newShape = shape;

	
	shape.style.position = "absolute";
	
	// 이미지 처리 수정....
	var parent = tools.nowSelectElement || tools.timeline.dl_object;
	e.dragInfo.prevSelectElement = parent;
	
	parent.append(shape);
	tools.nowSelectElement = $(e.dragInfo.newShape);
	var offset = parent.offset();
	var x = e.stx - offset.left;
	var y = e.sty - offset.top;
	e.dragInfo.fixX = x;
	e.dragInfo.fixY = y;
	
};
tools.menuActions.shape.drag = function(e, shape) {
	if(!tools.timeline)
		return;		
	
	var info = e.dragInfo;
	if(!info.newShape)
		return;
	
		
	if(tools.dlTool.has(e.dragElement, true).size() > 0)
		return;
	
	var width = Math.abs(e.dragX);
	var height = Math.abs(e.dragY);
	var x = info.fixX;
	var y = info.fixY;
	
	if(e.dragX < 0)
		x += e.dragX;
	
	if(e.dragY < 0)
		y += e.dragY;
		
	var motion = {position: "absolute"};
	motion.left = x + "px";
	motion.top = y + "px";
	motion.width = width + "px";
	motion.height = height + "px";
	motion.time = 0;
	motion.fill = "add";
	
	if(shape === "oval")
		motion["border-radius"] = "50%";
	tools.getLayer().addMotion(motion);
	tools.refresh();
	//tools.setShapeFigure();
}
tools.menuActions.shape.dragend = function(e) {

	if(!e.dragInfo.newShape)
		return;
	

	if(e.dragX == 0 && e.dragY == 0) {
		console.log("제거");
		e.dragInfo.newShape.remove();
		tools.nowSelectElement = $(e.dragElement);
	}
	
	tools.menu.changeMenu("pointer");
	tools.setting.refresh();
	tools.setting.refreshLayerWindow();
	
	
	e.dragInfo.newShape = false;
}
tools.menuActions.oval = {};
tools.menuActions.oval.dragstart = function(e) {
	tools.menuActions.shape.dragstart(e);
}
tools.menuActions.oval.drag = function(e) {
	tools.menuActions.shape.drag(e, "oval");
}
tools.menuActions.oval.dragend = function(e) {
	tools.menuActions.shape.dragend(e);
}