daylight.animation = {
		//actionList : Dictionary(Object)
		CONSTANT : {
			browserPrefix : ["", "-webkit-", "-moz-", "-o-", "-ms-"],
			transformList : {"left":"translateX(?)", "top":"translateY(?)", "rotate":"rotate(?)", "scale" : "scale(?)"},
			browserEffectCSS : {"origin" : "transform-origin:?"}
		},
		css : function(actionList, prefix) {
			var CONSTANT = daylight.animation.CONSTANT;
			var transformList = [];
			var browserEffectList = [];
			var style = "";
			
			for(var action in actionList) {
				if(action in CONSTANT.transformList)
					transformList.push(action);
				if(action in CONSTANT.browserEffectCSS)
					browserEffectList.push(action);				
			}
			if(transformList.length > 0) {
				var transformStyle = "{prefix}transform:";
				for(var j = 0; j < transformList.length; ++j) {
					var action = transformList[j];
					var replaceMotion = CONSTANT.transformList[action].replace("?", actionList[action]);
					transformStyle += " " + replaceMotion;
				}
				transformStyle += ";\n";
				style += transformStyle;
			}
			if(browserEffectList.length > 0) {
				var browserEffectStyle = "" ;
				for(var j = 0; j < browserEffectList.length; ++j) {
					var action = browserEffectList[j];
					var replaceMotion = "{prefix}" + CONSTANT.browserEffectCSS[action].replace("?", actionList[action]);
					browserEffectStyle += " " + replaceMotion;
				browserEffectStyle += ";\n";
				}
				style += browserEffectStyle;
			}
			var cssStyle = "";
			if(!prefix) {
				for(var i = 0; i < CONSTANT.browserPrefix.length; ++i) {
					cssStyle += daylight.replace("{prefix}", CONSTANT.browserPrefix[i], style);
				}
			} else {
				cssStyle += daylight.replace("{prefix}", CONSTANT.browserPrefix[0], style);
				cssStyle += daylight.replace("{prefix}", prefix, style);
			}
			return cssStyle;
		}
		,timeline : function(query) {
			console.log("NEW TIMELINE");
			this.query = query;
			this.object = $(query);
			this.layers = [];
			this.totalTime = 0;
			this.animationType = "ease";
		}	
		,layer : function(query) {
			this.query = query;
			var id = query;
			id = daylight.replace(" ", "", id);
			id = daylight.replace(".", "", id);
			id = daylight.replace("#", "", id);
			
			this.id = id;
			this.object = $(query);
			this.is_unusable = (this.object.size !=1);
		}
};
daylight.animation.timeline.prototype.hasLayer = function(layer) {
	var layers = this.layers;
	var is_string = (typeof layer == "string");
	for(var i = 0; i < layers.length; ++i) {
		var layerObject = layers[i];
		if(!is_string && layerObject.layer.object.equal(layer.object))
			return true;
		
		if(is_string && layerObject.layer.id != layer)
			continue;
		else if(!is_string && (layerObject.layer != layer))// && layers[i].layer.id != layer.id
			continue;
		
		
		return true;
	}
	return false;
}
	daylight.animation.timeline.prototype.getLayer = function(layer) {
	var layers = this.layers;
	var is_string = (typeof layer == "string");
	for(var i = 0; i < layers.length; ++i) {
		if(is_string && layers[i].layer.id != layer)
			continue;
		else if(!is_string && layers[i].layer != layer)
			continue;
			
		return layers[i];
	}
	
	return null;
}
daylight.animation.timeline.prototype.addLayer = function(query, initMotion) {

	var layer = (query instanceof daylight.animation.layer) ? query : new daylight.animation.layer(query);
	
	if(layer.is_unusable) {
		alert("객체가 2개 이상 발견하거나 발견하지 못했습니다.");
		console.log(layer);
		return null;
	}
	if(this.hasLayer(layer)) {
		alert("이미 레이어가 있습니다. id : " + layer.id);
		return layer.id;
	}
/*
	if(this.hasLayer(layer.id)) {
		alert("이미 레이어가 있습니다.");
		return null;
	}
*/
	layer.object.addClass("daylightAnimationLayer");
	this.layers.push({layer:layer, init:initMotion, motions:[]});
	
	return layer.id;
}
daylight.animation.timeline.prototype.setLayer = function(layer, initMotion) {
	if(!layer) {
		alert("잘못된 레이어입니다.");
		return;
	}
	
	var layerObject = this.getLayer(layer);
	
	if(!layerObject) {
		alert("레이어가 없습니다.");
		return;
	}
	layerObject.init = initMotion;
}
daylight.animation.timeline.prototype.addMotion = function(layer, motion) {
	if(!layer) {
		alert("잘못된 레이어입니다.");
		return;
	}
	var layerObject = this.getLayer(layer);
	if(!layerObject) {
		alert("레이어가 없습니다.");
		return;
	}
	//type 1 시간
	/*
		{start: {
			left : 0,
			top : 0
			},
		end : {
			left: 20,
			top: 20
		}
		,startTime : 0,
		endTime : 1
		}
		
	*/
	if(motion.endTime && this.totalTime < motion.endTime) {
		this.totalTime = motion.endTime;
	}
	layerObject.motions.push(motion);
}
daylight.animation.timeline.prototype.init = function() {
	console.log("INIT TIMELINE");

	var layers = this.layers;
	var length = layers.length;
	var totalTime = this.totalTime;
	var styleHTML = '<style class="daylightAnimationStyle">\n';

	
	for(var i = 0; i < length; ++i) {
		var layerObject = layers[i];
		var query = layerObject.layer.query;
		var id = layerObject.layer.id;
		var motions = layerObject.motions;
		var timeSchedule = {};
		
		for(var j = 0; j < motions.length; ++j) {
			var motion = motions[j];
			var startTime = motion.startTime;
			var endTime = motion.endTime;
			timeSchedule[startTime] = motion.start;

			if(!(endTime === undefined))
				timeSchedule[endTime] = motion.end;
		}	
		styleHTML += "@-webkit-keyframes daylightAnimation"+id+" {";
		for(var time in timeSchedule) {
			var percentage = parseFloat(time) * 100 / totalTime;
			styleHTML += percentage +"% {";
			
			var motion = timeSchedule[time];
			styleHTML += daylight.animation.css(motion);
			styleHTML += "}";
		}
		styleHTML += "}";
		
		//console.log(layerObject);
		if(layerObject.init) {
			styleHTML += query + "{";
			styleHTML += daylight.animation.css(layerObject.init);
			styleHTML += "}\n";
		}
		styleHTML += query + ".animationStart {";
		styleHTML += "-webkit-animation: daylightAnimation"+id+" "+totalTime+"s infinite " +this.getAnimationType()+ ";\n";
		styleHTML += "}\n";
	}
		styleHTML += query + ".animationPause {";
		styleHTML += "-webkit-animation-play-state:paused;\n";
		styleHTML += "}\n";
	styleHTML += '</style>';
	
	var style = $(".daylightAnimationStyle");
	
	if(!style.isNull())//removeStyle
		style.get(0).parentNode.removeChild(style.get(0));
	$("body").get(0).insertAdjacentHTML("afterend", styleHTML);
}
daylight.animation.timeline.prototype.start = function() {
	console.log("START TIMELINE");
	$(".daylightAnimationLayer").addClass("animationStart");
	$(".daylightAnimationLayer").removeClass("animationPause");
}
daylight.animation.timeline.prototype.pause = function() {
	console.log("PAUSE TIMELINE");
	$(".daylightAnimationLayer").toggleClass("animationPause");
}
daylight.animation.timeline.prototype.showAnimationBar = function() {
	
}
daylight.defineGetterSetter(daylight.animation.timeline, "animationType");
