//
//1. 공통 (convention)
// private한 것은 prefix에 (_)언더바를 잘 사용할 것.
// 함수는 동사_명사형태로 이름지을 것.
// 생성자는 첫글자를 대문자로 시작해서 일반 메서드와 구별할 수 있게 할 것.
// object 의 prefix에는 'o' 나 hashtable을 의미하는 'ht' 를 붙이는 게 좋겠음.
// array 에는 'a'를 prefix로 붙이는 게 좋겠음.

// framework 소스를 그대로 퍼오는 것보다 착안해서 구현하는 게 좋겠음. 
// chaining 을 지원하는 건 꽤 중요함. 
// 

(function(window) {

var document = window.document || document;
var class2type = {};
var toString = class2type.toString;
var hasOwn = class2type.hasOwnProperty;
var navigator = window.navigator || navigator;
var userAgent = navigator.userAgent;

var daylight = function(query, parent) {
	return daylight.init(query, parent);
};


window.light = window.$ = window.dlight = window.daylight = daylight;

daylight.document = document;
daylight.version = "1.0.0";  //1.0.0 은 major버전.minor버전.trivial버전 을 의미하는데..출시전단계면 Major버전을 1 로 하진 않을 듯 ^^(이미 출시?)


daylight.CONSTANT = {SLOW:"slow", FAST:"fast"};
daylight.OPTION = {speed : daylight.CONSTANT.SLOW};


var CONSTANT = daylight.CONSTANT,
	OPTION = daylight.OPTION;


var _textToElement = function(text) {
	var e = document.createElement("div");
	e.innerHTML = text;
	return e;
}
var _arraySum = function(arr) {
	var a = [];
	var l = arr.length;
	for(var i = 0; i < l; ++i) {
		var type = daylight.type(arr[i]);
		if(type === "array")
			a.concat(arr[i]);
	}
	return a;
}
var _style = function(element) {
	if(window.getComputedStyle)
		return window.getComputedStyle(element);
	else if(element.currentStyle)
		return element.currentStyle;
	else if(element.style)
		return element.style;
}
var _curCss = function(element, name, cssHooks) {
	//62 ~ 66 라인은 그냥 || 연산자를 사용해서 같이 return 처리. 참고로 return false나 null이 더 좋음. undefiend는 자바스크립트가 
	//사용하는 type이라고 생각하는 게 좋고. 이걸 코드에서 사용하는 건 좋지 않음.
	if(!element)
		return undefined;
	if(!name)
		return undefined;
	var style;
	if(!cssHooks) {
		style = _style(element)[name];
	} else {
		style = cssHooks[name];
	}
	if(style[style.length - 1] == "%") {
		//test
		var percentage = parseFloat(style);
		var offsetParent = element.offsetParent;

		var cssHooks = _style(offsetParent);
		var dimension = _curCssHook(offsetParent, name, cssHooks);
		//100이 의미하는게 뭐지? 이런 데이터는 외부상수로 빼던가 . 주석으로 설명을 꼭 달아둘 것. 
		//전체적으로 주석을 아끼지 말것 (주석은 배포단게에서 없에주는 툴이 있으니 그때 다 날라감.)
		return percentage * dimension / 100 + "px";
	}
	
	return style;
}
var _dimensionCssHook = function(element, component, cssHooks) {
	//한번을 초과해서 사용하는 변수는 항상 담아두기 
	//var sLeft = component[0];
	//var sRign = component[1];
	// var border_left = _curCss(element, "border-" + sLeft + "-width", cssHooks);

	var border_left = _curCss(element, "border-"+component[0]+"-width", cssHooks);
	var border_right = _curCss(element, "border-"+component[1]+"-width", cssHooks);
	var padding_left = _curCss(element, "padding-"+component[0], cssHooks);
	var padding_right = _curCss(element, "padding-"+component[1], cssHooks);
	//비교는 확실하지 않은 경우는 ==보다는 === 를 사용하는 습관.
	//$(element) 도 변수에 담아두는 게 좋았을 뻔. 
	var inner = (component[0] == "left") ? $(element).innerWidth() : $(element).innerHeight();
	var dimension = inner - parseFloat(border_left) - parseFloat(border_right) - parseFloat(padding_left) - parseFloat(padding_right);	
}
var _curCssHook = function(element, name, cssHooks) {
	//아래 두 개는 뭔가 의미 있어보이는 데... 두개의 Array가 하나의 Object에 포함해서 var totalType = {lrtype : [] , tbtype : []} 이렇게 의미적으로 합치는 게 어떨뻔 ?
	var lrtype = ["left", "right", "width", "margin-left", "margin-right", "padding-left", "padding-right", "border-left-width", "border-right-width"];
	var tbtype = ["top", "bottom", "height", "margin-top", "margin-bottom", "padding-top", "padding-bottom", "border-top-width", "border-bottom-width"];	
	if(lrtype.indexOf(name) != -1) {
		var requestComponent = ["left", "right"]
		return _dimensionCssHook(element, requestComponent, cssHooks);
	} else if(tbtype.indexOf(name) != -1) {
		var requestComponent = ["top", "bottom"];
		return _dimensionCssHook(element, requestComponent, cssHooks);
	} else if(name == "font-size") {
		return _curCss(element.offsetParent, name);
	}
	//else문이 없어서..방어적인 코드가 아닐지도 모름. 확인필요.
	
	
	return dimension;
}
var _domEach = function(target, o, callback) {
	//함수에서 바로 오류를 뱉어야 하는 경우 아래처럼 빨리 return해주는 거 좋음. 
	//불필요한 연산이 없어짐. 
	if(target.size == 0)
		return;
		
	var t = daylight.type(o, true);
	var e;
	switch(t) {
	case "string":
	case "number":
		e = _textToElement(o).childNodes;
		break;
	case "daylight":
		e = o.o;
		break;
	case "nodelist":
	case "array":
		e = o;
	case "html":
		e = [o];
	}

	if(target.size == 1) {
		var self = target.o[0]
		//javascript 의 for 문의 length는 미리 변수에 할당하고 사용하는 게 좋음. (안그러면 매 loop 에서 그 길이를 계산함)
		for(var i = 0; i < e.length; ++i) {
			if(self == e[i])
				continue;
			
			callback.call(self, self, e[i]);
		}
	}
	target.each(function(self, index) {
		for(var i = 0; i < e.length; ++i) {
			if(self == e[i])
				continue;
			
			callback.call(self, self, daylight.clone(e[i]));
		}
	});
}
//Array's IndexOf
var arr = [];

var indexOf = arr.indexOf;
if (!Array.prototype.indexOf) {
    Array.prototype.indexOf = function (element) {
		var length = arr.length;
		
		//미리 길이를 구한 거 잘 했음. 
		for(var i = 0; i < length; ++i) {
			if(arr[i] == object)
				return i;
		}		
		return -1;
    }
}


//FORM INPUT, SELECT VALUE값는 찾는 함수와 설정하는 함수
var _value = {
	//SELECT 태그에 해당하는 함수
	select : {
		get : function(element) {
			var result = [];
			var options = element && element.options;
			var opt;
			
			for (var i=0, iLen=options.length; i<iLen; i++) {
				opt = options[i];
				
				if (opt.selected)
					result[result.length] = (opt.value || opt.text);
			}
			if(result.length > 1)
				return result;
			else
				return result[0];
		},
		set : function(element, key) {
			var result = [];
			var options = element && element.options;			
			var type = daylight.type(key);

			switch(type) {
				//아래 case 3가지에는 중복되는 코드가 있는데..(for 루프로직 부터 ) 함수로 빼는 것도 좋겠는데? 
				//함수라는 게 재사용은 아니지만 일회용 innerfunction을 사용해도 됨.
				/* Ex.
				 set : function() {
				   _execLoop();
				   funciton _execLoop (){
				   	//어쩌구
				   }
				 }
				*/
			case "number":
				for(var i = 0; i < options.length; ++i) {
					var opt = options[i];
					//boolean type이면 isSelected 라는 이름이 더 좋겠음. 
					opt.selected = false;
				}
				options[key].selected = true;
				break;
			case "string":
				for(var i = 0; i < options.length; ++i) {
					var opt = options[i];
					var value = (opt.value || opt.text);
					if(value == key)
						opt.selected = true;
					else
						opt.selected = false;
				}
				break;
			case "array":
				for(var i = 0; i < options.length; ++i) {
					var opt = options[i];
					var value = (opt.value || opt.text);
					if(key.indexOf(value) >= 0)
						opt.selected = true;
					else
						opt.selected = false;
				}
			}
		}
	//이건 별건 아닌데 줄바꿈을 할 때 오류가 나는 상황이 발생할 수 있기때문에 
	// } 
	// ,
	// 보다
	// },
	// 처럼 ,까지 쓰고 줄바꿈하는 게 좀더 좋음.
	}
	,input : {
		get : function(element, is_value) {
			var type = element.type;
			if(!_value[type])
				return element.value;
			else
				return _value[type].get(element, is_value);
		}
		,set : function(element, key) {
			var type = element.type;
			if(!_value[type])
				element.value = key;
			else
				_value[type].set(element, key);	
		}
	}
	,textarea : {
		get : function(element) {
			return element.innerText;
		}
		,set : function(element, key) {
			element.innerText = key;
		}
	}
	,radio : {
		get : function(element, is_value) {
			if(is_value || element.checked) return element.value;
			//아래 statement는 있으나마나..javascript는 반환값이 없으면 기본값이 undefined
			return undefined;	
		}
		,set : function(element, key) {
			var type = daylight.type(key);
			if(type == "array")
				//아래 코드는 이렇게 구현가능 (!! : is not NOT ^^)
				//element.checked = !! (key.indexOf(element.value) >= 0); 
				element.checked = key.indexOf(element.value) >= 0 ? true : false; 
			else if(element.value === key)
				element.checked = true;
			else 
				element.checked = false;
		}		
	}
	,checkbox : {
		get : function(element, is_value) {
			if(is_value || element.checked) return element.value;
			//아래 statement는 있으나마나..javascript는 반환값이 없으면 기본값이 undefined
			return undefined;	
		}
		,set : function(element, key) {
			var type = daylight.type(key);
			if(type == "array")
				element.checked = key.indexOf(element.value) >= 0 ? true : false; 
			else if(element.value === key)
				element.checked = true;
			else 
				element.checked = false;
		}
	}
	
};

//object가 생성자(constructor)라면 대문자로 시작해주는 게 보기 좋음.
daylight.object = function(arr) {
	var size = this.size = arr.length;
	this.o = this.objects = arr;
	
	//옵션 설정하면 제이쿼리랑 비슷하게 사용 가능 하지만 느려짐.
	if(OPTION.speed == CONSTANT.SLOW) {
		this.length = size;
		for(var i = 0; i < size; ++i) {
			this[i] = arr[i];
		}
	}	
}


//daylight.object의 프로토타입은 Array이다. JQuery가 느린 원인 중 하나. 하지만 매우 편하게 사용할 수 있다.
daylight.object.prototype = [];

//프로토타입을 daylight.fn으로 묶는다.
daylight.fn = daylight.object.prototype;

//daylight object라는 것을 인식
daylight.fn.daylight = "daylight";

//확장 함수
daylight.extend = daylight.fn.extend = function() {
	var a = arguments;
	var length = a.length;
	if(length == 0)
		return this;
	var target = this;
	var name;
	for(var i = 0; i <length; ++i) {
		var options = a[i];
		if(daylight.type(options) != "object")
			continue;

		for(name in options) {
			var src = target[name];
			var copy = options[name];

/*
	중복제거
			//ildan  continue;
			if(src)
				continue;
*/
			
			target[name] = copy;
		}
	}
}

//daylight만의 타입  Array, String 등 구분가능.
//type 말고 이름을 checkType이런이름으로 사용하는 게 어떨지
daylight.type = function(obj, expand) {
	var type = typeof obj;
	if(!expand)
		//자바스크립트 type check는 toString.call이 사실상 가장 정확한 방법인데 잘 사용했음.
		return type == "object" ? obj.daylight || class2type[toString.call(obj)] || "object" : type;
	
	return type == "object" ? obj instanceof HTMLElement ? "html" : obj.daylight || class2type[toString.call(obj)] || "object" : type;	
}
daylight.css = function(element, name, value) {
	if(value !== undefined && typeof value != "boolean") {
		element.style[name] = value;
		return value;
	}
	if(value === true) {
		var returnValue = parseFloat(_curCss(element, name));
		if(!returnValue
			//0이라면 false를 의미한거임? 이걸 사용하는 쪽에서의 상황을 잘 봐야 함. )
			// 0 == false  --> true
			// 0 === false  --> ???? 뭔지 알지?
			return 0;  
			
		return returnValue;
	}
	return _curCss(element, name);
}

//define 관련 함수들 모음
//와우 멋진데.
daylight.extend( {
	//해당 함수를 선언합니다.
	define : function(object, name, func) {
		var type = typeof object;
		if(type == "object" && object.__proto__)
			object.__proto__[name] = func;
		else if(daylight.indexOf(["function", "object"], type) != -1 && object.prototype)
			object.prototype[name] = func;
		else if(type == "object")
			object[name] = func;
	},
	//GetterSetter함수를 만듭니다.
	defineGetterSetter :function(object, name) {
		this.defineGetter(object, name);
		this.defineSetter(object, name);
	},
	defineGetter : function(object, name, func) {
		if(!func)
			func = function(name){return function() {return this[name];}}(name);
			
		name =  "get" + name.charAt(0).toUpperCase() + name.substr(1, name.length);	
		this.define(object, name, func);
	},
	defineSetter : function(object, name, func) {
		if(!func)
			func = function(name){return function(value) {return this[name] = value;}}(name);
			
		name =  "set" + name.charAt(0).toUpperCase() + name.substr(1, name.length);	
		this.define(object, name, func);
	}
	//전역변수를 만듭니다.
	,defineGlobal : function(name, o) {
		var typeName = this.type(name);
		if(typeName === "string")
			window[name] = o;
	}
});

//내용을 복사합니다.
daylight.clone = function(node, dataAndEvent, deepDataAndEvent) {
	var n = node.cloneNode();
	n.innerHTML = node.innerHTML;
	return n;
}

daylight.create = function(classFunction) {
	return function() {
		var a = new function(arg) {
			return classFunction.apply(this, arg);
		}(arguments);
		a.__proto__ = classFunction.prototype;
		
		return a;
	};
}

//해당 index를 보여줍니다.
daylight.index = daylight.indexOf = function(arr, object) {
	var type = typeof arr;
	
	if(arr.indexOf)
		return arr.indexOf(object);
	
	if(type == "object") {
		for(var key in arr) {
			if(arr[key] === object)
				return key;
		}
		return "";
	} else {
		var length = arr.length;
		
		for(var i = 0; i < length; ++i) {
			if(arr[i] == object)
				return i;
		}

		return -1;
	}
}


daylight.extend({
	nodeName : function(element, compare) {
		var nodeName = element.nodeName;
		
		if(compare !== undefined)//비교 대상이 있으면 비교값을 리턴 true, false;
			return nodeName === compare;
			
		return nodeName;//비교 대상이 없으면 노드 이름만 반환.
	},
	/**
* @func : daylight.isNode(Node)
* @description : 해당 객체가 Node인지 확인
* @param : Node
* @return : Boolean(노드이면 true 아니면 false)
*/
	isNode : function(o) {
		if(o instanceof Node)
			return true;
	
		return false;
	},
/**
* @func : daylight.isElement(Node)
* @description : 해당 객체가 Element인지 확인
* @param : Element
* @return : Boolean(Element이면 true 아니면 false)
*/
	isElement : function(o) {
		if(!o)
			return false;
			
		if(o.nodeType === 1)
			return true;
	
		return false;
	},
	isPlainObject : function(n) {
		if(!n)
			return false;
		
		if(n.constructor === Object)
			return true;
	}
});

/**
* @func : daylight.replace(SearchValue, NewValue, String)
* @description : replaceAll
* @param : from(바뀔 문자), to(바꿀 문자), str(문자열)
* @return : String
*/
daylight.replace = function(from, to, str) {
	return str.split(from).join(to);	
}

daylight.each = daylight.forEach = function(arr, callback) {
	var type = daylight.type(arr, true);
	if(type === "array" || type === "nodelist") {
		var length = arr.length;
		for(var i = 0; i < length; ++i)
			callback.call(arr[i], arr[i], i, arr);//i == index, arr
	} else if(type == "object") {
		for(var i in arr) 
			callback.call(arr[i], arr[i], i, arr);
	} else if(type === "daylight") {
			arr.each(callback);
	}
}
daylight.contains = function(parent, node, isContainParent) {
	return (isContainParent && parent === node || parent !== node )&& parent.contains(node);
}

//addClass, removeClass, hasClass
daylight.extend({
	/**
	* @func : daylight.removeClass(Element, className)
	* @description : 클래스를 삭제를 합니다.
	* @func : daylight.removeClass(Element, className, Boolean(ignore Checking Element))
	* @description : 클래스를 삭제를 합니다. (3번째 인자가 true로 들어오면 첫번째 인자가 Element인지 검사를 하는 코드를 무시합니다.)
	* @param : element(삭제할 element), className : 삭제할 클래스 이름, ignoreCheck : element의 검사를 무시할 수 있다.(중복 체크)
	* @return : Boolean(삭제 체크)
	*/
	removeClass : function(element, className, ignoreCheck) {
		if(!ignoreCheck && !daylight.isElement(element))
			return false;
			
		var name = element.className;
		var arr = name.split(" ");
		var length = arr.length;
		var afterClassName = "";

		
		for(var i = 0; i < length; ++i) {
			var eClass = arr[i];
			if(eClass == className)
				continue;
			afterClassName += afterClassName ? " " + eClass : eClass
		}
		element.className = afterClassName;
		
		return true;
	}
	/**
	* @func : daylight.hasClass(Element, className)
	* @description : 클래스를 가지고 있는지 확인
	* @param : Element(찾을 element), className : 찾을 클래스 이름
	* @return : Boolean(가지고 있는지 체크)
	*/
	,hasClass : function(element, className) {
		if(!daylight.isElement(element))
			return false;
			
		var name = element.className;
		var arr = name.split(" ");
		var length = arr.length;
		for(var i = 0; i < length; ++i) {
			if(arr[i] == className)
				return true;
		}

		return false;
	}, 
	/**
	* @func : daylight.addClass(Element, className)
	* @param : element(추가할 element), className(추가할 클래스 이름)
	* @return : Boolean(추가되었는지 체크)
	*/
	addClass : function(element, className) {
		if(daylight.hasClass(element, className))
			return false;
	
		if(element.className == "")
			element.className = className;
		else
			element.className += " " + className;
			
		return true;
	}
});

/**
* @func : daylight.init(query)
* @param : query(CSS Query)
* @return : new daylight.object
*/
daylight.$ = daylight.init = function(query, option) {
	var objects;
	var t = daylight.type(query);
	switch(t) {
	case "daylight":
		return query;	
	case "string":
		objects = query ? document.querySelectorAll(query) : [];
		if(!objects) objects = [];
		break;
	case "array":
	case "nodelist":
		objects = query;
		break;
	default:
		objects = [query];
	}
	return new this.object(objects, option);
}
/**
* @func : daylight.template(object, template)
* @param : object(Array, Object), template(String, Daylight)
* @return : html(String)
*/
daylight.template = function(obj, template) {
	var type = this.type(obj);
	var templateType = this.type(template);
	
	if(templateType == "daylight")
		template = template.ohtml();//html 형태로 변환
		
	if(type == "array") {//배열이면 리스트 형태로 만든다.
		var contents = [];
		var length = obj.length;
		for(var i = 0; i < length; ++i) {
			var content = obj[i];
			contents[contents.length] = this.template(content, template);//배열의 요소를 다시 template을 만든다.
		}
		return contents.join(" ");
	} else if(type == "object") {//배열의 요소를 분석해서 {key}를 바꿔준다.
		for(var k in obj) {
			var value = obj[k];
			if(this.type(value) == "array") {//만드는 중
				var regx = new RegExp('{' + k + '}((.|\n|\r)*?){/'+ k + '}', 'g');
				var list = template.match(regx);
				
				if(!list)
					continue;
				
				for(var i = 0; i < list.length; ++i) {
					var sub_template = list[i];
					sub_template = sub_template.replace("{" + k + "}", "");
					sub_template = sub_template.replace("{/" + k + "}", "");
					template = template.replace(list[i], daylight.template(value, sub_template) );//{key} => value
				}
				
			} else {
				if(value === undefined)
					value = "";
				template = daylight.replace("{" + k + "}", value, template);//{key} => value
			}
		}
		//console.log(template);
		return template;
	} else {
		//배열이나 Dictionary 형태가 아닌 다른 것들은 키를 1로 하고 value로 바꿔준다.
		return daylight.replace("{1}", obj, template);//{1} => value
	}
	return "";
}
/**
* @func : daylight.attr(name, value)
* @param : name(String), value(undefined, String)
* @return : attribute(String)
*/
daylight.fn.attr = function(name, value) {
	if(value === "" || value) {
		this.each(function(obj) {
			if(typeof obj == "object") {//속도 저하의 원인을 찾자!! 10ms 증가
				obj.setAttribute? obj.setAttribute(name, value) : obj.name = value;
			}
		});
		return this;
	}
	
	var o = this.o[0];
	if(typeof o == "object")	
		return  o.getAttribute ? o.getAttribute(name) : o[name];
	else
		return undefined;

}
daylight.fn.appendChild = function(object) {
	if(daylight.type(object) === "daylight") {
		var parent = this.o[0];
		object.forEach(function(e) {
			parent.appendChild(e);
		});
	} else {
		this.o[0].appendChild(object);
	}
}


daylight.fn.css = function(name, value) {
	if(!(value === undefined)) {
		if(typeof name == "object") {
			this.forEach(function(e) {
				for(var key in name) {
					e.style[key] = name[key];
				}
			});
		} else {
			this.forEach(function(e) {
				e.style[name] = value;
			});
		}
		return this;
	}
		
	return _curCss(this.o[0], name);
}

daylight.fn.drag = function(dragFunc) {
	var dragObject = null;
	var is_drag = false;
	var dragDistance = {x : 0, y : 0};
	var prePosition = null;
	
	var mouseDown = function(e) {
		is_drag = true;
		prePosition = daylight.$E.cross(e);
		dragDistance = {stx :prePosition.pageX, sty : prePosition.pageY, x : 0, y : 0, dx:0, dy:0};
		dragObject = e.target || e.srcElement;
/* 		console.log("DRAG START"); */
		dragFunc(dragObject, e, dragDistance);
	};
	var mouseMove = function(e) {
		if(!is_drag)
			return;	
		var position = daylight.$E.cross(e);
		dragDistance.dx = position.pageX - prePosition.pageX;
		dragDistance.dy = position.pageY - prePosition.pageY;
		dragDistance.x += dragDistance.dx;
		dragDistance.y += dragDistance.dy;

		prePosition = position;
		
		if(dragFunc) dragFunc(dragObject, e, dragDistance);
		e.preventDefault();
	};
	var mouseUp = function(e) {
		if(!is_drag)
			return;
		dragObject = null;
		is_drag = false;
	}
	
	this.addEvent("mousedown", mouseDown);
	this.addEvent("mousemove", mouseMove);
	this.addEvent("mouseup", mouseUp);
	this.addEvent("mouseleave", mouseUp);
	
	this.addEvent("touchstart", mouseDown);
	this.addEvent("touchmove", mouseMove);
	this.addEvent("touchend", mouseUp);
}
daylight.fn.addEvent = daylight.fn.event = function(key, func) {
	if(func) {
		this.forEach(function(e) {
			if(e.addEventListener){
				e.addEventListener(key, func);    
			} else if(e.attachEvent){ // IE < 9 :(
			    e.attachEvent("on" + key, func);
			}
		});
	}
}
daylight.fn.equal = function(object) {
	var type = daylight.type(object, true);
	if(type == "html" && this.size == 1 && object == this.o[0]) {
		return true;
	} else if(type == "daylight" &&  this.size == object.size) {
		for(var i = 0; i < object.size; ++i) {
			if(this.index(object.o[i]) == -1)
				return false;

		}
		return true;
	}
	return false;
}
daylight.fn.find = function(query) {
	var o = [];
	this.each(function() {
		if(!daylight.isElement(this))
			return;
		
		var a = this.querySelectorAll(query);
		var l = a.length;
		for(var i = 0; i < l; ++i) {
			o[o.length] = a[i];
		}
	});
	return daylight(o);
}
daylight.fn.get = function(index) {
	if(index < 0)
		index = this.o.length - index;
	return this.o[index];
}
daylight.fn.has = function(selector, isContainParent) {
	if(daylight.isElement(selector)) {
		return this.filter(function() {
			return daylight.contains(this, selector, isContainParent);
		});
	} else if(typeof selector === "string"){
		return this.filter(function() {
			return daylight.contains(this, this.querySelector(selector));
		});		
	}
	return [];
}
daylight.fn.extend({
	filter : function(e) {
		var type = daylight.type(e);
		var objects = this.o;
		var length = this.size;
		var arr = [];
		var k = 0;
		switch(type) {
		case "function":
			for(var i = 0; i < length; ++i) {
				var a = e.call(objects[i], objects[i], i, objects);
				a ? arr[k++] = objects[i] : null;
			}
			return daylight(arr);
		}
		
		return daylight(arr);
	},
	map : function(func) {	
		var objects = this.o;
		var length = this.size;
		var arr = [];
		for(var i = 0; i < length; ++i)
			arr[i] = func.call(objects[i], i, objects);
		
		return daylight(arr);
	},
	each : function(callback) {
		var objects = this.o;
		var length = this.size;
		for(var i = 0; i < length; ++i) {
			var object = objects[i];
			callback.call(object, object, i, objects);
		}
	}
});

daylight.fn.extend({
	getClass : function() {
		var obj = this.o[0];
		//var type = daylight.type(obj);
		if(obj instanceof HTMLElement) {
			return this.o[0].className.split(" ");
		}
		return [];
	},
	addClass : function(className) {
		this.each(function(e, index) {
			daylight.addClass(e, className);
		});
	},
	hasClass : function(className, index) {
		if(!index)
			index = 0;
		if(!this.size)
			return false;
		
		return daylight.hasClass(this.o[index], className);
	},
	toggleClass : function(className, className2) {
		//var obj = this;
		this.each(function(e, index) {
			var is_add = daylight.addClass(e, className);
			if(!is_add) {
				//className이 이미 있다. -> className 제거
				daylight.removeClass(e, className, true);
				//className2가 없다. -> className2 추가.
				if(className2)
					daylight.addClass(e, className2, true);
			} else if(className2) {
				daylight.removeClass(e, className2, true);
			}
				
		});
	
		return this;
	},removeClass : function(className) {
		//var reg = new RegExp('(\\s|^)'+className+'(\\s|$)');
		this.each(function(element) {
			daylight.removeClass(element, className);
		});
		
		return this;
	}
});

/*
	before
	<p>
	prepend
	aa
	
	append
	</p>
	after
*/
daylight.fn.extend({
	before : function(e) {
		var type = daylight.type(e);//type 검사
		if(type === "string") {
			this.insertHTML("beforebegin", e); 
			return this;
		}
		_domEach(this, objs, function(target, element) {
			if(daylight.isElement(target) && target.parentNode)
				target.parentNode.insertBefore(element, target);
		});
		return this;
	},
	prepend : function(e) {
		var type = daylight.type(e);
		if(type === "string") {
			this.insertHTML("afterbegin", e);
			return this;
		}
		_domEach(this, objs, function(target, element) {
			if(daylight.isElement(target))
				target.insertBefore(element, target.firstChild);
		});
		return this;
	},
	append : function(object) {
		var type = daylight.type(object);
		if(type === "string") {
			this.insertHTML("beforeend", object);
			return this;
		}
		_domEach(this, object, function(target, element) {
			if(daylight.isElement(target))
				target.appendChild(element);
		});
		return this;
		
	},
	after : function(e) {
		var type = daylight.type(e);
		if(type === "string") {
			this.insertHTML("afterend", e);
			return this;
		}
		_domEach(this, objs, function(target, element) {
			if(daylight.isElement(target) && target.parentNode)
				target.parentNode.insertBefore(element,  target.nextSibling );
		});
		return this;
	},
	insertHTML : function(position, html) {//html 삽입하는 함수
		this.each(function(element) {
			if(!daylight.isElement(element))//만약 element가 아니면 insertAdjacentHTML을 사용할 수 없다.
				return false;
			
			element.insertAdjacentHTML(position, html);
		})
	}
});

daylight.fn.extend({
	isEmpty : function() {
		return this.size == 0;
	}, isElement : function(index) {
		if(index) {
			if(daylight.isElement(this.o[i]))
				return true;
				
			return false;
		}
		if(this.o.constructor === NodeList)
			return true;
		
		return false;
	}
});

daylight.fn.index = function(object) {
	var type = daylight.type(object);
	if(type == "daylight")
		object = object.o[0];
	for(var i = 0; i < this.size; ++i) {
		if(this.o[i] === object)
			return i;
	}
	return -1;
}

daylight.fn.scrollTop = function(value) {
	if(value) {
		this.each(function(e) {
			e.scrollTop = value;
		});
	} else {
		return this.o[0].scrollTop;
	}
}

daylight.fn.template = function(o, t) {
	this.html(daylight.template(o, t));
	return this;
}

daylight.fn.extend({
	parent: function(object) {
		var arr = [];
		var type = daylight.type(object);
		var parentObjects = type === "string"? daylight(object).o : [];
	
		if(type === "number") {
			this.each(function(v) {
				if(!daylight.isElement(v))
					return;
				var i = object;
				while(--i >= 0 && (v = v.parentNode)) {}
				
				if(!v)
					return;
	
				arr[arr.length] = v;
			});
		} else {
			this.each(function(v) {
				if(!daylight.isElement(v))
					return;
	
				var a = v.parentNode;
				if(a)
					arr[arr.length] = a;
			});
		}
		return daylight(arr);
	},
	offsetParent: function() {
		return this.map(function() {
			var offsetParent = this.offsetParent || docElem;

			while ( offsetParent && ( !daylight.nodeName( offsetParent, "html" ) && offsetParent.style && offsetParent.style.position === "static" ) ) {
				offsetParent = offsetParent.offsetParent;
			}

			return offsetParent || docElem;
		});
	}
});
daylight.fn.siblings = function() {
	var arr = [];
};


daylight.fn.extend({
	html : function(value) {
		if(!(value === undefined)) {
			this.each(function() {
				this.innerHTML = value;
			});
		}
		if(this.size == 0)
			return "";
		return this.o[0].innerHTML;
	},
	text : function(value) {
		if(!(value === undefined)) {
			this.each(function() {
				this.innerText = value;
			});
			return this;
		}
		return this.o[0].innerText;
	},
	ohtml : function(value) {
		if(!(value === undefined)) {
			this.each(function() {
				this.outerHTML = value;
			});
		}
		return this.o[0].outerHTML;
	},
	val : function(value) {
		if(!(value === undefined)) {
			this.each(function() {
				if(!daylight.isElement(this))
					return;
					
				var node = this.nodeName.toLowerCase();
				_value[node].set(this, value);
			});
			return this;
		}
		if(!daylight.isElement(this.o[0]))
			return;
		var node = this.o[0].nodeName.toLowerCase();
		return _value[node].get(this.o[0]);
	}
});
daylight.fn.extend({
	first : function() {
		return this.o[0];
	},
	last : function() {
		if(!this.size)
			return undefined;

		return this.o[this.size - 1];
	},
	children : function() {
		var o = [];
		this.each(function(v) {
			if(!daylight.isElement(v))
				return;
				
			var a = this.children;
			var l = a.length;
			for(var i = 0; i < l; ++i)
				o[o.length] = a[i];
		});
		return daylight(o);
	},
	prev : function() {
		var arr = [];
		for(var i = 0; i < this.size; ++i) {
			var e = this.o[i];
			if(daylight.type(e) != "object")
				continue;
			while((e = e.previousSibling) != null && e.nodeType != 1) {}
	
			if(!e)
				continue;
			
			arr.push(e);
		};
		return daylight(arr);
	},
	next : function() {
		var arr = [];
		for(var i = 0; i < this.size; ++i) {
			var e = this.o[i];
			if(!daylight.isNode(e))
				continue;
			while((e = e.nextSibling) != null && e.nodeType != 1) {}
			if(!e)
				continue;
	
			arr[arr.length] = e;
		}
		return daylight(arr);
	}

});

//getComputedStyle == currentStyle
daylight.fn.extend({
	dimension : function() {
		var is_request = {};
		var border = {left : null, top: null, right:null, bottom:null};
		var padding = {left : null, top: null, right:null, bottom:null};
		var margin = {left : null, top: null, right:null, bottom:null};
		
	},
	style : function(name) {
		var o = this.o[0];
		if(!o)
			return o.style[name];
	}
});
//demension 관련 함수들  width, height, innerWidth, innerHeight, outerWidth, outerHeight
["Width", "Height"].forEach(function(name) {
	var lowerName = name.toLowerCase();
	var requestComponent = name === "Width" ? ["left", "right"] : ["top", "bottom"];
	daylight.fn[lowerName] = function() {
		var currentStyle = this.style();
		var o = this.o[0];
		if(o["client" + name] > 0) {
			var dimension = o["client" + name];
		var cssHooks = _style(o);
		dimension -= parseFloat(_curCss(o, "padding-" + requestComponent[0], cssHooks));
		dimension -= parseFloat(_curCss(o, "padding-" + requestComponent[1], cssHooks));
			
			return dimension;
		}
		var dimension = o["offset" + name];
		var cssHooks = _style(o);
		dimension -= parseFloat(_curCss(o, "padding-" + requestComponent[0], cssHooks));
		dimension -= parseFloat(_curCss(o, "padding-" + requestComponent[1], cssHooks));
		dimension -= parseFloat(_curCss(o, "border-" + requestComponent[0] + "-width", cssHooks));
		dimension -= parseFloat(_curCss(o, "border-" + requestComponent[1] + "-width", cssHooks));

		return dimension;
	}
	daylight.fn["inner" + name] = function() {
		var currentStyle = this.style();
		var o = this.o[0];
		if(o["client" + name] > 0)
			return o["client" + name]

		var dimension = o["offset" + name];
		var cssHooks = _style(o);
		dimension -= parseFloat(_curCss(o, "border-" + requestComponent[0] + "-width", cssHooks));
		dimension -= parseFloat(_curCss(o, "border-" + requestComponent[1] + "-width", cssHooks));
		
		return dimension;
	}
	daylight.fn["outer" + name] = function(bInlcudeMargin) {
		var currentStyle = this.style();
		var o = this.o[0];
		var dimension = o["offset" + name];
		
		if(bInlcudeMargin) {
			var cssHooks = _style(o);
			dimension += parseFloat(_curCss(o, "margin-" + requestComponent[0], cssHooks)) + parseFloat(_curCss(o, "margin-" + requestComponent[1], cssHooks));
		}
		return dimension;
	}
});

//테스트용 함수 ㅠㅠㅠㅠ
daylight.fn.test = function() {
	var o = this.o[0];
	
	this.dimension();
}
daylight.fn.extend({
	position : function() {
		//margin padding을 무시한 위치

		var offsetParent, offset,
			elem = this.o[0],
			parentOffset = { top: 0, left: 0 };

		// Fixed elements are offset from window (parentOffset = {top:0, left: 0}, because it is its only offset parent
		if ( elem.style.position === "fixed" ) {
			offset = elem.getBoundingClientRect();
		} else {
			offsetParent = this.offsetParent();
			offset = this.offset();
			if ( !daylight.nodeName( offsetParent.o[0], "html" ) ) {
				parentOffset = offsetParent.offset();
			}

			// Add offsetParent borders
			parentOffset.top += daylight.css( offsetParent.o[0], "borderTopWidth", true );
			parentOffset.left += daylight.css( offsetParent.o[0], "borderLeftWidth", true );
			parentOffset.top -= daylight.css( offsetParent.o[0], "paddingTop", true );
			parentOffset.left -= daylight.css( offsetParent.o[0], "paddingLeft", true );
		}

		// Subtract parent offsets and element margins
		return {
			top: offset.top - parentOffset.top - daylight.css( elem, "marginTop", true ),
			left: offset.left - parentOffset.left - daylight.css( elem, "marginLeft", true )
		};

	}
	//jQuery를 거의 그대로 퍼옴.
	,offset : function() {
		//contents의 위치
		var element = this.o[0];		
		var box = { top: 0, left: 0 };
		if(!element)
			return box;
		
		var win = window;
		var doc = document;
		var docElem = docElem = doc.documentElement;
		if(element.getBoundingClientRect)
			box = element.getBoundingClientRect();
		
		return {
			top: box.top + win.pageYOffset - docElem.clientTop,
			left: box.left + win.pageXOffset - docElem.clientLeft
		};
	}
});

//animation Effect
daylight.fn.extend({
	animation : function() {
		
	}
	,show : function() {
		
	}
	,hide : function() {
		
	}
});

daylight.parseHTML;
daylight.fn.scrollLeft;

daylight.fn.forEach = daylight.fn.each;
daylight.each("Boolean Number String Text Function Array Date RegExp Object Error Window NodeList".split(" "), function(name, index, arr) {
	class2type[ "[object " + name + "]" ] = name.toLowerCase();
});

daylight.each("$Event".split(" "), function(name, index, arr) {
	daylight.defineGlobal(name, daylight[name]);
});

daylight.each("scroll load click mousedown mousemove mouseup mouseleave focus keydown keypress keyup select selectstart dragstart".split(" "), function(name, index, arr) {
	daylight.fn[name] = function(func) {
		this.event(name, func);
	}
});


})(window);