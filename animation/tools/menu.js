tools.menu = {};
tools.initMenu = function() {
	var dlMenu = $(".day-tools-menu");
	
	dlMenu.click(function(e) {
		var eTarget = e.target;
		
		var dlItem = dlMenu.find("li").has(eTarget, true);
		if(dlItem.size() == 0)
			return;
		

		if(dlItem.nodeName() !== "LI")
			return;
			
		var sItem = dlItem.attr("data-item");
		
		if(!sItem)
			return;
			
		tools.menu.changeMenu(sItem);
	});
	
	tools.refreshMenu();
}
tools.menu.changeMenu = function(sItem) {		
	var bSelected = tools.selectedMenu[sItem];
	if(!bSelected) {
		for(var _item in tools.selectedMenu) {
			tools.selectedMenu[_item] = false;
		}
		
		tools.selectedMenu[sItem] = true;
		if(sItem === "transform")
			tools.selectedMenu["pointer"] = true;	
	}
	if(bSelected && sItem === "transform") {
		tools.selectedMenu[sItem] = false;
	}
	tools.refreshMenu();
	tools.refreshStatus();
}
tools.refreshMenu = function() {
	var li = $(".day-tools-menu li");//.removeClass("selected");
	li.each(function(el) {
		var menu = this.getAttribute("data-item");
		if(tools.selectedMenu[menu])
			daylight.addClass(this, "selected");
		else
			daylight.removeClass(this, "selected");
	})
}


tools.refreshStatus = function() {
	if(tools.selectedMenu.pointer &&!tools.selectedMenu.transform && tools.nowSelectElement) {
		tools.setFigure();	
		tools.figure.addClass("show");
	} else
		tools.figure.removeClass("show");

	if(tools.selectedMenu.transform && tools.nowSelectElement) {
		tools.transform.setFigure();
		tools.rotateArea.addClass("show");
	} else
		tools.rotateArea.removeClass("show");
		
/*
	if(tools.selectedMenu.shape && tools.nowSelectElement) {
		tools.setShapeFigure();
	} else
		tools.shapeFigure.removeClass("show");
*/
}