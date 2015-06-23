/*global L:false */
var KR = this.KR || {};

//see: https://github.com/mylen/leaflet.TileLayer.WMTS
L.TileLayer.WMTS=L.TileLayer.extend({defaultWmtsParams:{service:"WMTS",request:"GetTile",version:"1.0.0",layer:"",style:"",tilematrixSet:"",format:"image/jpeg"},initialize:function(e,t){this._url=e;var n=L.extend({},this.defaultWmtsParams),r=t.tileSize||this.options.tileSize;if(t.detectRetina&&L.Browser.retina){n.width=n.height=r*2}else{n.width=n.height=r}for(var i in t){if(!this.options.hasOwnProperty(i)&&i!="matrixIds"){n[i]=t[i]}}this.wmtsParams=n;this.matrixIds=t.matrixIds||this.getDefaultMatrix();L.setOptions(this,t)},onAdd:function(e){L.TileLayer.prototype.onAdd.call(this,e)},getTileUrl:function(e,t){var n=this._map;crs=n.options.crs;tileSize=this.options.tileSize;nwPoint=e.multiplyBy(tileSize);nwPoint.x+=1;nwPoint.y-=1;sePoint=nwPoint.add(new L.Point(tileSize,tileSize));nw=crs.project(n.unproject(nwPoint,t));se=crs.project(n.unproject(sePoint,t));tilewidth=se.x-nw.x;t=n.getZoom();ident=this.matrixIds[t].identifier;X0=this.matrixIds[t].topLeftCorner.lng;Y0=this.matrixIds[t].topLeftCorner.lat;tilecol=Math.floor((nw.x-X0)/tilewidth);tilerow=-Math.floor((nw.y-Y0)/tilewidth);url=L.Util.template(this._url,{s:this._getSubdomain(e)});return url+L.Util.getParamString(this.wmtsParams,url)+"&tilematrix="+ident+"&tilerow="+tilerow+"&tilecol="+tilecol},setParams:function(e,t){L.extend(this.wmtsParams,e);if(!t){this.redraw()}return this},getDefaultMatrix:function(){var e=new Array(22);for(var t=0;t<22;t++){e[t]={identifier:""+t,topLeftCorner:new L.LatLng(20037508.3428,-20037508.3428)}}return e}});L.tileLayer.wmts=function(e,t){return new L.TileLayer.WMTS(e,t)}

(function (ns) {
    'use strict';

    function getMatrix(tilematrixSet) {
        var matrixIds3857 = new Array(30);
        for (var i= 0; i<22; i++) {
            matrixIds3857[i]= {
                identifier: tilematrixSet + ':' + i,
                topLeftCorner: new L.LatLng(2.0037508E7, -2.003750834E7)
            };
        }
        return matrixIds3857;
    }

    ns.SKTokenUrl = 'http://localhost:8001/html/baat/?type=token';

    ns.getNibLayer = function (callback, wmsc) {
        ns.Util.sendRequest(KR.SKTokenUrl, null, function (token) {
            var layer;
            if (wmsc) {
                layer = L.tileLayer.wms('http://gatekeeper2.geonorge.no/BaatGatekeeper/gk/gk.nibcache', {
                    layers: 'NiB',
                    format: 'image/jpeg',
                    transparent: true,
                    attribution: 'Kartverket'
                });
            } else {
                var url = 'http://gatekeeper1.geonorge.no/BaatGatekeeper/gk/gk.nibcache_wmts';
                var tilematrixSet = 'EPSG:900913';
                layer = new L.TileLayer.WMTS(url, {
                    layer: 'NiB',
                    style: 'normal',
                    tilematrixSet: tilematrixSet,
                    matrixIds: getMatrix(tilematrixSet),
                    format: 'image/jpeg',
                    attribution: 'Kartverket'
                });
            }
            layer.setParams({GKT: token});
            callback(layer);
        });
    };

}(KR));
