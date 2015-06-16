
KR.Style.setDatasetStyle('Default', {});
var datasets = KR.Style.datasets;



$('#circle').append(_.map(datasets, function (style, name) {
    return $('<tr>' + 
                '<td style="vertical-align:top;">' + name + '</td>' +
                '<td><div id="map_circle_' + name.replace(/ /g, '_') +'" style="width:100px;height:100px;"></div></td>' +
                '<td><div id="map_marker_' + name.replace(/ /g, '_') +'" style="width:100px;height:100px;"></div></td>' +
                '<td><div id="map_thumb_' + name.replace(/ /g, '_') +'" style="width:100px;height:100px;"></div></td>' +
                '<td><div id="map_cluster_circle_' + name.replace(/ /g, '_') +'" style="width:100px;height:100px;"></div></td>' +
                '<td><div id="map_cluster_thumb_' + name.replace(/ /g, '_') +'" style="width:100px;height:100px;"></div></td>' +
            '</tr>');
}));

function showFeature(ll, marker, id) {
    var map = L.map(id, {attributionControl: false, zoomControl: false});
    marker.addTo(map);
    map.setView(ll, 10);
}

_.each(datasets, function (style, name) {
    var id = name.replace(/ /g, '_');
    var feature = {properties: {datasetId: name, thumbnail: 'http://lorempixel.com/100/100/', vernef_id: 'LVO'}};
    var ll = L.latLng(60, 10);

    var s = KR.Style.getDatasetStyle(name);
    s.thumbnail = false;
    s.circle = true;
    var circleMarker = KR.Style.getMarker(feature, ll);

    s.circle = false;
    var marker = KR.Style.getMarker(feature, ll);

    s.thumbnail = true;
    var thumbMarker = KR.Style.getMarker(feature, ll);

    showFeature(ll, circleMarker, 'map_circle_' + id);
    showFeature(ll, marker, 'map_marker_' + id);
    showFeature(ll, thumbMarker, 'map_thumb_' + id);

    var clusterMarker = L.marker(ll);
    clusterMarker.feature = feature;
    var cluster = {getAllChildMarkers: function () {return [clusterMarker, clusterMarker, clusterMarker, clusterMarker]}};
    clusterMarker.setIcon(KR.Style.getClusterIcon(cluster));
    showFeature(ll, clusterMarker, 'map_cluster_circle_' + id);


    s.thumbnail = false;
    var clusterMarker2 = L.marker(ll);
    clusterMarker2.feature = feature;
    var cluster = {getAllChildMarkers: function () {return [clusterMarker2, clusterMarker2, clusterMarker2, clusterMarker2]}};
    clusterMarker2.setIcon(KR.Style.getClusterIcon(cluster));
    showFeature(ll, clusterMarker2, 'map_cluster_thumb_' + id);
});