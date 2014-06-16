datl.event = {};
datl.addEvent = function(event, startMotion, endMotion) {

};
(function(tools)
{
    var browserPrefix = ["", "-webkit-", "-moz-", "-o-", "-ms-"];
    var browserPrefixLength = browserPrefix.length;
    var dimensionType = ["px", "em", "%"];
    tools.setProperty = function(pos, time)
    {
        if (!tools.nowSelectElement) return;
        var dlElement = tools.nowSelectElement;
        var motion = tools.getMotion(typeof time !== "undefined" ? time : tools.nowTime);
        var value = "";
        var figure = tools.selectedMenu.pointer && tools.figure;
        var sSuffix = "px";
        var cssObject = {};
        for (var key in pos)
        {
            if (typeof pos[key] === "undefined") continue;
            value = parseFloat(pos[key]) || pos[key];
            if (!value) value = "0px";
            sSuffix = "px";
            if (daylight.type(pos[key]) === "string")
            {
                console.log("string");
                for (var i = 0; i < dimensionType.length; ++i) if (pos[key].indexOf(dimensionType[i]) !== -1) sSuffix = dimensionType[i]
            }
            if (typeof value === "number") value = value + sSuffix;
            cssObject[key] = value;
            motion[key] = value;
            tools.setting.refreshItem(key, value)
        }
        dlElement.css(cssObject);
        if (figure)
        {
            for (var i = 0; i < browserPrefixLength; ++i) if (cssObject.hasOwnProperty(browserPrefix[i] + "transform")) delete cssObject[browserPrefix[i] + "transform"];
            if (cssObject.hasOwnProperty("opacity")) delete cssObject["opacity"];
            if (cssObject.hasOwnProperty("left")) cssObject.left = parseFloat(dlElement.css("left")) + parseFloat(dlElement.css("border-left-width"));
            if (cssObject.hasOwnProperty("top")) cssObject.top = parseFloat(dlElement.css("top")) + parseFloat(dlElement.css("border-top-width"));
            figure.css(cssObject)
        }
        motion.fill = "add";
        tools.getLayer().addMotion(motion)
    };
    tools.resize = function(e)
    {
        var info = e.dragInfo;
        var btn = $(e.dragElement);
        var classes = btn.getClass();
        var pos = classes[0];
        var bPosS = pos.indexOf("s") != -1;
        var bPosW = pos.indexOf("w") != -1;
        var bPosE = pos.indexOf("e") != -1;
        var bPosN = pos.indexOf("n") != -1;
        var is_transform = !! tools.selectedMenu.transform;
        var is_shift = !! tools.key.is_shift;
        console.debug("RESIZE", bPosE);
        if (!is_transform)
        {
            var properties = {};
            var width = parseFloat(info.owidth);
            var height = parseFloat(info.oheight);
            var x = e.dragX;
            var y = e.dragY;
            if (tools.key.shift && (bPosE || bPosW) && (bPosS || bPosN))
            {
                var ox = x;
                var oy = y;
                var bRevers = bPosE && bPosN || bPosW && bPosS;
                if (bRevers) oy *= -1;
                x = y = (ox + oy) / 2;
                if (bRevers) y *= -1
            }
            if (bPosE)
            {
                width = width + x;
                properties.width = width;
                if (info.oright !== "auto") properties.right = parseFloat(info.oright) - x
            }
            if (bPosS)
            {
                if (info.obottom !== "auto") properties.bottom = parseFloat(info.obottom) + y;
                height = height + y;
                properties.height = height
            }
            if (bPosN)
            {
                if (info.obottom === "auto") properties.top = (parseFloat(info.otop) || 0) + y;
                properties.height = height - y
            }
            if (bPosW)
            {
                if (info.oright === "auto") properties.left = (parseFloat(info.oleft) || 0) + x;
                width = width - x;
                properties.width = width
            }
            if (width > 0 && height > 0) tools.setProperty(properties)
        }
        else;
    };
    tools.dragMouse = function(e)
    {
        console.debug("DRAG MOUSE");
        var is_transform = tools.selectedMenu.transform;
        var info = e.dragInfo;
        if (!is_transform)
        {
            var pos = {};
            if (info.obottom === "auto") pos.top = (parseFloat(info.otop) || 0) + e.dragY;
            else pos.bottom = parseFloat(info.obottom) - e.dragY;
            if (info.oright === "auto") pos.left = (parseFloat(info.oleft) || 0) + e.dragX;
            else pos.right = parseFloat(info.oright) - e.dragX;
            tools.setProperty(pos)
        }
        else
        {
            info.tx = parseFloat(info.tx) || 0;
            info.ty = parseFloat(info.ty) || 0;
            tools.setTranslate(info.tx + e.dragX, info.ty + e.dragY)
        }
    };
    tools.addPosition = function(x, y)
    {
        if (!tools.nowSelectElement) return;
        var layer = $(tools.nowSelectElement);
        var bottom = layer.css("bottom");
        var right = layer.css("right");
        var pos = {};
        if (bottom === "auto") pos.top = (parseFloat(layer.css("top")) || 0) + y;
        else pos.bottom = (parseFloat(layer.css("bottom")) || 0) - y;
        if (right === "auto") pos.left = (parseFloat(layer.css("left")) || 0) + x;
        else pos.right = (parseFloat(layer.css("right")) || 0) - x;
        console.log(pos);
        tools.setProperty(pos)
    }
})(tools);