(function() {
	tools.keyframes.mode.easy = {
	};
	var easy = tools.keyframes.mode.easy;
	easy.init = function() {
		this.dlHead = $(".datl-scenes-head");
		this.dlScenes = $(".datl-scens");
		
		this.dlScenes.click(function() {
			
		});
		
		$(document).on("editComplete", function(e) {
			var dlTarget = e.editTarget;
			var text = e.completeText;
			alert("edit: " + text);
			
		});
	};
})();