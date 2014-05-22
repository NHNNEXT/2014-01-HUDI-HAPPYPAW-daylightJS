window.requestAnimFrame = (function(){
  return  window.requestAnimationFrame       ||
          window.webkitRequestAnimationFrame ||
          window.mozRequestAnimationFrame    ||
          function( callback ){
            window.setTimeout(callback, 1000 / 60);
          };
})();

/*공통 
 * 전반적으로 오류 상황에 대해서 잘 대처하고 있는지 모르겠음.
 * 인자의 갯수나 타입이 올바르지 않다면 console.warn과 같이 개발자에게 경고성멘트를 남겨두는 것도 좋을 듯.
 * 필요하면 인자타입을 체크하는 로직을 만들어서 재사용하는 것도 방법.
 */

//전역변수가  어떻게 이렇게 널려있지..
//daylight만의 namespace(이름을 짓기 위한 껍데기 객체)를 생성하고 그 안에 담는 게 나을 듯.
//그래서 4개가가 지금처럼 배열로 나눠져 있지 않고 하나의 객체묶음으로 같이 존재하는 것이 좋겠음. 

//content width에 따라 바뀔 수 있는 속성
var lrtype = ["left", "right", "width", "margin-left", "margin-right", "padding-left", "padding-right"];
//content height에 따라 바뀔 수 있는 속성
var tbtype = ["top", "bottom", "height", "margin-top", "margin-bottom", "padding-top", "padding-bottom"];
//숫자로 치환할 수 있는 타입
var dtype = ["rotate", "opacity", "tx", "ty", "gtop", "gleft"];
var dimensionType = ["px", "em", "%"]

//아래 3개는 그냥 전역함수인데... 객체에 묶여있게 하는 것이 좋겠음.
function _dot(a1,a2,b1,b2) {
	if(b1 + b2 == 0)
		return a1;
	return a1 * b1 / (b1 + b2) + a2 * b2 / (b1 + b2);  //혼란스럽지 않게 괄호를 더 많이 사용해서 연산자 우선되는 것을 표시해두기
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
	for(var i = 0; i < length; ++i) {  //length는 미리 항상 계산해두기.자바스크립트는 루프가도는 만큼 그 갯수를 계산함.
		if(a.indexOf(dimensionType[i]) != -1)
			return dimensionType[i];
		}
	return "";
}

daylight.animation = {
		//actionList : Dictionary(Object)
		CONSTANT : {
			browserPrefix : ["", "-webkit-", "-moz-", "-o-", "-ms-"],
			transformList : {"gleft":"translateX(?)","tx":"translateX(?)", "gtop":"translateY(?)","ty":"translateY(?)", "rotate":"rotate(?)", "scale" : "scale(?)", "rotateX":"rotateX(?)", "rotateY":"rotateY(?)"},
			browserEffectCSS : {"origin" : "transform-origin:?", "transition":"transition:?"},
			styleStartAnimation : "{prefix}animation: daylightAnimation{id} {time}s {type};\n{prefix}animation-fill-mode: forwards;\n{prefix}animation-iteration-count:{count};\n",
			stylePauseAnimation : "{prefix}animation-play-state:paused;\n",
			ignoreCSS : ["count", "time", "function", "length", "fill"]
		},
		prefixToBrowser : function(css, prefix) {
			prefix = prefix === undefined ? "all" : prefix;  //typeof prefix === "undefined" 가 좀더 일반적인 습관.
			//prefix
			//all : prefix별로 바꿔준다.
			//-1 : prefix를 바꾸지 않고 그대로 둔다.
			//나머지 : 지정된 prefix로 바꿔준다.
			
			var CONSTANT = this.CONSTANT;
			var browserPrefixLength = CONSTANT.browserPrefix.length;
			var cssWithPrefix;
			
			switch(prefix) {
			case "all":
				var totalStyle = "";
				for(var i = 0; i < browserPrefixLength; ++i) {
					totalStyle +=daylight.replace("{prefix}", CONSTANT.browserPrefix[i], css);
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
		//이제 주석 메타태크 형태로 사용하는건가?? 오~ 자동으로 추출하는 YUIDOC같은 거 쓸거야? 암튼 좋다.
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
			var style = selector + "{";
			style += value;
			style += "}";
			
			return style;
		},
		/**
		*
		* @prarm {object} property, value 쌍으로 이루어져 있는 Object
		* @prarm {string} prefix prefix가 없으면 모든 브라우저에 맞게 고쳐준다.
		* @desc CSS값들이 있는 Object를 style로 바꿔준다.
		*/
		// 사실 동적타이핑인 자바스크립트의 변수는 헝가리안 표기법이 꽤 좋음.(사실상 표준적인 현장 방법이랄까..)
		objectToCSS: function(actionList, prefix) {
			var CONSTANT = this.CONSTANT;
			var transformList = [];
			var browserEffectList = [];
			var otherList = [];
			var totalStyle = "";
			var transformStyle = "{prefix}transform:";
			var browserEffectStyle = "" ;
			var otherStyle = "";
			var action, replaceMotion;
			var j;
			prefix = prefix === undefined ? "all" : prefix;
			//prefix = -webkit-, -moz-, -ms-, -o-, "", "all", -1 : 고치지 않고 그대로.
			
			for(action in actionList) {
				if(action in CONSTANT.transformList)
					transformList.push(action);
				else if(action in CONSTANT.browserEffectCSS)
					browserEffectList.push(action);
				else if(CONSTANT.ignoreCSS.indexOf(action) != -1)
					continue;
				else 
					otherList.push(action);
			}
			//아래 if문 3개 그 안의 로직은 함수로 모두 빼고 여기서는 구현된 각각의 함수만 호출하는 게 어떨지.
			//아마도 그렇게 구현된 함수는 objectToCSS함수 안에 포함된 내부 함수일 수도 있고.
			if(transformList.length > 0) {
				for(j = 0; j < transformList.length; ++j) { //length는 변수에 담아두고 재사용. 객체 속성을 자꾸 접근하는 것을 줄여보기
					action = transformList[j];
					replaceMotion = CONSTANT.transformList[action].replace("?", actionList[action]);
					transformStyle += " " + replaceMotion;
				}
				transformStyle += ";\n";
				totalStyle += this.prefixToBrowser(transformStyle, prefix);
			}
			if(browserEffectList.length > 0) {
				for(j = 0; j < browserEffectList.length; ++j) {
					action = browserEffectList[j];
					replaceMotion = "{prefix}" + CONSTANT.browserEffectCSS[action].replace("?", actionList[action]);
					browserEffectStyle += " " + replaceMotion;
					browserEffectStyle += ";\n";
				}
				totalStyle += this.prefixToBrowser(browserEffectStyle, prefix);

			} //이렇게 긴~ 함수에서는 if문과 다음 if문 사이에 한 줄 공백이 있음 훨씬 보기 좋음.
			if(otherList.length > 0) {
				for(j = 0; j < otherList.length; ++j) {
					action = otherList[j];
					otherStyle += action+":"+actionList[action];
					otherStyle += ";\n";
				}
				totalStyle += otherStyle;
			}
			var cssStyle = daylight.replace("{prefix}", CONSTANT.browserPrefix[1], totalStyle);
			return cssStyle;
		},
		/**
		*
		* @class
		* @classdesc 타임라인
		*
		*/
		Timeline : function(selector) {
			console.log("NEW TIMELINE");
			
			this.selector = selector;
			var dl_object = this.dl_object = daylight(selector);
			this.layers = [];
			this.totalTime = 0;
			this.animationType = "ease";
			this.count = "infinite";
			
			dl_object.scroll(function(e) {e.preventDefault();});
			

			
		},//레이어를 만드는 함수
		/**
		*
		* @class
		* @classdesc 타임라인의 레이어
		*
		*/
		Layer: function(selector, initMotion) {
			this.selector = selector;
			var id = selector;
			id = daylight.replace(" ", "", id);
			id = daylight.replace(".", "", id);
			id = daylight.replace("#", "", id);
			
			this.id = id;
			this.dl_object = daylight(selector);
			
			if(this.dl_object.size() == 0) {
				throw new Error("레이어가 없습니다.");  //에러처리 좋네. 이런메시지도 하나의 메시지상수 객체를 만들어두고 넣어두는 게 좋긴함.(비즈니스로직과 데이터의 분리차원에서)
			}
			
			
			//생성자안에서 디폴트 값을 설정하는 함수를 한번 만들어두고 다른 생성자에서 재사용할 수 있게 하는 건 어떨까?
			//생성자마다 option처리하는 방식이 일관성이 약간 부족해보여.
			this.motions = [];
			this.timeSchedule = {};
			this.initMotion = initMotion;
			this.totalTime = 0;
			this.properties = [];
			if(this.initMotion) {
				this.initMotion.time = -1;
				this.addMotion(this.initMotion);
			}
		},
		Motion: function(time, _propertyValues, option) {
			option = option || {};
			this.count = option.count || 0;
			this.fill = option.fill || "";
			this.time = time;
			this.propertyValues = _propertyValues;
		}
};
daylight.animation.animationActions = {
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
					if(loopMotion.indexOf(property) == -1)
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
daylight.animation.Layer.prototype.fillMotion = function(motion, fromMotion, is_force) {
	var self = this;
	var ignoreCSS = daylight.animation.CONSTANT.ignoreCSS;
	//is_force -1이면 언제든지 바꾸기 요청이 오면 바꾸게 할 수 있다.
	if(!fromMotion)
		return;


	//중복되는 프로퍼티가 있는지 검사.
	if(is_force != -1 && is_force != 1) {  //비용이 더 들지 모르겠지만,, if(Math.abs(is_force) !==1)  이렇게 해도 같을 듯.
		//언더바 표기법을 썻다가..카멜표기법을 썻다가.. 잘 결정하고 일관되게 이름을 짓도록.
		var is_repeat = false;
		daylight.each(fromMotion, function(value, key){
			if(ignoreCSS.indexOf(key) >= 0)
				return;
				
			if(motion.hasOwnProperty(key))
				is_repeat = true;  //is라는 건 주로 boolean타입을 리턴하는 함수에 사용하고 변수는 bRepeat 처럼 prefix에 b라는 단어를 사용하는 게 일반적.
			
	
		});
	}
	if(is_repeat) {
		fromMotion.time += 0.0001; //이런숫자는 불편임??
		this.addMotion(fromMotion);
		return false;
	}
	daylight.each(fromMotion, function(value, key){
		if(ignoreCSS.indexOf(key) >= 0)
			return;
			
		if(motion.hasOwnProperty(key + "?a") && !is_force) {
			motion[key] = value;
			delete motion[key + "?a"];
		} else if(!motion.hasOwnProperty(key) || is_force)
			motion[key] = value;
		if(is_force == -1) {
			motion[key + "?a"] = value;
		}
	});
	return true;
}
//index 이전의 모션에 등록되어 있는 속성들을 지금 속성에 붙혀넣기.
daylight.animation.Layer.prototype._fillPrevMotionsWithMotionWithIndex = function(motion, index) {
	var motions = this.motions;
	var ignoreCSS = daylight.animation.CONSTANT.ignoreCSS;
    while(--index >= 0) {
       	var _motion = motions[index];
        for(var property in _motion) {
        	if(ignoreCSS.indexOf(property) != -1)
        		continue;
            if(this.hasProperty(motion, property) != -1)
                continue;
            
            motion[property] = _motion[property];
        }
    }
}
//method 에 underbar가 붙은 건 private속성으로 이해하고 있겠음.
daylight.animation.Layer.prototype._fillNextMotions = function(motion, time) {
	var self = this;
	var motions = this.motions;
	var ignoreCSS = daylight.animation.CONSTANT.ignoreCSS;
    daylight.each(motion, function(value, property) {
    	if(ignoreCSS.indexOf(property) >= 0)
			return;
       
	    var index = self.indexOfNextMotionWithTime(time);
	    if(index == -1)
	        return;
	    
	    var length = motions.length;
	    var _motion;
	    
	    do {
	        _motion = motions[index];
	        if(self.hasProperty(_motion, property) == 1)
	            return;
	
	        _motion[property +"?a"] = value;
	    } while((++index) < length);
    });
}

///hasproperty의 반환값이 0, 1, -1인데 3가지 유형으로 꼭 해야 하는 걸까? 두가지라면 true, false로 그냥 하면 될텐데.
daylight.animation.Layer.prototype.hasProperty = function(index, property) {
	var motions = this.motions;
	var motion = typeof index === "object" ?index : motions[i];
	if(motion.hasOwnProperty(property))
		return 1;
	else if(motion.hasOwnProperty(property + "?a"))
		return 0;
	
	return -1;
}

daylight.animation.Layer.prototype.getPrevMotion = function(name, time) {
	var max_time = -2;
	var value = {};
	
	//근데 너가 사용한 each함수가 native메서드 보다 빠르니? 그냥 궁금했다. native메서드는 브라우저 지원 범위가 아직 넓지 않지만..
	daylight.each(this.motions, function(o, index) {
		if(max_time > o.time || time < o.time)
			return;
			
		
		var tmp = o.hasOwnProperty(name + "?a") ? o[name +"?a"] : o[name];

		if(tmp !== undefined) {
			value = o;
			max_time = o.time;
		}
	});
	return value;
}
/*
	@param {string} css property
	@param {number} 찾고 싶은 시간
*/
//getPreMotion과 꽤 중복이네..해결방법은 없을꼬.
daylight.animation.Layer.prototype.getNextMotion = function(name, time) {
	var min_time = 100000000; //의미없는 값... 밖으로 상수로 빼. 
	var value = {};
	
	daylight.each(this.motions, function(o, index) {
		if(min_time < o.time || time > o.time)
			return;

		var tmp = o.hasOwnProperty(name + "?a") ? o[name +"?a"] : o[name];
		if(tmp !== undefined) {
			value = o;
			min_time = o.time;
		}
	});
	return value;
}


daylight.animation.Layer.prototype._addMotion = function(motion) {
	var motions = this.motions;
	var time = motion.time;
	
    var index = this.indexOfNextMotionWithTime(time);
    if(index == -1)
       	motions.push(motion);
    else
    	motions.splice(index, 0, motion);


    
    var is_max = false;
    if(this.totalTime < time) {
        this.totalTime = time;
        is_max = true;
        index = this.motions.length - 1;
    }
    if(is_max || motion.fill === "auto") {
    	this._fillPrevMotionsWithMotionWithIndex(motion, index);
    }
}
/**
*	@param {object|object[]} motion / motion List / from Motion to Motion
*	@returns {Layer} this
*/

//재귀도 적절히 잘 쓴 거 같은데. 덩어리가 너무 크니까 좀 분리하자. 의미적으로 아래 from---to 부분을 나눌수도 있지 않을까? (private함수로)
daylight.animation.Layer.prototype.addMotion = function(motion) {
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
			
			self.properties.push(k);
		});
		
		var _motion = this.getMotion(time);
		var is_success = false;
	    if(!_motion) {

	        this._addMotion(motion);
	        is_success = true;
	    } else {
	        is_success = this.fillMotion(_motion, motion);// _motion에  motion을 추가
	    }
	    time = motion.time;
	    if(is_success)
		    this._fillNextMotions(motion, time);
		

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
daylight.animation.Layer.prototype.initTimer = function() {
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
daylight.animation.Layer.prototype.getMotion = function(time) {
	var totalTime = this.totalTime;
	var motions = this.motions;
	var length = this.motions.length;
    if(length == 0)
        return;
    
/*
    for(var i = 0; i < length; ++i) {
	    if(motions[i].time === time)
	    	return motions[i];
    }
    return;
    
*/
    
    //test
    var i = totalTime == 0 ? 0 : Math.floor(time / totalTime * length);
    
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
        if(to == 1 && motion.time > time)
        	return;
        else if(to == -1 && motion.time < time)
        	 return;
        	 
        if(this.id === "brown")       
           console.log(motion.time,  time);
    }
	    
    return;
}
daylight.animation.Layer.prototype.indexOfNextMotionWithTime = function(time) {
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
daylight.animation.Layer.prototype.getTimeValue = function(time, property, prev, next) {
	var prevMotion = prev[property];
	var nextMotion = next[property];
	var dimension = "";
	
	var value = prevMotion;
	if(lrtype.indexOf(property) !== -1)
		dimension =  "width";
	else if(tbtype.indexOf(property) !== -1)
		dimension = "height";
	else if(dtype.indexOf(property) !== -1)
		dimension = "dimension";
	
	var prevTime = time - prev.time;
	var nextTime = next.time - time;

	if(dimension === "width" || dimension === "height") {
		var p100 = this.dl_object.dimension(dimension);//100퍼센트 기준으로 수치
		prevMotion = _abspx(prevMotion, p100);
		nextMotion = _abspx(nextMotion, p100);
		value = _dot(prevMotion, nextMotion, nextTime, prevTime) +"px";

	} else if(dimension === "dimension") {
		prevMotion = _abspx(prevMotion);
		nextMotion = _abspx(nextMotion);
		//console.log(prevMotion, nextMotion);
		value = _dot(prevMotion, nextMotion, nextTime, prevTime);
		
		switch(property) {
		case "rotate":
			value = value + "deg";
			break;
		case "tx":
		case "ty":
		case "gtop":
		case "gleft":
			value = value + "px";
			break;
		}
	} else {		
		return "transition";
	}
	return value;
}
daylight.animation.Layer.prototype.timer = function(time) {
	var properties = this.properties;
	var length = properties.length;
	var motions = {};
	var value, property, prev, next;
	var dl_object = this.dl_object;
	for(var i = 0; i < length; ++i) {
		property = properties[i];
		prev = this.getPrevMotion(property, time);
		next = this.getNextMotion(property, time);
		
		if(!prev.hasOwnProperty(property)) {
			if(daylight.animation.CONSTANT.transformList.hasOwnProperty(property))
				continue;

			
			if(property === "border-radius")
				console.log(time +"  "+ dl_object.css(property));

			prev[property] = dl_object.css(property);
			prev.time = 0;
			prev.count = 0;
			
			this.motions.push(prev);
			
			if(this.getMotion(time))
				this.getMotion(time)[property] = prev[property];
			else
				this.getMotion(prev);
			
		}
		
		if(!next.hasOwnProperty(property))
			next = prev;
			
		value = this.getTimeValue(time, property, prev, next);
		if(value === "transition") {
			motions["transition"] =  property + " linear " + (next.time - prev.time) + "s";
			motions[property] = next[property];
		} else {
			motions[property] = value;
		}

		//_dot(time - prevMotion.time, nextMotion.time - time)	
	}

	var style = daylight.animation.objectToCSS(motions);
	dl_object.each(function(element) {
		//오리지날 스타일
		var ostyle = element.getAttribute("data-style") + ";" || "";

		element.setAttribute("style", ostyle + style);
	});
	return motions;
}


daylight.animation.Layer.prototype.getCSSInitMotion = function() {
	if(this.initMotion) {
		var styleHTML = daylight.animation.objectToCSSWithSelector(this.selector, this.initMotion);
		return styleHTML;
	}
	return "";
}
//count와. type 테스트 값.
daylight.animation.Layer.prototype.getCSSInit = function(count, type) {
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
	var percentage;

	for(var i = 0; i < browserPrefixLength; ++i) {
		prefix = browserPrefix[i];
		styleHTML += "@" + prefix +"keyframes daylightAnimation"+id+" {\n";
		daylight.each(this.motions, function(motion, i) {
			percentage = parseFloat(motion.time) * 100 / totalTime;//시간을 %로 바꿔준다.
			
			styleHTML += daylight.animation.objectToCSSWithSelector(percentage +"%"
						, motion, prefix) +"\n";	
		});
		styleHTML += "}\n";
	}

	var data = {id: id, time: totalTime, count: count, type: type};
	styleStartAnimation = daylight.template(data, styleStartAnimation);
	
	
	styleHTML += daylight.animation.getCSSWithSelector(this.selector + ".animationStart"
				,daylight.animation.prefixToBrowser(styleStartAnimation)) +"\n";

	styleHTML += daylight.animation.getCSSWithSelector(this.selector + ".animationPause"
				,daylight.animation.prefixToBrowser(stylePauseAnimation)) +"\n";	

	
	return styleHTML;

}


//test
daylight.animation.Layer.prototype.print = function() {
	var motions = this.motions;
	daylight.each(motions, function() {
		console.log(JSON.stringify(this));
	});
}


daylight.animation.Timeline.prototype.hasLayer = function(layer) {
	var layers = this.layers;
	var t = daylight.type(_layer);
	var is_string = t === "string";
	var layerLength = layers.length;
	var _layer;

	for(var i = 0; i < layerLength; ++i) {
		_layer = layers[i];
		if(!is_string && _layer.dl_object.equal(layer.dl_object))
			return true;
		
		if(is_string && _layer.id != layer)
			continue;
		else if(!is_string && (layer != _layer))// && layers[i].layer.id != layer.id
			continue;
		
		return true;
	}
	return false;
}
daylight.animation.Timeline.prototype.getLayer = function(layer) {
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
daylight.animation.Timeline.prototype.createLayer = function(selector, initMotion) {
	var a = new daylight.animation.Layer(selector, initMotion);
	var id = this.addLayer(a);
	if(id == null)
		return;
	
	return a;
}
daylight.animation.Timeline.prototype.addLayer = function(selector, initMotion) {

	var layer = (selector instanceof daylight.animation.Layer) ? selector : new daylight.animation.Layer(selector, initMotion);
	
	if(this.hasLayer(layer)) {
		console.log("이미 레이어가 있습니다. id : " + layer.id);
		return null; //보통 null을 리턴하지 않고 그냥 return.(자바스크립트에서는 null을 객체 초기화 할 때 빼고는 잘 안써서.)
	}

	layer.dl_object.addClass("daylightAnimationLayer");
	this.layers.push(layer);
	
	return layer.id;
}
daylight.animation.Timeline.prototype.setLayer = function(layer, initMotion) {
	if(!layer) {
		console.log("잘못된 레이어입니다.");
		return;
	}
	
	var _layer = this.getLayer(layer);
	
	if(!_layer) {
		console.log("레이어가 없습니다.");
		return;
	}
	_layer.initMotion = initMotion;
}
daylight.animation.Timeline.prototype.addAction = function(layer, name, startTime, endTime, option) {
	//fade-in
	//fade-out
	//move, zoom(not scale)
	//disolve(targe포함)
	
	var _layer = this.getLayer(layer);
	if(daylight.animation.animationActions.hasOwnProperty(name)) {
		daylight.animation.animationActions[name](_layer, startTime, endTime, option);
	} else {
		throw new Error("해당하는 엑션이 없습니다.")
	}
	return this;
}
daylight.animation.Timeline.prototype.addMotion = function(layer, motion) {
	if(!layer) {
		throw new Error("잘못된 레이어입니다.");
	}
	var _layer = this.getLayer(layer);
	if(!_layer) {
		throw new Error("레이어가 없습니다.");
	}
	_layer.addMotion(motion);
	return this;
}
daylight.animation.Timeline.prototype.fillTimeline = function(layer) {
	var motions = layer.motions;
	var totalTime = this.totalTime;
	var fMotion = {time:0};
	var finalMotion = {time:0};
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
		
		
		if(finalMotion.time <= time)
			finalMotion = motion;
	}
	
	layer.fillMotion(fMotion, finalMotion, 1);
	if(!layer.getMotion(totalTime))
		layer.addMotion(fMotion);
	
	
	return this;
}
daylight.animation.Timeline.prototype.getInitMotionCSS = function() {
	var styleHTML = '<style class="daylightAnimationInitStyle">\n';
	var layers = this.layers;
	var layerLength = layers.length;
	for(var i = 0; i < layerLength; ++i) {
		styleHTML += layers[i].getCSSInitMotion();
	}
	styleHTML += '</style>';
	
	return styleHTML;
}
daylight.animation.Timeline.prototype.initTimer = function() {
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
	
	var style = $(".daylightAnimationStyle, .daylightAnimationInitStyle");
	
	if(!style.isEmpty())//removeStyle
		style.remove();
		
	$("head").append(this.getInitMotionCSS());
	return this;
}
daylight.animation.Timeline.prototype.init = function() {
	console.log("INIT TIMELINE");

	var layers = this.layers;
	var layerLength = layers.length;

	var styleHTML = '<style class="daylightAnimationStyle">\n';

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

	var style = $(".daylightAnimationStyle, .daylightAnimationInitStyle");
	
	if(!style.isEmpty())//removeStyle
		style.remove();
		
	$("head").append(styleHTML);
	$("head").append(this.getInitMotionCSS());

	return this;
}
daylight.animation.Timeline.prototype.executeFunction = function(schedule, spendTime, count) {
	
}
daylight.animation.Timeline.prototype.timer = function() {

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
			
			if(time > nowTime && (motion.count == count))
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
			layer.timer(nowTime);
		}
	});
	
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
daylight.animation.Timeline.prototype.finish = function() {
	console.log("FINISH TIMELINE totalTime : " + this.totalTime);
	this.startTime = this.prevTime = this.nowTime = this.spendTime = 0;
	this.is_start = false;
	this.is_pause = false;
	this.is_finish = true;
	return this;
}
/**
*
* @desc 재생된 횟수를 초기화한다.
*/
daylight.animation.Timeline.prototype.initCount = function() {
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
daylight.animation.Timeline.prototype.start = function() {
	console.log("START TIMELINE totalTime : " + this.totalTime);
	$(".daylightAnimationLayer").addClass("animationStart");
	$(".daylightAnimationLayer").removeClass("animationPause");
	this.initCount();
	
	this.startTime = this.prevTime = Date.now();
	this.nowTime = this.spendTime = 0;
	requestAnimFrame(this.timer.bind(this));
	this.is_start = true;
	this.is_finish = false;
	this.is_pause = false;
	return this;
}
/**
*
* @desc 일시중지
*/
daylight.animation.Timeline.prototype.pause = function() {
	console.log("PAUSE TIMELINE");
	$(".daylightAnimationLayer").toggleClass("animationPause");
	this.is_pause = !this.is_pause;
	if(!this.is_pause) {
		this.prevTime = Date.now();
		requestAnimFrame(this.timer.bind(this));
	}
	return this;
}
daylight.animation.Timeline.prototype.showAnimationBar = function() {
	
}

daylight.defineGetterSetter(daylight.animation.Timeline, "animationType");
daylight.defineGetterSetter(daylight.animation.Timeline, "count");
daylight.defineGetter(daylight.animation.Timeline, "is_finish");
daylight.defineGetter(daylight.animation.Timeline, "is_start");
daylight.defineGetter(daylight.animation.Timeline, "is_pause");
daylight.extend(daylight.animation);