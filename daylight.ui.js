daylight.UI = {};

daylight.UI.drag = function(element) {
	
}

$(document).ready(function() {
	$("body").drag();
	
	var is_drag_start = false;
	var otop, oleft;
	$("body").on("dragstart", function(e) {
	
		e.stopPropagation();
		
		
		var dlElement = $(e.dragElement);
		if(!dlElement.hasClass("day-drag-draggable"))
			return;
		

		var dlDragTarget = $(".day-drag").has(e.dragElement, true);
		otop = parseFloat(dlDragTarget.css("top")) || 0;
		oleft = parseFloat(dlDragTarget.css("left")) || 0;
		

	});
	$("body").on("drag", function(e) {
		e.stopPropagation();
		var dlElement = $(e.dragElement);
		if(!dlElement.hasClass("day-drag-draggable"))
			return;
			
		
		var dlDragTarget = $(".day-drag").has(e.dragElement, true);
		if(dlDragTarget.size() === 0)
			return;
		
		
		
		dlDragTarget.css("left", oleft + e.dragX);
		dlDragTarget.css("top", otop + e.dragY);
	});

});