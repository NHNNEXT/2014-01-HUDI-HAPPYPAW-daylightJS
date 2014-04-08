
daylight.ajax = function(url, option) {
	var cl = arguments.callee;
	if (!(this instanceof cl)) return new cl(url, option);
	
	this.request = new XMLHttpRequest();

	this.option = option;

	this.url = url;
	this.func = {
		done : null,
		timeout : null,
		fail : null,
		always : null
	}
	var ajax = this;
	
	if(option) {
		this.async = option.async ? true : false;
		this.data = option.data;
		if(option.method) this.method = option.method;
		if(option.type) this.type = option.type;
	} else {
		this.option = option = {};
	}
	this.param = this.objectToParam(this.data);
	
	
	var request = this.request;
	request.open(this.method, url, this.async);
	if(this.isAutoSend || option.autoSend) {
		request.send(this.param);
		
		if(!this.async && request.status == 200 ) {
			this.status = request.status;
			this.text = request.responseText;	
		}
	}
	request.onreadystatechange = function (aEvt) {
		console.log(aEvt);
		if (request.readyState == 4) {
			if(request.status == 200) {
				if(ajax.func.done) {
					var value = ajax.getValue(ajax.request);
					ajax.func.done.call(ajax.request, value, request);
				}
			} else {
				if(ajax.func.fail)
					ajax.func.fail("", request);
			}
			if(ajax.func.always)
				ajax.func.always(request);
		}
	};
}
daylight.ajax.prototype.isAutoSend = true;
daylight.ajax.prototype.method = "GET";
daylight.ajax.prototype.type = "auto";
daylight.ajax.prototype.async = false;
daylight.ajax.prototype._parseJSON = function(text) {
	try {
		return JSON.parse(text);
	} catch (e) {
		return {};
	}
}
daylight.ajax.prototype.getValue = function(request) {
	var contentType = request.getResponseHeader("content-type");
	switch(this.type) {
	case "auto":	
		if(contentType === "application/json")
			return this._parseJSON(request.responseText);
		
		if(!request.responseXML)
			return request.responseText;
		

	case "xml":
		if(request.responseXML)
			return request.responseXML;
		break;
	case "text":
		return request.responseText;
		break;
	case "json":
		return this._parseJSON(request.responseText);
	case "jsonp":
		return this._parseJSON(request.responseText);
	}

		
	
}
daylight.ajax.prototype.objectToParam = function(data) {
	var param = "";
	
	return param;
}
daylight.ajax.prototype.done = function(func) {
	//this
	this.func.done = func;
	return this;
}
daylight.ajax.prototype.send = function(func) {
	//this
	this.request.send(null);
	return this;
}
daylight.ajax.prototype.timeout = function(func) {
	//this
	
	return this;
}
daylight.ajax.prototype.fail = function(func) {
	//this
	
	return this;
}
daylight.ajax.prototype.always = function(func) {
	return this;
}

daylight.post = function() {
	
}