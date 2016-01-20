/*global audiojs:false, turf:false*/

var KR = this.KR || {};
(function () {
    'use strict';


    function PositionDisplayer() {
        var map, div, feature, content;

        var template = _.template($('#user_position_template').html());

        function _distanceAndBearing(feature) {
            if (map && map.userPosition) {
                var pos = turf.point([
                    map.userPosition.lng,
                    map.userPosition.lat
                ]);
                var distBear =  KR.Util.distanceAndBearing(pos, feature);
                var dist = distBear.distance;
                if (dist < 1000) {
                    dist = KR.Util.round(dist, 0) + ' Meter';
                } else {
                    dist = KR.Util.round(dist / 1000, 2) + ' Kilometer';
                }
                return {
                    dist: dist,
                    rot: distBear.bearing - 45 //-45 because of rotation of fa-location-arrow
                };
            }
        }


        function _showPosition() {
            if (div && map && map.userPosition && feature) {

                if (content) {
                    content.remove();
                }

                var header = div.find('h3').eq(0);
                var distBear = _distanceAndBearing(feature);
                content = $(template({distanceBearing: distBear}));
                if (header.length) {
                    header.after(content);
                } else {
                    div.prepend(content);
                }
            }
        }

        function selectFeature(_feature, _div) {
            div = _div;
            feature = _feature;
            _showPosition();
        }

        return {
            setMap: function (_map) {
                map = _map;
                map.on('locationChange', _showPosition);
            },
            selectFeature: selectFeature
        };
    }


    /*
        Handles display of content in a sidebar
    */
    KR.SidebarContent = function (wrapper, element, top, options) {

        var defaultTemplate = KR.Util.getDatasetTemplate('popup');

        var positionDisplayer = new PositionDisplayer();

        element = $(element);
        wrapper = $(wrapper);
        top = $(top);

        function _setContent(content) {
            element.html(content);
        }

        function _setupSwipe(callbacks) {
            if (!callbacks) {
                return;
            }
            element
                .swipe({
                    swipe: function () {},
                    allowPageScroll: 'vertical'
                })
                .off('swipeLeft')
                .on('swipeLeft', function () {
                    if (callbacks.next) {
                        callbacks.next();
                    }
                })
                .off('swipeRight')
                .on('swipeRight', function () {
                    if (callbacks.prev) {
                        callbacks.prev();
                    }
                });
        }

        function _createListCallbacks(feature, index, dataset, getData, features, close) {
            var prev;
            if (index > 0) {
                prev = function (e) {
                    if (e) {
                        e.preventDefault();
                    }
                    index = index - 1;
                    feature = features[index];
                    var callbacks = _createListCallbacks(feature, index, dataset, getData, features, close);
                    showFeature(feature, dataset, getData, callbacks, index, features.length);
                };
            }
            var next;
            if (index < features.length - 1) {
                next = function (e) {
                    if (e) {
                        e.preventDefault();
                    }
                    index = index + 1;
                    feature = features[index];
                    var callbacks = _createListCallbacks(feature, index, dataset, getData, features, close);
                    showFeature(feature, dataset, getData, callbacks, index, features.length);
                };
            }

            if (!close) {
                close = function () {
                    showFeatures(features, dataset, getData, options.noListThreshold, true);
                };
            }

            return {
                prev: prev,
                close: close,
                next: next
            };
        }

        function _createListElement(feature, index, dataset, getData, features) {
            var marker;
            if (feature.properties.thumbnail) {
                marker = options.thumbnailTemplate({
                    thumbnail: KR.Util.getImageCache(feature.properties.thumbnail, 80, 60),
                    thumbnail2x: KR.Util.getImageCache(feature.properties.thumbnail, 120, 90),
                    color: KR.Style2.colorForDataset(dataset, true, true)
                });
            } else {
                marker = options.markerTemplate({
                    icon: '',
                    color: KR.Style2.colorForDataset(dataset, true, true)
                });
            }

            var li = $(options.listElementTemplate({
                title: feature.properties.title,
                marker: marker
            }));

            li.on('click', function (e) {
                e.preventDefault();
                var callbacks = _createListCallbacks(feature, index, dataset, getData, features);
                showFeature(feature, dataset, getData, callbacks, index, features.length);
                return false;
            });
            return li;
        }


        function setupFullscreenClick(element) {
            element.find('img[data-fullsize-url!=""]').click(function () {
                var url = $(this).attr('data-fullsize-url');
                $('#overlay').removeClass('hidden').html($('<img src="' + url + '" />')).click(function () {
                    $('#overlay').addClass('hidden').html('');
                });
            });
        }


        function showFeature(feature, dataset, getData, callbacks, index, numFeatures) {
            if (getData) {
                var content = '';
                if (feature.properties.title) {
                    content += '<h3>' + feature.properties.title + '</h3>';
                }
                content += '<i class="fa fa-spinner fa-pulse fa-3x"></i>';
                _setContent(content);
                getData(feature, function (newFeature) {
                    newFeature.properties = _.extend(feature.properties, newFeature.properties);
                    showFeature(newFeature, dataset, null, callbacks, index, numFeatures);
                });
                return;
            }
            var template = dataset.template || defaultTemplate;

            var img = feature.properties.images;
            if (_.isArray(img)) {
                img = img[0];
            }

            if (!feature.properties.images) {
                feature.properties.images = null;
            }

            if (feature.properties.allProps && feature.properties.allProps.europeana_rights) {
                feature.properties.license = feature.properties.allProps.europeana_rights[0];
            } else {
                feature.properties.license = feature.properties.license;
            }


            var color = KR.Style2.colorForDataset(dataset, true, true);
            var content = '<span class="providertext" style="color:' + color + ';">' + dataset.name + '</span>';

            content += template(_.extend({image: null}, feature.properties));



            if (options.footerTemplate && feature.properties.link) {
                if (!feature.properties.provider) {
                    feature.properties.provider = dataset.provider;
                }
                content += options.footerTemplate(feature.properties);
            }

            content = $(['<div>', content, '</div>'].join(' '));
            if (KR.Util.isInIframe()) {
                content.find('a').attr('target', '_blank');
            }

            positionDisplayer.selectFeature(feature, content);
            _setContent(content);
            _setupSwipe(callbacks);

            wrapper.find('.prev-next-arrows').remove();

            top.html('');
            if (callbacks) {
                var list = $('<a class="pull-left list-btn"><i class="fa fa-bars"></i></a>');
                top.append(list);
                list.click(callbacks.close);
                var idx = index + 1;
                top.append($('<div class="top-text pull-left"><b>' + idx + '</b> av ' + numFeatures + '</div>'));

                var prev = $('<a class="prev-next-arrows prev circle"><span class="glyphicon glyphicon-chevron-left" aria-hidden="true"></span></a>');
                wrapper.append(prev);
                if (callbacks.prev) {
                    prev.click(callbacks.prev).addClass('active');
                }

                var next = $('<a class="prev-next-arrows next circle"><span class="glyphicon glyphicon-chevron-right" aria-hidden="true"></span></a>');
                wrapper.append(next);
                if (callbacks.next) {
                    next.click(callbacks.next).addClass('active');
                }
                wrapper.append($('<div id="overlay" class="hidden"></div>'));
            }

            setupFullscreenClick(wrapper);

            var mediaContainer = element.find('.media-container');
            if (mediaContainer.length) {
                KR.MediaCarousel.SetupMediaCarousel(mediaContainer, setupFullscreenClick);
            }
            if (typeof audiojs !== 'undefined') {
                audiojs.createAll();
            }

            element.scrollTop(0);
        }

        function showFeatures(features, dataset, getData, noListThreshold, forceList) {
            noListThreshold = (noListThreshold === undefined) ? options.noListThreshold : noListThreshold;
            var shouldSkipList = (features.length <= noListThreshold);
            if (shouldSkipList && forceList !== true) {
                var feature = features[0];
                element.html('');
                var callbacks = _createListCallbacks(feature, 0, dataset, getData, features);
                this.showFeature(feature, dataset, getData, callbacks, 0, features.length);
                return;
            }

            var count = $('<span class="circle">' + features.length + '</span>');
            top.html(count);

            var grouped = _.chain(features)
                .groupBy(function (feature) {
                    return feature.properties.provider;
                })
                .map(function (featuresInGroup, key) {
                    var wrap = $('<div></div>');
                    var list = $('<div class="list-group"></ul>');
                    var elements = _.map(featuresInGroup, function (feature) {
                        var index = _.findIndex(features, function (a) {
                            return a === feature;
                        });
                        return _createListElement(feature, index, dataset, getData, features);
                    }, this);

                    list.append(elements);
                    wrap.append('<h5 class="providertext">' + dataset.name + '</h5>');
                    wrap.append(list);
                    return wrap;
                }).value();

            element.html(grouped);
            element.scrollTop(0);
        }

        return {
            showFeature: showFeature,
            showFeatures: showFeatures,
            setMap: function (_map) {
                positionDisplayer.setMap(_map);
            }
        };
    };

}());