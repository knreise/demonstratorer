/*global L:false */
var KR = this.KR || {};

//see: https://github.com/mylen/leaflet.TileLayer.WMTS
L.TileLayer.WMTS=L.TileLayer.extend({defaultWmtsParams:{service:"WMTS",request:"GetTile",version:"1.0.0",layer:"",style:"",tilematrixSet:"",format:"image/jpeg"},initialize:function(a,b){this._url=a;var c=L.extend({},this.defaultWmtsParams),d=b.tileSize||this.options.tileSize;c.width=c.height=b.detectRetina&&L.Browser.retina?2*d:d;for(var e in b)this.options.hasOwnProperty(e)||"matrixIds"==e||(c[e]=b[e]);this.wmtsParams=c,this.matrixIds=b.matrixIds||this.getDefaultMatrix(),L.setOptions(this,b)},onAdd:function(a){L.TileLayer.prototype.onAdd.call(this,a)},getTileUrl:function(a,b){var c=this._map;return crs=c.options.crs,tileSize=this.options.tileSize,nwPoint=a.multiplyBy(tileSize),nwPoint.x+=1,nwPoint.y-=1,sePoint=nwPoint.add(new L.Point(tileSize,tileSize)),nw=crs.project(c.unproject(nwPoint,b)),se=crs.project(c.unproject(sePoint,b)),tilewidth=se.x-nw.x,b=c.getZoom(),ident=this.matrixIds[b].identifier,X0=this.matrixIds[b].topLeftCorner.lng,Y0=this.matrixIds[b].topLeftCorner.lat,tilecol=Math.floor((nw.x-X0)/tilewidth),tilerow=-Math.floor((nw.y-Y0)/tilewidth),url=L.Util.template(this._url,{s:this._getSubdomain(a)}),url+L.Util.getParamString(this.wmtsParams,url)+"&tilematrix="+ident+"&tilerow="+tilerow+"&tilecol="+tilecol},setParams:function(a,b){return L.extend(this.wmtsParams,a),b||this.redraw(),this},getDefaultMatrix:function(){for(var a=new Array(22),b=0;22>b;b++)a[b]={identifier:""+b,topLeftCorner:new L.LatLng(20037508.3428,-20037508.3428)};return a}}),L.tileLayer.wmts=function(a,b){return new L.TileLayer.WMTS(a,b)};


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
                    transparent: false,
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
