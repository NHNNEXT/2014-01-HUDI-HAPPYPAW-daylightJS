(function(tools) {
	tools.clipboard = {};
	
	var clipboardElement;
	tools.clipboard.copy = function() {
		var nowSelectElement = tools.nowSelectElement;
		if(!nowSelectElement)
			return;
			
		clipboardElement = nowSelectElement.get(0).cloneNode(true);
	}
	tools.clipboard.pase = function() {
		
	}
})(tools);