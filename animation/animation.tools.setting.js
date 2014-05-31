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
			
		tools.applySetting(dlItem);
		return;
		
	},
	items: null
}
tools.applySetting = function(dlItem) {
	var item = dlItem.attr("data-item");
	if(!item)
		return;
	console.log("applySetting", item, dlItem.val());	

	var dlElement = tools.nowSelectElement;
	var layer = tools.getLayer();
	var motion = tools.getNowMotion();
	motion.fill = "add";
	motion[item] = dlItem.val();
	

	layer.addMotion(motion);
	
	tools.refresh();
	tools.refreshStatus();
}
tools.refreshSetting = function() {
	var motion = tools.getNowMotion();
	var dlElement = tools.nowSelectElement;
	if(!dlElement)
		return;
	tools.setting.items.each(function() {
		var dlItem = $(this);
		var item = dlItem.attr("data-item");
		if(!item)
			return;
		dlItem.val(motion[item] || dlElement.css(item));
	});
}
tools.refreshItem = function(item, value) {
	var dlItem = $('.day-tools-properties [data-item="'+item+'"]');
	dlItem.val(value);
}
tools.setting.init = function() {
	console.debug("init setting");
	tools.setting.items = $(".day-tools-properties [data-item]");
	tools.setting.select = $(".day-tools-properties select[data-item]");

	tools.setting.select.on("change", function(e) {
		console.log("SELECT");
		
		tools.applySetting($(this));
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
		tools.refreshSetting();
		tools.refreshStatus();
		tools.refreshLayerWindow();
	});
	
	tools.layerTemplate = $(".day-layer").ohtml();
	tools.refreshLayerWindow();
}

tools.refreshLayerWindow = function() {
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