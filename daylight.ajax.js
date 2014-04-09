/*
Setting
isAutoSend(자동으로 보내기) : true
async(비동기) : true
Method : GET
type : auto

var a = $.ajax("http://daybrush.com/yk/board/daylightJS/test/json.php");
json.php는 content-type이  application/json => json형태의 데이터로 보여준다.

*/
daylight.ajax = function(url, option) {
	var cl = arguments.callee;
	if (!(this instanceof cl)) return new cl(url, option);
	
	this.request = new XMLHttpRequest();
	//옵션 초기화
	this.option = {
		autoSend : this.autoSend,
		method : this.method,
		type : this.type,
		async : this.async
	};
	this.url = url;
	//콜백함수 초기화.
	this.func = {
		done : null,
		always : null,
		fail : null,
		timeout : null,
		beforeSend : null
	}

	//옵션이 있는지 없는지 검사.
	if(option) {
		for(var k in option) {
			//func에 해당하는 옵션이 들어오면 func에 넣는다.
			this.func[k] === undefined? this.option[k] = option[k]: this.func[k] = option[k];
		}
	}
	option = this.option;
	
	//object형태의 url형태로 바꿔준다. 다른 방법이 있다면 formDate또는 다른 방식으로 바꿔준다...
	this.setParameter(option.data);
	var ajax = this;
	var request = this.request;
	//request오픈!!!
	request.open(this.method, url, this.async);
	
	//ajax함수를 부르는 순간 보낼 것인가 안 보낼 것인가 결정.
	if(option.autoSend)
		this.send();
	
	//state변경
	request.onreadystatechange = function (evt) {
		if (request.readyState == 4) {
			if(request.status == 200) {
			//200이 정상
				//done함수 있을 경우.
				if(ajax.func.done) {
					var value = ajax._get(request);
					ajax.func.done.call(request, value, request);
				}
			} else {
				if(ajax.func.fail) ajax.func.fail("", request);
			}
			if(ajax.func.always) ajax.func.always(request);
		}
	};
}
daylight.ajax.prototype.extend = daylight.extend;
daylight.ajax.prototype.autoSend = true;
daylight.ajax.prototype.method = "GET";
daylight.ajax.prototype.type = "auto";
daylight.ajax.prototype.async = true;

daylight.ajax.prototype._parseJSON = function(text) {
	try {
		return JSON.parse(text);
	} catch (e) {
		return {};
	}
}
daylight.ajax.prototype._get = function(request) {
	var contentType = request.getResponseHeader("content-type");
	switch(this.type) {
	case "auto":
		//JSON형태로 변환.
		if(contentType === "application/json")
			return this._parseJSON(request.responseText);
		
		//나머지는 그냥 텍스트로
		if(!request.responseXML)
			return request.responseText;

	case "xml":
		//XML이면 responseXML 노드 형태로 되어있다.
		if(request.responseXML)
			return request.responseXML;
		break;
	case "text":
		return request.responseText;
		break;
	case "json":
		return this._parseJSON(request.responseText);
	case "jsonp":
		//정보 찾아보기. 모르겠다 ㅠㅠ
		return this._parseJSON(request.responseText);
	}	
}


//callback함수 모음.
daylight.ajax.prototype.extend({
	beforeSend : function(func) {
		this.func.beforeSend = func;
		return true;
	},
	//결과가 정상적으로 완료되면 부르는 함수
	done : function(func) {
		this.func.done = func;
		return this;
	},
	//요청시간이 오바되면 부르는 함수
	timeout : function(func) {
		this.func.timeout = func;
		return this;
	},
	//요청실패하면 부르는 함수
	fail : function(func) {
		this.func.fail = func;
		return this;
	},
	//실패하든 말든 부르는 함수
	always : function(func) {
		this.func.always = func;
		return this;
	}
});
daylight.ajax.prototype._done = function() {
	if(request.readyState == 4 && request.status == 200) {
		this.text = request.responseText;
	}
}
daylight.ajax.prototype.get = function() {
	return this._get(this.request);
}
daylight.ajax.prototype.send = function() {
	var req = this.request;
	if(this.func.beforeSend)
		this.func.beforeSend(req);
	req.send(null);
	return this;
}

//parameter관련 함수들
daylight.ajax.prototype.extend({
	setParameter : function(data) {
		if(!data)
			this.param = "";
		else if(typeof data === "string")
			this.param = data;
		else
			this.param = this.objectToParam(option.data);
	},
	objectToParam : function(data) {
		var param = "";
		for (var key in data) {
		    if (param != "")
		        param += "&";
	
		    param += key + "=" + param[key];
		}
		return param;
	}
});


