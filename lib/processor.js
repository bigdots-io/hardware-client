"use strict";

class Processor {
  processDot(y, x, hex, displayData) {
    var brightness = displayData.brightness || 100,
        shadedHex = shadeHex(hex, -((100 - brightness) / 100)),
        rgb = hexToRgb(shadedHex);

    return {
      y: parseInt(y, 10),
      x: parseInt(x, 10),
      r: rgb.r,
      g: rgb.g,
      b: rgb.b
    };
  }
}

function hexToRgb(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}

function shadeHex(color, percent) {
    var f=parseInt(color.slice(1),16),t=percent<0?0:255,p=percent<0?percent*-1:percent,R=f>>16,G=f>>8&0x00FF,B=f&0x0000FF;
    return "#"+(0x1000000+(Math.round((t-R)*p)+R)*0x10000+(Math.round((t-G)*p)+G)*0x100+(Math.round((t-B)*p)+B)).toString(16).slice(1);
}

module.exports = Processor;
