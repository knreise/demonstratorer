(function () {
    'use strict';

    //canvasOverlay from http://bl.ocks.org/sumbera/11114288

    L.CanvasOverlay = L.Class.extend({

        initialize: function (userDrawFunc, options) {
            this._userDrawFunc = userDrawFunc;
            L.setOptions(this, options);
            this.isStatic = true;
        },

        drawing: function (userDrawFunc) {
            this._userDrawFunc = userDrawFunc;
            return this;
        },

        params:function(options){
            L.setOptions(this, options);
            return this;
        },
        
        canvas: function () {
            return this._canvas;
        },

        redraw: function () {
            if (!this._frame) {
                this._frame = L.Util.requestAnimFrame(this._redraw, this);
            }
            return this;
        },

        onAdd: function (map) {
            this._map = map;
            this._canvas = L.DomUtil.create('canvas', 'leaflet-heatmap-layer');

            var size = this._map.getSize();
            this._canvas.width = size.x;
            this._canvas.height = size.y;

            var animated = this._map.options.zoomAnimation && L.Browser.any3d;
            L.DomUtil.addClass(this._canvas, 'leaflet-zoom-' + (animated ? 'animated' : 'hide'));

            map._panes.overlayPane.appendChild(this._canvas);

            map.on('moveend', this._reset, this);
            map.on('resize',  this._resize, this);

            if (map.options.zoomAnimation && L.Browser.any3d) {
                map.on('zoomanim', this._animateZoom, this);
            }

            this._reset();
            if (this.isStatic) {
                this._redrawCanvas();
            }
        },

        onRemove: function (map) {
            map.getPanes().overlayPane.removeChild(this._canvas);

            map.off('moveend', this._reset, this);
            map.off('resize', this._resize, this);

            if (map.options.zoomAnimation) {
                map.off('zoomanim', this._animateZoom, this);
            }
            this_canvas = null;

        },

        addTo: function (map) {
            map.addLayer(this);
            return this;
        },

        _resize: function (resizeEvent) {
            this._canvas.width  = resizeEvent.newSize.x;
            this._canvas.height = resizeEvent.newSize.y;
        },

        _reset: function () {
            var topLeft = this._map.containerPointToLayerPoint([0, 0]);
            L.DomUtil.setPosition(this._canvas, topLeft);
            this._redraw();
        },

        _redraw: function () {
            if (!this.isStatic) {
                this._redrawCanvas();
            }
        },

        _redrawCanvas: function () {
            var size = this._map.getSize();
            var bounds   = this._map.getBounds();
            var zoomScale = (size.x * 180) / (20037508.34  * (bounds.getEast() - bounds.getWest())); // resolution = 1/zoomScale
            var zoom = this._map.getZoom();

            if (this._userDrawFunc) {
                this._userDrawFunc(this, {
                    canvas   :this._canvas,
                    bounds   : bounds,
                    size     : size,
                    zoomScale: zoomScale,
                    zoom : zoom,
                    options: this.options
               });
            }
            this._frame = null;
        },

        _animateZoom: function (e) {
            var scale = this._map.getZoomScale(e.zoom),
                offset = this._map._getCenterOffset(e.center)._multiplyBy(-scale).subtract(this._map._getMapPanePos());

            this._canvas.style[L.DomUtil.TRANSFORM] = L.DomUtil.getTranslateString(offset) + ' scale(' + scale + ')';
        }
    });

    L.canvasOverlay = function (userDrawFunc, options) {
        return new L.CanvasOverlay(userDrawFunc, options);
    };

    function getDrawSnow(color, mp) {

        color = color || 'rgba(255, 255, 255, 0.8)';
        mp = mp || 25; //max particles
        //snow drawing function from http://thecodeplayer.com/walkthrough/html5-canvas-snow-effect
        return function drawSnow(canvasOverlay, params) {
            console.log("draw")
            var ctx = params.canvas.getContext('2d');

            //canvas dimensions
            var W = window.innerWidth;
            var H = window.innerHeight;

            //snowflake particles
            
            var particles = [];
            for(var i = 0; i < mp; i++) {
                particles.push({
                    x: Math.random()*W, //x-coordinate
                    y: Math.random()*H, //y-coordinate
                    r: Math.random()*4+1, //radius
                    d: Math.random()*mp //density
                });
            }
            //Lets draw the flakes
            function draw() {
                ctx.clearRect(0, 0, W, H);

                ctx.fillStyle = color;
                ctx.beginPath();
                for(var i = 0; i < mp; i++)
                {
                    var p = particles[i];
                    ctx.moveTo(p.x, p.y);
                    ctx.arc(p.x, p.y, p.r, 0, Math.PI*2, true);
                }
                ctx.fill();
                update();
            }
            
            //Function to move the snowflakes
            //angle will be an ongoing incremental flag. Sin and Cos functions will be applied to it to create vertical and horizontal movements of the flakes
            var angle = 0;
            function update() {
                angle += 0.01;
                for(var i = 0; i < mp; i++) {
                    var p = particles[i];
                    //Updating X and Y coordinates
                    //We will add 1 to the cos function to prevent negative values which will lead flakes to move upwards
                    //Every particle has its own density which can be used to make the downward movement different for each flake
                    //Lets make it more random by adding in the radius
                    p.y += Math.cos(angle+p.d) + 1 + p.r/2;
                    p.x += Math.sin(angle) * 2;
                    
                    //Sending flakes back from the top when it exits
                    //Lets make it a bit more organic and let flakes enter from the left and right also.
                    if(p.x > W+5 || p.x < -5 || p.y > H) {
                        if(i%3 > 0) { //66.67% of the flakes
                            particles[i] = {x: Math.random()*W, y: -10, r: p.r, d: p.d};
                        } else {
                            //If the flake is exitting from the right
                            if(Math.sin(angle) > 0) {
                                //Enter from the left
                                particles[i] = {x: -5, y: Math.random()*H, r: p.r, d: p.d};
                            } else {
                                //Enter from the right
                                particles[i] = {x: W+5, y: Math.random()*H, r: p.r, d: p.d};
                            }
                        }
                    }
                }
            }

            //animation loop
            setInterval(draw, 33);
        };
    }

    L.snowLayer = function (options) {
        return new L.CanvasOverlay(getDrawSnow(options.color, options.maxFlakes));
    };

}());