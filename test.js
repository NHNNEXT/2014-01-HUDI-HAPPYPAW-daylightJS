$(document).ready(function() {
$("body").append('<link href="./test/test.css" rel="stylesheet"/>');
$("body").append('<div class="size t1"></div><div class="size boxsize t2"></div>');
test("equal test", function() {
	var div = document.createElement("div");

	var dl_div = $(div);
	var dl_div2 = $([div]);

	ok(dl_div.equal(dl_div2));
	ok(dl_div.equal(div));
	
	var dl_size = $(".size");
	ok(dl_size.equal(dl_size.o));
});
test("dimension test", function() {
	/*
		width:100px;
		height:40px;
		padding:10px 5px 6px 2px;
		margin:4px 3px 1px 10px;
		border:4px solid black;
		border-width: 3px 9px 4px 3px;
	*/
	var dl_size = $(".t1");
	equal(dl_size.width(), 100);
	equal(dl_size.innerWidth(), dl_size.width() + 5 + 2);
	equal(dl_size.outerWidth(), dl_size.innerWidth() + 9 + 3);
	equal(dl_size.outerWidth(true), dl_size.outerWidth() + 3 + 10);
	
	equal(dl_size.height(), 40);
	equal(dl_size.innerHeight(), dl_size.height() + 10 + 6);
	equal(dl_size.outerHeight(), dl_size.innerHeight() + 3 + 4);
	equal(dl_size.outerHeight(true), dl_size.outerHeight() + 4 + 1);
	
});
test("dimension box-sizing test", function() {
	var dl_size = $(".t2");
	equal(dl_size.width(), 100 - 7 - 12);
	equal(dl_size.innerWidth(), dl_size.width() + 5 + 2);
	equal(dl_size.outerWidth(), dl_size.innerWidth() + 9 + 3);
	equal(dl_size.outerWidth(true), dl_size.outerWidth() + 3 + 10);
	
	equal(dl_size.height(), 40 - 16 - 7);
	equal(dl_size.innerHeight(), dl_size.height() + 10 + 6);
	equal(dl_size.outerHeight(), dl_size.innerHeight() + 3 + 4);
	equal(dl_size.outerHeight(true), dl_size.outerHeight() + 4 + 1);
});
test("is test", function() {
	var dl_size = $(".t2");
	ok(daylight.isNode(document.querySelector(".t2")));
	ok(daylight.isElement(document.querySelector(".t2")));
	notEqual(daylight.isElement(undefined), true);
	ok(daylight.isFunction(function() {}));
	equal(daylight.nodeName(document.createElement("div")), "DIV");
	equal(daylight.nodeName(document.createElement("div"), document.createElement("divs")), false);
	equal(daylight.nodeName(document.createElement("div"), document.createElement("div")), true);
	ok(daylight.isPlainObject({}));
	ok(daylight.isPlainObject({a:1, b:2}));
});
test("type test", function() {
	equal(daylight.type($()), "daylight");
	equal(daylight.type(), "undefined");
	equal(daylight.type(null), "null");
	equal(daylight.type(""), "string");
	equal(daylight.type(new String()), "string");
	equal(daylight.type(true), "boolean");
	equal(daylight.type(1), "number");
	equal(daylight.type(new Number(2)), "number");
	equal(daylight.type(document.createElement("div")), "object");
});
test("class test", function() {
	var div = document.createElement("div");
	div.className = "a1 a2 a3 a4 a5";
	var dl_div = $(div);
	ok(dl_div.hasClass("a1"));
	ok(!dl_div.removeClass("a1").hasClass("a1"));
	ok(dl_div.addClass("ab").hasClass("ab"));
	ok(daylight.toggleClass(div, "a"));
	ok(dl_div.hasClass("a"));
	ok(!daylight.toggleClass(div, "a"));
	ok(!dl_div.hasClass("a"));
});
test("insertion test", function() {
	var div = document.createElement("div");
	div.innerHTML = "";
	var div2 = document.createElement("div");
	div.appendChild(div2);
	ok(div.contains(div2));
	
	var dl_div = $(div);
	var dl_div2 = $(div2);
	
	equal(dl_div2.append("2").html(), "2");
	equal(dl_div2.prepend("3").html(), "32");
	equal(dl_div2.after('<div>a</div>').next().html(), "a");
	equal(dl_div2.before('<div>2</div>').prev().html(), "2");
	

	
	
});


});