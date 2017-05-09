require=(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"VRComponent":[function(require,module,exports){
"\nVRComponent class\n\nproperties\n- front (set: imagePath <string>, get: layer)\n- right\n- back\n- left\n- top\n- bottom\n- heading <number>\n- elevation <number>\n- tilt <number> readonly\n\n- orientationLayer <bool>\n- arrowKeys <bool>\n- lookAtLatestProjectedLayer <bool>\n\nmethods\n- projectLayer(layer) # heading and elevation are set as properties on the layer\n- hideEnviroment()\n\nevents\n- Events.OrientationDidChange, (data {heading, elevation, tilt})\n\n--------------------------------------------------------------------------------\n\nVRLayer class\n\nproperties\n- heading <number> (from 0 up to 360)\n- elevation <number> (from -90 down to 90 up)\n";
var KEYS, KEYSDOWN, SIDES, VRAnchorLayer,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

SIDES = ["north", "front", "east", "right", "south", "back", "west", "left", "top", "bottom"];

KEYS = {
  LeftArrow: 37,
  UpArrow: 38,
  RightArrow: 39,
  DownArrow: 40
};

KEYSDOWN = {
  left: false,
  up: false,
  right: false,
  down: false
};

Events.OrientationDidChange = "orientationdidchange";

VRAnchorLayer = (function(superClass) {
  extend(VRAnchorLayer, superClass);

  function VRAnchorLayer(layer, cubeSide) {
    VRAnchorLayer.__super__.constructor.call(this, void 0);
    this.width = 0;
    this.height = 0;
    this.clip = false;
    this.name = "anchor";
    this.cubeSide = cubeSide;
    this.layer = layer;
    layer.superLayer = this;
    layer.center();
    layer.on("change:orientation", (function(_this) {
      return function(newValue, layer) {
        return _this.updatePosition(layer);
      };
    })(this));
    this.updatePosition(layer);
    layer._context.on("layer:destroy", (function(_this) {
      return function(layer) {
        if (layer === _this.layer) {
          return _this.destroy();
        }
      };
    })(this));
  }

  VRAnchorLayer.prototype.updatePosition = function(layer) {
    var halfCubSide;
    halfCubSide = this.cubeSide / 2;
    return this.style["webkitTransform"] = "translateX(" + ((this.cubeSide - this.width) / 2) + "px) translateY(" + ((this.cubeSide - this.height) / 2) + "px) rotateZ(" + layer.heading + "deg) rotateX(" + (90 - layer.elevation) + "deg) translateZ(" + layer.distance + "px) rotateX(180deg)";
  };

  return VRAnchorLayer;

})(Layer);

exports.VRLayer = (function(superClass) {
  extend(VRLayer, superClass);

  function VRLayer(options) {
    if (options == null) {
      options = {};
    }
    options = _.defaults(options, {
      heading: 0,
      elevation: 0
    });
    VRLayer.__super__.constructor.call(this, options);
  }

  VRLayer.define("heading", {
    get: function() {
      return this._heading;
    },
    set: function(value) {
      var rest;
      if (value >= 360) {
        value = value % 360;
      } else if (value < 0) {
        rest = Math.abs(value) % 360;
        value = 360 - rest;
      }
      if (this._heading !== value) {
        this._heading = value;
        this.emit("change:heading", value);
        return this.emit("change:orientation", value);
      }
    }
  });

  VRLayer.define("elevation", {
    get: function() {
      return this._elevation;
    },
    set: function(value) {
      value = Utils.clamp(value, -90, 90);
      if (value !== this._elevation) {
        this._elevation = value;
        this.emit("change:elevation", value);
        return this.emit("change:orientation", value);
      }
    }
  });

  VRLayer.define("distance", {
    get: function() {
      return this._distance;
    },
    set: function(value) {
      if (value !== this._distance) {
        this._distance = value;
        this.emit("change:distance", value);
        return this.emit("change:orientation", value);
      }
    }
  });

  return VRLayer;

})(Layer);

exports.VRComponent = (function(superClass) {
  extend(VRComponent, superClass);

  function VRComponent(options) {
    if (options == null) {
      options = {};
    }
    this.addDesktopPanLayer = bind(this.addDesktopPanLayer, this);
    this.removeDesktopPanLayer = bind(this.removeDesktopPanLayer, this);
    this.deviceOrientationUpdate = bind(this.deviceOrientationUpdate, this);
    this.createCube = bind(this.createCube, this);
    options = _.defaults(options, {
      cubeSide: 3000,
      perspective: 1200,
      lookAtLatestProjectedLayer: false,
      width: Screen.width,
      height: Screen.height,
      orientationLayer: true,
      arrowKeys: true
    });
    VRComponent.__super__.constructor.call(this, options);
    this.perspective = options.perspective;
    this.backgroundColor = null;
    this.createCube(options.cubeSide);
    this.degToRad = Math.PI / 180;
    this.layersToKeepLevel = [];
    this.lookAtLatestProjectedLayer = options.lookAtLatestProjectedLayer;
    this.arrowKeys = options.arrowKeys;
    this._keys();
    this._heading = 0;
    this._elevation = 0;
    this._tilt = 0;
    this._headingOffset = 0;
    this._elevationOffset = 0;
    this._deviceHeading = 0;
    this._deviceElevation = 0;
    if (options.heading) {
      this.heading = options.heading;
    }
    if (options.elevation) {
      this.elevation = options.elevation;
    }
    this.orientationLayer = options.orientationLayer;
    this.desktopPan(0, 0);
    if (Utils.isMobile()) {
      window.addEventListener("deviceorientation", (function(_this) {
        return function(event) {
          return _this.orientationData = event;
        };
      })(this));
    }
    Framer.Loop.on("update", this.deviceOrientationUpdate);
    Framer.CurrentContext.on("reset", function() {
      return Framer.Loop.off("update", this.deviceOrientationUpdate);
    });
    this.on("change:frame", function() {
      return this.desktopPan(0, 0);
    });
  }

  VRComponent.prototype._keys = function() {
    document.addEventListener("keydown", (function(_this) {
      return function(event) {
        if (_this.arrowKeys) {
          switch (event.which) {
            case KEYS.UpArrow:
              KEYSDOWN.up = true;
              return event.preventDefault();
            case KEYS.DownArrow:
              KEYSDOWN.down = true;
              return event.preventDefault();
            case KEYS.LeftArrow:
              KEYSDOWN.left = true;
              return event.preventDefault();
            case KEYS.RightArrow:
              KEYSDOWN.right = true;
              return event.preventDefault();
          }
        }
      };
    })(this));
    document.addEventListener("keyup", (function(_this) {
      return function(event) {
        if (_this.arrowKeys) {
          switch (event.which) {
            case KEYS.UpArrow:
              KEYSDOWN.up = false;
              return event.preventDefault();
            case KEYS.DownArrow:
              KEYSDOWN.down = false;
              return event.preventDefault();
            case KEYS.LeftArrow:
              KEYSDOWN.left = false;
              return event.preventDefault();
            case KEYS.RightArrow:
              KEYSDOWN.right = false;
              return event.preventDefault();
          }
        }
      };
    })(this));
    return window.onblur = function() {
      KEYSDOWN.up = false;
      KEYSDOWN.down = false;
      KEYSDOWN.left = false;
      return KEYSDOWN.right = false;
    };
  };

  VRComponent.define("orientationLayer", {
    get: function() {
      return this.desktopOrientationLayer !== null && this.desktopOrientationLayer !== void 0;
    },
    set: function(value) {
      if (this.world !== void 0) {
        if (Utils.isDesktop()) {
          if (value === true) {
            return this.addDesktopPanLayer();
          } else if (value === false) {
            return this.removeDesktopPanLayer();
          }
        }
      }
    }
  });

  VRComponent.define("heading", {
    get: function() {
      var heading, rest;
      heading = this._heading + this._headingOffset;
      if (heading > 360) {
        heading = heading % 360;
      } else if (heading < 0) {
        rest = Math.abs(heading) % 360;
        heading = 360 - rest;
      }
      return heading;
    },
    set: function(value) {
      return this.lookAt(value, this._elevation);
    }
  });

  VRComponent.define("elevation", {
    get: function() {
      return this._elevation;
    },
    set: function(value) {
      return this.lookAt(this._heading, value);
    }
  });

  VRComponent.define("tilt", {
    get: function() {
      return this._tilt;
    },
    set: function(value) {
      throw "Tilt is readonly";
    }
  });

  SIDES.map(function(face) {
    return VRComponent.define(face, {
      get: function() {
        return this.layerFromFace(face);
      },
      set: function(value) {
        return this.setImage(face, value);
      }
    });
  });

  VRComponent.prototype.createCube = function(cubeSide) {
    var colors, halfCubSide, i, index, key, len, ref, ref1, results, side, sideNames;
    if (cubeSide == null) {
      cubeSide = this.cubeSide;
    }
    this.cubeSide = cubeSide;
    if ((ref = this.world) != null) {
      ref.destroy();
    }
    this.world = new Layer({
      name: "world",
      superLayer: this,
      width: cubeSide,
      height: cubeSide,
      backgroundColor: null,
      clip: false
    });
    this.world.style.webkitTransformStyle = "preserve-3d";
    this.world.center();
    halfCubSide = this.cubeSide / 2;
    this.side0 = new Layer;
    this.side0.style["webkitTransform"] = "rotateX(-90deg) translateZ(-" + halfCubSide + "px)";
    this.side1 = new Layer;
    this.side1.style["webkitTransform"] = "rotateY(-90deg) translateZ(-" + halfCubSide + "px) rotateZ(90deg)";
    this.side2 = new Layer;
    this.side2.style["webkitTransform"] = "rotateX(90deg) translateZ(-" + halfCubSide + "px) rotateZ(180deg)";
    this.side3 = new Layer;
    this.side3.style["webkitTransform"] = "rotateY(90deg) translateZ(-" + halfCubSide + "px) rotateZ(-90deg)";
    this.side4 = new Layer;
    this.side4.style["webkitTransform"] = "rotateY(-180deg) translateZ(-" + halfCubSide + "px) rotateZ(180deg)";
    this.side5 = new Layer;
    this.side5.style["webkitTransform"] = "translateZ(-" + halfCubSide + "px)";
    this.sides = [this.side0, this.side1, this.side2, this.side3, this.side4, this.side5];
    colors = ["#866ccc", "#28affa", "#2dd7aa", "#ffc22c", "#7ddd11", "#f95faa"];
    sideNames = ["front", "right", "back", "left", "top", "bottom"];
    index = 0;
    ref1 = this.sides;
    for (i = 0, len = ref1.length; i < len; i++) {
      side = ref1[i];
      side.name = sideNames[index];
      side.width = side.height = cubeSide;
      side.superLayer = this.world;
      side.html = sideNames[index];
      side.color = "white";
      side._backgroundColor = colors[index];
      side.backgroundColor = colors[index];
      side.style = {
        lineHeight: cubeSide + "px",
        textAlign: "center",
        fontSize: (cubeSide / 10) + "px",
        fontWeight: "100",
        fontFamily: "Helvetica Neue"
      };
      index++;
    }
    if (this.sideImages) {
      results = [];
      for (key in this.sideImages) {
        results.push(this.setImage(key, this.sideImages[key]));
      }
      return results;
    }
  };

  VRComponent.prototype.hideEnviroment = function() {
    var i, len, ref, results, side;
    ref = this.sides;
    results = [];
    for (i = 0, len = ref.length; i < len; i++) {
      side = ref[i];
      results.push(side.destroy());
    }
    return results;
  };

  VRComponent.prototype.layerFromFace = function(face) {
    var map;
    map = {
      north: this.side0,
      front: this.side0,
      east: this.side1,
      right: this.side1,
      south: this.side2,
      back: this.side2,
      west: this.side3,
      left: this.side3,
      top: this.side4,
      bottom: this.side5
    };
    return map[face];
  };

  VRComponent.prototype.setImage = function(face, imagePath) {
    var layer, ref;
    if (ref = !face, indexOf.call(SIDES, ref) >= 0) {
      throw Error("VRComponent setImage, wrong name for face: " + face + ", valid options: front, right, back, left, top, bottom, north, east, south, west");
    }
    if (!this.sideImages) {
      this.sideImages = {};
    }
    this.sideImages[face] = imagePath;
    layer = this.layerFromFace(face);
    if (imagePath) {
      if (layer != null) {
        layer.html = "";
      }
      return layer != null ? layer.image = imagePath : void 0;
    } else {
      if (layer != null) {
        layer.html = layer != null ? layer.name : void 0;
      }
      return layer != null ? layer.backgroundColor = layer != null ? layer._backgroundColor : void 0 : void 0;
    }
  };

  VRComponent.prototype.getImage = function(face) {
    var layer, ref;
    if (ref = !face, indexOf.call(SIDES, ref) >= 0) {
      throw Error("VRComponent getImage, wrong name for face: " + face + ", valid options: front, right, back, left, top, bottom, north, east, south, west");
    }
    layer = this.layerFromFace(face);
    if (layer) {
      return layer.image;
    }
  };

  VRComponent.prototype.projectLayer = function(insertLayer) {
    var anchor, distance, elevation, heading, rest;
    heading = insertLayer.heading;
    if (heading === void 0) {
      heading = 0;
    }
    elevation = insertLayer.elevation;
    if (elevation === void 0) {
      elevation = 0;
    }
    if (heading >= 360) {
      heading = value % 360;
    } else if (heading < 0) {
      rest = Math.abs(heading) % 360;
      heading = 360 - rest;
    }
    elevation = Utils.clamp(elevation, -90, 90);
    distance = insertLayer.distance;
    if (distance === void 0) {
      distance = 1200;
    }
    insertLayer.heading = heading;
    insertLayer.elevation = elevation;
    insertLayer.distance = distance;
    anchor = new VRAnchorLayer(insertLayer, this.cubeSide);
    anchor.superLayer = this.world;
    if (this.lookAtLatestProjectedLayer) {
      return this.lookAt(heading, elevation);
    }
  };

  VRComponent.prototype.deviceOrientationUpdate = function() {
    var alpha, beta, date, diff, gamma, halfCubSide, orientation, rotation, translationX, translationY, translationZ, x, xAngle, yAngle, zAngle;
    if (Utils.isDesktop()) {
      if (this.arrowKeys) {
        if (this._lastCallHorizontal === void 0) {
          this._lastCallHorizontal = 0;
          this._lastCallVertical = 0;
          this._accelerationHorizontal = 1;
          this._accelerationVertical = 1;
          this._goingUp = false;
          this._goingLeft = false;
        }
        date = new Date();
        x = .1;
        if (KEYSDOWN.up || KEYSDOWN.down) {
          diff = date - this._lastCallVertical;
          if (diff < 30) {
            if (this._accelerationVertical < 30) {
              this._accelerationVertical += 0.18;
            }
          }
          if (KEYSDOWN.up) {
            if (this._goingUp === false) {
              this._accelerationVertical = 1;
              this._goingUp = true;
            }
            this.desktopPan(0, 1 * this._accelerationVertical * x);
          } else {
            if (this._goingUp === true) {
              this._accelerationVertical = 1;
              this._goingUp = false;
            }
            this.desktopPan(0, -1 * this._accelerationVertical * x);
          }
          this._lastCallVertical = date;
        } else {
          this._accelerationVertical = 1;
        }
        if (KEYSDOWN.left || KEYSDOWN.right) {
          diff = date - this._lastCallHorizontal;
          if (diff < 30) {
            if (this._accelerationHorizontal < 25) {
              this._accelerationHorizontal += 0.18;
            }
          }
          if (KEYSDOWN.left) {
            if (this._goingLeft === false) {
              this._accelerationHorizontal = 1;
              this._goingLeft = true;
            }
            this.desktopPan(1 * this._accelerationHorizontal * x, 0);
          } else {
            if (this._goingLeft === true) {
              this._accelerationHorizontal = 1;
              this._goingLeft = false;
            }
            this.desktopPan(-1 * this._accelerationHorizontal * x, 0);
          }
          return this._lastCallHorizontal = date;
        } else {
          return this._accelerationHorizontal = 1;
        }
      }
    } else if (this.orientationData) {
      alpha = this.orientationData.alpha;
      beta = this.orientationData.beta;
      gamma = this.orientationData.gamma;
      if (alpha !== 0 && beta !== 0 && gamma !== 0) {
        this.directionParams(alpha, beta, gamma);
      }
      xAngle = beta;
      yAngle = -gamma;
      zAngle = alpha;
      halfCubSide = this.cubeSide / 2;
      orientation = "rotate(" + (window.orientation * -1) + "deg) ";
      translationX = "translateX(" + ((this.width / 2) - halfCubSide) + "px)";
      translationY = " translateY(" + ((this.height / 2) - halfCubSide) + "px)";
      translationZ = " translateZ(" + this.perspective + "px)";
      rotation = translationZ + translationX + translationY + orientation + (" rotateY(" + yAngle + "deg) rotateX(" + xAngle + "deg) rotateZ(" + zAngle + "deg)") + (" rotateZ(" + (-this._headingOffset) + "deg)");
      return this.world.style["webkitTransform"] = rotation;
    }
  };

  VRComponent.prototype.directionParams = function(alpha, beta, gamma) {
    var alphaRad, betaRad, cA, cB, cG, cH, diff, elevation, gammaRad, heading, orientationTiltOffset, sA, sB, sG, tilt, xrA, xrB, xrC, yrA, yrB, yrC, zrA, zrB, zrC;
    alphaRad = alpha * this.degToRad;
    betaRad = beta * this.degToRad;
    gammaRad = gamma * this.degToRad;
    cA = Math.cos(alphaRad);
    sA = Math.sin(alphaRad);
    cB = Math.cos(betaRad);
    sB = Math.sin(betaRad);
    cG = Math.cos(gammaRad);
    sG = Math.sin(gammaRad);
    xrA = -sA * sB * sG + cA * cG;
    xrB = cA * sB * sG + sA * cG;
    xrC = cB * sG;
    yrA = -sA * cB;
    yrB = cA * cB;
    yrC = -sB;
    zrA = -sA * sB * cG - cA * sG;
    zrB = cA * sB * cG - sA * sG;
    zrC = cB * cG;
    heading = Math.atan(zrA / zrB);
    if (zrB < 0) {
      heading += Math.PI;
    } else if (zrA < 0) {
      heading += 2 * Math.PI;
    }
    elevation = Math.PI / 2 - Math.acos(-zrC);
    cH = Math.sqrt(1 - (zrC * zrC));
    tilt = Math.acos(-xrC / cH) * Math.sign(yrC);
    heading *= 180 / Math.PI;
    elevation *= 180 / Math.PI;
    tilt *= 180 / Math.PI;
    this._heading = Math.round(heading * 1000) / 1000;
    this._elevation = Math.round(elevation * 1000) / 1000;
    tilt = Math.round(tilt * 1000) / 1000;
    orientationTiltOffset = (window.orientation * -1) + 90;
    tilt += orientationTiltOffset;
    if (tilt > 180) {
      diff = tilt - 180;
      tilt = -180 + diff;
    }
    this._tilt = tilt;
    this._deviceHeading = this._heading;
    this._deviceElevation = this._elevation;
    return this._emitOrientationDidChangeEvent();
  };

  VRComponent.prototype.removeDesktopPanLayer = function() {
    var ref;
    return (ref = this.desktopOrientationLayer) != null ? ref.destroy() : void 0;
  };

  VRComponent.prototype.addDesktopPanLayer = function() {
    var ref;
    if ((ref = this.desktopOrientationLayer) != null) {
      ref.destroy();
    }
    this.desktopOrientationLayer = new Layer({
      width: 100000,
      height: 10000,
      backgroundColor: null,
      superLayer: this,
      name: "desktopOrientationLayer"
    });
    this.desktopOrientationLayer.center();
    this.desktopOrientationLayer.draggable.enabled = true;
    this.prevDesktopDir = this.desktopOrientationLayer.x;
    this.prevDesktopHeight = this.desktopOrientationLayer.y;
    this.desktopOrientationLayer.on(Events.DragStart, (function(_this) {
      return function() {
        _this.prevDesktopDir = _this.desktopOrientationLayer.x;
        _this.prevDesktopHeight = _this.desktopOrientationLayer.y;
        return _this.desktopDraggableActive = true;
      };
    })(this));
    this.desktopOrientationLayer.on(Events.Move, (function(_this) {
      return function() {
        var deltaDir, deltaHeight, strength;
        if (_this.desktopDraggableActive) {
          strength = Utils.modulate(_this.perspective, [1200, 900], [22, 17.5]);
          deltaDir = (_this.desktopOrientationLayer.x - _this.prevDesktopDir) / strength;
          deltaHeight = (_this.desktopOrientationLayer.y - _this.prevDesktopHeight) / strength;
          _this.desktopPan(deltaDir, deltaHeight);
          _this.prevDesktopDir = _this.desktopOrientationLayer.x;
          return _this.prevDesktopHeight = _this.desktopOrientationLayer.y;
        }
      };
    })(this));
    return this.desktopOrientationLayer.on(Events.AnimationEnd, (function(_this) {
      return function() {
        var ref1;
        _this.desktopDraggableActive = false;
        return (ref1 = _this.desktopOrientationLayer) != null ? ref1.center() : void 0;
      };
    })(this));
  };

  VRComponent.prototype.desktopPan = function(deltaDir, deltaHeight) {
    var halfCubSide, rotation, translationX, translationY, translationZ;
    halfCubSide = this.cubeSide / 2;
    translationX = "translateX(" + ((this.width / 2) - halfCubSide) + "px)";
    translationY = " translateY(" + ((this.height / 2) - halfCubSide) + "px)";
    translationZ = " translateZ(" + this.perspective + "px)";
    this._heading -= deltaDir;
    if (this._heading > 360) {
      this._heading -= 360;
    } else if (this._heading < 0) {
      this._heading += 360;
    }
    this._elevation += deltaHeight;
    this._elevation = Utils.clamp(this._elevation, -90, 90);
    rotation = translationZ + translationX + translationY + (" rotateX(" + (this._elevation + 90) + "deg) rotateZ(" + (360 - this._heading) + "deg)") + (" rotateZ(" + (-this._headingOffset) + "deg)");
    this.world.style["webkitTransform"] = rotation;
    this._heading = Math.round(this._heading * 1000) / 1000;
    this._tilt = 0;
    return this._emitOrientationDidChangeEvent();
  };

  VRComponent.prototype.lookAt = function(heading, elevation) {
    var halfCubSide, ref, rotation, translationX, translationY, translationZ;
    halfCubSide = this.cubeSide / 2;
    translationX = "translateX(" + ((this.width / 2) - halfCubSide) + "px)";
    translationY = " translateY(" + ((this.height / 2) - halfCubSide) + "px)";
    translationZ = " translateZ(" + this.perspective + "px)";
    rotation = translationZ + translationX + translationY + (" rotateZ(" + this._tilt + "deg) rotateX(" + (elevation + 90) + "deg) rotateZ(" + (-heading) + "deg)");
    if ((ref = this.world) != null) {
      ref.style["webkitTransform"] = rotation;
    }
    this._heading = heading;
    this._elevation = elevation;
    if (Utils.isMobile()) {
      this._headingOffset = this._heading - this._deviceHeading;
    }
    this._elevationOffset = this._elevation - this._deviceElevation;
    heading = this._heading;
    if (heading < 0) {
      heading += 360;
    } else if (heading > 360) {
      heading -= 360;
    }
    return this.emit(Events.OrientationDidChange, {
      heading: heading,
      elevation: this._elevation,
      tilt: this._tilt
    });
  };

  VRComponent.prototype._emitOrientationDidChangeEvent = function() {
    return this.emit(Events.OrientationDidChange, {
      heading: this.heading,
      elevation: this._elevation,
      tilt: this._tilt
    });
  };

  return VRComponent;

})(Layer);


},{}],"myModule":[function(require,module,exports){
exports.myVar = "myVariable";

exports.myFunction = function() {
  return print("myFunction is running");
};

exports.myArray = [1, 2, 3];


},{}]},{},[])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZnJhbWVyLm1vZHVsZXMuanMiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL1VzZXJzL3podXl1eHVhbi/nmb7luqbkupHlkIzmraXnm5gvMTYtMTflub/ogZQvRnJhbWVyIFN0dWRpby9UcmF2ZWxBcHAuZnJhbWVyL21vZHVsZXMvbXlNb2R1bGUuY29mZmVlIiwiLi4vLi4vLi4vLi4vLi4vVXNlcnMvemh1eXV4dWFuL+eZvuW6puS6keWQjOatpeebmC8xNi0xN+W5v+iBlC9GcmFtZXIgU3R1ZGlvL1RyYXZlbEFwcC5mcmFtZXIvbW9kdWxlcy9WUkNvbXBvbmVudC5jb2ZmZWUiLCJub2RlX21vZHVsZXMvYnJvd3Nlci1wYWNrL19wcmVsdWRlLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIiMgQWRkIHRoZSBmb2xsb3dpbmcgbGluZSB0byB5b3VyIHByb2plY3QgaW4gRnJhbWVyIFN0dWRpby4gXG4jIG15TW9kdWxlID0gcmVxdWlyZSBcIm15TW9kdWxlXCJcbiMgUmVmZXJlbmNlIHRoZSBjb250ZW50cyBieSBuYW1lLCBsaWtlIG15TW9kdWxlLm15RnVuY3Rpb24oKSBvciBteU1vZHVsZS5teVZhclxuXG5leHBvcnRzLm15VmFyID0gXCJteVZhcmlhYmxlXCJcblxuZXhwb3J0cy5teUZ1bmN0aW9uID0gLT5cblx0cHJpbnQgXCJteUZ1bmN0aW9uIGlzIHJ1bm5pbmdcIlxuXG5leHBvcnRzLm15QXJyYXkgPSBbMSwgMiwgM10iLCJcIlwiXCJcblxuVlJDb21wb25lbnQgY2xhc3NcblxucHJvcGVydGllc1xuLSBmcm9udCAoc2V0OiBpbWFnZVBhdGggPHN0cmluZz4sIGdldDogbGF5ZXIpXG4tIHJpZ2h0XG4tIGJhY2tcbi0gbGVmdFxuLSB0b3Bcbi0gYm90dG9tXG4tIGhlYWRpbmcgPG51bWJlcj5cbi0gZWxldmF0aW9uIDxudW1iZXI+XG4tIHRpbHQgPG51bWJlcj4gcmVhZG9ubHlcblxuLSBvcmllbnRhdGlvbkxheWVyIDxib29sPlxuLSBhcnJvd0tleXMgPGJvb2w+XG4tIGxvb2tBdExhdGVzdFByb2plY3RlZExheWVyIDxib29sPlxuXG5tZXRob2RzXG4tIHByb2plY3RMYXllcihsYXllcikgIyBoZWFkaW5nIGFuZCBlbGV2YXRpb24gYXJlIHNldCBhcyBwcm9wZXJ0aWVzIG9uIHRoZSBsYXllclxuLSBoaWRlRW52aXJvbWVudCgpXG5cbmV2ZW50c1xuLSBFdmVudHMuT3JpZW50YXRpb25EaWRDaGFuZ2UsIChkYXRhIHtoZWFkaW5nLCBlbGV2YXRpb24sIHRpbHR9KVxuXG4tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG5WUkxheWVyIGNsYXNzXG5cbnByb3BlcnRpZXNcbi0gaGVhZGluZyA8bnVtYmVyPiAoZnJvbSAwIHVwIHRvIDM2MClcbi0gZWxldmF0aW9uIDxudW1iZXI+IChmcm9tIC05MCBkb3duIHRvIDkwIHVwKVxuXG5cIlwiXCJcblxuU0lERVMgPSBbXG5cdFwibm9ydGhcIiwgXG5cdFwiZnJvbnRcIiwgXG5cdFwiZWFzdFwiLFxuXHRcInJpZ2h0XCIsIFxuXHRcInNvdXRoXCIsIFxuXHRcImJhY2tcIiwgXG5cdFwid2VzdFwiLCBcblx0XCJsZWZ0XCIsIFxuXHRcInRvcFwiLCBcblx0XCJib3R0b21cIiwgXG5dXG5cbktFWVMgPSB7XG5cdExlZnRBcnJvdzogMzdcblx0VXBBcnJvdzogMzhcblx0UmlnaHRBcnJvdzogMzlcblx0RG93bkFycm93OiA0MFxufVxuXG5LRVlTRE9XTiA9IHtcblx0bGVmdDogZmFsc2Vcblx0dXA6IGZhbHNlXG5cdHJpZ2h0OiBmYWxzZVxuXHRkb3duOiBmYWxzZVxufVxuXG5FdmVudHMuT3JpZW50YXRpb25EaWRDaGFuZ2UgPSBcIm9yaWVudGF0aW9uZGlkY2hhbmdlXCJcblxuY2xhc3MgVlJBbmNob3JMYXllciBleHRlbmRzIExheWVyXG5cblx0Y29uc3RydWN0b3I6IChsYXllciwgY3ViZVNpZGUpIC0+XG5cdFx0c3VwZXIgdW5kZWZpbmVkXG5cdFx0QHdpZHRoID0gMFxuXHRcdEBoZWlnaHQgPSAwXG5cdFx0QGNsaXAgPSBmYWxzZVxuXHRcdEBuYW1lID0gXCJhbmNob3JcIlxuXHRcdEBjdWJlU2lkZSA9IGN1YmVTaWRlXG5cblx0XHRAbGF5ZXIgPSBsYXllclxuXHRcdGxheWVyLnN1cGVyTGF5ZXIgPSBAXG5cdFx0bGF5ZXIuY2VudGVyKClcblxuXHRcdGxheWVyLm9uIFwiY2hhbmdlOm9yaWVudGF0aW9uXCIsIChuZXdWYWx1ZSwgbGF5ZXIpID0+XG5cdFx0XHRAdXBkYXRlUG9zaXRpb24obGF5ZXIpXG5cdFx0QHVwZGF0ZVBvc2l0aW9uKGxheWVyKVxuXG5cdFx0bGF5ZXIuX2NvbnRleHQub24gXCJsYXllcjpkZXN0cm95XCIsIChsYXllcikgPT5cblx0XHRcdGlmIGxheWVyID09IEBsYXllclxuXHRcdFx0XHRAZGVzdHJveSgpXG5cblx0dXBkYXRlUG9zaXRpb246IChsYXllcikgLT5cblx0XHRoYWxmQ3ViU2lkZSA9IEBjdWJlU2lkZS8yXG5cdFx0QHN0eWxlW1wid2Via2l0VHJhbnNmb3JtXCJdID0gXCJ0cmFuc2xhdGVYKCN7KEBjdWJlU2lkZSAtIEB3aWR0aCkvMn1weCkgdHJhbnNsYXRlWSgjeyhAY3ViZVNpZGUgLSBAaGVpZ2h0KS8yfXB4KSByb3RhdGVaKCN7bGF5ZXIuaGVhZGluZ31kZWcpIHJvdGF0ZVgoI3s5MC1sYXllci5lbGV2YXRpb259ZGVnKSB0cmFuc2xhdGVaKCN7bGF5ZXIuZGlzdGFuY2V9cHgpIHJvdGF0ZVgoMTgwZGVnKVwiXG5cbmNsYXNzIGV4cG9ydHMuVlJMYXllciBleHRlbmRzIExheWVyXG5cblx0Y29uc3RydWN0b3I6IChvcHRpb25zID0ge30pIC0+XG5cdFx0b3B0aW9ucyA9IF8uZGVmYXVsdHMgb3B0aW9ucyxcblx0XHRcdGhlYWRpbmc6IDBcblx0XHRcdGVsZXZhdGlvbjogMFxuXHRcdHN1cGVyIG9wdGlvbnNcblxuXHRAZGVmaW5lIFwiaGVhZGluZ1wiLFxuXHRcdGdldDogLT4gQF9oZWFkaW5nXG5cdFx0c2V0OiAodmFsdWUpIC0+XG5cdFx0XHRpZiB2YWx1ZSA+PSAzNjBcblx0XHRcdFx0dmFsdWUgPSB2YWx1ZSAlIDM2MFxuXHRcdFx0ZWxzZSBpZiB2YWx1ZSA8IDBcblx0XHRcdFx0cmVzdCA9IE1hdGguYWJzKHZhbHVlKSAlIDM2MFxuXHRcdFx0XHR2YWx1ZSA9IDM2MCAtIHJlc3Rcblx0XHRcdGlmIEBfaGVhZGluZyAhPSB2YWx1ZVxuXHRcdFx0XHRAX2hlYWRpbmcgPSB2YWx1ZVxuXHRcdFx0XHRAZW1pdChcImNoYW5nZTpoZWFkaW5nXCIsIHZhbHVlKVxuXHRcdFx0XHRAZW1pdChcImNoYW5nZTpvcmllbnRhdGlvblwiLCB2YWx1ZSlcblxuXHRAZGVmaW5lIFwiZWxldmF0aW9uXCIsXG5cdFx0Z2V0OiAtPiBAX2VsZXZhdGlvblxuXHRcdHNldDogKHZhbHVlKSAtPlxuXHRcdFx0dmFsdWUgPSBVdGlscy5jbGFtcCh2YWx1ZSwgLTkwLCA5MClcblx0XHRcdGlmIHZhbHVlICE9IEBfZWxldmF0aW9uXG5cdFx0XHRcdEBfZWxldmF0aW9uID0gdmFsdWVcblx0XHRcdFx0QGVtaXQoXCJjaGFuZ2U6ZWxldmF0aW9uXCIsIHZhbHVlKVxuXHRcdFx0XHRAZW1pdChcImNoYW5nZTpvcmllbnRhdGlvblwiLCB2YWx1ZSlcblxuXHRAZGVmaW5lIFwiZGlzdGFuY2VcIixcblx0XHRnZXQ6IC0+IEBfZGlzdGFuY2Vcblx0XHRzZXQ6ICh2YWx1ZSkgLT5cblx0XHRcdGlmIHZhbHVlICE9IEBfZGlzdGFuY2Vcblx0XHRcdFx0QF9kaXN0YW5jZSA9IHZhbHVlXG5cdFx0XHRcdEBlbWl0KFwiY2hhbmdlOmRpc3RhbmNlXCIsIHZhbHVlKVxuXHRcdFx0XHRAZW1pdChcImNoYW5nZTpvcmllbnRhdGlvblwiLCB2YWx1ZSlcblxuY2xhc3MgZXhwb3J0cy5WUkNvbXBvbmVudCBleHRlbmRzIExheWVyXG5cblx0Y29uc3RydWN0b3I6IChvcHRpb25zID0ge30pIC0+XG5cdFx0b3B0aW9ucyA9IF8uZGVmYXVsdHMgb3B0aW9ucyxcblx0XHRcdGN1YmVTaWRlOiAzMDAwXG5cdFx0XHRwZXJzcGVjdGl2ZTogMTIwMFxuXHRcdFx0bG9va0F0TGF0ZXN0UHJvamVjdGVkTGF5ZXI6IGZhbHNlXG5cdFx0XHR3aWR0aDogU2NyZWVuLndpZHRoXG5cdFx0XHRoZWlnaHQ6IFNjcmVlbi5oZWlnaHRcblx0XHRcdG9yaWVudGF0aW9uTGF5ZXI6IHRydWVcblx0XHRcdGFycm93S2V5czogdHJ1ZVxuXHRcdHN1cGVyIG9wdGlvbnNcblx0XHRAcGVyc3BlY3RpdmUgPSBvcHRpb25zLnBlcnNwZWN0aXZlXG5cdFx0QGJhY2tncm91bmRDb2xvciA9IG51bGxcblx0XHRAY3JlYXRlQ3ViZShvcHRpb25zLmN1YmVTaWRlKVxuXHRcdEBkZWdUb1JhZCA9IE1hdGguUEkgLyAxODBcblx0XHRAbGF5ZXJzVG9LZWVwTGV2ZWwgPSBbXVxuXHRcdEBsb29rQXRMYXRlc3RQcm9qZWN0ZWRMYXllciA9IG9wdGlvbnMubG9va0F0TGF0ZXN0UHJvamVjdGVkTGF5ZXJcblx0XHRAYXJyb3dLZXlzID0gb3B0aW9ucy5hcnJvd0tleXNcblx0XHRAX2tleXMoKVxuXG5cdFx0QF9oZWFkaW5nID0gMFxuXHRcdEBfZWxldmF0aW9uID0gMFxuXHRcdEBfdGlsdCA9IDBcblxuXHRcdEBfaGVhZGluZ09mZnNldCA9IDBcblx0XHRAX2VsZXZhdGlvbk9mZnNldCA9IDBcblx0XHRAX2RldmljZUhlYWRpbmcgPSAwXG5cdFx0QF9kZXZpY2VFbGV2YXRpb24gPSAwXG5cblx0XHRpZiBvcHRpb25zLmhlYWRpbmdcblx0XHRcdEBoZWFkaW5nID0gb3B0aW9ucy5oZWFkaW5nXG5cdFx0aWYgb3B0aW9ucy5lbGV2YXRpb25cblx0XHRcdEBlbGV2YXRpb24gPSBvcHRpb25zLmVsZXZhdGlvblxuXG5cdFx0QG9yaWVudGF0aW9uTGF5ZXIgPSBvcHRpb25zLm9yaWVudGF0aW9uTGF5ZXJcblxuXHRcdEBkZXNrdG9wUGFuKDAsIDApXG5cblx0XHQjIHRpbHRpbmcgYW5kIHBhbm5pbmdcblx0XHRpZiBVdGlscy5pc01vYmlsZSgpXG5cdFx0XHR3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lciBcImRldmljZW9yaWVudGF0aW9uXCIsIChldmVudCkgPT5cblx0XHRcdFx0QG9yaWVudGF0aW9uRGF0YSA9IGV2ZW50XG5cblx0XHRGcmFtZXIuTG9vcC5vbihcInVwZGF0ZVwiLCBAZGV2aWNlT3JpZW50YXRpb25VcGRhdGUpXG5cblx0XHQjIE1ha2Ugc3VyZSB3ZSByZW1vdmUgdGhlIHVwZGF0ZSBmcm9tIHRoZSBsb29wIHdoZW4gd2UgZGVzdHJveSB0aGUgY29udGV4dFxuXHRcdEZyYW1lci5DdXJyZW50Q29udGV4dC5vbiBcInJlc2V0XCIsIC0+XG5cdFx0XHRGcmFtZXIuTG9vcC5vZmYoXCJ1cGRhdGVcIiwgQGRldmljZU9yaWVudGF0aW9uVXBkYXRlKVxuXG5cdFx0QG9uIFwiY2hhbmdlOmZyYW1lXCIsIC0+XG5cdFx0XHRAZGVza3RvcFBhbigwLDApXG5cblxuXHRfa2V5czogLT5cblx0XHRkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyIFwia2V5ZG93blwiLCAoZXZlbnQpID0+XG5cdFx0XHRpZiBAYXJyb3dLZXlzXG5cdFx0XHRcdHN3aXRjaCBldmVudC53aGljaFxuXHRcdFx0XHRcdHdoZW4gS0VZUy5VcEFycm93XG5cdFx0XHRcdFx0XHRLRVlTRE9XTi51cCA9IHRydWVcblx0XHRcdFx0XHRcdGV2ZW50LnByZXZlbnREZWZhdWx0KClcblx0XHRcdFx0XHR3aGVuIEtFWVMuRG93bkFycm93XG5cdFx0XHRcdFx0XHRLRVlTRE9XTi5kb3duID0gdHJ1ZVxuXHRcdFx0XHRcdFx0ZXZlbnQucHJldmVudERlZmF1bHQoKVxuXHRcdFx0XHRcdHdoZW4gS0VZUy5MZWZ0QXJyb3dcblx0XHRcdFx0XHRcdEtFWVNET1dOLmxlZnQgPSB0cnVlXG5cdFx0XHRcdFx0XHRldmVudC5wcmV2ZW50RGVmYXVsdCgpXG5cdFx0XHRcdFx0d2hlbiBLRVlTLlJpZ2h0QXJyb3dcblx0XHRcdFx0XHRcdEtFWVNET1dOLnJpZ2h0ID0gdHJ1ZVxuXHRcdFx0XHRcdFx0ZXZlbnQucHJldmVudERlZmF1bHQoKVxuXG5cdFx0ZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lciBcImtleXVwXCIsIChldmVudCkgPT5cblx0XHRcdGlmIEBhcnJvd0tleXNcblx0XHRcdFx0c3dpdGNoIGV2ZW50LndoaWNoXG5cdFx0XHRcdFx0d2hlbiBLRVlTLlVwQXJyb3dcblx0XHRcdFx0XHRcdEtFWVNET1dOLnVwID0gZmFsc2Vcblx0XHRcdFx0XHRcdGV2ZW50LnByZXZlbnREZWZhdWx0KClcblx0XHRcdFx0XHR3aGVuIEtFWVMuRG93bkFycm93XG5cdFx0XHRcdFx0XHRLRVlTRE9XTi5kb3duID0gZmFsc2Vcblx0XHRcdFx0XHRcdGV2ZW50LnByZXZlbnREZWZhdWx0KClcblx0XHRcdFx0XHR3aGVuIEtFWVMuTGVmdEFycm93XG5cdFx0XHRcdFx0XHRLRVlTRE9XTi5sZWZ0ID0gZmFsc2Vcblx0XHRcdFx0XHRcdGV2ZW50LnByZXZlbnREZWZhdWx0KClcblx0XHRcdFx0XHR3aGVuIEtFWVMuUmlnaHRBcnJvd1xuXHRcdFx0XHRcdFx0S0VZU0RPV04ucmlnaHQgPSBmYWxzZVxuXHRcdFx0XHRcdFx0ZXZlbnQucHJldmVudERlZmF1bHQoKVxuXG5cdFx0d2luZG93Lm9uYmx1ciA9IC0+XG5cdFx0XHRLRVlTRE9XTi51cCA9IGZhbHNlXG5cdFx0XHRLRVlTRE9XTi5kb3duID0gZmFsc2Vcblx0XHRcdEtFWVNET1dOLmxlZnQgPSBmYWxzZVxuXHRcdFx0S0VZU0RPV04ucmlnaHQgPSBmYWxzZVxuXG5cdEBkZWZpbmUgXCJvcmllbnRhdGlvbkxheWVyXCIsXG5cdFx0Z2V0OiAtPiByZXR1cm4gQGRlc2t0b3BPcmllbnRhdGlvbkxheWVyICE9IG51bGwgJiYgQGRlc2t0b3BPcmllbnRhdGlvbkxheWVyICE9IHVuZGVmaW5lZFxuXHRcdHNldDogKHZhbHVlKSAtPlxuXHRcdFx0aWYgQHdvcmxkICE9IHVuZGVmaW5lZFxuXHRcdFx0XHRpZiBVdGlscy5pc0Rlc2t0b3AoKVxuXHRcdFx0XHRcdGlmIHZhbHVlID09IHRydWVcblx0XHRcdFx0XHRcdEBhZGREZXNrdG9wUGFuTGF5ZXIoKVxuXHRcdFx0XHRcdGVsc2UgaWYgdmFsdWUgPT0gZmFsc2Vcblx0XHRcdFx0XHRcdEByZW1vdmVEZXNrdG9wUGFuTGF5ZXIoKVxuXG5cdEBkZWZpbmUgXCJoZWFkaW5nXCIsXG5cdFx0Z2V0OiAtPlxuXHRcdFx0aGVhZGluZyA9IEBfaGVhZGluZyArIEBfaGVhZGluZ09mZnNldFxuXHRcdFx0aWYgaGVhZGluZyA+IDM2MFxuXHRcdFx0XHRoZWFkaW5nID0gaGVhZGluZyAlIDM2MFxuXHRcdFx0ZWxzZSBpZiBoZWFkaW5nIDwgMFxuXHRcdFx0XHRyZXN0ID0gTWF0aC5hYnMoaGVhZGluZykgJSAzNjBcblx0XHRcdFx0aGVhZGluZyA9IDM2MCAtIHJlc3Rcblx0XHRcdHJldHVybiBoZWFkaW5nXG5cdFx0c2V0OiAodmFsdWUpIC0+XG5cdFx0XHRAbG9va0F0KHZhbHVlLCBAX2VsZXZhdGlvbilcblxuXHRAZGVmaW5lIFwiZWxldmF0aW9uXCIsXG5cdFx0Z2V0OiAtPiBAX2VsZXZhdGlvblxuXHRcdHNldDogKHZhbHVlKSAtPiBAbG9va0F0KEBfaGVhZGluZywgdmFsdWUpXG5cblx0QGRlZmluZSBcInRpbHRcIixcblx0XHRnZXQ6IC0+IEBfdGlsdFxuXHRcdHNldDogKHZhbHVlKSAtPiB0aHJvdyBcIlRpbHQgaXMgcmVhZG9ubHlcIlxuXG5cdFNJREVTLm1hcCAoZmFjZSkgPT5cblx0XHRAZGVmaW5lIGZhY2UsXG5cdFx0XHRnZXQ6IC0+IEBsYXllckZyb21GYWNlKGZhY2UpICMgQGdldEltYWdlKGZhY2UpXG5cdFx0XHRzZXQ6ICh2YWx1ZSkgLT4gQHNldEltYWdlKGZhY2UsIHZhbHVlKVxuXG5cdGNyZWF0ZUN1YmU6IChjdWJlU2lkZSA9IEBjdWJlU2lkZSkgPT5cblx0XHRAY3ViZVNpZGUgPSBjdWJlU2lkZVxuXG5cdFx0QHdvcmxkPy5kZXN0cm95KClcblx0XHRAd29ybGQgPSBuZXcgTGF5ZXJcblx0XHRcdG5hbWU6IFwid29ybGRcIlxuXHRcdFx0c3VwZXJMYXllcjogQFxuXHRcdFx0d2lkdGg6IGN1YmVTaWRlLCBoZWlnaHQ6IGN1YmVTaWRlXG5cdFx0XHRiYWNrZ3JvdW5kQ29sb3I6IG51bGxcblx0XHRcdGNsaXA6IGZhbHNlXG5cdFx0QHdvcmxkLnN0eWxlLndlYmtpdFRyYW5zZm9ybVN0eWxlID0gXCJwcmVzZXJ2ZS0zZFwiXG5cdFx0QHdvcmxkLmNlbnRlcigpXG5cblx0XHRoYWxmQ3ViU2lkZSA9IEBjdWJlU2lkZS8yXG5cblx0XHRAc2lkZTAgPSBuZXcgTGF5ZXJcblx0XHRAc2lkZTAuc3R5bGVbXCJ3ZWJraXRUcmFuc2Zvcm1cIl0gPSBcInJvdGF0ZVgoLTkwZGVnKSB0cmFuc2xhdGVaKC0je2hhbGZDdWJTaWRlfXB4KVwiXG5cdFx0QHNpZGUxID0gbmV3IExheWVyXG5cdFx0QHNpZGUxLnN0eWxlW1wid2Via2l0VHJhbnNmb3JtXCJdID0gXCJyb3RhdGVZKC05MGRlZykgdHJhbnNsYXRlWigtI3toYWxmQ3ViU2lkZX1weCkgcm90YXRlWig5MGRlZylcIlxuXHRcdEBzaWRlMiA9IG5ldyBMYXllclxuXHRcdEBzaWRlMi5zdHlsZVtcIndlYmtpdFRyYW5zZm9ybVwiXSA9IFwicm90YXRlWCg5MGRlZykgdHJhbnNsYXRlWigtI3toYWxmQ3ViU2lkZX1weCkgcm90YXRlWigxODBkZWcpXCJcblx0XHRAc2lkZTMgPSBuZXcgTGF5ZXJcblx0XHRAc2lkZTMuc3R5bGVbXCJ3ZWJraXRUcmFuc2Zvcm1cIl0gPSBcInJvdGF0ZVkoOTBkZWcpIHRyYW5zbGF0ZVooLSN7aGFsZkN1YlNpZGV9cHgpIHJvdGF0ZVooLTkwZGVnKVwiXG5cdFx0QHNpZGU0ID0gbmV3IExheWVyXG5cdFx0QHNpZGU0LnN0eWxlW1wid2Via2l0VHJhbnNmb3JtXCJdID0gXCJyb3RhdGVZKC0xODBkZWcpIHRyYW5zbGF0ZVooLSN7aGFsZkN1YlNpZGV9cHgpIHJvdGF0ZVooMTgwZGVnKVwiXG5cdFx0QHNpZGU1ID0gbmV3IExheWVyXG5cdFx0QHNpZGU1LnN0eWxlW1wid2Via2l0VHJhbnNmb3JtXCJdID0gXCJ0cmFuc2xhdGVaKC0je2hhbGZDdWJTaWRlfXB4KVwiXG5cblx0XHRAc2lkZXMgPSBbQHNpZGUwLCBAc2lkZTEsIEBzaWRlMiwgQHNpZGUzLCBAc2lkZTQsIEBzaWRlNV1cblx0XHRjb2xvcnMgPSBbXCIjODY2Y2NjXCIsIFwiIzI4YWZmYVwiLCBcIiMyZGQ3YWFcIiwgXCIjZmZjMjJjXCIsIFwiIzdkZGQxMVwiLCBcIiNmOTVmYWFcIl1cblx0XHRzaWRlTmFtZXMgPSBbXCJmcm9udFwiLCBcInJpZ2h0XCIsIFwiYmFja1wiLCBcImxlZnRcIiwgXCJ0b3BcIiwgXCJib3R0b21cIl1cblxuXHRcdGluZGV4ID0gMFxuXHRcdGZvciBzaWRlIGluIEBzaWRlc1xuXHRcdFx0c2lkZS5uYW1lID0gc2lkZU5hbWVzW2luZGV4XVxuXHRcdFx0c2lkZS53aWR0aCA9IHNpZGUuaGVpZ2h0ID0gY3ViZVNpZGVcblx0XHRcdHNpZGUuc3VwZXJMYXllciA9IEB3b3JsZFxuXHRcdFx0c2lkZS5odG1sID0gc2lkZU5hbWVzW2luZGV4XVxuXHRcdFx0c2lkZS5jb2xvciA9IFwid2hpdGVcIlxuXHRcdFx0c2lkZS5fYmFja2dyb3VuZENvbG9yID0gY29sb3JzW2luZGV4XVxuXHRcdFx0c2lkZS5iYWNrZ3JvdW5kQ29sb3IgPSBjb2xvcnNbaW5kZXhdXG5cdFx0XHRzaWRlLnN0eWxlID1cblx0XHRcdFx0bGluZUhlaWdodDogXCIje2N1YmVTaWRlfXB4XCJcblx0XHRcdFx0dGV4dEFsaWduOiBcImNlbnRlclwiXG5cdFx0XHRcdGZvbnRTaXplOiBcIiN7Y3ViZVNpZGUgLyAxMH1weFwiXG5cdFx0XHRcdGZvbnRXZWlnaHQ6IFwiMTAwXCJcblx0XHRcdFx0Zm9udEZhbWlseTogXCJIZWx2ZXRpY2EgTmV1ZVwiXG5cdFx0XHRpbmRleCsrXG5cblx0XHRpZiBAc2lkZUltYWdlc1xuXHRcdFx0Zm9yIGtleSBvZiBAc2lkZUltYWdlc1xuXHRcdFx0XHRAc2V0SW1hZ2Uga2V5LCBAc2lkZUltYWdlc1trZXldXG5cblx0aGlkZUVudmlyb21lbnQ6IC0+XG5cdFx0Zm9yIHNpZGUgaW4gQHNpZGVzXG5cdFx0XHRzaWRlLmRlc3Ryb3koKVxuXG5cdGxheWVyRnJvbUZhY2U6IChmYWNlKSAtPlxuXHRcdG1hcCA9XG5cdFx0XHRub3J0aDogQHNpZGUwXG5cdFx0XHRmcm9udDogQHNpZGUwXG5cdFx0XHRlYXN0OiAgQHNpZGUxXG5cdFx0XHRyaWdodDogQHNpZGUxXG5cdFx0XHRzb3V0aDogQHNpZGUyXG5cdFx0XHRiYWNrOiAgQHNpZGUyXG5cdFx0XHR3ZXN0OiAgQHNpZGUzXG5cdFx0XHRsZWZ0OiAgQHNpZGUzXG5cdFx0XHR0b3A6ICAgQHNpZGU0XG5cdFx0XHRib3R0b206QHNpZGU1XG5cdFx0cmV0dXJuIG1hcFtmYWNlXVxuXG5cdHNldEltYWdlOiAoZmFjZSwgaW1hZ2VQYXRoKSAtPlxuXHRcdFxuXHRcdGlmIG5vdCBmYWNlIGluIFNJREVTXG5cdFx0XHR0aHJvdyBFcnJvciBcIlZSQ29tcG9uZW50IHNldEltYWdlLCB3cm9uZyBuYW1lIGZvciBmYWNlOiBcIiArIGZhY2UgKyBcIiwgdmFsaWQgb3B0aW9uczogZnJvbnQsIHJpZ2h0LCBiYWNrLCBsZWZ0LCB0b3AsIGJvdHRvbSwgbm9ydGgsIGVhc3QsIHNvdXRoLCB3ZXN0XCJcblxuXHRcdGlmIG5vdCBAc2lkZUltYWdlc1xuXHRcdFx0QHNpZGVJbWFnZXMgPSB7fVxuXHRcdEBzaWRlSW1hZ2VzW2ZhY2VdID0gaW1hZ2VQYXRoXG5cblx0XHRsYXllciA9IEBsYXllckZyb21GYWNlKGZhY2UpXG5cdFx0XG5cdFx0aWYgaW1hZ2VQYXRoXG5cdFx0XHRsYXllcj8uaHRtbCA9IFwiXCJcblx0XHRcdGxheWVyPy5pbWFnZSA9IGltYWdlUGF0aFxuXHRcdGVsc2Vcblx0XHRcdGxheWVyPy5odG1sID0gbGF5ZXI/Lm5hbWVcblx0XHRcdGxheWVyPy5iYWNrZ3JvdW5kQ29sb3IgPSBsYXllcj8uX2JhY2tncm91bmRDb2xvclxuXG5cdGdldEltYWdlOiAoZmFjZSkgLT5cblxuXHRcdGlmIG5vdCBmYWNlIGluIFNJREVTXG5cdFx0XHR0aHJvdyBFcnJvciBcIlZSQ29tcG9uZW50IGdldEltYWdlLCB3cm9uZyBuYW1lIGZvciBmYWNlOiBcIiArIGZhY2UgKyBcIiwgdmFsaWQgb3B0aW9uczogZnJvbnQsIHJpZ2h0LCBiYWNrLCBsZWZ0LCB0b3AsIGJvdHRvbSwgbm9ydGgsIGVhc3QsIHNvdXRoLCB3ZXN0XCJcblxuXHRcdGxheWVyID0gQGxheWVyRnJvbUZhY2UoZmFjZSlcblx0XHRpZiBsYXllclxuXHRcdFx0bGF5ZXIuaW1hZ2VcblxuXHRwcm9qZWN0TGF5ZXI6IChpbnNlcnRMYXllcikgLT5cblxuXHRcdGhlYWRpbmcgPSBpbnNlcnRMYXllci5oZWFkaW5nXG5cdFx0aWYgaGVhZGluZyA9PSB1bmRlZmluZWRcblx0XHRcdGhlYWRpbmcgPSAwXG5cdFx0ZWxldmF0aW9uID0gaW5zZXJ0TGF5ZXIuZWxldmF0aW9uXG5cdFx0aWYgZWxldmF0aW9uID09IHVuZGVmaW5lZFxuXHRcdFx0ZWxldmF0aW9uID0gMFxuXG5cdFx0aWYgaGVhZGluZyA+PSAzNjBcblx0XHRcdGhlYWRpbmcgPSB2YWx1ZSAlIDM2MFxuXHRcdGVsc2UgaWYgaGVhZGluZyA8IDBcblx0XHRcdHJlc3QgPSBNYXRoLmFicyhoZWFkaW5nKSAlIDM2MFxuXHRcdFx0aGVhZGluZyA9IDM2MCAtIHJlc3RcblxuXHRcdGVsZXZhdGlvbiA9IFV0aWxzLmNsYW1wKGVsZXZhdGlvbiwgLTkwLCA5MClcblxuXHRcdGRpc3RhbmNlID0gaW5zZXJ0TGF5ZXIuZGlzdGFuY2Vcblx0XHRpZiBkaXN0YW5jZSA9PSB1bmRlZmluZWRcblx0XHRcdGRpc3RhbmNlID0gMTIwMFxuXG5cdFx0aW5zZXJ0TGF5ZXIuaGVhZGluZyA9IGhlYWRpbmdcblx0XHRpbnNlcnRMYXllci5lbGV2YXRpb24gPSBlbGV2YXRpb25cblx0XHRpbnNlcnRMYXllci5kaXN0YW5jZSA9IGRpc3RhbmNlXG5cblx0XHRhbmNob3IgPSBuZXcgVlJBbmNob3JMYXllcihpbnNlcnRMYXllciwgQGN1YmVTaWRlKVxuXHRcdGFuY2hvci5zdXBlckxheWVyID0gQHdvcmxkXG5cblx0XHRpZiBAbG9va0F0TGF0ZXN0UHJvamVjdGVkTGF5ZXJcblx0XHRcdEBsb29rQXQoaGVhZGluZywgZWxldmF0aW9uKVxuXG5cdCMgTW9iaWxlIGRldmljZSBvcmllbnRhdGlvblxuXG5cdGRldmljZU9yaWVudGF0aW9uVXBkYXRlOiA9PlxuXG5cdFx0aWYgVXRpbHMuaXNEZXNrdG9wKClcblx0XHRcdGlmIEBhcnJvd0tleXNcblx0XHRcdFx0aWYgQF9sYXN0Q2FsbEhvcml6b250YWwgPT0gdW5kZWZpbmVkXG5cdFx0XHRcdFx0QF9sYXN0Q2FsbEhvcml6b250YWwgPSAwXG5cdFx0XHRcdFx0QF9sYXN0Q2FsbFZlcnRpY2FsID0gMFxuXHRcdFx0XHRcdEBfYWNjZWxlcmF0aW9uSG9yaXpvbnRhbCA9IDFcblx0XHRcdFx0XHRAX2FjY2VsZXJhdGlvblZlcnRpY2FsID0gMVxuXHRcdFx0XHRcdEBfZ29pbmdVcCA9IGZhbHNlXG5cdFx0XHRcdFx0QF9nb2luZ0xlZnQgPSBmYWxzZVxuXG5cdFx0XHRcdGRhdGUgPSBuZXcgRGF0ZSgpXG5cdFx0XHRcdHggPSAuMVxuXHRcdFx0XHRpZiBLRVlTRE9XTi51cCB8fCBLRVlTRE9XTi5kb3duXG5cdFx0XHRcdFx0ZGlmZiA9IGRhdGUgLSBAX2xhc3RDYWxsVmVydGljYWxcblx0XHRcdFx0XHRpZiBkaWZmIDwgMzBcblx0XHRcdFx0XHRcdGlmIEBfYWNjZWxlcmF0aW9uVmVydGljYWwgPCAzMFxuXHRcdFx0XHRcdFx0XHRAX2FjY2VsZXJhdGlvblZlcnRpY2FsICs9IDAuMThcblx0XHRcdFx0XHRpZiBLRVlTRE9XTi51cFxuXHRcdFx0XHRcdFx0aWYgQF9nb2luZ1VwID09IGZhbHNlXG5cdFx0XHRcdFx0XHRcdEBfYWNjZWxlcmF0aW9uVmVydGljYWwgPSAxXG5cdFx0XHRcdFx0XHRcdEBfZ29pbmdVcCA9IHRydWVcblx0XHRcdFx0XHRcdEBkZXNrdG9wUGFuKDAsIDEgKiBAX2FjY2VsZXJhdGlvblZlcnRpY2FsICogeClcblx0XHRcdFx0XHRlbHNlXG5cdFx0XHRcdFx0XHRpZiBAX2dvaW5nVXAgPT0gdHJ1ZVxuXHRcdFx0XHRcdFx0XHRAX2FjY2VsZXJhdGlvblZlcnRpY2FsID0gMVxuXHRcdFx0XHRcdFx0XHRAX2dvaW5nVXAgPSBmYWxzZVxuXHRcdFx0XHRcdFx0XG5cdFx0XHRcdFx0XHRAZGVza3RvcFBhbigwLCAtMSAqIEBfYWNjZWxlcmF0aW9uVmVydGljYWwgKiB4KVxuXHRcdFx0XHRcdEBfbGFzdENhbGxWZXJ0aWNhbCA9IGRhdGVcblxuXHRcdFx0XHRlbHNlXG5cdFx0XHRcdFx0QF9hY2NlbGVyYXRpb25WZXJ0aWNhbCA9IDFcblxuXHRcdFx0XHRpZiBLRVlTRE9XTi5sZWZ0IHx8IEtFWVNET1dOLnJpZ2h0XG5cdFx0XHRcdFx0ZGlmZiA9IGRhdGUgLSBAX2xhc3RDYWxsSG9yaXpvbnRhbFxuXHRcdFx0XHRcdGlmIGRpZmYgPCAzMFxuXHRcdFx0XHRcdFx0aWYgQF9hY2NlbGVyYXRpb25Ib3Jpem9udGFsIDwgMjVcblx0XHRcdFx0XHRcdFx0QF9hY2NlbGVyYXRpb25Ib3Jpem9udGFsICs9IDAuMThcblx0XHRcdFx0XHRpZiBLRVlTRE9XTi5sZWZ0XG5cdFx0XHRcdFx0XHRpZiBAX2dvaW5nTGVmdCA9PSBmYWxzZVxuXHRcdFx0XHRcdFx0XHRAX2FjY2VsZXJhdGlvbkhvcml6b250YWwgPSAxXG5cdFx0XHRcdFx0XHRcdEBfZ29pbmdMZWZ0ID0gdHJ1ZVxuXHRcdFx0XHRcdFx0QGRlc2t0b3BQYW4oMSAqIEBfYWNjZWxlcmF0aW9uSG9yaXpvbnRhbCAqIHgsIDApXG5cdFx0XHRcdFx0ZWxzZVxuXHRcdFx0XHRcdFx0aWYgQF9nb2luZ0xlZnQgPT0gdHJ1ZVxuXHRcdFx0XHRcdFx0XHRAX2FjY2VsZXJhdGlvbkhvcml6b250YWwgPSAxXG5cdFx0XHRcdFx0XHRcdEBfZ29pbmdMZWZ0ID0gZmFsc2Vcblx0XHRcdFx0XHRcdEBkZXNrdG9wUGFuKC0xICogQF9hY2NlbGVyYXRpb25Ib3Jpem9udGFsICogeCwgMClcblx0XHRcdFx0XHRAX2xhc3RDYWxsSG9yaXpvbnRhbCA9IGRhdGVcblx0XHRcdFx0ZWxzZVxuXHRcdFx0XHRcdEBfYWNjZWxlcmF0aW9uSG9yaXpvbnRhbCA9IDFcblxuXHRcdGVsc2UgaWYgQG9yaWVudGF0aW9uRGF0YVxuXG5cdFx0XHRhbHBoYSA9IEBvcmllbnRhdGlvbkRhdGEuYWxwaGFcblx0XHRcdGJldGEgPSBAb3JpZW50YXRpb25EYXRhLmJldGFcblx0XHRcdGdhbW1hID0gQG9yaWVudGF0aW9uRGF0YS5nYW1tYVxuXG5cdFx0XHRpZiBhbHBoYSAhPSAwICYmIGJldGEgIT0gMCAmJiBnYW1tYSAhPSAwXG5cdFx0XHRcdEBkaXJlY3Rpb25QYXJhbXMoYWxwaGEsIGJldGEsIGdhbW1hKVxuXG5cdFx0XHR4QW5nbGUgPSBiZXRhXG5cdFx0XHR5QW5nbGUgPSAtZ2FtbWFcblx0XHRcdHpBbmdsZSA9IGFscGhhXG5cblx0XHRcdGhhbGZDdWJTaWRlID0gQGN1YmVTaWRlLzJcblx0XHRcdG9yaWVudGF0aW9uID0gXCJyb3RhdGUoI3t3aW5kb3cub3JpZW50YXRpb24gKiAtMX1kZWcpIFwiXG5cdFx0XHR0cmFuc2xhdGlvblggPSBcInRyYW5zbGF0ZVgoI3soQHdpZHRoIC8gMikgLSBoYWxmQ3ViU2lkZX1weClcIlxuXHRcdFx0dHJhbnNsYXRpb25ZID0gXCIgdHJhbnNsYXRlWSgjeyhAaGVpZ2h0IC8gMikgLSBoYWxmQ3ViU2lkZX1weClcIlxuXHRcdFx0dHJhbnNsYXRpb25aID0gXCIgdHJhbnNsYXRlWigje0BwZXJzcGVjdGl2ZX1weClcIlxuXHRcdFx0cm90YXRpb24gPSB0cmFuc2xhdGlvblogKyB0cmFuc2xhdGlvblggKyB0cmFuc2xhdGlvblkgKyBvcmllbnRhdGlvbiArIFwiIHJvdGF0ZVkoI3t5QW5nbGV9ZGVnKSByb3RhdGVYKCN7eEFuZ2xlfWRlZykgcm90YXRlWigje3pBbmdsZX1kZWcpXCIgKyBcIiByb3RhdGVaKCN7LUBfaGVhZGluZ09mZnNldH1kZWcpXCJcblx0XHRcdEB3b3JsZC5zdHlsZVtcIndlYmtpdFRyYW5zZm9ybVwiXSA9IHJvdGF0aW9uXG5cblx0ZGlyZWN0aW9uUGFyYW1zOiAoYWxwaGEsIGJldGEsIGdhbW1hKSAtPlxuXG5cdFx0YWxwaGFSYWQgPSBhbHBoYSAqIEBkZWdUb1JhZFxuXHRcdGJldGFSYWQgPSBiZXRhICogQGRlZ1RvUmFkXG5cdFx0Z2FtbWFSYWQgPSBnYW1tYSAqIEBkZWdUb1JhZFxuXG5cdFx0IyBDYWxjdWxhdGUgZXF1YXRpb24gY29tcG9uZW50c1xuXHRcdGNBID0gTWF0aC5jb3MoYWxwaGFSYWQpXG5cdFx0c0EgPSBNYXRoLnNpbihhbHBoYVJhZClcblx0XHRjQiA9IE1hdGguY29zKGJldGFSYWQpXG5cdFx0c0IgPSBNYXRoLnNpbihiZXRhUmFkKVxuXHRcdGNHID0gTWF0aC5jb3MoZ2FtbWFSYWQpXG5cdFx0c0cgPSBNYXRoLnNpbihnYW1tYVJhZClcblxuXHRcdCMgeCB1bml0dmVjdG9yXG5cdFx0eHJBID0gLXNBICogc0IgKiBzRyArIGNBICogY0dcblx0XHR4ckIgPSBjQSAqIHNCICogc0cgKyBzQSAqIGNHXG5cdFx0eHJDID0gY0IgKiBzR1xuXG5cdFx0IyB5IHVuaXR2ZWN0b3Jcblx0XHR5ckEgPSAtc0EgKiBjQlxuXHRcdHlyQiA9IGNBICogY0Jcblx0XHR5ckMgPSAtc0JcblxuXHRcdCMgLXogdW5pdHZlY3RvclxuXHRcdHpyQSA9IC1zQSAqIHNCICogY0cgLSBjQSAqIHNHXG5cdFx0enJCID0gY0EgKiBzQiAqIGNHIC0gc0EgKiBzR1xuXHRcdHpyQyA9IGNCICogY0dcblxuXHRcdCMgQ2FsY3VsYXRlIGhlYWRpbmdcblx0XHRoZWFkaW5nID0gTWF0aC5hdGFuKHpyQSAvIHpyQilcblxuXHRcdCMgQ29udmVydCBmcm9tIGhhbGYgdW5pdCBjaXJjbGUgdG8gd2hvbGUgdW5pdCBjaXJjbGVcblx0XHRpZiB6ckIgPCAwXG5cdFx0XHRoZWFkaW5nICs9IE1hdGguUElcblx0XHRlbHNlIGlmIHpyQSA8IDBcblx0XHRcdGhlYWRpbmcgKz0gMiAqIE1hdGguUElcblxuXHRcdCMgIyBDYWxjdWxhdGUgQWx0aXR1ZGUgKGluIGRlZ3JlZXMpXG5cdFx0ZWxldmF0aW9uID0gTWF0aC5QSSAvIDIgLSBNYXRoLmFjb3MoLXpyQylcblxuXHRcdGNIID0gTWF0aC5zcXJ0KDEgLSAoenJDICogenJDKSlcblx0XHR0aWx0ID0gTWF0aC5hY29zKC14ckMgLyBjSCkgKiBNYXRoLnNpZ24oeXJDKVxuXG5cdFx0IyBDb252ZXJ0IHJhZGlhbnMgdG8gZGVncmVlc1xuXHRcdGhlYWRpbmcgKj0gMTgwIC8gTWF0aC5QSVxuXHRcdGVsZXZhdGlvbiAqPSAxODAgLyBNYXRoLlBJXG5cdFx0dGlsdCAqPSAxODAgLyBNYXRoLlBJXG5cblx0XHRAX2hlYWRpbmcgPSBNYXRoLnJvdW5kKGhlYWRpbmcgKiAxMDAwKSAvIDEwMDBcblx0XHRAX2VsZXZhdGlvbiA9IE1hdGgucm91bmQoZWxldmF0aW9uICogMTAwMCkgLyAxMDAwXG5cblx0XHR0aWx0ID0gTWF0aC5yb3VuZCh0aWx0ICogMTAwMCkgLyAxMDAwXG5cdFx0b3JpZW50YXRpb25UaWx0T2Zmc2V0ID0gKHdpbmRvdy5vcmllbnRhdGlvbiAqIC0xKSArIDkwXG5cdFx0dGlsdCArPSBvcmllbnRhdGlvblRpbHRPZmZzZXRcblx0XHRpZiB0aWx0ID4gMTgwXG5cdFx0XHRkaWZmID0gdGlsdCAtIDE4MFxuXHRcdFx0dGlsdCA9IC0xODAgKyBkaWZmXG5cdFx0QF90aWx0ID0gdGlsdFxuXG5cdFx0QF9kZXZpY2VIZWFkaW5nID0gQF9oZWFkaW5nXG5cdFx0QF9kZXZpY2VFbGV2YXRpb24gPSBAX2VsZXZhdGlvblxuXG5cdFx0QF9lbWl0T3JpZW50YXRpb25EaWRDaGFuZ2VFdmVudCgpXG5cblx0IyBEZXNrdG9wIHRpbHRcblxuXHRyZW1vdmVEZXNrdG9wUGFuTGF5ZXI6ID0+XG5cdFx0QGRlc2t0b3BPcmllbnRhdGlvbkxheWVyPy5kZXN0cm95KClcblxuXHRhZGREZXNrdG9wUGFuTGF5ZXI6ID0+XG5cdFx0QGRlc2t0b3BPcmllbnRhdGlvbkxheWVyPy5kZXN0cm95KClcblx0XHRAZGVza3RvcE9yaWVudGF0aW9uTGF5ZXIgPSBuZXcgTGF5ZXJcblx0XHRcdHdpZHRoOiAxMDAwMDAsIGhlaWdodDogMTAwMDBcblx0XHRcdGJhY2tncm91bmRDb2xvcjogbnVsbFxuXHRcdFx0c3VwZXJMYXllcjpAXG5cdFx0XHRuYW1lOiBcImRlc2t0b3BPcmllbnRhdGlvbkxheWVyXCJcblx0XHRAZGVza3RvcE9yaWVudGF0aW9uTGF5ZXIuY2VudGVyKClcblx0XHRAZGVza3RvcE9yaWVudGF0aW9uTGF5ZXIuZHJhZ2dhYmxlLmVuYWJsZWQgPSB0cnVlXG5cdFx0XG5cdFx0QHByZXZEZXNrdG9wRGlyID0gQGRlc2t0b3BPcmllbnRhdGlvbkxheWVyLnhcblx0XHRAcHJldkRlc2t0b3BIZWlnaHQgPSBAZGVza3RvcE9yaWVudGF0aW9uTGF5ZXIueVxuXHRcdFxuXHRcdEBkZXNrdG9wT3JpZW50YXRpb25MYXllci5vbiBFdmVudHMuRHJhZ1N0YXJ0LCA9PlxuXHRcdFx0QHByZXZEZXNrdG9wRGlyID0gQGRlc2t0b3BPcmllbnRhdGlvbkxheWVyLnhcblx0XHRcdEBwcmV2RGVza3RvcEhlaWdodCA9IEBkZXNrdG9wT3JpZW50YXRpb25MYXllci55XG5cdFx0XHRAZGVza3RvcERyYWdnYWJsZUFjdGl2ZSA9IHRydWVcblx0XHRcdFxuXHRcdEBkZXNrdG9wT3JpZW50YXRpb25MYXllci5vbiBFdmVudHMuTW92ZSwgPT5cblx0XHRcdGlmIEBkZXNrdG9wRHJhZ2dhYmxlQWN0aXZlXG5cdFx0XHRcdHN0cmVuZ3RoID0gVXRpbHMubW9kdWxhdGUoQHBlcnNwZWN0aXZlLCBbMTIwMCwgOTAwXSwgWzIyLCAxNy41XSlcblx0XHRcdFx0ZGVsdGFEaXIgPSAoQGRlc2t0b3BPcmllbnRhdGlvbkxheWVyLnggLSBAcHJldkRlc2t0b3BEaXIpIC8gc3RyZW5ndGhcblx0XHRcdFx0ZGVsdGFIZWlnaHQgPSAoQGRlc2t0b3BPcmllbnRhdGlvbkxheWVyLnkgLSBAcHJldkRlc2t0b3BIZWlnaHQpIC8gc3RyZW5ndGhcblx0XHRcdFx0QGRlc2t0b3BQYW4oZGVsdGFEaXIsIGRlbHRhSGVpZ2h0KVxuXHRcdFx0XHRAcHJldkRlc2t0b3BEaXIgPSBAZGVza3RvcE9yaWVudGF0aW9uTGF5ZXIueFxuXHRcdFx0XHRAcHJldkRlc2t0b3BIZWlnaHQgPSBAZGVza3RvcE9yaWVudGF0aW9uTGF5ZXIueVxuXHRcdFxuXHRcdEBkZXNrdG9wT3JpZW50YXRpb25MYXllci5vbiBFdmVudHMuQW5pbWF0aW9uRW5kLCA9PlxuXHRcdFx0QGRlc2t0b3BEcmFnZ2FibGVBY3RpdmUgPSBmYWxzZVxuXHRcdFx0QGRlc2t0b3BPcmllbnRhdGlvbkxheWVyPy5jZW50ZXIoKVxuXG5cdGRlc2t0b3BQYW46IChkZWx0YURpciwgZGVsdGFIZWlnaHQpIC0+XG5cdFx0aGFsZkN1YlNpZGUgPSBAY3ViZVNpZGUvMlxuXHRcdHRyYW5zbGF0aW9uWCA9IFwidHJhbnNsYXRlWCgjeyhAd2lkdGggLyAyKSAtIGhhbGZDdWJTaWRlfXB4KVwiXG5cdFx0dHJhbnNsYXRpb25ZID0gXCIgdHJhbnNsYXRlWSgjeyhAaGVpZ2h0IC8gMikgLSBoYWxmQ3ViU2lkZX1weClcIlxuXHRcdHRyYW5zbGF0aW9uWiA9IFwiIHRyYW5zbGF0ZVooI3tAcGVyc3BlY3RpdmV9cHgpXCJcblx0XHRAX2hlYWRpbmcgLT0gZGVsdGFEaXJcblxuXHRcdGlmIEBfaGVhZGluZyA+IDM2MFxuXHRcdFx0QF9oZWFkaW5nIC09IDM2MFxuXHRcdGVsc2UgaWYgQF9oZWFkaW5nIDwgMFxuXHRcdFx0QF9oZWFkaW5nICs9IDM2MFxuXG5cdFx0QF9lbGV2YXRpb24gKz0gZGVsdGFIZWlnaHRcblx0XHRAX2VsZXZhdGlvbiA9IFV0aWxzLmNsYW1wKEBfZWxldmF0aW9uLCAtOTAsIDkwKVxuXG5cdFx0cm90YXRpb24gPSB0cmFuc2xhdGlvblogKyB0cmFuc2xhdGlvblggKyB0cmFuc2xhdGlvblkgKyBcIiByb3RhdGVYKCN7QF9lbGV2YXRpb24gKyA5MH1kZWcpIHJvdGF0ZVooI3szNjAgLSBAX2hlYWRpbmd9ZGVnKVwiICsgXCIgcm90YXRlWigjey1AX2hlYWRpbmdPZmZzZXR9ZGVnKVwiXG5cdFx0QHdvcmxkLnN0eWxlW1wid2Via2l0VHJhbnNmb3JtXCJdID0gcm90YXRpb25cblxuXHRcdEBfaGVhZGluZyA9IE1hdGgucm91bmQoQF9oZWFkaW5nICogMTAwMCkgLyAxMDAwXG5cdFx0QF90aWx0ID0gMFxuXHRcdEBfZW1pdE9yaWVudGF0aW9uRGlkQ2hhbmdlRXZlbnQoKVxuXG5cdGxvb2tBdDogKGhlYWRpbmcsIGVsZXZhdGlvbikgLT5cblx0XHRoYWxmQ3ViU2lkZSA9IEBjdWJlU2lkZS8yXG5cdFx0dHJhbnNsYXRpb25YID0gXCJ0cmFuc2xhdGVYKCN7KEB3aWR0aCAvIDIpIC0gaGFsZkN1YlNpZGV9cHgpXCJcblx0XHR0cmFuc2xhdGlvblkgPSBcIiB0cmFuc2xhdGVZKCN7KEBoZWlnaHQgLyAyKSAtIGhhbGZDdWJTaWRlfXB4KVwiXG5cdFx0dHJhbnNsYXRpb25aID0gXCIgdHJhbnNsYXRlWigje0BwZXJzcGVjdGl2ZX1weClcIlxuXHRcdHJvdGF0aW9uID0gdHJhbnNsYXRpb25aICsgdHJhbnNsYXRpb25YICsgdHJhbnNsYXRpb25ZICsgXCIgcm90YXRlWigje0BfdGlsdH1kZWcpIHJvdGF0ZVgoI3tlbGV2YXRpb24gKyA5MH1kZWcpIHJvdGF0ZVooI3staGVhZGluZ31kZWcpXCJcblxuXHRcdEB3b3JsZD8uc3R5bGVbXCJ3ZWJraXRUcmFuc2Zvcm1cIl0gPSByb3RhdGlvblxuXHRcdEBfaGVhZGluZyA9IGhlYWRpbmdcblx0XHRAX2VsZXZhdGlvbiA9IGVsZXZhdGlvblxuXHRcdGlmIFV0aWxzLmlzTW9iaWxlKClcblx0XHRcdEBfaGVhZGluZ09mZnNldCA9IEBfaGVhZGluZyAtIEBfZGV2aWNlSGVhZGluZ1xuXG5cdFx0QF9lbGV2YXRpb25PZmZzZXQgPSBAX2VsZXZhdGlvbiAtIEBfZGV2aWNlRWxldmF0aW9uXG5cblx0XHRoZWFkaW5nID0gQF9oZWFkaW5nXG5cdFx0aWYgaGVhZGluZyA8IDBcblx0XHRcdGhlYWRpbmcgKz0gMzYwXG5cdFx0ZWxzZSBpZiBoZWFkaW5nID4gMzYwXG5cdFx0XHRoZWFkaW5nIC09IDM2MFxuXG5cdFx0QGVtaXQoRXZlbnRzLk9yaWVudGF0aW9uRGlkQ2hhbmdlLCB7aGVhZGluZzogaGVhZGluZywgZWxldmF0aW9uOiBAX2VsZXZhdGlvbiwgdGlsdDogQF90aWx0fSlcblxuXHRfZW1pdE9yaWVudGF0aW9uRGlkQ2hhbmdlRXZlbnQ6IC0+XG5cdFx0QGVtaXQoRXZlbnRzLk9yaWVudGF0aW9uRGlkQ2hhbmdlLCB7aGVhZGluZzogQGhlYWRpbmcsIGVsZXZhdGlvbjogQF9lbGV2YXRpb24sIHRpbHQ6IEBfdGlsdH0pXG4iLCIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltv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
