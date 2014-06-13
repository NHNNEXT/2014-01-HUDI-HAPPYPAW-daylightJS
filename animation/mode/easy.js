(function() {
	tools.keyframes.mode.easy = {
		sceneTemplate:'<div class="datl-scene day-text-editable" data-text="{time}" data-edit-complete-prefix="" data-edit-complete-suffix="s">{time}s</div>',
		addTemplate:'<div class="datl-scene-add"><div class="datl-scene-add1"></div><div class="datl-scene-add2"></div></div>'
	};
	var easy = tools.keyframes.mode.easy;
	easy.init = function() {
		console.debug("Init Mode EASY")
		this.dlHead = $(".datl-scenes-head");
		this.dlScenes = $(".datl-scenes");
		this.dlTimeLabel = $(".day-tools-timeline-time");
		
		
		this.sceneTemplate = this.addTemplate + this.sceneTemplate;
		
		this.dlScenes.click(function(e) {
			if(!tools.timeline)
				return;
			if(!easy.dlSceneCollection)
				return;
				
			var target = e.target;
			console.log(target);
			var dlScene = easy.dlSceneCollection.has(target, true);
			if(dlScene.size() > 0) {
				var time = parseFloat(dlScene.attr("data-text")) || 0;
				easy.selectScene(time);
				
				return;
			}
			var dlBtnAdd = $(".datl-scene-add").has(target, true);
			if(dlBtnAdd.size() > 0) {
				console.debug("EASY Add Button")
				var dlPrevScene = dlBtnAdd.prev();
				var dlNextScene = dlBtnAdd.next();
				var prevTime = parseFloat(dlPrevScene.attr("data-text"));
				var nextTime = dlNextScene.size() === 0 ? prevTime + 2 : dlNextScene.attr("data-text");
				var time = (prevTime + parseFloat(nextTime)) / 2;
				easy.addScene(time);
				easy.dlSceneCollection = daylight(".datl-scene");
			}
			
		});
		
		$(document).on("editComplete", function(e) {
			var dlTarget = e.editTarget;
			var time = parseFloat(e.completeText);
			var prevTime = parseFloat(e.oldText);
			if(!time) {
				alert("입력값이 올바르지 않습니다.");
				daylight.ui.textedit.setText(dlTarget, prevTime);
			}
			var dlPrevTarget = dlTarget.prev(2);
			var dlNextTarget = dlTarget.next(2);
			console.log(dlPrevTarget, dlNextTarget);
			daylight.ui.textedit.setText(dlTarget, time);
			
		});
	};
	easy.selectScene = function(time) {
		tools.nowTime = time;
		tools.refreshTimeline();
		this.refreshTime();
	}
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
			if(dlScene.size() === 0) {
				this.addSceneNode(scene, prevScene);
			}
		}
		this.dlSceneCollection = daylight(".datl-scene");
	}
	easy.addSceneNode = function(time, dlPrevScene) {
		if(!dlPrevScene)
			return;
		dlPrevScene.after(daylight.template({time:time}, this.sceneTemplate));
	}
	easy.addScene = function(time) {
		if(!tools.timeline)
			return;

		var timeline = tools.timeline;
		var scenes = timeline.scenes;
		var scenesLength = scenes.length;
		var scene;
		var dlPrevScene, nowSceneIndex = 0;
		for(var i = 0; i < scenesLength; ++i) {
			scene = scenes[i];
			if(scene < time) {
				nowSceneIndex = i;
			} else {
				break;
			}
		}
		if(scene !== time) {
			dlPrevScene = daylight('.datl-scene[data-text="'+scenes[nowSceneIndex]+'"]');
			scenes.splice(nowSceneIndex + 1, 0, time);
		}
		
		if(time > timeline.totalTime)
			timeline.totalTime = time;
		
		this.addSceneNode(time, dlPrevScene);
		
		easy.selectScene(time);
	}
	easy.refreshSceneTime = function(is_time_control) {
		var time = tools.nowTime;
		var scenes = tools.timeline.scenes;
		var scenesLength = scenes.length;
		var scene;
		var min = 1000;
		var minIndex = 0;
		for(var i = 0; i < scenesLength; ++i) {
			scene = scenes[i];
			var abs = Math.abs(scene - time);
			if(abs < min) {
				min = abs;
				minIndex = i;
			}
		}
		time = scenes[minIndex];
		if(is_time_control)
			tools.nowTime = time;
		
		var dlScene = daylight('.datl-scene[data-text="'+time+'"]');
				
		this.dlSceneCollection.removeClass("selected");
		dlScene.addClass("selected");

		
		//this.refreshTime();
	}
	easy.refreshTime = function(is_time_control) {
		easy.refreshSceneTime(is_time_control);
		var time = tools.keyframes.getTime(tools.nowTime * 100);
		this.dlTimeLabel.html(time);
	}
})();