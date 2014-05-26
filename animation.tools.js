var tools = {
	html: '<div class="anim-tools">{boxs}</div>',
	blockBox: '<div class="anim-block-box {class}"></div>',
	modifiedBox: '<div class="anim-block-box anim-modified"><h3></h3> <p></p> <input type="text" class="property-value" name="property" value="" /> <button class="save">Save</button></div>',
	block: '<div class="anim-block {class}" data-type="{type}" data-id="{id}">{title}</div>',
	timelines: [],
	layers: [],
	nowTimeline: null,
	nowLayer: null,
	supportProperties : {
		tx: {name:"translateX", default:"0px"},
		ty: {name:"translateY", default:"0px"},
		left: {name:"좌표 X", default:"0px"},
		top: {name:"좌표 Y", default:"0px"},
		rotate: {name:"회전", default:"0deg"},
		origin: {name:"기준점", default:"50% 50%"},
		scale: {name:"확대/축소", default:"1, 1"},
		width: {name:"너비", default:"100px"},
		height: {name:"높이", default:"100px"}
	},
	type: ""
};
tools.refreshTimeline = function() {
	var timelines = daylight.map(this.timelines, function(timeline, index) {
		return {id:timeline.id,title:timeline.id, selector:timeline.selector, class:"anim-block-timeline"};
	});
	timelines[timelines.length] = {id:"",title:"+", selector:"", class:"anim-block-add"};
	$(".anim-block-box.anim-timelines").template(timelines, this.block);
}
tools.refreshLayer = function() {
	var layers = daylight.map(this.layers, function(layer, index) {
		return {id:layer.id, selector:layer.selector, title:layer.id, class:"anim-block-layer"};
	});
	layers[layers.length] = {id:"",title:"+", selector:"", class:"anim-block-add"};
	$(".anim-block-box.anim-layers").template(layers, tools.block);
}
tools.refreshCProperties = function() {
	var dl_cproperties_box = $(".anim-block-box.anim-cproperties");
	dl_cproperties_box.addClass("show");
	var cproperties = daylight.map(tools.nowLayer.properties, function(name, index) {
		return {id:name, selector:"", title:name, class:"anim-block-cproperty"};
	});
	dl_cproperties_box.template(cproperties, tools.block);
}
tools.refreshProperties = function() {
	var dl_properties_box = $(".anim-block-box.anim-properties");
	dl_properties_box.addClass("show");
	var nowProperties = tools.nowProperties;
	var list = daylight.map(tools.supportProperties, function(value, property) {
		var o = {id:property, selector:"", title:this.name, class:"anim-block-property"};
		if(nowProperties.hasOwnProperty(property))
			o.class += " checked";
		return o;
	});
	
	dl_properties_box.template(list, tools.block);
}
tools.refreshModifiedBox = function() {
	var dl_modified_box = $(".anim-block-box.anim-modified"),
		dl_input = dl_modified_box.find(".property-value");
		
	dl_modified_box.addClass("show");
	var value = tools.nowProperties[tools.nowProperty];
	if(value !== 0 && !value)
		value = "";
	dl_input.val(value);
}
tools.refreshTimes = function() {
	var motions = daylight.map(this.nowLayer.motions, function(motion, index) {
		var title = motion.time;
		title = title == -1 ? "Init" : title + "s";
		return {id:motion.time, selector:"", title:title, class:"anim-block-times"};
	});
	
	if(typeof motions[0] === "undefiend" || motions[0].id != -1) {
		motions.splice(0, 0, {id:-1, selector:"", title:"Init", class:"anim-block-times"});
	}
	
	motions[motions.length] = {id:"",title:"+", selector:"", class:"anim-block-add"};
	$(".anim-block-box.anim-times").template(motions, tools.block);
}
tools.addTime = function(time) {
	var motion = {time:time};
	//addMotion
	//totalTime 변경 유무
	//totalTime 증가 finalMotion 전부 시간 증가
}
tools.removeTime = function(time) {
	//
	//totalTime 변경 유무
	//totalTime 증가 finalMotion 전부 시간 증가ㄴ	
}
tools.init = function init() {
	console.log("INIT ANIMATION TOOLS");
	var html = $.template({class: "anim-timelines"}, this.blockBox)
			+ $.template({class: "anim-layers"}, this.blockBox)
			+ $.template({class: "anim-cproperties"}, this.blockBox)
			+ $.template({class: "anim-times"}, this.blockBox)
			+ $.template({class: "anim-properties"}, this.blockBox)
			+ tools.modifiedBox;
			
	tools.html = $.template({boxs:html}, tools.html);
	
	
	
	$("body").append(this.html);
	
	var dl_all_box = $(".anim-block-box"),
		dl_timelines_box = $(".anim-block-box.anim-timelines"),
		dl_layers_box = $(".anim-block-box.anim-layers"),
		dl_cproperties_box = $(".anim-block-box.anim-cproperties"),
		dl_times_box = $(".anim-block-box.anim-times"),
		dl_properties_box = $(".anim-block-box.anim-properties"),
		dl_modified_box = $(".anim-block-box.anim-modified"),
		dl_input = dl_modified_box.find(".property-value");
		
	this.timelines = [timeline];
	tools.refreshTimeline();
	
	
	function getTarget(e, type) {
		var o_e = $.Event(e);
		var dl_target = $(o_e.target);
		if(!dl_target.hasClass(type))
			return;
			
		return dl_target;
	}
	function searchIn(arr, property, searchValue) {
		var length = arr.length;
		var now = -1;
		for(var i = 0; i < length; ++i) {
			if(arr[i][property] == searchValue)
				return i;
		}
		return now;
	}
	
	dl_timelines_box.click(function(e) {
		var dl_target = getTarget(e, "anim-block-timeline");
		if(!dl_target)
			return;
			
		$(this).find(".selected").removeClass("selected");
		dl_target.addClass("selected");
		
		
		dl_all_box.removeClass("show");		
		dl_layers_box.addClass("show");
		
		
		var id = dl_target.attr("data-id");
		tools.nowTimeline = tools.timelines[searchIn(tools.timelines, "id", id)];
		
		if(!tools.nowTimeline)
			return;
	
		tools.layers = tools.nowTimeline.layers;
		
		tools.refreshLayer();
	});
	
	dl_layers_box.click(function(e) {
		var dl_target = getTarget(e, "anim-block-layer");
		if(!dl_target)
			return;

		$(this).find(".selected").removeClass("selected");
		dl_target.addClass("selected");

		dl_all_box.removeClass("show");
		dl_layers_box.addClass("show");


		var id = dl_target.attr("data-id");
		console.log(tools.layers);
		tools.nowLayer = tools.layers[searchIn(tools.layers, "id", id)];
		if(!tools.nowLayer)
			return;
		
		var curBox = tools.type === "current" ? dl_cproperties_box : dl_times_box;
		curBox.addClass("show");
		
		if(tools.type === "current") {
			tools.refreshCProperties();
		}else {
			//times 함수
			tools.refreshTimes();
		}
		
		/*
			레이어 클릭
			nowLayer 설정
			
		*/
	});
	dl_cproperties_box.click(function (e) {
		var dl_target = getTarget(e, "anim-block-cproperty");
		if(!dl_target)
			return;
		if(!tools.nowLayer)
			return;
				
		$(this).find(".selected").removeClass("selected");
		dl_target.addClass("selected");
		
		
		var id = dl_target.attr("data-id");
		
		//프로티스 종류중 하나
		tools.nowProperty = tools.nowLayer.properties[tools.nowLayer.properties.indexOf(id)];
		if(!tools.nowProperty)
			return;
		tools.refreshTimes();

		dl_times_box.addClass("show");

		
	});
	
	dl_times_box.click(function(e) {
		var o_e = $.Event(e);
		var dl_target = $(o_e.target);
		if(!dl_target.hasClass("anim-block-times"))
			return;

		dl_modified_box.removeClass("show");



		$(this).find(".selected").removeClass("selected");
		dl_target.addClass("selected");
		
		
		var time = parseFloat(dl_target.attr("data-id"));
		var nowProperties = tools.nowLayer.getMotion(time) || {};
		
		tools.nowProperties = nowProperties;
		nowProperties.time = time;
		if(tools.type === "current") {
			tools.refreshModifiedBox();
		} else {
			tools.refreshProperties();
		}

	});
	
	dl_properties_box.click(function(e) {
		var o_e = $.Event(e);
		var dl_target = $(o_e.target);
		if(!dl_target.hasClass("anim-block-property"))
			return;
			
		var property = dl_target.attr("data-id");
		if(!property)
			return;
		
		tools.nowProperty = property;
		
		$(this).find(".selected").removeClass("selected");
		dl_target.addClass("selected");
		dl_modified_box.addClass("show");
		tools.refreshModifiedBox();

	});
	dl_modified_box.find("button.save").click(function (){
		var property = tools.nowProperty;
		var nowProperties = tools.nowProperties;
		if(!property)
			return;
		if(typeof nowProperties.time === "undefined")
			return;
			
		var propertyValues = {time: nowProperties.time};
		propertyValues[property] = dl_input.val();
		propertyValues.fill = "add";
		tools.nowLayer.addMotion(propertyValues);
		
		
	});
}