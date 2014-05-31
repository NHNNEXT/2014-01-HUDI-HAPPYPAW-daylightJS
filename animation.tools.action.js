
tools.menuActions.pointer = {};
tools.menuActions.pointer.dragstart = function(e) {
	if($(".daylightAnimationTimeline, .day-rotate-area, .day-figure").has(e.dragElement, true).size() <= 0)
		return;
	
	if($(".day-figure, .day-rotate-area").has(e.dragElement, true).size() == 0) {
		tools.nowSelectElement = $(e.dragElement);
		tools.refreshSetting();
	}
	if($(".day-tool").has(e.dragElement, true).size() > 0)
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
		var motion = tools.getMotion(tools.nowTime);
		e.dragInfo.tx = motion.tx || 0;
		e.dragInfo.ty = motion.ty || 0;
		e.dragInfo.scale = motion.scale || "1,1";
		tools.setTransformFigure();
	}
	
	tools.refreshLayerWindow();

};
tools.menuActions.pointer.drag = function(e) {
	if($(".daylightAnimationTimeline, .day-rotate-area, .day-figure").has(e.dragElement, true).size() <= 0)
		return;
	
	if($(".day-tool").has(e.dragElement, true).size() > 0)
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
		return;
	}
	
	
	tools.dragMouse(e);
	
	tools.refresh();
	
	if(tools.selectedMenu.transform)
		tools.setTransformFigure();
}
tools.menuActions.pointer.dragend = function(e) {
	if($(".daylightAnimationTimeline").has(e.dragElement, true).size() <= 0)
		return;
		
	tools.refresh();
}


tools.menuActions.shape = {};
tools.menuActions.shape.dragstart = function(e) {
	if(tools.dlTool.has(e.dragElement, true).size() > 0)
		return;
	
	var size = $(".daylightAnimationShape").size();
	console.log("-" + size);
	
	var shape = daylight.createElement("div", {class:"daylightAnimationShape day-shape" + (size + 1)});
	e.dragInfo.newShape = shape;
	shape.style.position = "absolute";
	tools.timeline.dl_object.append(shape);
	tools.nowSelectElement = $(e.dragInfo.newShape);
	
};
tools.menuActions.shape.drag = function(e) {
	if(tools.dlTool.has(e.dragElement, true).size() > 0)
		return;
	
	var width = Math.abs(e.dragX);
	var height = Math.abs(e.dragY);
	var x = e.stx - timeline.dl_object.offset().left;
	var y = e.sty - timeline.dl_object.offset().top;
	
	if(e.dragX < 0)
		x += e.dragX;
	
	if(e.dragY < 0)
		y += e.dragY;
		
	var motion = {position: "absolute"};
	motion.left = x + "px";
	motion.top = y + "px";
	motion.width = width + "px";
	motion.height = height + "px";
	motion.time = -1;
	motion.fill = "add";
	tools.getLayer().addMotion(motion);
	tools.refresh();
	tools.setShapeFigure();
}
tools.menuActions.shape.dragend = function(e) {
	if(!e.dragInfo.newShape)
		return;
		

	if(e.dragX == 0 && e.dragY == 0) {
		console.log("제거");
		e.dragInfo.newShape.remove();
		tools.nowSelectElement = $(e.dragElement);
	}
	tools.refreshStatus();
	tools.refreshLayerWindow();
	
	
	e.dragInfo.newShape = false;
}