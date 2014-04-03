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
daylight.version = "1.0.0";


daylight.CONSTANT = {SLOW:"slow", FAST:"fast"};
daylight.OPTION = {speed : daylight.CONSTANT.FAST};


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
var _domEach = function(target, o, callback) {
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
			case "number":
				for(var i = 0; i < options.length; ++i) {
					var opt = options[i];
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
	,checkbox : {
		get : function(element, is_value) {
			if(is_value || element.checked) return element.value;
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
		
	var target = length == 1? this : a[0];
	var name;
	for(var i = 0; i <length; ++i) {
		var options = a[i];
		if(daylight.type(options) != "object")
			continue;

		for(name in options) {
			var src = target[name];
			var copy = options[name];

			//ildan  continue;
			if(src)
				continue;
			
			target[name] = copy;
		}
	}
}

//daylight만의 타입  Array, String 등 구분가능.
daylight.type = function(obj, expand) {
	var type = typeof obj;
	if(!expand)
		return type == "object" ? obj.daylight || class2type[toString.call(obj)] || "object" : type;
	
	return type == "object" ? obj instanceof HTMLElement ? "html" : obj.daylight || class2type[toString.call(obj)] || "object" : type;
	
}

//define 관련 함수들 모음
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

/**
* @description : 해당 객체가 Node(Element)인지 확인
* @param : o(Element), text(텍스트 노드 포함 체크)
* @return : Boolean(노드이면 true 아니면 false)
*/
daylight.isNode = function(o, text) {
	if(!t)
		return false;
	if(o.nodeType == 1)
		return true;
	if(text && o.nodeType)
		return true;

	return false;
}
/**
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


//addClass, removeClass, hasClass
daylight.extend({
	/**
	@ 클래스를 삭제를 합니다.
	@param element : 삭제할 element, className : 삭제할 클래스 이름, ignoreCheck : element의 검사를 무시할 수 있다.(중복 체크)
	@return Boolean(삭제 체크)
	*/
	removeClass : function(element, className, ignoreCheck) {
		if(!ignoreCheck && !daylight.isNode(element))
			return false;
			
		var name = element.className;
		var arr = name.split(" ");
		var length = arr.length;
		var afterClassName = "";
		var is_remove = false;
		
		for(var i = 0; i < length; ++i) {
			if(arr[i] == className) {
				is_remove = true;
				continue;
			}
			if(afterClassName == "")
				afterClassName = arr[i];
			else
				afterClassName = afterClassName + " " + arr[i];
		}
		element.className = afterClassName;
		
		return true;
	}
	/**
	@ 클래스를 가지고 있는지 확인
	@param element : 찾을 element, className : 찾을 클래스 이름
	@return Boolean(가지고 있는지 체크)
	*/
	,hasClass : function(element, className) {
		if(!daylight.isNode(element))
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
	@ 클래스를 추가한다.
	@param element : 추가할 element, className : 추가할 클래스 이름
	@return Boolean(추가되었는지 체크)
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

daylight.template = function(obj, template) {
	var type = this.type(obj);
	var templateType = this.type(template);
	if(templateType == "daylight")
		template = template.ohtml();
	if(type == "array") {
		var contents = [];
		var length = obj.length;
		for(var i = 0; i < length; ++i) {
			var content = obj[i];
			contents[contents.length] = this.template(content, template);
		}
		return contents.join(" ");
	} else if(type == "object") {
		for(var k in obj) {
			var value = obj[k];
			if(this.type(value) == "array") {
				var length = value.length;
				for(var i = 0; i < length; ++i) {
					value[i]

				}
				template = daylight.replace("{" + k + "}", value, template);
			} else {
				template = daylight.replace("{" + k + "}", value, template);
			}
		}
		return template;
	} else {
		
	}
	return "";
}

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

daylight.fn.addClass = function(className) {
	var obj = this;
	this.each(function(e, index) {
		if(daylight.hasClass(e, className))
			return;
	

		if(this.className == "")
			this.className = className;
		else
			this.className += " " + className;
			
	});
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
		
	return this.o[0].currentStyle ? this.o[0].currentStyle[name] : this.o[0].style[name];
}
daylight.fn.children = function() {
	var o = [];
	this.each(function(v) {
		if(!daylight.isNode(v))
			return;
			
		var a = this.children;
		var l = a.length;
		for(var i = 0; i < l; ++i)
			o[o.length] = a[i];
	});
	return $(o);
}
daylight.fn.drag = function(dragFunc) {
	var dragObject = null;
	var is_drag = false;
	var dragDistance = {x : 0, y : 0};
	var prePosition = null;
	
	var mouseDown = function(e) {
		is_drag = true;
		prePosition = daylight.$E.cross(e);
		dragDistance = {x : 0, y : 0};
		console.log("DRAG START");
	};
	var mouseMove = function(e) {
		if(!is_drag)
			return;
		var position = daylight.$E.cross(e);
		dragDistance.x += position.pageX - prePosition.pageX;
		dragDistance.y += position.pageY - prePosition.pageY;
		prePosition = position;
		e.preventDefault();
	};
	var mouseUp = function(e) {
		if(!is_drag)
			return;
			
		console.log("DRAG EBD");
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
	if((object instanceof HTMLElement) && this.size == 1 && object == this.o[0]) {
		return true;
	} else if((object instanceof daylight.object) &&  this.size == object.size) {
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
		if(!daylight.isNode(this))
			return;
		
		var a = this.querySelectorAll(query);
		var l = a.length;
		for(var i = 0; i < l; ++i) {
			o[o.length] = a[i];
		}
	});
	return $(o);
}
daylight.fn.filter = function(e) {
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
		return arr;
	}
	
	return arr;
}
daylight.fn.each = daylight.fn.forEach = function(callback) {
	var objects = this.o;
	var length = this.size;
	for(var i = 0; i < length; ++i) {
		callback.call(objects[i], objects[i], i, objects);
	}
}
daylight.fn.get = function(index) {
	if(index < 0)
		index = this.o.length - index;
	return this.o[index];
}
daylight.fn.extend({
	getClass : function() {
		var obj = this.o[0];
		//var type = daylight.type(obj);
		if(obj instanceof HTMLElement) {
			return this.o[0].className.split(" ");
		}
		return [];
	},
	hasClass : function(className, index) {
		if(!index)
			index = 0;
		if(!this.size)
			return false;
		
		var object = this.o[index];
		var name = object.className;
		var arr = name.split(" ");
		var length = arr.length;
		for(var i = 0; i < length; ++i) {
			if(arr[i] == className)
				return true;
		}
		return false;
	},
	toggleClass : function(className) {
		//var obj = this;
		this.each(function(e, index) {
			var is_add = daylight.addClass(e, className);
			if(!is_add)
				daylight.removeClass(e, className, true);
				
		});
	
		return this;
	},removeClass : function(className) {
		//var reg = new RegExp('(\\s|^)'+className+'(\\s|$)');
		this.each(function(element) {
			var name = element.className;
			var arr = name.split(" ");
			var length = arr.length;
			var afterClassName = "";
			var is_remove = false;
			for(var i = 0; i < length; ++i) {
				if(arr[i] == className) {
					is_remove = true;
					continue;
				}
				if(afterClassName == "")
					afterClassName = arr[i];
				else
					afterClassName = afterClassName + " " + arr[i];
			}
			element.className = afterClassName;
		});
		
		return this;
	}
});

daylight.fn.html = function(value) {
	if(!(value === undefined)) {
		this.each(function() {
			this.innerHTML = value;
		});
	}
	return this.o[0].innerHTML;
}

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
			if(daylight.isNode(target) && target.parentNode)
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
			if(daylight.isNode(target))
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
			if(daylight.isNode(target))
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
			if(daylight.isNode(target) && target.parentNode)
				target.parentNode.insertBefore(element,  target.nextSibling );
		});
		return this;
	},
	insertHTML : function(position, html) {//html 삽입하는 함수
		this.each(function(element) {
			if(!daylight.isNode(element))//만약 element가 아니면 insertAdjacentHTML을 사용할 수 없다.
				return false;
			
			element.insertAdjacentHTML(position, html);
		})
	}
});

daylight.fn.extend({
	isNull : function() {
		return this.size == 0;
	}, isNode : function(index) {
		if(index) {
			if(daylight.isNode(this.o[i]))
				return true;
				
			return false;
		}
		if(daylight.isNode(this.o))
			return true;
		
		return false;
	}
});

daylight.fn.index = function(object) {
	if((object instanceof HTMLElement))
		return daylight.indexOf(this.o, object);
	else if((object instanceof daylight.object) && object.size == 1)
		return daylight.indexOf(this.o, object.o[0]);
	return -1;
}

daylight.fn.map = function(func) {	
	var objects = this.o;
	var length = this.size;
	var arr = [];
	for(var i = 0; i < length; ++i)
		arr[i] = func.call(objects[i], i, objects);
	
	return arr;
}
daylight.fn.ohtml = function(value) {
	if(!(value === undefined)) {
		this.each(function() {
			this.outerHTML = value;
		});
	}
	return this.o[0].outerHTML;
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


daylight.fn.parent = function(object) {
	var arr = [];
	var type = daylight.type(object);
	var parentObjects = type === "string"? $(object).o : [];

	if(type === "number") {
		this.each(function(v) {
			if(!daylight.isNode(v))
				return;
			var i = object;
			while(--i >= 0 && (v = v.parentNode)) {}
			
			if(!v)
				return;

			arr[arr.length] = v;
		});
	} else {
		this.each(function(v) {
			if(!daylight.isNode(v))
				return;

			var a = v.parentNode;
			if(a)
				arr[arr.length] = a;
		});
	}
	return $(arr);
}


daylight.fn.prev = function() {
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
	return $(arr);
};
daylight.fn.next = function() {
	var arr = [];
	for(var i = 0; i < this.size; ++i) {
		var e = this.o[i];
		if(typeof e != "object")
			continue;
		while((e = e.nextSibling) != null && e.nodeType != 1) {}
		if(!e)
			continue;

		arr[arr.length] = e;
	}
	return $(arr);
};
daylight.fn.siblings = function() {
	var arr = [];
};
daylight.fn.text = function(value) {
	if(!(value === undefined)) {
		this.each(function() {
			this.innerText = value;
		});
		return this;
	}
	return this.o[0].innerText;
}
daylight.fn.val = function(value) {
	if(!(value === undefined)) {
		this.each(function() {
			if(!daylight.isNode(this))
				return;
				
			var node = this.nodeName.toLowerCase();
			_value[node].set(this, value);
		});
		return this;
	}
	if(!daylight.isNode(this.o[0]))
		return;
	var node = this.o[0].nodeName.toLowerCase();
	return _value[node].get(this.o[0]);
};

daylight.fn.extend({
	width : function() {
		return this.o[0].offsetWidth;
	}
	,height : function() {
		return this.o[0].offsetHeight;
	}
	,innerWidth : function() {
		
	}
	,innerHeight : function() {
		
	}
	,outerWidth : function() {
		
	}
	,outerHeight : function() {
		
	}
});

daylight.fn.extend({
	position : function() {
		//margin padding을 무시한 위치
	}
	,offset : function() {
		//contents의 위치
	}
});
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

daylight.each("Boolean Number String Text Function Array Date RegExp Object Error Window NodeList".split(" "), function(name, index, arr) {
	class2type[ "[object " + name + "]" ] = name.toLowerCase();
});

daylight.each("$Event".split(" "), function(name, index, arr) {
	daylight.defineGlobal(name, daylight[name]);
});

daylight.each("scroll click mousedown mousemove mouseup mouseleave focus keydown keypress keyup".split(" "), function(name, index, arr) {
	daylight.fn[name] = function(func) {
		this.event(name, func);
	}
});


})(window);