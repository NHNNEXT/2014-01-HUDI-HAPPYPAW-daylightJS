window.requestAnimFrame = (function(){
  return  window.requestAnimationFrame       ||
          window.webkitRequestAnimationFrame ||
          window.mozRequestAnimationFrame    ||
          function( callback ){
            window.setTimeout(callback, 1000 / 60);
          };
})();

daylight.animation = {
		//actionList : Dictionary(Object)
		CONSTANT : {
			browserPrefix : ["", "-webkit-", "-moz-", "-o-", "-ms-"],
			transformList : {"gleft":"translateX(?)", "gtop":"translateY(?)", "rotate":"rotate(?)", "scale" : "scale(?)"},
			browserEffectCSS : {"origin" : "transform-origin:?"}
		},
		objectToCSS : function(actionList, prefix) {
			var CONSTANT = daylight.animation.CONSTANT;
			var transformList = [];
			var browserEffectList = [];
			var otherList = [];
			var style = "";
			
			for(var action in actionList) {
				if(action in CONSTANT.transformList)
					transformList.push(action);
				else if(action in CONSTANT.browserEffectCSS)
					browserEffectList.push(action);
				else if(typeof actionList[action] === "function")
					continue;
				else 
					otherList.push(action);
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
			if(otherList.length > 0) {
				var otherStyle = "" ;
				for(var j = 0; j < otherList.length; ++j) {
					var action = otherList[j];
					otherStyle += action+":"+actionList[action];
					otherStyle += ";\n";
				}
				style += otherStyle;
			}
			var cssStyle = daylight.replace("{prefix}", CONSTANT.browserPrefix[1], style);
			return cssStyle;
		}
		,timeline : function(query) {
			console.log("NEW TIMELINE");
			this.query = query;
			var object = this.object = daylight(query);
			this.layers = [];
			this.totalTime = 0;
			this.animationType = "ease";
			this.count = "infinite";
			
			object.scroll(function(e) {e.preventDefault();});
			
			object.on("click", function(e) {
				this.webkitRequestFullScreen();	
			});
			
		}	
		,layer : function(query) {
			this.query = query;
			var id = query;
			id = daylight.replace(" ", "", id);
			id = daylight.replace(".", "", id);
			id = daylight.replace("#", "", id);
			
			this.id = id;
			this.object = $(query);
			this.timeSchedule = {};
			this.is_unusable = (this.object.size() !=1);
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
daylight.animation.timeline.prototype.addAction = function(layer, option) {
	var startTime = option.startTime;
	var endTime = option.endTime;
	var action = option.action;
	//fade-in
	//fade-out
	//move, zoom(not scale)
	//disolve(targe포함)
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
	var prevMotion = {motion:{}, startTime:0, endTime:0};
	daylight.each(layerObject.motions, function(o, index) {
		if(o.endTime === motion.startTime)
			motion.startTime += 0.00001;
			
		if(o.endTime < motion.startTime && o.endTime > prevMotion.endTime) {
			daylight.each(o.end, function(value, key) {
				prevMotion.motion[key] = value;
			});
		} 
	});
	
	daylight.each(prevMotion.motion, function(value, key){
		if(!motion.start)
			motion.start = {};
		if(!motion.start[key])
			motion.start[key] = value;
			
		if(!motion.end[key])
			motion.end[key] = value;
	});

	layerObject.motions.push(motion);
}
daylight.animation.timeline.prototype.init = function() {
	console.log("INIT TIMELINE");

	var layers = this.layers;
	var length = layers.length;
	var totalTime = this.totalTime;
	var styleHTML = '<style class="daylightAnimationStyle">\n';
	var CONSTANT = daylight.animation.CONSTANT;
	for(var i = 0; i < length; ++i) {
		var layerObject = layers[i];
		var query = layerObject.layer.query;
		var id = layerObject.layer.id;
		var motions = layerObject.motions;
		layers[i].timeSchedule = {};
		var timeSchedule = layers[i].timeSchedule;
		var finalMotion = {startTime:0, endTime : 0}
		for(var j = 0; j < motions.length; ++j) {
			var motion = motions[j];
			var startTime = motion.startTime;
			var endTime = motion.endTime;
			if(startTime !== undefined)
				timeSchedule[startTime] = motion.start;
				
			if(endTime !== undefined)
				timeSchedule[endTime] = motion.end;
				
			if(finalMotion.endTime < endTime)
				finalMotion = motion;
		}
		if(!timeSchedule[totalTime]) {
			timeSchedule[totalTime] = finalMotion.end;
		}
		styleHTML += "@-webkit-keyframes daylightAnimation"+id+" {\n";
		for(var time in timeSchedule) {
			var percentage = parseFloat(time) * 100 / totalTime;
			styleHTML += percentage +"% {\n";
			
			var motion = timeSchedule[time];
			styleHTML += daylight.animation.objectToCSS(motion, "-webkit-");
			styleHTML += "}\n";
		}
		styleHTML += "}\n";
		
		//console.log(layerObject);
		if(layerObject.init) {
			styleHTML += query + "{";
			styleHTML += daylight.animation.objectToCSS(layerObject.init);
			styleHTML += "}\n";
		}
		styleHTML += query + ".animationStart {\n";
		styleHTML += "-webkit-animation: daylightAnimation"+id+" "+totalTime+"s " + this.getCount() + " " +this.getAnimationType()+ ";\n";
		styleHTML += "-webkit-animation-fill-mode: forwards;\n";
		styleHTML += "}\n";
	}
		styleHTML += query + ".animationPause {\n";
		styleHTML += "-webkit-animation-play-state:paused;\n";
		styleHTML += "}\n";
	styleHTML += '</style>';
	
	var style = $(".daylightAnimationStyle");
	
	if(!style.isEmpty())//removeStyle
		style.parent().remove(style.get(0));
	$("head").append(styleHTML);
}
daylight.animation.timeline.prototype.timer = function() {

	var self = this;
		
	var time = Date.now();
	var spendTime = this.spendTime = (time - this.startTime) / 1000 % this.totalTime;
	var count = parseInt((time - this.startTime) / 1000 / this.totalTime);
	var layers = this.layers;
	
	if(spendTime > this.totalTime)
		return;	
		
	var is_finish = false;
	
	daylight.each(layers, function(layer, index) {
		var schedule = layer.timeSchedule;
		daylight.each(schedule, function(motion, time) {
			if(!motion)
				return;
			if(motion.count === undefined)
				motion.count = 0;
			//test
			if(count < motion.count)
				return;
			
			if(time > spendTime && (motion.count == count))
				return;
			motion.count++;
			daylight.each(motion, function(action, name) {
				if(typeof action !== "function")
					return;
				console.log("function");
				action(self, parseFloat(time));
			});
			is_finish = self.getCount() === "infinite" ? false :  count >= self.getCount();
		});
		//count 0일 떄
		//spendTime을 지난 것만 찾자
		
		
		//count 1일 때 
		//motion.count가 0인 것을 찾자.
	});
	if(is_finish) {
		console.log("FINISHED");
		return;
	}
	requestAnimFrame(this.timer.bind(this));
}
daylight.animation.timeline.prototype.start = function() {
	console.log("START TIMELINE totalTime : " + this.totalTime);
	$(".daylightAnimationLayer").addClass("animationStart");
	$(".daylightAnimationLayer").removeClass("animationPause");
	this.startTime = Date.now();
	this.spendTime = 0;
	requestAnimFrame(this.timer.bind(this));
}
daylight.animation.timeline.prototype.pause = function() {
	console.log("PAUSE TIMELINE");
	$(".daylightAnimationLayer").toggleClass("animationPause");
}
daylight.animation.timeline.prototype.showAnimationBar = function() {
	
}
daylight.defineGetterSetter(daylight.animation.timeline, "animationType");
daylight.defineGetterSetter(daylight.animation.timeline, "count");


daylight.extend(daylight.animation);