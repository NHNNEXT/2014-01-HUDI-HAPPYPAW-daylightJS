daylight.createTable = function(info) {
	var doc = this.document;
	var table = doc.createElement("table");
	if(info && info.row && info.row > 0) {
		for(var i = 0; i < info.row; ++i) {
			var tr = doc.createElement("tr");
			table.appendChild(tr);
			if(info.column > 0) {
				for(var j = 0; j < info.column; ++j) {
					var td = doc.createElement("td");
					tr.appendChild(td);
					if(info.each) {
						info.each.call(td, i, j);
					}
				}
			}
		}
	}
	return $table(table);
}
daylight.$table = daylight.table = function(object) {
	this.cells = [];
	this.row = 0;
	this.column = 0;
	
	
	if(object instanceof daylight.object)
		this.object = object;
	else
		this.object = $(object);
		
	
	var tr = this.object.find("tr");
	this.row = tr.size;
	for(var i = 0; i < tr.size; ++i) {
		var datas = $(tr.o[i]).find("th, td");
		
		if(datas.size > this.row)
			this.column = datas.size;
		
		
		this.cells[i] = [];
		for(var j = 0; j < datas.size; ++j) {
			this.cells[i][j] = new $cell($(datas.o[j]));
		}
	}
	for(var key in this.object) {
		var func = this.object[key];
		if(typeof func == "function") {
			if(this.__proto__ && this.__proto__[key] || this.prototype && this.prototype[key])
				continue;
			if(key == "get")
				continue;
			this[key] = func.bind(this.object);
		}
	}

}
daylight.$replace = function(from, to, string) {
	return string.split(from).join(to);
}
daylight.table.prototype.get = function(row, column) {
	return this.cells[row][column];
}

$cell = function(obj) {
	this.colspan = 0;
	this.rowspan = 0;
	this.object = obj;
}

var $table = daylight.create(daylight.table);
