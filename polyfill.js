String.prototype.trim = String.prototype.trim || function(){
	return this.replace(/(^\s*)|(\s*$)/gi, "");
}
String.prototype.ltrim = function(){
	return this.replace( /^\s+/, "" );
}
String.prototype.rtrim = function(){
	return this.replace( /\s+$/, "" );
}
String.prototype.replaceAll = function(from, to) {
	if(!this)
		return "";
	return this.split(from).join(to);
}
Array.prototype.indexOf = Array.prototype.indexOf = function (element) {
	var length = this.length;
	
	for(var i = 0; i < length; ++i) {
		if(this[i] === element)
			return i;
	}		
	return -1;
}

Array.prototype.forEach = Array.prototype.forEach = function (func) {
	var length = this.length;
	
	for(var i = 0; i < length; ++i) {
		func(this[i], i, this);
	}		
	return this;
}
