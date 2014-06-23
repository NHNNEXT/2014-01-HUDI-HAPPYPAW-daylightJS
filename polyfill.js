String.prototype.trim = String.prototype.trim || function(){
	return this.replace(/(^\s*)|(\s*$)/gi, "");
}
String.prototype.ltrim = function(){
	return this.replace( /^\s+/, "" );
}
String.prototype.rtrim = function(){
	return this.replace( /\s+$/, "" );
}
String.prototype.startsWith = function (str){
    return this.indexOf(str) == 0;
 };
String.prototype.replaceAll = function(from, to) {
	if(!this)
		return "";
	return this.split(from).join(to);
}
String.prototype.toUpperFirst = function() {
	return this.substring(0,1).toUpperCase() + this.substring(1);
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
Object.keys = Object.keys || (function () {
    'use strict';
    var hasOwnProperty = Object.prototype.hasOwnProperty,
        hasDontEnumBug = !({toString: null}).propertyIsEnumerable('toString'),
        dontEnums = [
          'toString',
          'toLocaleString',
          'valueOf',
          'hasOwnProperty',
          'isPrototypeOf',
          'propertyIsEnumerable',
          'constructor'
        ],
        dontEnumsLength = dontEnums.length;

    return function (obj) {
      if (typeof obj !== 'object' && (typeof obj !== 'function' || obj === null)) {
        throw new TypeError('Object.keys called on non-object');
      }

      var result = [], prop, i;

      for (prop in obj) {
        if (hasOwnProperty.call(obj, prop)) {
          result.push(prop);
        }
      }

      if (hasDontEnumBug) {
        for (i = 0; i < dontEnumsLength; i++) {
          if (hasOwnProperty.call(obj, dontEnums[i])) {
            result.push(dontEnums[i]);
          }
        }
      }
      return result;
    };
  }());