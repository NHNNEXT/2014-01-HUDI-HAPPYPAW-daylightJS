(function(tools) {
	tools.clipboard = {};
	
	var clipboardElement;
	var originalElement;
	var copyMotion;
	function _clone(obj) {
		var robj = {};
		
		for(var key in obj) {
			robj[key] = obj[key];
		}
		return robj;
	}
	tools.clipboard.copy = function() {
		var nowSelectElement = tools.nowSelectElement;
		if(!nowSelectElement)
			return;
		
		clipboardElement = nowSelectElement.get(0).cloneNode(true);
		console.log(clipboardElement);
	}
	tools.clipboard.paste = function() {
		if(!clipboardElement)
			return;
		tools.timer.pause();
			
		var size = 0;
		$(".daylightAnimationShape").each(function(e) {
			var classes = e.className.split(" ");
			var length = classes.length;
			var v = 0;
			for(var i = 0; i < length; ++i) {
				if(classes[i].indexOf("day-shape") === -1)
					continue;
					
				v = parseFloat(classes[i].replace("day-shape", "")) || 0;
				if(v > size)
					size = v;
			}
		});
		var dlElement = $(clipboardElement);
		dlElement.add(dlElement.find("*"));
		
		console.log("f" + size);
		dlElement.removeClass("daylightAnimationLayer");
		dlElement.each(function(e) {
			var classes = e.className.split(" ");
			var length = classes.length;
			var id, className, selector, aid;
			id =  e.getAttribute("id");
			className =  e.getAttribute("class");
			selector = id ? "#" + id  : "." + className.trim().replaceAll(" ", " .");
			aid = daylight.animation.makeId(selector);
							
			for(var i = 0; i < length; ++i) {
				if(classes[i].indexOf("day-shape") === -1)
					continue;

				
				daylight.removeClass(e, classes[i]);
				++size;
				daylight.addClass(e, "day-shape" + size);
				
				console.log(selector);
				var layer = tools.timeline.getLayer(aid);
				if(!layer)
					continue;
					
				console.log(layer);
				var motion = _clone(layer.motions[0]);
				delete motion.time;
				delete motion.fill;
				delete motion.count;
				var eLayer = tools.timeline.createLayer(e, motion);
			}
		});
		

		tools.nowSelectElement.append(clipboardElement);
		tools.nowSelectElement = $(clipboardElement);
		
		tools.refreshStatus();
		clipboardElement = null;
		copyMotion = null;
	}
})(tools);