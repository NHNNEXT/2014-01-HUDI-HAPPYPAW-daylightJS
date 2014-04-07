
daylight.ajax = function(url, option) {
	var cl = arguments.callee;
	if (!(this instanceof cl)) return new cl(url, option);
	
	this.async = false;
	this.request = new XMLHttpRequest();
	this.option = option;

	if(this.option) {
		this.async = option.async ? true : false;
		this.data = option.data;
	}
	this.param = this.objectToParam(this.data);
	
	
	var request = this.request;
	request.open('GET', url, this.async);
	if(this.isAutoSend || option.autoSend)
		request.send(null);
	
	if(req.status == 200)
	  dump(request.responseText);
}
daylight.ajax.prototype.isAutoSend = true;

daylight.ajax.prototype.objectToParam = function(data) {
	var param = "";
	
	return param;
}
daylight.ajax.prototype.done = function(func) {
	//this
	
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