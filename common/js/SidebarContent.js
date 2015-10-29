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
            if (div && map.userPosition && feature) {

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

    function Counter(num, current) {
        current = current || 0;

        return {
            prev: function () {
                if (current === 0) {
                    current = num;
                }
                return --current;
            },
            next: function () {
                if (current >= num - 1) {
                    current = -1;
                }
                return ++current;
            }
        };
    }


    function _createImage(src) {
        return $('<img data-type="image" class="fullwidth img-thumbnail" src="' + src + '" />');
    }

    function _createVideo(src) {
        if (src.indexOf('mp4') !== -1) {
            //  <% if(images) { %>poster="<%= images[0] %>" <% } %> 
            return $('<video data-type="video" class="video-js vjs-default-skin fullwidth" controls preload="auto" height="315" data-setup="{}"><source src="' + src + '" type="video/mp4"></video>');
        }
        return $('<iframe data-type="video" class="fullwidth" height="315" src="' + src + '" frameborder="0" allowfullscreen></iframe>');
    }

    function _createSound(src) {
        return $('<audio data-type="sound" src="' + src + '" preload="auto"></audio>');
    }

    var generators = {
        'image': _createImage,
        'video': _createVideo,
        'sound': _createSound
    };

    function _getMarkup(mediaObject) {
        if (_.has(generators, mediaObject.type)) {
            var element = generators[mediaObject.type](mediaObject.url);
            element.attr('data-type', mediaObject.type);
            element.attr('data-created', true);
            return element;
        }
    }

    function _setupMediaCarousel(imagesContainer) {
        var media = imagesContainer.find('.images-list').children();
        var counter = new Counter(media.length);

        function showMedia(idx) {
            media = imagesContainer.find('.images-list').children();
            var mediaElement = $(media[idx]);
            media.addClass('hidden');
            if (mediaElement.attr('data-created') || mediaElement.hasClass('audiojs')) {
                mediaElement.removeClass('hidden');
            } else {
                var mediaObject = {
                    type: mediaElement.attr('data-type'),
                    url: mediaElement.attr('data-src')
                };
                var element = _getMarkup(mediaObject);
                mediaElement.replaceWith(element);
                if (element.is('audio')) {
                    audiojs.create(element);
                }
            }
        }

        imagesContainer.find('.next').on('click', function () {
            showMedia(counter.next());
        });

        imagesContainer.find('.prev').on('click', function () {
            showMedia(counter.prev());
        });
    }

    KR.CreateImageListMarkup = function () {return ''; };

    function _createInactiveMarkup(url, type) {
        return $('<div class="hidden"> </div>')
            .attr('data-src', url)
            .attr('data-type', type);
    }

    KR.CreateMediaListMarkup = function (media) {
        var outer = $('<div class="images-container"></div>');
        var list = $('<div class="images-list"></div>');
        list.append(_.map(media, function (mediaObject, index) {
            var active = index === 0;

            if (active) {
                return _getMarkup(mediaObject);
            }
            return _createInactiveMarkup(mediaObject.url, mediaObject.type);
        }));
        outer.append(list);
        if (media.length > 1) {
            outer.append($('<div class="image-navigation"><a class="prev circle active"><span class="glyphicon glyphicon-chevron-left" aria-hidden="true"></span></a><a class="next circle active"><span class="glyphicon glyphicon-chevron-right" aria-hidden="true"></span></a></div>'));
        }
        return outer[0].outerHTML;
    };


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

        function _createListCallbacks(feature, index, template, getData, features, close) {
            var prev;
            if (index > 0) {
                prev = function (e) {
                    if (e) {
                        e.preventDefault();
                    }
                    index = index - 1;
                    feature = features[index];
                    var callbacks = _createListCallbacks(feature, index, template, getData, features, close);
                    showFeature(feature, template, getData, callbacks, index, features.length);
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
                    var callbacks = _createListCallbacks(feature, index, template, getData, features, close);
                    showFeature(feature, template, getData, callbacks, index, features.length);
                };
            }

            if (!close) {
                close = function () {
                    showFeatures(features, template, getData, options.noListThreshold, true);
                };
            }

            return {
                prev: prev,
                close: close,
                next: next
            };
        }

        function _createListElement(feature, index, template, getData, features) {
            var marker;
            if (feature.properties.thumbnail) {
                marker = options.thumbnailTemplate({
                    thumbnail: KR.Util.getImageCache(feature.properties.thumbnail, 80, 60),
                    thumbnail2x: KR.Util.getImageCache(feature.properties.thumbnail, 60, 120),
                    color: KR.Style.colorForFeature(feature, true)
                });
            } else {
                marker = options.markerTemplate({
                    icon: '',
                    color: KR.Style.colorForFeature(feature)
                });
            }

            var li = $(options.listElementTemplate({
                title: feature.properties.title,
                marker: marker
            }));

            li.on('click', function (e) {
                e.preventDefault();
                var callbacks = _createListCallbacks(feature, index, template, getData, features);
                showFeature(feature, template, getData, callbacks, index, features.length);
                return false;
            });
            return li;
        }



        function showFeature(feature, template, getData, callbacks, index, numFeatures) {
            if (getData) {
                var content = '';
                if (feature.properties.title) {
                    content += '<h3>' + feature.properties.title + '</h3>';
                }
                content += '<i class="fa fa-spinner fa-pulse fa-3x"></i>';
                _setContent(content);
                getData(feature, function (newFeature) {
                    newFeature.properties = _.extend(feature.properties, newFeature.properties);
                    showFeature(newFeature, template, null, callbacks, index, numFeatures);
                });
                return;
            }

            template = template || feature.template || KR.Util.templateForDataset(feature.properties.dataset) || defaultTemplate;

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
                feature.properties.license = null;
            }

            var color = KR.Style.colorForFeature(feature, true, true);
            var content = '<span class="providertext" style="color:' + color + ';">' + feature.properties.provider + '</span>';

            content += template(_.extend({image: null}, feature.properties));

            if (options.footerTemplate && feature.properties.link) {
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
            }

            var imagesContainer = element.find('.images-container');
            if (imagesContainer.length) {
                _setupMediaCarousel(imagesContainer);
            }
            if (typeof audiojs !== 'undefined') {
                audiojs.createAll();
            }

            element.scrollTop(0);
        }

        function showFeatures(features, template, getData, noListThreshold, forceList) {
            noListThreshold = (noListThreshold === undefined) ? options.noListThreshold : noListThreshold;
            var shouldSkipList = (features.length <= noListThreshold);
            if (shouldSkipList && forceList !== true) {
                var feature = features[0];
                element.html('');
                var callbacks = _createListCallbacks(feature, 0, template, getData, features);
                this.showFeature(feature, template, getData, callbacks, 0, features.length);
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
                        return _createListElement(feature, index, template, getData, features);
                    }, this);

                    list.append(elements);
                    wrap.append('<h5 class="providertext">' + key + '</h5>');
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