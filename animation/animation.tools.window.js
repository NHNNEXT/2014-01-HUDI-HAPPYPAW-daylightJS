(function(tools) {
	tools.window = {};
	tools.window.windowTemplate = '<div data-window="{id}" class="day-tool day-tools-properties day-drag" style="/* left:{x}; top:{y}; */"><!--<div class="day-drag-draggable"></div>--><div class="day-property">{title}{contents}</div>';
	tools.window.innerWindowTemplate = '<div class="day-property-inner">{title}<table>{properties}<tr>{column}<td class="day-item-property">{name}</td><td class="day-item-value"><input type="input" data-item="{property}" data-default="{default}"/></td>{/column}</tr>{/properties}</table></div>';
	
	var dlProperties;
	
	
	tools.window.makeColumn = function(obj) {
		obj.forEach(function(element, index) {
			var is_multi = element.multi;
			var title = element.title;
			element.title = title ? "<h4>" + title + "</h4>" : "";
			var properties = element.properties;
			if(!is_multi) {
				properties.forEach(function(element, index) {
					properties[index] = {column:[element]};
					
					if(!element.hasOwnProperty("default"))
						element.default = "";
				});
			} else {
				var rowCount = Math.round(properties.length / 2);
				properties.forEach(function(element, index) {
					var row = parseInt(index / 2);
					if(index % 2 == 0)
						properties[row] = {column:[element]};
					else
						properties[row].column[1] =element;
						
					if(!element.hasOwnProperty("default"))
						element.default = "";
				});
				properties.splice(rowCount, properties.length - rowCount);
				
			}
		});
	}
	tools.window.makeWindow = function(id, title, obj, pos) {
	/*
	[{title:"", properties:[{name:"", property:""}]}
	
	*/
		var sType = daylight.type(obj);
		if(sType !== "array")
			obj = [obj];
		
		if(!pos)
			pos = {x:0, y:0};
			
		this.makeColumn(obj);
		title = title ? '<h3 class="day-drag-draggable">' + title +'</h3>' : '';
		var innerWindowTemplate = daylight.template(obj, this.innerWindowTemplate);
		var template = daylight.template({id:id, title:title, contents:innerWindowTemplate, x :pos.x, y:pos.y}, this.windowTemplate);
		$("body").append(template);
	}
	
	
	tools.window.init = function() {
		tools.window.makeWindow("transform","", [{title:"", multi:true, properties:[
		{name: "X", property:"tx", default: "0px"},
		{name: "Y", property:"ty", default: "0px"},
		{name: "scale", property:"scale", default: "1, 1"},
		{name: "각도", property:"rotate", default: "0deg"}
	
		]},
		{title:"", multi:false, properties:[	{name: "기준점", property:"origin", default:"50% 50%"}]}]
		
		, {x:30, y:100});
		
		tools.window.makeWindow("property", "",[
		{title:"위치", multi:true, properties:[
			{name: "상단", property:"top"},
			{name: "하단", property:"bottom"},
			{name: "왼쪽", property:"left"},
			{name: "오른쪽", property:"right"}
		]},
		{title:"크기", multi:true, properties:[
			{name: "너비", property:"width"},
			{name: "높이", property:"height"},
		]},
		{title:"테두리", multi:false, properties:[
			{name: "전체 테두리", property:"border"},
			{name: "반경", property:"border-radius"}
		]}	
		], {x:"70%", y:"40px"});
		
		
		tools.window.makeWindow("border", "",[
		{title:"테두리", properties:[
			{name: "상단", property:"border-top"},
			{name: "하단", property:"border-bottom"},
			{name: "왼쪽", property:"border-left"},
			{name: "오른쪽", property:"border-right"}
		]}
		], {x:"70%", y:"40px"});
		
		
		
		
		tools.window.initEvent();
	}
	
	tools.window.initEvent = function(){
		dlProperties = $(".day-tools-properties");
		var size = dlProperties.size();
		for(var i = 0; i < size; ++i) {
			dlProperties.removeClass("show");
		}
		var dlWindowsMenu = $(".day-tools-windows");
		var dlWindowsMenuItems = dlWindowsMenu.find("li");
		dlWindowsMenu.click(function(e) {

			var dlItem = dlWindowsMenuItems.has(e.target, true);
			var bSelected = dlItem.hasClass("selected");
			dlWindowsMenuItems.removeClass("selected");
			dlProperties.removeClass("show");
			if(!bSelected) {
				dlItem.addClass("selected");
				var dlWindow = $(".day-tools-properties[data-window=\""+dlItem.attr("data-window")+"\"]");
				dlWindow.addClass("show");
			}

				
			
			
		});
		
		
	}
})(tools);