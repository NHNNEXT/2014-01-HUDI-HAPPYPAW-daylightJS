(function() {
	tools.keyframes.mode.easy = {
		sceneTemplate:'	<div class="datl-scene day-text-editable" data-text="{time}" data-edit-complete-prefix="" data-edit-complete-suffix="s">{time}s</div>'
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
	easy.refreshAll = function() {
		if(!tools.timeline)
			return;
		
		var scenes = tools.timeline.scenes;
		var scenesLength = scenes.length;
		var scene, dlScene, prevScene;
		for(var i = 0; i < scenesLength; ++i) {
			scene = scenes[i];
			prevScene = dlScene;
			dlScene = daylight('.datl-scene[data-text="'+scene+'"]');
			if(dlScene.size() == 0) {
				prevScene.after(daylight.template({time:scene}, sceneTemplate));
			}
		}
	}
	
	easy.addScene = function(time) {
		
	}

})();