tools.window = {};
tools.window.windowTemplate = '<div class="day-tool day-tools-properties day-drag" style="left:{x}; top:{y};"><div class="day-drag-draggable"></div><div class="day-property"><h3 class="day-drag-draggable">{title}</h3>{contents}</div>';
tools.window.innerWindowTemplate = '<div class="day-property-inner">{title}<table>{properties}<tr>{column}<td class="day-item-property">{name}</td><td class="day-item-value"><input type="input" data-item="{property}" data-default="{default}"/></td>{/column}</tr>{/properties}</table></div>';
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
tools.window.makeWindow = function(title, obj, pos) {
/*
[{title:"", properties:[{name:"", property:""}]}

*/
	var sType = daylight.type(obj);
	if(sType !== "array")
		obj = [obj];
	
	if(!pos)
		pos = {x:0, y:0};
		
	this.makeColumn(obj);
	
	var innerWindowTemplate = daylight.template(obj, this.innerWindowTemplate);
	var template = daylight.template({title:title, contents:innerWindowTemplate, x :pos.x, y:pos.y}, this.windowTemplate);
	$("body").append(template);
}


tools.window.init = function() {
	tools.window.makeWindow("Transform", [{title:"", multi:true, properties:[
	{name: "X", property:"tx", default: "0px"},
	{name: "Y", property:"ty", default: "0px"},
	{name: "scale", property:"scale", default: "1, 1"},
	{name: "각도", property:"rotate", default: "0deg"}

	]},
	{title:"", multi:false, properties:[	{name: "기준점", property:"origin"}]}]
	
	, {x:30, y:100});
	
	tools.window.makeWindow("속성",[
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
	
}