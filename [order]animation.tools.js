var tools = {};
tools.size = "-4px";
{
	var relative = "relative", none = "none", absolute = "absolute", block="block",center="center", left="left", hidden="hidden";
	tools.css = {
		".day-figure": {
			position: "absolute",
			"min-width": "100px",
			"min-height": "100px",
			border:"1px solid #72BCEB"
		},
		".day-figure div" : {
			position: "absolute",
			width: "5px",
			height: "5px",
			background:"#fff",
			border:"1px solid #72BCEB",
		},
		".day-figure .nw" : {top:0, left:0, "margin-left":tools.size, "margin-top":tools.size},
		".day-figure .origin" : {"margin-left":tools.size, "margin-top":tools.size},
		".day-figure .n" : {top:0, left:"50%", "margin-left":tools.size, "margin-top":tools.size},
		".day-figure .ne" : {top:0, right:0, "margin-right":tools.size, "margin-top":tools.size},
		".day-figure .w" : {top:"50%", left:0, "margin-left":tools.size, "margin-top":tools.size},
		".day-figure .e" : {top:"50%", right:0, "margin-right":tools.size, "margin-top":tools.size},
		".day-figure .sw" : {bottom:0, left:0, "margin-left":tools.size, "margin-bottom":tools.size},
		".day-figure .s" : {bottom:0, left:"50%", "margin-left":tools.size, "margin-bottom":tools.size},
		".day-figure .se" : {bottom:0, right:0, "margin-right":tools.size, "margin-bottom":tools.size},
		".AnimationTools": {position:relative, overflow:hidden},
		".ids" :{width:"10%", position:relative, "padding":0, "list-style":none, float:left},
		".ids li" :{position:relative, height:"30px", "line-height":"30px"},
		".timeline" :{float:left, width:"80%", "position":"relative", "padding":0, "list-style":none},
		".timeline li" :{height:"30px", position:relative,  "border-left":"1px solid #ccc"},
		".motion" : {"border-radius":"50%",top:"50%", "width":"10px", "height":"10px", "margin":"-5px 0px 0px -5px", "background":"#f55", position:absolute},
		".motion .tip" : {display:none, "border-radius":"4px",top:"-15px",left:"50%","text-align":center, "width":"50px", "height":"20px", "line-height":"20px", "margin":"-10px 0px 0px -25px", "background":"#000", position:absolute, color:"#fff", "font-size":"12px"},
		".motion:hover .tip":{display:block}
		
	};
}
tools.objectToCSS = function(css) {
	var html = "";
	for(var selector in css) {
		html += selector +"{";
		html += daylight.animation.objectToCSS(css[selector]);
		html += "}";
	}
	return html;
};
tools.html = '<div class="day-figure day_drag day_draggable day_resize"><div class="n"></div><div class="nw"></div><div class="ne"></div><div class="w"></div><div class="e"></div><div class="s"></div><div class="sw"></div><div class="origin"></div><div class="se day_resizable"></div></div>';

tools.element = daylight(daylight.parseHTML(tools.html)[0]);
tools.init = function(timeline) {

	var styleElement = document.createElement("style");
	var styleHTML = '<style class="daylightAnimationToolsStyle">\n';
	styleHTML += this.objectToCSS(this.css);
	styleHTML += "</style>";
	$("head").append(styleHTML);
	$("body").append(tools.element);
	$(".AnimationTools").template(timeline, $(".AnimationTools"));
	
	$(".timeline").click(function(e) {
		var o_event = daylight.$Event(e);
		var element = o_event.target
		if(daylight.hasClass(element, "motion")) {
			var dl_element = $(element);
			var time = dl_element.attr("data-time")  ;
			var id = dl_element.parent().attr("data-id");
			var motion = timeline.getLayer(id).getMotion(time);
		}
	})
	$(".daylightAnimationLayer").click(function() {
		timeline.pause();
		var layer = timeline.getLayer(this);
		var dl_el = $(this);
		var pos = dl_el.position();
		var width = dl_el.innerWidth();
		var height = dl_el.innerHeight();
		dl_el.parent().append(tools.element);
		tools.element.attr("style", dl_el.attr("style"));
		tools.element.css("left", dl_el.css("left"));
		tools.element.css("top", dl_el.css("top"));
		tools.element.css("margin", dl_el.css("margin"));
		tools.element.css("width", width+"px");
		tools.element.css("height", height+"px");
		
		var style = dl_el.css();
		var origin = style["-webkit-transform-origin"] || style["transform-origin"] || style["-moz-transform-origin"];
		if(!origin || origin === "none")
			return;
		dl_el.css("-webkit-transform-origin", origin);
		tools.element.css("-webkit-transform-origin", origin);
		
		
		origin = origin.split(" ");

		tools.element.find(".origin").css("left", origin[0]);
		tools.element.find(".origin").css("top", origin[1]);
	
	});
}