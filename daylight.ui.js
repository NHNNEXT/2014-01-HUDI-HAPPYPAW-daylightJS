daylight.UI = {};
daylight.UI.drag = {};
daylight.UI.drag.dragstart = function(e) {
	var dlDragTarget = $(".day-drag").has(e.dragElement, true);
	e.dragInfo.otop = parseFloat(dlDragTarget.css("top")) || 0;
	e.dragInfo.oleft = parseFloat(dlDragTarget.css("left")) || 0;
}
daylight.UI.drag.drag = function(e) {
	var dlDragTarget = $(".day-drag").has(e.dragElement, true);
	if(dlDragTarget.size() === 0)
		return;
	dlDragTarget.css("left", e.dragInfo.oleft + e.dragX);
	dlDragTarget.css("top", e.dragInfo.otop + e.dragY);
	
}
daylight.UI.drag.dragend = function(e) {
}
$(document).ready(function() {
	$("body").drag();
	
	var is_drag_start = false;
	var otop, oleft;
	$("body").on("dragstart", function(e) {
	
		e.stopPropagation();
		
		var dlElement = $(e.dragElement);
		if(dlElement.hasClass("day-drag-draggable"))
			daylight.UI.drag.dragstart(e);

	});
	$("body").on("drag", function(e) {
		e.stopPropagation();
		
		var dlElement = $(e.dragElement);
		if(dlElement.hasClass("day-drag-draggable"))
			daylight.UI.drag.drag(e);
		
		
	});

});