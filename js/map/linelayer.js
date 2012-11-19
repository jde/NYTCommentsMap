// Generated by CoffeeScript 1.3.3
(function() {
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  define(["lib/leaflet", "./coordinate", "lib/jsbezier"], function(L, Coordinate, jsBezier) {
    var LineLayer;
    return LineLayer = (function() {

      LineLayer.prototype.lineWidth = 2;

      function LineLayer(fromLatlng, toLatLng) {
        this.fromLatlng = fromLatlng;
        this.toLatLng = toLatLng;
        this.doDraw = __bind(this.doDraw, this);

        this.calculatePoints = __bind(this.calculatePoints, this);

        this.drawLine = __bind(this.drawLine, this);

        this.calculateDimensions = __bind(this.calculateDimensions, this);

        this.onReset = __bind(this.onReset, this);

      }

      LineLayer.prototype.onAdd = function(map) {
        this.map = map;
        this._el = $('<canvas/>');
        console.log(this._el[0]);
        this.canvas = this._el[0].getContext("2d");
        map.getPanes().overlayPane.appendChild(this._el[0]);
        map.on('viewreset', this.onReset, this);
        return this.onReset();
      };

      LineLayer.prototype.onRemove = function() {
        map.getPanes().overlayPane.removeChild(this._el[0]);
        return map.off('viewreset', this.onReset, this);
      };

      LineLayer.prototype.onReset = function() {
        this.startPos = this.map.latLngToLayerPoint(this.fromLatlng);
        this.endPos = this.map.latLngToLayerPoint(this.toLatLng);
        this.calculateDimensions();
        return this.drawLine();
      };

      LineLayer.prototype.calculateDimensions = function() {
        var cssProps;
        cssProps = {
          position: "absolute"
        };
        this.startPosPx = {};
        this.endPosPx = {};
        this.controlPoints = [0, 1, 2, 3].map(function() {
          return new Coordinate;
        });
        this.size = {
          height: Math.abs(this.startPos.y - this.endPos.y),
          width: Math.abs(this.startPos.x - this.endPos.x)
        };
        if (this.startPos.y > this.endPos.y) {
          cssProps.top = this.endPos.y;
          this.controlPoints[0].y = this.size.height;
          this.controlPoints[3].y = 0;
        } else {
          cssProps.top = this.startPos.y;
          this.controlPoints[0].y = 0;
          this.controlPoints[3].y = this.size.height;
        }
        if (this.startPos.x > this.endPos.x) {
          cssProps.left = this.endPos.x;
          this.controlPoints[0].x = this.size.width;
          this.controlPoints[1].x = this.size.width - (this.size.width / 4);
          this.controlPoints[2].x = this.size.width / 4;
          this.controlPoints[3].x = 0;
        } else {
          cssProps.left = this.startPos.x;
          this.controlPoints[0].x = 0;
          this.controlPoints[1].x = this.size.width / 4;
          this.controlPoints[2].x = this.size.width - (this.size.width / 4);
          this.controlPoints[3].x = this.size.width;
        }
        this.controlPoints[1].y = this.controlPoints[0].y - (this.size.width / 4);
        this.controlPoints[2].y = this.controlPoints[0].y - (this.size.width / 4);
        this.controlPoints.reverse();
        this.calculatePoints();
        this.size.height += this.extraHeight + this.lineWidth;
        this.size.width += this.lineWidth;
        cssProps.top -= this.extraHeight;
        this._el.css(cssProps);
        return this._el.attr(this.size);
      };

      LineLayer.prototype.drawLine = function() {
        var drawTimeout, grd, percentDrawn,
          _this = this;
        this.canvas.strokeStyle = "white";
        grd = this.canvas.createLinearGradient(0, 0, this.size.width, this.size.height);
        grd.addColorStop(0, "#25426d");
        grd.addColorStop(0.3, "#25426d");
        grd.addColorStop(0.5, "#4e76b1");
        grd.addColorStop(0.7, "#25426d");
        grd.addColorStop(1, "#25426d");
        this.canvas.fillStyle = grd;
        this.canvas.lineCap = "round";
        this.canvas.lineWidth = this.lineWidth;
        percentDrawn = 0;
        drawTimeout = function() {
          return setTimeout(function() {
            _this.canvas.clearRect(0, 0, _this.size.width, _this.size.height);
            _this.doDraw(percentDrawn);
            percentDrawn++;
            if (percentDrawn <= 100) {
              return drawTimeout();
            }
          }, 5);
        };
        return drawTimeout();
      };

      LineLayer.prototype.calculatePoints = function() {
        var lowestY, pointMap, _i, _j, _results, _results1,
          _this = this;
        lowestY = 0;
        this.secondLinePoints = this.controlPoints.map(function(p, i) {
          if (i === 1 || i === 2) {
            return new Coordinate(p.x, p.y - 15);
          } else {
            return new Coordinate(p.x, p.y);
          }
        });
        pointMap = function(points) {
          return function(p) {
            var point;
            point = jsBezier.pointOnCurve(points, p / 100);
            if (point.y < lowestY) {
              lowestY = point.y;
            }
            return point;
          };
        };
        this.points = (function() {
          _results = [];
          for (_i = 0; _i <= 100; _i++){ _results.push(_i); }
          return _results;
        }).apply(this).map(pointMap(this.controlPoints));
        this.secondLinePoints = (function() {
          _results1 = [];
          for (_j = 0; _j <= 100; _j++){ _results1.push(_j); }
          return _results1;
        }).apply(this).map(pointMap(this.secondLinePoints));
        return this.extraHeight = 0 - lowestY;
      };

      LineLayer.prototype.doDraw = function(percent) {
        var nextPoint, startFrom, startPoint, x, _i, _j, _ref, _ref1;
        startFrom = 0;
        if (percent > 100) {
          startFrom = percent - 100;
          percent = 100;
          this.canvas.strokeStyle = "rgba(0, 0, 0, " + Math.round(10 - startFrom / 10, 2) / 10 + ")";
        }
        startPoint = this.points[startFrom];
        this.canvas.moveTo(startPoint.x, startPoint.y);
        this.canvas.beginPath();
        for (x = _i = _ref = startFrom + 1; _ref <= percent ? _i <= percent : _i >= percent; x = _ref <= percent ? ++_i : --_i) {
          nextPoint = this.points[x];
          this.canvas.lineTo(nextPoint.x + (this.lineWidth / 2), nextPoint.y + this.extraHeight + (this.lineWidth / 2));
        }
        for (x = _j = percent, _ref1 = startFrom + 1; percent <= _ref1 ? _j <= _ref1 : _j >= _ref1; x = percent <= _ref1 ? ++_j : --_j) {
          nextPoint = this.secondLinePoints[x];
          this.canvas.lineTo(nextPoint.x + (this.lineWidth / 2), nextPoint.y + this.extraHeight + (this.lineWidth / 2));
        }
        return this.canvas.fill();
      };

      return LineLayer;

    })();
  });

}).call(this);
