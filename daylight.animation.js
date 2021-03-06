
window.requestAnimFrame = (function(){
  return  window.requestAnimationFrame       ||
          window.webkitRequestAnimationFrame ||
          window.mozRequestAnimationFrame    ||
          function( callback ){
            window.setTimeout(callback, 1000 / 60);
          };
})();


(function(daylight) {

//content width에 따라 바뀔 수 있는 속성
var lrtype = ["left", "right", "width", "margin-left", "margin-right", "padding-left", "padding-right"];
//content height에 따라 바뀔 수 있는 속성
var tbtype = ["top", "bottom", "height", "margin-top", "margin-bottom", "padding-top", "padding-bottom"];
//숫자로 치환할 수 있는 타입
var dtype = ["rotate", "opacity", "tx", "ty", "gtop", "gleft"];
var notTransitionType = ["display", "position"];
var dimensionType = ["px", "em", "%"]

function _dot(a1,a2,b1,b2) {
	if(b1 + b2 === 0)
		return a1;
	return a1 * b1 / (b1 + b2) + a2 * b2 / (b1 + b2);
}
function _abspx(a, p100) {
	var v = parseFloat(a);
	if(p100 && a.indexOf("%") > -1)
		return v * p100 / 100;
	else
		return v;
}
function _getDimensionType(a) {
	var length = dimensionType.length;
	for(var i = 0; i < length; ++i) {
		if(a.indexOf(dimensionType[i]) != -1)
			return dimensionType[i];
		}
	return "";
}
var animation = daylight.animation = {
	isActivateAnimation: function() {
		var browser = daylight.browser();
		var version = browser.version;
		if(!browser.mobile) {
			if(browser.ie && version >= 10 || browser.webkit && version >= 4 || browser.firefox && version >= 16 || browser.opera && version >= 12)
				return true;
		}
		var computedStyle = window.getComputedStyle && window.getComputedStyle(document.body);
		
		if(!computedStyle)
			return false;
			
		var is_has_property_animation = computedStyle.hasOwnProperty("animation") ||
										computedStyle.hasOwnProperty("-webkit-animation") ||
										computedStyle.hasOwnProperty("-ms-animation") ||
										computedStyle.hasOwnProperty("-moz-animation") ||
										computedStyle.hasOwnProperty("-o-animation");
		
		return is_has_property_animation;
	},
	ERRORMESSAGE: {
		NOLAYER: "레이어가 없습니다.",
		WRONGTYPE: "잘못된 형식입니다.",
		WRONGLAYER: "잘못된 레이어입니다."
	},
	CONSTANT: {
		BIGNUMBER : 10000000,
		
		browserPrefix : ["", "-webkit-", "-moz-", "-o-", "-ms-"],
		styleStartAnimation : "{prefix}animation: daylightAnimation{id} {time}s {type};\n{prefix}animation-fill-mode: forwards;\n{prefix}animation-iteration-count:{count};\n",
		stylePauseAnimation : "{prefix}animation-play-state:paused;\n",
		ignoreCSS : ["count", "time", "function", "length", "fill"],
		removeProperties: ["count", "length", "fill"]
	},
	prefixToBrowser : function(css, prefix, prefixList) {
		prefix = typeof prefix === "undefined" ? "all" : prefix;
		//prefix
		//all : prefix별로 바꿔준다.
		//-1 : prefix를 바꾸지 않고 그대로 둔다.
		//나머지 : 지정된 prefix로 바꿔준다.
		
		var CONSTANT = this.CONSTANT;
		var browserPrefix = prefixList || CONSTANT.browserPrefix;
		var browserPrefixLength = browserPrefix.length;
		var cssWithPrefix;
		
		switch(prefix) {
		case "all":
			var totalStyle = "";
			for(var i = 0; i < browserPrefixLength; ++i) {
				totalStyle +=daylight.replace("{prefix}", browserPrefix[i], css);
			}
			return totalStyle;
			break;
		case -1:
			return css;
		default:
			cssWithPrefix = daylight.replace("{prefix}", prefix, css);
			if(prefix === "")
			 	return cssWithPrefix;
			 else
			 	return cssWithPrefix + daylight.replace("{prefix}", "", css);
		 }
	},
	/**
	*
	* @desc 애니메이션을 지원하는 브라우저인지 확인한다.
	* @return {boolean} 지원하는 브라우저이면 true, 아니면 false를 반환한다.
	*/
	checkBrowser : function() {
	
		return true;
	},
	/**
	*
	* @prarm {string} selector, CSS Selector
	* @prarm {object} property, value 쌍으로 이루어져 있는 Object
	* @prarm {string} prefix prefix가 없으면 모든 브라우저에 맞게 고쳐준다.
	* @desc CSS값들이 있는 Object를 CSSSelector가 포함된 style로 바꿔준다.
	*/
	objectToCSSWithSelector: function(selector, actionList, prefix) {
		var value = this.objectToCSS(actionList, prefix);
		var style = this.getCSSWithSelector(selector, value);
		
		return style;
	},
	/**
	/**
	*
	* @prarm {string} selector, CSS Selector
	* @prarm {string} CSS Value
	* @desc CSS값들이 있는 String을 CSSSelector가 포함된 style로 바꿔준다.
	*/
	getCSSWithSelector: function(selector, value) {

		if(!value) {
		return "";
		}
			
		var style = selector + "{\n";
		style += value;
		style += "\n}";
		
		return style;
	},
	/**
	*
	* @prarm {object} property, value 쌍으로 이루어져 있는 Object
	* @prarm {string} prefix prefix가 없으면 모든 브라우저에 맞게 고쳐준다.
	* @desc CSS값들이 있는 Object를 style로 바꿔준다.
	*/
	objectToCSS: function(actionList, prefix) {
		if(!actionList)
			return "";
		//prefix = -webkit-, -moz-, -ms-, -o-, "", "all", -1 : 고치지 않고 그대로.
		prefix = typeof prefix === "undefined" ? "all" : prefix;
		
		var CONSTANT = this.CONSTANT;
		var totalStyle = "";
		var action;

		var cssTypeList = {
			"Transform": new this.Transform(),
			"BrowserEffectCSSList": new this.BrowserEffectCSSList(),
			"CSSList": new this.CSSList()
		};
		
		var cssType;
		var cssList;
		for(action in actionList) {
			if(CONSTANT.ignoreCSS.indexOf(action) != -1)
				continue;
			for(cssType in cssTypeList) {
				cssList = cssTypeList[cssType];
				if(this[cssType].has && !this[cssType].has(action))
					continue;
				
				cssList.add(action, actionList[action]);
				break;
			}
		}
		for(cssType in cssTypeList) {
			cssList = cssTypeList[cssType];
			totalStyle += cssList.get(prefix);
		}
		totalStyle = totalStyle.replaceAll(";", ";\n");
		var cssStyle = daylight.replace("{prefix}", CONSTANT.browserPrefix[1], totalStyle);
		
		return cssStyle;
	},
	makeId : function(id) {
		id = daylight.replace(" ", "", id);
		id = daylight.replace(".", "", id);
		id = daylight.replace("#", "", id);
		id = daylight.replace("=", "Equal", id);
		id = daylight.replace("[", "A", id);
		var limit_char = /[~!\#$^&*\=+|:;?"<,.>']/;
		id = id.replace(limit_char, "");
		return id;
	},
	animationControl: true,
	timelines: []
};

animation.animationActions = {
	form : function(_layer, startTime, endTime, option) {
		
	},
	rotate : function(_layer, startTime, endTime, option) {
		var angle = parseFloat(option.angle) || 0;
		var prevRotate = parseFloat(_layer.getPrevMotion("rotate", startTime)["rotate"]) || 0;
		
		var motion = {startTime : startTime , endTime : endTime, start:{rotate : prevRotate + "deg"}, end:{rotate:(prevRotate + angle)+"deg"}};
		_layer.addMotion(motion);
		
	},
	fade : function(_layer, startTime, endTime, option, to) {
		var opacity = option && parseFloat(option.opacity) || to;		
		var prevOpacity = _layer.getPrevMotion("opacity", startTime)["opacity"];
		prevOpacity = typeof prevOpacity === "number" ? prevOpacity : 1;
		
		var motion = {startTime : startTime , endTime : endTime, start:{opacity:prevOpacity}, end:{opacity:opacity}};
		_layer.addMotion(motion);
	
	},
	/**
	* @desc fadein 액션
	*/	
	fadein : function(_layer, startTime, endTime, option) {
		this.fade(_layer, startTime, endTime, option, 1);	
	},
	/**
	* @desc fadeout 액션
	*/
	fadeout : function(_layer, startTime, endTime, option) {
		this.fade(_layer, startTime, endTime, option, 0);		
	},
	/**
	* @desc 이동 액션
	*/
	move : function(_layer, option) {
		if(!option)
			return;
		var moveMotion;
		var i, pos, left, top;
		var optionLength = option.length;
		//var dimension = _layer.dl_object.dimension();
		//top = daylight.type(top) === "string" ? parseFloat(top) : 0;
		//left = daylight.type(top) === "string" ? parseFloat(left) : 0;
		
		for(i = 0; 	i < optionLength; ++i) {
			moveMotion = option[i];
			if(moveMotion.hasOwnProperty("pos")) {
				pos = moveMotion["pos"];
				left = pos[1];
				top = pos[0];
				moveMotion.left = left;
				moveMotion.top = top;
				delete moveMotion.pos;
			}
			_layer.addMotion(moveMotion);
		}
	},
	/**
	* @desc flip 액션
	*/
	flip : function(_layer, startTime, endTime, option) {
		option = option || {};
		var startMotion = {time:startTime};
		var endMotion = {time:endTime};
		var rotate, toRotate;
		
		var property;
		var direction;
		//option.direction
		//left
		//right
		//top
		//bottom
		//rotateY
		//rotateX
		
		_layer.addMotion(startMotion);
		
		switch(option.direction) {

		case "left":
			property = "rotateY";
			direction = -1;
			break;
		case "top":
			property = "rotateX";
			direction = 1;
			break;
		case "bottom":
			property = "rotateX";
			direction = -1;
			break;
		case "right":
		default:
			property = "rotateY";
			direction = 1;
		}
		rotate = parseFloat(_layer.getPrevMotion(property, endTime)[property]) || 0;
		toRotate = (parseInt(rotate / 180) + direction) * 180;

		endMotion[property] = toRotate + "deg";
		_layer.addMotion(endMotion);
	},
	loop: function(_layer, startTime, endTime, option) {
		option = option || {};
		if(!option.hasOwnProperty("list"))
			return;
		//count는 1번 이상.
		option.count = option.count || 1;
		
		//시간이 정해져있다면 그 시간안에 몇 번의 count가 될 수 있는지 쳌.
		if(option.hasOwnProperty("time"))
			option.count = parseInt((option.time - endTime) / (endTime - startTime));
			
		var count = option.count;
		var list = option.list;
		var loopMotion = option.list;
		var loopMotionLength = loopMotion.length;
		var loop = {};
		
		for(var i = 0; i < count; ++i)
			loop[i] = {};
			
		daylight.each(_layer.motions, function(o, index) { 
			if(o.time < startTime || o.time > endTime)
				return;
			
			var motion;
			var property;
			var time;
			for(var i = 0; i < count; ++i) {
				time = (endTime - startTime) * (i + 1) + o.time;
				motion = loop[i][o.time] = {time: time};
				for(property in o) {
					if(loopMotion.indexOf(property) === -1)
						continue;
					motion[property] = o[property];
				}
			}
		});
		
		for(i in loop) {
			for(var j in loop[i]) {
				_layer.addMotion(loop[i][j]);
			}
		}
	},
	/**
	* @desc 이미지 전환 액션
	*/
	sprite : function(_layer, startTime, endTime, option) {
		
	},
	disolve : function(_layer, startTime, endTime, option) {
		
	}
}
animation.Motion = function Motion(time, _propertyValues, option) {
	option = option || {};
	this.count = option.count || 0;
	this.fill = option.fill || "";
	this.time = time;
	this.propertyValues = _propertyValues;
}
animation.Motion.prototype = {
	hasProperty : function(property) {
		if(propertyValues.hasOwnProperty(property))
			return 1;
		else if(propertyValues.hasOwnProperty(property + "?a"))
			return 0;
		
		return -1;
	},
	getPropertyValue : function(property) {
	    var value = this.propertyValues[property];
	    
	    if(value)
	        return value;
	    
	    return this.propertyValues[property +"?a"];
	},
	getObject : function(property) {
	    return this.propertyValues[property];
	},
	setObject : function(property, value) {
	    this.propertyValues[property] = value;
	}
};

/**
*
* @class
* @classdesc 타임라인의 레이어
*
*/
animation.Layer = function Layer(selector, initMotion) {
	var type = daylight.type(selector, true);
	
	this.dl_object = daylight(selector);
	
	if(type === "element" || type === "daylight") {
		var id =  this.dl_object.attr("id");
		var className =  this.dl_object.attr("class");
		selector = id ? "#" + id  : "." + className.trim().replaceAll(" ", ".");
	}
	else if(type !== "string") {
		throw new Error(daylight.animation.ERRORMESSAGE.WRONGTYPE);
	}
	this.selector = selector;
	var id = daylight.animation.makeId(selector);
	this.id = id;

	
	if(this.dl_object.size() === 0) {
		throw new Error(daylight.animation.ERRORMESSAGE.NOLAYER);
	}
	
	this.motions = [];
	this.actions = [];
	
	this.timeSchedule = {};
	this.initMotion = initMotion;
	this.totalTime = 0;
	this.properties = [];
	if(this.initMotion) {
		this.initMotion.time = 0;
		this.addMotion(this.initMotion);
	}
}
var layerPrototype = animation.Layer.prototype;
layerPrototype.fillMotion = function(motion, fromMotion, is_force) {
	var self = this;
	var ignoreCSS = daylight.animation.CONSTANT.ignoreCSS;
	//is_force -1이면 언제든지 바꾸기 요청이 오면 바꾸게 할 수 있다.
	//is_force 1이면 강제성
	
	if(!fromMotion)
		return;


	//중복되는 프로퍼티가 있는지 검사.
	if(is_force != -1 && is_force != 1) {
		var is_repeat = false;
		daylight.each(fromMotion, function(value, key){
			if(ignoreCSS.indexOf(key) >= 0)
				return;
				
			if(motion.hasOwnProperty(key))
				is_repeat = true;
			
		});
	}
	if(is_repeat) {
		fromMotion.time += 0.0001;
		this.addMotion(fromMotion);
		return false;
	}
	daylight.each(fromMotion, function(value, key){
		if(ignoreCSS.indexOf(key) >= 0)
			return;
			
		 else if(motion.hasOwnProperty(key + "?a") && !is_force) {
			motion[key] = value;
			delete motion[key + "?a"];
		} else if(!motion.hasOwnProperty(key) || is_force === 1) {
			motion[key] = value;
			if(motion.hasOwnProperty(key + "?a"))
				delete motion[key + "?a"];
		} else if(is_force === -1) {
			motion[key + "?a"] = value;
		}

	});
	return true;
}
//index 이전의 모션에 등록되어 있는 속성들을 지금 속성에 붙혀넣기.
layerPrototype._fillPrevMotionsWithMotionWithIndex = function(motion, index) {
	var motions = this.motions;
	var ignoreCSS = daylight.animation.CONSTANT.ignoreCSS;

    	
    while((--index) >= 0) {
       	var _motion = motions[index];
       	
        for(var property in _motion) {

        	if(ignoreCSS.indexOf(property) !== -1)
        		continue;
		    	
		    	
            if(this.hasProperty(motion, property) !== -1)
                continue;

	
            motion[property] = _motion[property];
            
            if(this.id === "cony" && property === "scale") {
            	console.log(property, motion, _motion[property]);
            	motion[property] = "-1, 1";
            }
        }
    }
}

layerPrototype._fillNextMotions = function(motion, time) {
	var self = this;
	var motions = this.motions;
	var ignoreCSS = daylight.animation.CONSTANT.ignoreCSS;
    daylight.each(motion, function(value, property) {
    	if(ignoreCSS.indexOf(property) >= 0)
			return;
       
	    var index = self.indexOfNextMotionWithTime(time);
	    if(index === -1)
	        return;
	    
	    var length = motions.length;
	    var _motion;
	    
	    do {
	        _motion = motions[index];
	        if(self.hasProperty(_motion, property) === 1)
	            return;
	
	        _motion[property +"?a"] = value;
	    } while((++index) < length);
    });
}
/*
	@param {Object| Number} 모션이 들어온다면 그대로 숫자라면 레이어의 순서를 가지고 모션을 찾아준다.
	@param {property} 찾고 싶은 속성
	@return {Number} 1 가지고 있다. 0 auto속성으로 가지고 있다. -1 없다.
	@desc 해당하는 모션이 해당 속성을 가지고 있는지 검사한다.
*/
layerPrototype.hasProperty = function(index, property) {
	var motions = this.motions;
	var motion = typeof index === "object" ?index : motions[i];
	if(motion.hasOwnProperty(property))
		return 1;
	else if(motion.hasOwnProperty(property + "?a"))
		return 0;
	
	return -1;
}
/*
	@param {string} css property
	@param {number} 찾고 싶은 시간
	@param {number} auto가 붙은 것까지 찾을 것인가 확인
	@return {motion} time 이전의 property를 가지고 있는 모션을 반환
	@desc time 이전의 property를 가지고 있는 모션을 찾아준다.
*/
layerPrototype.applyAll = function(property, value) {
	
	var properties = this.properties;
	var index = properties.indexOf(property);
	if(index === -1)
		properties[properties.length] = property;
		
	var motions = this.motions;
	var length = motions.length;
	var properties = this.properties;
	var motion, i;
	
	for(i = 0; i < length; ++i) {
		motion = motions[i];
		if(i === 0) {
			motion[property] = value;
		} else {
			delete motion[property];
			delete motion[property + "?a"];
		}
	}	
	
}
layerPrototype.removePropertyAll = function(property) {
	var index = properties.indexOf(property);
	if(index === -1)
		return;
	var motions = this.motions;
	var length = motions.length;
	var properties = this.properties;
	var motion, i;
	
	for(i = 0; i < length; ++i) {
		motion = motions[i];
		delete _motion[property];
		delete _motion[property + "?a"];
	}	
	properties.splice(index, 1);
	
}
layerPrototype.removeProperty = function(time, property) {
	var _motion = this.getMotion(time);
	if(!_motion)
		return;

	
	delete _motion[property];
	
	
	
	
	var is_has_property = this.getPrevMotion(property, time, 1).hasOwnProperty(property) ||
							this.getNextMotion(property, time, 1).hasOwnProperty(property)
							
	if(is_has_property)
		return;
	
	console.log(property, _motion[property]);
	
	
	var properties = this.properties;
	var index = properties.indexOf(property);

	if(index === -1)
		return;
		
	properties.splice(index, 1);
	
}
layerPrototype.getPrevMotion = function(name, time, nAuto) {
	var max_time = -2;
	var value = {};
	
	daylight.each(this.motions, function(o, index) {
		if(max_time > o.time || time < o.time)
			return;
			
		
		var tmp = !nAuto && o.hasOwnProperty(name + "?a") ? o[name +"?a"] : o[name];

		if(typeof tmp !== "undefined") {
			value = o;
			max_time = o.time;
		}
	});
	return value;
}
/*
	@param {string} css property
	@param {number} 찾고 싶은 시간
	@param {number} auto가 붙은 것까지 찾을 것인가 확인
	@return {motion} time 이후의 property를 가지고 있는 모션을 반환
	@desc time 이후의 property를 가지고 있는 모션을 찾아준다.
*/
layerPrototype.getNextMotion = function(property, time, nAuto) {
	var min_time = daylight.animation.CONSTANT.BIGNUMBER;
	var value = {};
	
	daylight.each(this.motions, function(o, index) {
		if(min_time < o.time || time > o.time)
			return;

		var tmp = !nAuto && o.hasOwnProperty(property + "?a") ? o[property +"?a"] : o[property];
		if(typeof tmp !== "undefined") {
			value = o;
			min_time = o.time;
		}
	});
	return value;
}
layerPrototype.addAction = function(name, startTime, endTime, option) {
	if(daylight.animation.animationActions.hasOwnProperty(name)) {
		daylight.animation.animationActions[name](this, startTime, endTime, option);
	} else {
		throw new Error("해당하는 엑션이 없습니다.")
	}
}
layerPrototype.optimizeRepeat = function(motion) {
	var pos = ["top", "left", "right", "bottom"];
	var i = 0;
	var properties = this.properties, index;
	if(motion.hasOwnProperty("border")) {
		for(i = 0; i < 4; ++i) {
			if(motion.hasOwnProperty("border-" + pos[i]))
				delete motion["border-" + pos[i]];
			index = properties.indexOf("border-" + pos[i]);
			if(index !== -1)
				properties.splice(index, 1);
		}	
	} else if(motion.hasOwnProperty("border-left")) {
		var border = motion["border-top"];
		var is_repeat = true;
		for(i = 1; i < 4; ++i) {
			if(border !== motion["border-" + pos[i]]) {
				is_repeat = false;
				break;
			}
		}
		if(is_repeat) {
			for(i = 0; i < 4; ++i) {
				if(motion.hasOwnProperty("border-" + pos[i]))
					delete motion["border-" + pos[i]];
										
				index = properties.indexOf("border-" + pos[i]);
				if(index !== -1)
					properties.splice(index, 1);
			}
			motion["border"] = border;
			properties.push("border");
		}
	}
}
layerPrototype.optimize = function() {
	var ignoreCSS = daylight.animation.CONSTANT.ignoreCSS;
	var removeProperties = daylight.animation.CONSTANT.removeProperties;
	var transformList = daylight.animation.CONSTANT.transformList;
	var properties = {"test":{prev:"", count:0}};
	var motions = this.motions;
	var length = motions.length;
	var motion;
	var property;
	
	var propertyInfo;
	for(var i = 0; i < length; ++i) {
		motion = motions[i]
		for(property in motion) {
			
			if(property.indexOf("?a") != -1 || removeProperties.indexOf(property) != -1) {
				delete motion[property];
				continue;
			}
			
			
			
			if(ignoreCSS.indexOf(property) != -1)
				continue;


	
					
			if(transformList.hasOwnProperty(property))
				continue;
			
		
			if(!properties.hasOwnProperty(property)) {
				properties[property] = {prev:motion, count:0, value: motion[property]};
			} else if(properties[property].value !== motion[property]) {
				properties[property].count = 0;
				properties[property].value = motion[property];
			} else {
				propertyInfo = properties[property];
				propertyInfo.count++;
				if(propertyInfo.count >=2) {
					delete propertyInfo.prev[property];
					propertyInfo.count--;
				}
				else if(propertyInfo.count == 1 && i != 0 && i + 1 === length) {
					delete motion[property];
					propertyInfo.count--;
				}
				
				propertyInfo.prev = motion;
			}
		}
		this.optimizeRepeat(motion);
	}
}

layerPrototype._addMotion = function(motion) {
	var motions = this.motions;
	var time = motion.time;
	
    var index = this.indexOfNextMotionWithTime(time);
    if(index === -1)
       	motions.push(motion);
    else
    	motions.splice(index, 0, motion);


    
    var is_max = false;
    if(this.totalTime < time) {
        this.totalTime = time;
        is_max = true;
        index = this.motions.length - 1;
    }
    if(motion.fill === "auto") {

    	this._fillPrevMotionsWithMotionWithIndex(motion, index);
    }
}
/**
*	@param {object|object[]} motion / motion List / from Motion to Motion
*	@returns {Layer} this
*/
layerPrototype.addMotion = function(motion) {
	if(!motion)
		return;
	
	var type = daylight.type(motion);
	var ignoreCSS = daylight.animation.CONSTANT.ignoreCSS;
	var prevMotion = {time : -2};
	var self = this;
	var is_add = false;
	if(type === "array") {
		//다중 모션..ㅋㅋㅋㅋ
		var length = motion.length;
		for(var i = 0; i < length; ++i) {
			this.addMotion(motion[i]);
		}
		return this;
	}
	if(motion.hasOwnProperty("time")) {
		//한개만 추가...
		var time = motion.time;

		daylight.each(motion, function(v, k) {
			if(self.properties.indexOf(k) !== -1)
				return;
				
			if(ignoreCSS.indexOf(k) !== -1)
				return;
			if(k.indexOf("?a") !== -1)
				return;
			
			self.properties.push(k);
		});
		
		var _motion = this.getMotion(time);
		var is_success = false;
	    if(!_motion) {
	        this._addMotion(motion);
	        is_success = true;
	    } else {
	        is_success = this.fillMotion(_motion, motion, motion.fill === "add" ? 1: 0);// _motion에  motion을 추가
	    }
	    time = motion.time;
	    if(is_success)
		    this._fillNextMotions(motion, time);
		
		//this.optimize();

		return this;
	}
	
	// from ---- to
	motion.from = motion.from || motion.start || {};
	motion.to = motion.to || motion.end || {};
	var startTime = motion.from && motion.from.time || motion.startTime;
					 
	var endTime = motion.to && motion.to.time || motion.endTime;


	motion.from.time = startTime;
	motion.to.time = endTime;
	
	this.addMotion(motion.from);
	this.addMotion(motion.to);
	
	return this;
};
layerPrototype.initTimer = function() {
	var motions = this.motions;
	console.log("INIT   " + this.id);
	for(var i = 0; i < motions.length; ++i) {
		var motion = motions[i];
		var time = motion.time;
		if( time < 0)
			continue;
			
		for(var action in motion) {
			if(action.indexOf("?a") >= 0) {
				motion[action.replace("?a", "")] = motion[action];
				delete motion[action];
			}
		}
	}
	
	return this.getCSSInitMotion();
}
layerPrototype.getMotion = function(time) {
	var totalTime = this.totalTime;
	var motions = this.motions;
	var length = this.motions.length;
    if(length === 0)
        return;
    
/*
    for(var i = 0; i < length; ++i) {
	    if(motions[i].time === time)
	    	return motions[i];
    }
    return;
    
*/
    
    //test
    var i = totalTime === 0 ? 0 : Math.floor(time / totalTime * length);
    
    if(i >= length)
        i = length - 1;
    
    if( i < 0) i = 0;
    
    var motion = motions[i];
    
    if(motion.time === time)
        return motion;
    
    var to = 1;
    if(motion.time > time)
        to = -1;
    
    while((i+= to) >= 0  && i < length) {
        motion = motions[i];
        
        if(motion.time === time)
            return motion;
        if(to === 1 && motion.time > time)
        	return;
        else if(to === -1 && motion.time < time)
        	 return;
    }
	    
    return;
}
layerPrototype.indexOfNextMotionWithTime = function(time) {
	time = parseFloat(time);
	var length = this.motions.length;
	for(var i = 0; i < length; ++i) {
		var motion = this.motions[i];
		if(motion.time > time)
			return i;
	}
	return -1;
}
/**
*
* @param {number} time 애니메이션이 재생되고 있는 시간의 위치
* @param {string} property 찾고 싶은 CSS 속성
* @param {object} prevMotion time 이전의 property를 가지고 있는 모션.
* @param {object} nextvMotion time 이후의 property를 가지고 있는 모션.
* @return {string | number} 이전 시간과 이후 시간을 현재시간에 비례하여 내적을 한 값을 반환한다.
* @desc  이전 시간과 이후 시간을 현재시간에 비례하는 값을 찾아준다.
*/
layerPrototype.getTimeValue = function(time, property, prev, next) {
	var prevMotion = prev.hasOwnProperty(property) ? prev[property] : prev[property + "?a"] ;
	var nextMotion = next.hasOwnProperty(property) ? next[property] : next[property + "?a"];
	var dimension = "";
	
	
	if(prevMotion === nextMotion)
		return prevMotion;
		
	var value = prevMotion;
	if(lrtype.indexOf(property) !== -1)
		dimension =  "width";
	else if(tbtype.indexOf(property) !== -1)
		dimension = "height";
	else if(dtype.indexOf(property) !== -1)
		dimension = "dimension";
	
	var prevTime = time - prev.time;
	prevTime = prevTime >= 0 ? prevTime : 0;
	var nextTime = next.time - time;

	try {
		if(dimension === "width" || dimension === "height") {
			var p100 = this.dl_object.dimension(dimension);//100퍼센트 기준으로 수치
	
			prevMotion = _abspx(prevMotion, p100);
			nextMotion = _abspx(nextMotion, p100);
			value = _dot(prevMotion, nextMotion, nextTime, prevTime) +"px";
		} else if(dimension === "dimension") {

			var oprevMotion;
			prevMotion = _abspx(prevMotion);
			nextMotion = _abspx(nextMotion);
			
			if(prevMotion === nextMotion)
				return oprevMotion;
			
			//console.log(prevMotion, nextMotion);
			value = _dot(prevMotion, nextMotion, nextTime, prevTime);
			//console.log(property, value, prevMotion, nextMotion);
			switch(property) {
			case "rotate":
				value = value + "deg";
				break;
			case "tx":
			case "ty":
			case "tz":
			case "gtop":
			case "gleft":
				value = value + "px";
				break;
			}
		} else {
			switch(property) {
			case "scale":
				var fromScale = prevMotion.split(",");
				var toScale = nextMotion.split(",");
				var xScale = _dot(parseFloat(fromScale[0]), parseFloat(toScale[0]), nextTime, prevTime);
				var yScale = _dot(parseFloat(fromScale[1]), parseFloat(toScale[1]), nextTime, prevTime);
				return xScale +", " + yScale;
			}		
			if(daylight.animation.getTimeValue)
				return daylight.animation.getTimeValue(this.dl_object, time, property, prev, next);
			else
				return "transition";
		}
	} catch(e) {
		console.error("time :" + time, "property : " + property, "value : " + value, e);
	}
	return value;
}
layerPrototype.getTimeMotion = function(time, is_start, is_not_transition) {
	var properties = this.properties;
	var length = properties.length;
	var motions = {};
	var value, property, prev, next;
	var dl_object = this.dl_object;
	var CONSTANT = daylight.animation.CONSTANT;
	
	var transformList = animation.Transform.list;
	for(var i = 0; i < length; ++i) {
		property = properties[i];
		prev = this.getPrevMotion(property, time, -1);//?a 없는 프로퍼티 찾기
		next = this.getNextMotion(property, time, -1);
		
		if(!prev.hasOwnProperty(property)) {
			if(daylight.animation.Transform.list.hasOwnProperty(property))
				continue;
			console.log("add");
			
			prev.time = 0;
			prev[property] = dl_object.css(property);
			prev.count = 0;
			prev.fill = "add";
			
			if(this.getMotion(0))
				this.getMotion(0)[property] = prev[property];
			else
				this.addMotion(prev);
			
		}
			
		if(!next.hasOwnProperty(property))
			next = prev;

		if(is_start) {
			motions[property] = prev[property];
			continue;
		}

		value = this.getTimeValue(time, property, prev, next);
		
		if(property === "opacity") {
			//console.log(property, prev, next, value);
		}
		if(value === "transition") {
			if(property === "display") {
				motions[property] = prev[property];
				continue;
			}
				
			if(is_not_transition) {
				//console.debug("notTransition");
			}
			if(is_not_transition) {
				motions[property] = prev[property];
			} else {
				motions[property] = next[property];
			
				if(!transformList.hasOwnProperty(property)) {
					motions["transition"] = motions["transition"]? motions["transition"] + "," : ""; 
					motions["transition"] +=  property + " linear " + (next.time - prev.time) + "s ";
				}
			}
			
			motions[property] = next[property];
		} else {
			motions[property] = value;
		}

		//_dot(time - prevMotion.time, nextMotion.time - time)	
	}
	motions.time = time;
	return motions;	
}
layerPrototype.timer = function(time, is_start, is_not_transition) {
	var motion = this.getTimeMotion(time, is_start, is_not_transition);
	var style = daylight.animation.objectToCSS(motion);
	
	var dl_object = this.dl_object;
	dl_object.each(function(element) {
		//오리지날 스타일
		var ostyle = element.getAttribute("data-style") + ";" || "";
		element.setAttribute("style", ostyle + style);
	});
	return motion;
}


layerPrototype.getCSSInitMotion = function() {
	var initMotion = this.motions.length > 0 && this.motions[0].time === 0 ? this.motions[0]: {};
	var styleHTML = daylight.animation.objectToCSSWithSelector(this.selector, initMotion);
	return styleHTML;
}
//count와. type 테스트 값.
layerPrototype.getCSSInit = function(count, type) {
	var prefix = "-webkit-";
	var CONSTANT = daylight.animation.CONSTANT;
	var styleStartAnimation = CONSTANT.styleStartAnimation;
	var stylePauseAnimation = CONSTANT.stylePauseAnimation;
	var browserPrefix = CONSTANT.browserPrefix;
	var browserPrefixLength = browserPrefix.length;
	
	var id = this.id;
	var totalTime = this.totalTime;
	var selector = this.selector;
	var styleHTML = "";

	var keyframeSelector,
		keyframeStyle;
		

	for(var i = 0; i < browserPrefixLength; ++i) {
		prefix = browserPrefix[i];
		keyframeSelector = "@" + prefix +"keyframes daylightAnimation"+id;
		keyframeStyle = "";
		daylight.each(this.motions, function(motion, i) {
			if(motion.time < 0)
				return;
			var percentage = parseFloat(motion.time) * 100 / totalTime;//시간을 %로 바꿔준다.
			var style = daylight.animation.objectToCSSWithSelector(percentage +"%"
						, motion, prefix);
			keyframeStyle += style ? style + "\n" : "";
		});
		styleHTML += daylight.animation.getCSSWithSelector(keyframeSelector, keyframeStyle);

	}
	var data = {id: id, time: totalTime, count: count, type: type};
	styleStartAnimation = daylight.template(data, styleStartAnimation);
	
	if(styleHTML) {
		styleHTML += daylight.animation.getCSSWithSelector(this.selector + ".animationStart"
					,daylight.animation.prefixToBrowser(styleStartAnimation)) +"\n";
	
		styleHTML += daylight.animation.getCSSWithSelector(this.selector + ".animationPause"
					,daylight.animation.prefixToBrowser(stylePauseAnimation)) +"\n";	
	}
	
	return styleHTML;

}


//test
layerPrototype.print = function() {
	var motions = this.motions;
	daylight.each(motions, function() {
		console.log(JSON.stringify(this));
	});
}

/**
*
* @class
* @classdesc 타임라인
* @method $Animation.Timeline
*/
animation.Timeline = function Timeline(selector) {
	console.log("NEW TIMELINE");
	
	var type = daylight.type(selector, true);
	

	var dl_object = this.dl_object = daylight(selector);
	
	if(type === "element" || type === "daylight") {
		var id =  this.dl_object.attr("id");
		var className =  this.dl_object.attr("class");
		selector = id ? "#" + id  : "." + className.trim().replaceAll(" ", " .");
	}
	else if(type !== "string") {
		console.error("selector : " + selector, type)
		throw new Error(daylight.animation.ERRORMESSAGE.WRONGTYPE);
	}
	this.selector = selector;
	
	var id = daylight.animation.makeId(selector);
	this.id = id;
	
	this.layers = [];
	this.totalTime = 0;
	this.animationType = "ease";
	this.count = "infinite";
	
	if(daylight.animation.animationControl)
		daylight.animation.timelines.push(this);
	
	dl_object.addClass("daylightAnimationTimeline");
	dl_object.scroll(function(e) {e.preventDefault();});
	
}
var timelinePrototype = animation.Timeline.prototype;
timelinePrototype.exportToJSON = function(is_object, is_minify) {
	var id = "";
	var dl_object = this.dl_object;
	var element = dl_object.o[0];
	this.stop();
	var layers = this.layers;
	var layerLength = layers.length;
	for(var i = 0; i < layerLength; ++i)
		layers[i].timer(0);
	



	var json = this._exportToJSON(element);
	json.ss = this.scenes;
	json.tt = this.totalTime;
	if(is_object)
		return json;
	return JSON.stringify(json);
	
}
timelinePrototype.hasLayer = function(layer) {
	return !!this.getLayer(layer);
}
timelinePrototype.getLayer = function(layer) {
	var layers = this.layers;
	var t = daylight.type(layer, true);
	var is_string = (t === "string");
	var _layer;
	if(t === "undefined")
		throw new Error("No Layer");
	
	for(var i = 0; i < layers.length; ++i) {
		_layer = layers[i];
		if(is_string && _layer.id != layer)
			continue;
		else if((t === "daylight" || t === "element") && !_layer.dl_object.equal(layer))
			continue;
		else if(layer.constructor === daylight.animation.Layer &&  _layer != layer)
			continue;

		
		return _layer;
	}
	
	return;
}
timelinePrototype.createLayer = function(selector, initMotion) {
	var a = new daylight.animation.Layer(selector, initMotion);
	if(this.isOnlyOneLayer && a.dl_object.size() > 1)
		throw new Error("오직 한개의 레이어만 가능합니다.");
	var id = this.addLayer(a);
	if(id == null)
		return;
	
	return a;
}
timelinePrototype.addLayer = function(selector, initMotion) {

	var layer = (selector instanceof daylight.animation.Layer) ? selector : new daylight.animation.Layer(selector, initMotion);
	
	if(this.hasLayer(layer)) {
		console.log("이미 레이어가 있습니다. id : " + layer.id);
		return;
	}

	layer.dl_object.addClass("daylightAnimationLayer");
	this.layers.push(layer);
	
	return layer.id;
}

timelinePrototype.addAction = function(layer, name, startTime, endTime, option) {
	//fade-in
	//fade-out
	//move, zoom(not scale)
	//disolve(targe포함)
	
	var _layer = this.getLayer(layer);
	_layer.addAction(name, startTime, endTime, option);
	

	return this;
}

timelinePrototype.addMotion = function(layer, motion) {
	if(!layer) {
		throw new Error(daylight.animation.ERRORMESSAGE.WRONGLAYER);
	}
	var _layer = this.getLayer(layer);
	if(!_layer) {
		throw new Error(daylight.animation.ERRORMESSAGE.NOLAYER);
	}
	_layer.addMotion(motion);
	return this;
}
timelinePrototype.fillTimeline = function(layer) {
	var motions = layer.motions;
	var totalTime = this.totalTime;
	var fMotion = {time:0};
	var finalMotion = {time:0};
	var sRemovePrefixProperty;
	for(var i = 0; i < motions.length; ++i) {
		var motion = motions[i];
		var time = motion.time;

		if( time < 0)
			continue;
		
		for(var action in motion) {
			
			if(action.indexOf("?a") >= 0) {
				sRemovePrefixProperty = action.replace("?a", "");
				if(!motion.hasOwnProperty(sRemovePrefixProperty))
					motion[action.replace("?a", "")] = motion[action];

				delete motion[action];
			}
		}
		
		
		if(finalMotion.time <= time)
			finalMotion = motion;
	}
	
	layer.fillMotion(fMotion, finalMotion, 1);
	fMotion.time = totalTime;
	
	if(!layer.getMotion(totalTime)) {
		layer.addMotion(fMotion);
	}
	
	
	return this;
}
timelinePrototype.getInitMotionCSS = function() {
	var styleHTML = '<style class="daylightAnimation'+this.id+'InitStyle">\n';
	var layers = this.layers;
	var layerLength = layers.length;
	for(var i = 0; i < layerLength; ++i) {
		styleHTML += layers[i].getCSSInitMotion();
	}
	styleHTML += '</style>';
	
	return styleHTML;
}
timelinePrototype.initTimer = function() {
	console.log("INIT TIMELINE TIMER");
	this.is_timer = true;
	var layers = this.layers;
	var layerLength = layers.length;
	var dl_object, layer;
	
	for(var i = 0; i < layerLength; ++i) {
		if(this.totalTime < layers[i].totalTime)
			this.totalTime = layers[i].totalTime;
	}
	
	var totalTime = this.totalTime;
	
	for(var i = 0; i < layerLength; ++i) {
		layer = layers[i];
		dl_object = layer.dl_object;
		this.fillTimeline(layer);
		dl_object.each(function(element, index) {
			element.setAttribute("data-style", element.getAttribute("style"));
		});
	}
	
	this.reset();
		
	$("head").append(this.getInitMotionCSS());
	return this;
}
/**
* @desc 모든 것을 되돌린다.
*/
animation.Timeline.prototype.resetStyle = function() {
	console.debug("RESET");
	$(".daylightAnimationLayer").removeClass("animationStart");
	var style = $(".daylightAnimation"+this.id+"Style, .daylightAnimation"+this.id+"InitStyle");
	
	console.log(style);
	if(!style.isEmpty())//removeStyle
		style.remove();
}
animation.Timeline.prototype.init = function() {
	console.log("INIT TIMELINE");

	var layers = this.layers;
	var layerLength = layers.length;

	var styleHTML = '<style class="daylightAnimation'+this.id+'Style">\n';

	for(var i = 0; i < layerLength; ++i) {
		if(this.totalTime < layers[i].totalTime)
			this.totalTime = layers[i].totalTime;
	}
	var totalTime = this.totalTime;
	
	for(var i = 0; i < layerLength; ++i) {
		var layer = layers[i];
		this.fillTimeline(layer);
		styleHTML += layer.getCSSInit(this.getCount(), this.getAnimationType());
	}
	
	styleHTML += '</style>';
	console.debug("RESET");
	this.resetStyle();
		
	$("head").append(styleHTML);
	$("head").append(this.getInitMotionCSS());

	return this;
}
timelinePrototype.executeFunction = function(schedule, spendTime, count) {
	
}
timelinePrototype.synchronize = function(percentage) {
	var time = percentage * this.totalTime / 100;
	
	var layers = this.layers;
	var layersLength = layers.length;
	var layer;
	for(var i = 0; i < layersLength; ++i) {
		layer = layers[i];
		layer.timer(time, false, true);
	}
}
timelinePrototype.timer = function() {
	if(!this.totalTime) {
		this.finish();
		return;
	}
	var self = this;
	var is_timer = this.is_timer;
	var time = Date.now();
	var spendTime = this.spendTime += (time - this.prevTime) / 1000;
	var nowTime = this.nowTime = spendTime % this.totalTime;
	var count = parseInt(spendTime / this.totalTime);
	var totalTime = this.totalTime;
	var layers = this.layers;
	this.prevTime = time;
	

	if(!this.is_start) {
		this.nowTime = 0;
		return;
	}
	if(this.is_pause)
		return;
		
	var is_finish = this.is_finish = false;
	
	daylight.each(layers, function(layer, index) {
		var motions = layer.motions;
		daylight.each(motions, function(motion, time) {
			if(!motion)
				return;

			if(count < motion.count)
				return;
			
			if(time > nowTime && (motion.count === count))
				return;
				
			motion.count++;
			daylight.each(motion, function(action, name) {
				if(typeof action === "function") {
					console.log("function");
					action(layer, parseFloat(time), nowTime);
					return;
				}
			
			});
			//infinite 무한대이면 계속 timer가 돌도록 설정
			//아니면 count가 돌아야할 횟수를 넘으면 종료
			is_finish = self.getCount() === "infinite" ? false :  count >= self.getCount();
		});
		
		if(is_timer) {
			layer.timer(nowTime, self.cycleCount != count);
		}
	});
	this.cycleCount = count;
	
	daylight.trigger(document, "timelineTimer", {timeline:this, time:nowTime});
	if(is_finish) {
		this.is_finish = true;
		
		this.finish();
		
		console.log("FINISHED");
		return;
	}
	
	requestAnimFrame(this.timer.bind(this));
}
/**
*
* @desc 애니메이션을 종료한다.
*/
timelinePrototype.finish = function() {
	console.log("FINISH TIMELINE totalTime : " + this.totalTime);
	this.startTime = this.prevTime = this.nowTime = this.spendTime = 0;
	this.is_start = false;
	this.is_pause = false;
	this.is_finish = true;
	return this;
}
/**
*
* @desc 애니메이션을 강제 종료한다.
*/
timelinePrototype.reset = function() {
	
}
timelinePrototype.stop = function() {
	this.finish();
	$(".daylightAnimationLayer").removeClass("animationStart");
}
/**
*
* @desc 재생된 횟수를 초기화한다.
*/
timelinePrototype.initCount = function() {
	var layers = this.layers;
	daylight.each(layers, function(layer, index) {
		var motions = layer.motions;
		daylight.each(motions, function(motion, time) {
			motion.count = 0;
		});
	});
}

/**
*
* @desc 애니메이션을 시작한다.
*/
timelinePrototype.start = function() {
	console.log("START TIMELINE totalTime : " + this.totalTime);
	var dlLayer = $(".daylightAnimationLayer");
	dlLayer.addClass("animationStart");
	dlLayer.removeClass("animationPause");
	this.initCount();
	
	this.startTime = this.prevTime = Date.now();
	this.nowTime = this.spendTime = 0;
	requestAnimFrame(this.timer.bind(this));
	this.is_start = true;
	this.is_finish = false;
	this.is_pause = false;
	this.cycleCount = -1;
	return this;
}
/**
*
* @desc 일시중지
*/
timelinePrototype.pause = function() {
	console.log("PAUSE TIMELINE");
	$(".daylightAnimationLayer").toggleClass("animationPause");
	this.is_pause = !this.is_pause;
	if(!this.is_pause) {
		this.prevTime = Date.now();
		requestAnimFrame(this.timer.bind(this));
	}
	return this;
}
timelinePrototype.showAnimationBar = function() {
	
}

	(function() {
		var browserPrefix = daylight.animation.CONSTANT.browserPrefix;
		var NO_CHILD = ["IMG"];
		var EXPORT_PROPERTIES = {"opacity":1, "box-sizing":"content-box", width:"0px", height:"0px" , "border-radius":"0px", "color":"rgb(255, 255, 255)", position:"static"};
		var POS = ["left","top", "right", "bottom"];
		var BACKGROUND = "background-";
		EXPORT_PROPERTIES[BACKGROUND + "color"] = "rgba(0, 0, 0, 0)";
		EXPORT_PROPERTIES[BACKGROUND + "image"] = "none";
		EXPORT_PROPERTIES[BACKGROUND + "size"] = "auto";
		EXPORT_PROPERTIES[BACKGROUND + "position"] = "0% 0%";
	
		EXPORT_PROPERTIES["margin"] = "0px none rgb(0, 0, 0, 0)";
		EXPORT_PROPERTIES["padding"] = "0px";
		EXPORT_PROPERTIES["border"] = "";
		for(var i = 0; i < 4; ++i) {
			//EXPORT_PROPERTIES["border-"+ POS[i]] = {has:"0px"};
			//EXPORT_PROPERTIES["padding-"+ POS[i]] = "0px";
			//EXPORT_PROPERTIES["margin-"+ POS[i]] = "0px";
			EXPORT_PROPERTIES[POS[i]] = "auto";
		}
		var prefix;
		for(var i = 0; i < browserPrefix.length; ++i) {
			prefix = browserPrefix[i];
			//EXPORT_PROPERTIES[prefix + "transform"] = "none";
			//EXPORT_PROPERTIES[prefix + "transform-origin"] = "";
		}
		var _lengthObject = function(obj) {
			var count = 0;
			for(var i in obj) {++count;}
			return count;
		}
		var _exportStyle = function(element) {
			var exportStyle = {};
			var styles = window.getComputedStyle(element);
			try {		
				for(var property in EXPORT_PROPERTIES) {
		
					var propertyValue = styles[property];
					var propertyDefaultValue = EXPORT_PROPERTIES[property];
					if(typeof propertyValue === "undefined" || propertyValue === "" || propertyValue === propertyDefaultValue)
						continue;
					
					exportStyle[property] = propertyValue;
				}
				if(!exportStyle.position || exportStyle.postion === "static")
					exportStyle.position = "relative";
			} catch (e){
				console.log(element, "type : " + element.nodeType, property);
			}			
			return exportStyle;
		}
		var _exportCheckRepeatStyle = function(style, motion) {
			for(var property in style) {
				if(motion[property] === style[property])
					delete style[property];
					
				if(property.indexOf("transform-origin")) {
					if(!motion.hasOwnProperty("motion")) {
						motion.origin = style[property];
					}
					delete style[property];
				}
			}
		}
		timelinePrototype._exportToJSON = function(element) {
			var className = element.className;
			className = className.replace("daylightAnimationLayer", "");
			className = className.trim();
			var json = {n:element.nodeName, i:element.id, cn:className};
			var node, value;
			switch(json.name) {
			case "IMG": json.src = element.src;break;
			}
			
			var layer = this.getLayer(element);
	
			if(layer) {
				json.ms = layer.motions;
				json.tt = layer.totalTime;
				json.p = layer.properties;
				layer.optimize();
			}
		
			var childNodes = element.childNodes;
			var length = childNodes && childNodes.length || 0; 
			
			if(length !== 0)
				json.cns = [];
			
			for(var i = 0; i < length; ++i) {
				node = childNodes[i];
				//주석
				if(node.nodeType === 8)
					continue;
				value = node.nodeType === 3? node.innerHTML : this._exportToJSON(childNodes[i]);
				if(value) json.cns.push(value)
			}
			json.s = _exportStyle(element);
			if(json.ms && json.ms[0] && json.ms[0].time === 0) {
				_exportCheckRepeatStyle(json.s, json.ms[0]);
			}
			if(_lengthObject(json.s) === 0)
				delete json.s;
				
			
			return json;
		}
	}());


	daylight.defineGetterSetter(daylight.animation.Timeline, "animationType");
	daylight.defineGetterSetter(daylight.animation.Timeline, "count");
	daylight.defineGetter(daylight.animation.Timeline, "is_finish");
	daylight.defineGetter(daylight.animation.Timeline, "is_start");
	daylight.defineGetter(daylight.animation.Timeline, "is_pause");
	
	daylight.defineGlobal("$Anim", daylight.animation);
	daylight.defineGlobal("$Timeline", daylight.animation.Timeline);

})(daylight);



