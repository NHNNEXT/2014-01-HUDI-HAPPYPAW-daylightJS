//test 설계
daylight.ui = {};
daylight.ui.checkbox = function(name, option) {
	if(!option)
		option = {};
	var template = '<div class="day day_checkbox {class}"><input type="checkbox" value="None" id="input_{name}" name="check" /><label for="input_{name}"></label></div>';
	return daylight.template({name : name, "class":option.class}, template);
};