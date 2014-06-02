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
	property2stageTemplate: '<tr><td class="day-item-property">{property-name}</td><td class="day-item-value"><input type="input" data-item="{property}/></td></tr>'
}
tools.setting.removeProperty = function(dlItem) {
	if(!tools.nowSelectElement)
		return;
		
	var property = dlItem.attr("data-item");
	if(!property)
		return;
	console.debug("removeProperty", property);
	delete tools.getMotion(tools.nowTime)[property];
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
	var nowMotion = tools.getNowMotion();
	var motion = tools.getMotion(tools.nowTime)
	var dlElement = tools.nowSelectElement;
	if(!dlElement)
		return;
		
	tools.setting.items.each(function() {
		var dlItem = $(this);
		var item = dlItem.attr("data-item");
		if(!item)
			return;
		var is_motion = !!motion[item];
		var value = nowMotion[item];		
		if(!value) {
			is_motion = false;
			value = dlElement.css(item);
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
	tools.setting.properties = $(".day-tools-properties");
	tools.setting.items = tools.setting.properties.find("[data-item]");
	tools.setting.select = tools.setting.properties.find("select[data-item]");
	
	tools.setting.select.on("change", function(e) {
		console.log("SELECT");
		tools.setting.apply($(this));
	});
	tools.setting.properties.click(function(e) {
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
	tools.layerTemplate = $(".day-layer").ohtml();
	tools.setting.refreshLayerWindow();
}

tools.setting.refreshLayerWindow = function() {
	var layer;
	if(tools.nowSelectElement)
		layer = tools.getLayer();
	var info = daylight.map(tools.timeline.layers, function() {
		return {id:this.id};
	});
	$(".day-layers").template(info, tools.layerTemplate);
	
	if(layer)
		$('.day-layer[data-layer="'+layer.id+'"]').addClass("selected");

	
	
}