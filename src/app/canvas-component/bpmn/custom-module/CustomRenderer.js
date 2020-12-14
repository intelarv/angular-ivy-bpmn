import inherits from 'inherits';

import BaseRenderer from 'diagram-js/lib/draw/BaseRenderer';

import {
  componentsToPath,
  createLine
} from 'diagram-js/lib/util/RenderUtil';

import {
  appendTo as svgAppendTo,
  classes as svgClasses,
  append as svgAppend,
  attr as svgAttr,
  create as svgCreate,
  innerSVG as svgInnerSVG
} from 'tiny-svg';
import DefaultRenderer from "diagram-js/lib/draw/DefaultRenderer";

var COLOR_GREEN = '#52B415',
    COLOR_RED = '#cc0000',
    COLOR_YELLOW = '#ffc800',
    BORDER_COLOR = '#0F9D58',
    FILL_COLOR = '#F4B400',
    TEXT_COLOR = '#4285F4',
    CONNECTION_COLOR = '#DB4437';

var DEFAULT_WIDTH = 100, DEFAULT_HEIGHT = 60;

/**
 * A renderer that knows how to render custom elements.
 */
export default function CustomRenderer(eventBus, styles) {

  BaseRenderer.call(this, eventBus, 2000);

  var computeStyle = styles.computeStyle;

  this.drawTriangle = function (p, side) {
    var halfSide = side / 2,
      points,
      attrs;

    points = [halfSide, 0, side, side, 0, side];

    attrs = computeStyle(attrs, {
      stroke: COLOR_GREEN,
      strokeWidth: 2,
      fill: COLOR_GREEN
    });

    var polygon = svgCreate('polygon');

    svgAttr(polygon, {
      points: points
    });

    svgAttr(polygon, attrs);

    svgAppend(p, polygon);

    return polygon;
  };

  this.getTrianglePath = function (element) {
    var x = element.x,
      y = element.y,
      width = element.width,
      height = element.height;

    var trianglePath = [
      ['M', x + width / 2, y],
      ['l', width / 2, height],
      ['l', -width, 0],
      ['z']
    ];

    return componentsToPath(trianglePath);
  };

  this.drawCircle = function (p, width, height) {
    var cx = width / 2,
      cy = height / 2;

    var attrs = computeStyle(attrs, {
      stroke: COLOR_YELLOW,
      strokeWidth: 4,
      fill: COLOR_YELLOW
    });

    var circle = svgCreate('circle');

    svgAttr(circle, {
      cx: cx,
      cy: cy,
      r: Math.round((width + height) / 4)
    });

    svgAttr(circle, attrs);

    svgAppend(p, circle);

    return circle;
  };

  this.getCirclePath = function (shape) {
    var cx = shape.x + shape.width / 2,
      cy = shape.y + shape.height / 2,
      radius = shape.width / 2;

    var circlePath = [
      ['M', cx, cy],
      ['m', 0, -radius],
      ['a', radius, radius, 0, 1, 1, 0, 2 * radius],
      ['a', radius, radius, 0, 1, 1, 0, -2 * radius],
      ['z']
    ];

    return componentsToPath(circlePath);
  };

  this.drawCustomConnection = function (p, element) {
    var attrs = computeStyle(attrs, {
      stroke: COLOR_RED,
      strokeWidth: 2
    });

    return svgAppend(p, createLine(element.waypoints, attrs));
  };

  this.getCustomConnectionPath = function (connection) {
    var waypoints = connection.waypoints.map(function (p) {
      return p.original || p;
    });

    var connectionPath = [
      ['M', waypoints[0].x, waypoints[0].y]
    ];

    waypoints.forEach(function (waypoint, index) {
      if (index !== 0) {
        connectionPath.push(['L', waypoint.x, waypoint.y]);
      }
    });

    return componentsToPath(connectionPath);
  };

  // generic function to draw
  this.drawHFElement = (typeCssStyle, cssStyle, textMsg, width, height) => {
    const element = svgCreate('svg', {'width': width, 'height': height});
    //var g = svgAppendTo(svgCreate('g'), element);

    // add classes, SVG style!
    svgClasses(element).add(typeCssStyle);

    var text = `<g class="${cssStyle}">
    <rect x="0" y="0" width="${width}" height="${height}" rx="10" ry="10" fill="${FILL_COLOR}"/>
    <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="${TEXT_COLOR}" font-weight="bold">${textMsg}</text>
    </g>`;


    // set innerSVG
    svgInnerSVG(element, text);
    return element;
  }


  this.getHFShapePath = function getShapePath(shape) {

    var x = shape.x,
      y = shape.y,
      width = shape.width,
      height = shape.height;

    var shapePath = [
      ['M', x, y],
      ['l', width, 0],
      ['l', 0, height],
      ['l', -width, 0],
      ['z']
    ];

    return componentsToPath(shapePath);
  };

  this.getHFConnectionPath = function getConnectionPath(connection) {
    var waypoints = connection.waypoints;

    var idx, point, connectionPath = [];

    for (idx = 0; (point = waypoints[idx]); idx++) {

      // take invisible docking into account
      // when creating the path
      point = point.original || point;

      connectionPath.push([idx === 0 ? 'M' : 'L', point.x, point.y]);
    }

    return componentsToPath(connectionPath);
  };
}
inherits(CustomRenderer, BaseRenderer);

CustomRenderer.$inject = [ 'eventBus', 'styles' ];


CustomRenderer.prototype.canRender = function(element) {
  return /^hf/.test(element.type);
};

CustomRenderer.prototype.drawShape = function(p, element) {
  var type = element.type;

  if (type === 'hf:triangle') {
    return this.drawTriangle(p, element.width);
  }

  if (type === 'hf:circle') {
    return this.drawCircle(p, element.width, element.height);
  }

  var typeCssStyle, cssStyle, textMsg, width = DEFAULT_WIDTH, height = DEFAULT_HEIGHT;
  switch (type){
    case 'hf:timedelay':{
      typeCssStyle = 'delay';
      cssStyle = 'timedelay-delay';
      textMsg = 'Timedelay';
    }
    break;
    case 'hf:timewindow':{
      typeCssStyle = 'delay';
      cssStyle = 'timewindow-delay';
      textMsg = 'Time Window';
    }
      break;
    case 'hf:waituntil':{
      typeCssStyle = 'delay';
      cssStyle = 'waituntil-delay';
      textMsg = 'Wait Until';
    }
      break;
    case 'hf:exit':{
      typeCssStyle = 'control';
      cssStyle = 'exit-control';
      textMsg = 'exit';
    }
      break;
    case 'hf:start':{
      typeCssStyle = 'control';
      cssStyle = 'start-control';
      textMsg = 'start';
    }
      break;
    case 'hf:multisplit':{
      typeCssStyle = 'control';
      cssStyle = 'multisplit-control';
      textMsg = 'multisplit';
    }
      break;
    case 'hf:truefalse':{
      typeCssStyle = 'control';
      cssStyle = 'truefalse-control';
      textMsg = 'truefalse';
    }
      break;
    case 'hf:email':{
      typeCssStyle = 'message';
      cssStyle = 'email-msg';
      textMsg = 'Email';
    }
      break;
    case 'hf:msgcenter':{
      typeCssStyle = 'message';
      cssStyle = 'msgcenter-msg';
      textMsg = 'Email';
    }
      break;
    case 'hf:pns':{
      typeCssStyle = 'message';
      cssStyle = 'pns-msg';
      textMsg = 'Push Notifications';
    }
      break;
    case 'hf:sms':{
      typeCssStyle = 'message';
      cssStyle = 'sms-msg';
      textMsg = 'Text';
    }
      break;
    case 'hf:webhook':{
      typeCssStyle = 'message';
      cssStyle = 'webhook-msg';
      textMsg = 'WebHook';
    }
      break;
  }

  const ele = this.drawHFElement( typeCssStyle, cssStyle, textMsg, width, height);
  svgAppend(p, ele);
  return ele;
};

CustomRenderer.prototype.getShapePath = function(shape) {
  var type = shape.type;

  if (type === 'hf:triangle') {
    return this.getTrianglePath(shape);
  }

  if (type === 'hf:circle') {
    return this.getCirclePath(shape);
  }

  if (type === 'hf:connection') {
    return this.getHFConnectionPath(shape);
  } else if(/^hf/.test(type)) {
    return this.getHFShapePath(shape);
  }


};

CustomRenderer.prototype.drawConnection = function(p, element) {

  var type = element.type;

  if (type === 'hf:connection') {
    return this.drawCustomConnection(p, element);
  }
};


CustomRenderer.prototype.getConnectionPath = function(connection) {

  var type = connection.type;

  if (type === 'hf:connection') {
    return this.getCustomConnectionPath(connection);
  }
};
