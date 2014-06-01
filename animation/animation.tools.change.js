var dimensionType = ["px", "em", "%"];
tools.setProperty = function(pos, time) {
	console.log("setProperty", pos);
	
	
	if(!tools.nowSelectElement)
		return;
		
	var dlElement = tools.nowSelectElement;
	var motion = tools.getMotion((typeof time !== "undefined")? time : tools.nowTime);
	var value = "";
	var figure = tools.selectedMenu.pointer && tools.figure ||
				 tools.selectedMenu.shape && tools.shapeFigure || "";
	var sSuffix = "px";
	for(var key in pos) {
		if(typeof pos[key] === "undefined")
			continue;
		
		value = (parseFloat(pos[key]) || pos[key]);
		if(!value)
			value = "0px";
		sSuffix = "px";		
		if(daylight.type(pos[key]) === "string") {
			console.log("string");
			for(var i = 0; i < dimensionType.length; ++i) {
				if(pos[key].indexOf(dimensionType[i]) !== -1)
					sSuffix = dimensionType[i];
			}
		}
		if(typeof value === "number") {
			value = value + sSuffix;
		}
			
		
		dlElement.css(key, value);
		motion[key] = value;
		if(figure)
			figure.css(key, value);
			
		tools.setting.refreshItem(key, value);
		
	}
	motion.fill = "add";
	tools.getLayer().addMotion(motion);
}






tools.resize = function(e) {
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
	console.debug("RESIZE", bPosE);
	
	if(!is_transform) {
	//width, left 조정
	//height, top 조정
	
		var properties = {};
		var width = parseFloat(info.owidth);
		var height = parseFloat(info.oheight);
		
		if(bPosE) {
			width = width + e.dragX;
			properties.width = width;
			if(info.oright !== "auto")
				properties.right = parseFloat(info.oright) - e.dragX;
		}
		if(bPosS) {
			if(info.obottom !== "auto")
				properties.bottom = parseFloat(info.obottom) + e.dragY;
				
			height = height + e.dragY;
			properties.height = height;
		}
		if(bPosN) {
			if(info.obottom === "auto")
				properties.top = (parseFloat(info.otop) || 0) + e.dragY;

			
			properties.height = height - e.dragY;
		}
		if(bPosW) {
			if(info.oright === "auto")
				properties.left = (parseFloat(info.oleft) || 0) + e.dragX;

			width = width - e.dragX;
			properties.width = width;
		}	
		tools.setProperty(properties);
	} else {
		//scale 조정
	}
}
tools.dragMouse = function(e) {
	console.debug("DRAG MOUSE");
	var is_transform = tools.selectedMenu.transform;
	var info = e.dragInfo;
	if(!is_transform) {
		//이동, 선택
		var pos = {};
		if(info.obottom === "auto")
			pos.top = (parseFloat(info.otop) || 0) + e.dragY;
		else
			pos.bottom = parseFloat(info.obottom) - e.dragY;
			
		if(info.oright === "auto")
			pos.left = (parseFloat(info.oleft) || 0) + e.dragX;
		else
			pos.right = parseFloat(info.oright) - e.dragX;
			
		tools.setProperty(pos);
	} else {
		info.tx = parseFloat(info.tx) || 0;
		info.ty = parseFloat(info.ty) || 0;
		tools.setTranslate(info.tx + e.dragX, info.ty + e.dragY)
	}
}
tools.addPosition = function(x, y) {
	if(!tools.nowSelectElement)
		return;
		
	var layer = $(tools.nowSelectElement);
	
	
	var bottom = layer.css("bottom");
	var right = layer.css("right");
	var pos = {};
	if(bottom === "auto")
		pos.top = (parseFloat(layer.css("top")) || 0) + y;
	else
		pos.bottom = (parseFloat(layer.css("bottom")) || 0) - y;
		
	if(right === "auto")
		pos.left = (parseFloat(layer.css("left")) || 0) + x;
	else
		pos.right = (parseFloat(layer.css("right")) || 0) - x;
		
	console.log(pos);
	tools.setProperty(pos);
	
}
