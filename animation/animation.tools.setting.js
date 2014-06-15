(function(tools) {
	var transformList = daylight.animation.CONSTANT.transformList;
	tools.setting = {
		keydown: function(e) {},
		keyup : function(e) {
			if(!tools.nowSelectElement)
				return;
			
			var dlItem = tools.setting.items.has(e.target, true);
			var key = $.Event(e).key();
			var keyCode = key.keyCode;
			if(!key.enter)	
				return;
				
			tools.setting.applyProperty(dlItem);
			return;
			
		},
		items: null,
		property2stageTemplate: '<tr><td class="day-item-property">{property-name}</td><td class="day-item-value"><input type="input" data-item="{property}/></td></tr>',
		layerTemplate: '<div class="day-layer" data-layer="{id}"><div>{id}</div></div>'
	}
	tools.setting.removeProperty = function(dlItem) {
		if(!tools.nowSelectElement)
			return;
			
		var property = dlItem.attr("data-item");
		if(!property)
			return;
			
		console.debug("removeProperty", property);
		tools.getLayer().removeProperty(tools.nowTime, property);
		dlItem.parent().prev().removeClass("has-property");
	}
	tools.setting.applyProperty = function(dlItem) {
		if(!tools.nowSelectElement)
			return;
		var item = dlItem.attr("data-item");
		if(!item)
			return;
			
		console.debug("applyProperty", item, dlItem.val());	
	
		var dlElement = tools.nowSelectElement;
		var layer = tools.getLayer();
		
		var motion = tools.getMotion(tools.nowTime);
		motion.fill = "add";
		motion[item] = dlItem.val();
		
		layer.addMotion(motion);
		
		dlItem.parent().prev().addClass("has-property");
		tools.refresh();
		tools.refreshStatus();
	}
	tools.setting.refresh = function() {
		if(!tools.timeline)
			return;
		var nowMotion = tools.getNowMotion();
		var motion = tools.getMotion(tools.nowTime)
		var dlElement = tools.nowSelectElement;
		if(!dlElement)
			return;
			
		this.items.each(function() {
			var dlItem = $(this);
			var item = dlItem.attr("data-item");
			if(!item)
				return;
			var is_motion = !!motion[item];
			var value = nowMotion[item];
			
			if(nowMotion.hasOwnProperty(item)) {
				value = nowMotion[item];
			} else {
				is_motion = false;
				if(transformList.hasOwnProperty(item)) {
					value = dlItem.attr("data-default");
				} else {
					value = dlElement.css(item) || dlItem.attr("data-default") || 0;
				}
			}
			if(is_motion)
				dlItem.parent().prev().addClass("has-property");
			else
				dlItem.parent().prev().removeClass("has-property");
				
			dlItem.val(value);
		});
	}
	tools.setting.refreshItem = function(item, value) {
		var dlItem = $('.day-tools-properties [data-item="'+item+'"]');
		dlItem.parent().prev().addClass("has-property");
		dlItem.val(value);
	}
	tools.setting.init = function() {
		console.debug("init setting");
		this.properties = $(".day-tools-properties");
		this.items = tools.setting.properties.find("[data-item]");
		this.select = tools.setting.properties.find("select[data-item]");
		
		this.select.on("change", function(e) {
			console.log("SELECT");
			tools.setting.apply($(this));
		});
		this.properties.click(function(e) {
			var eTarget = e.target;
			if(!daylight.hasClass(eTarget, "day-item-property"))
				return;
			
			var dlTarget = $(eTarget);
			var dlItem = dlTarget.next().find("[data-item]");		
			if(dlTarget.hasClass("has-property")) {
				tools.setting.removeProperty(dlItem);
			} else {
				tools.setting.applyProperty(dlItem);
			}
			
		});
		$(".day-layers").on("click", function(e) {
			var dlLayerLabel = $(".day-layer").has(e.target, true);
	
			if(dlLayerLabel.size() == 0)
				return;
				
			if(dlLayerLabel.size() > 1)
				return;
			
			var layer = tools.timeline.getLayer(dlLayerLabel.attr("data-layer") || "");
			if(!layer)
				return;
				
			console.log("CLICK : " + layer.id);
			tools.nowSelectElement = layer.dl_object;
			tools.setting.refresh();
			tools.refreshStatus();
			tools.setting.refreshLayerWindow();
		});
		$(".btn-preview").click(function(e) {
			tools.cancelSelect();
			tools.timeline.setAnimationType("linear").init().start();
			tools.nowTime = 0;
		});	
		$(".btn-new").click(function(e) {
			tools.file.newDocument();
		});
		$(".btn-load").click(function(e) {
			daylight(".day-tool.day-tool-load").addClass("show");
		});	
		$(".btn-save").click(function(e) {
			daylight(".day-tool.day-tool-save").find("textarea").val(tools.file.saveJSON());
			daylight(".day-tool.day-tool-save").addClass("show");
		});	
		this.refreshLayerWindow();
	}
	
	tools.setting.refreshLayerWindow = function() {
		if(!tools.timeline)
			return;
		
		var layer;
		if(tools.nowSelectElement)
			layer = tools.getLayer();
		var info = daylight.map(tools.timeline.layers, function() {
			return {id:this.id};
		});
		$(".day-layers").template(info, this.layerTemplate);
		
		if(layer)
			$('.day-layer[data-layer="'+layer.id+'"]').addClass("selected");
	
		
		
	}
	
	tools.setting.goBack = function() {
		if(!tools.timeline)
			return;
		

		if(!tools.nowSelectElement)
			return;
			
			
		var nowSelectElement = tools.nowSelectElement;
		var dlPrev = nowSelectElement.prev();
		if(dlPrev.size() === 0)
			return;
			
		dlPrev.prepend(nowSelectElement);
	}
	tools.setting.goForward = function() {
		if(!tools.timeline)
			return;
		

		if(!tools.nowSelectElement)
			return;
			
			
		var nowSelectElement = tools.nowSelectElement;
		var dlNext = nowSelectElement.next();
		if(dlNext.size() === 0)
			return;
			
		dlNext.append(nowSelectElement);
	}
})(tools);