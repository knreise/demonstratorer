import $ from 'jquery';
import * as _ from 'underscore';
import {getImageCache, isInIframe} from '../../util';

import PositionDisplayer from './PositionDisplayer';

/*
    Handles display of content in a sidebar
*/
export default function SidebarContent(wrapper, element, top, options) {


    var positionDisplayer = new PositionDisplayer();

    element = $(element);
    wrapper = $(wrapper);
    top = $(top);

    function _setContent(content) {
        element.html(content);
    }

    function _setupSwipe(callbacks) {
        /*if (!callbacks) {
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
        */
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
        //TODO get color for feature
        //var color = KR.Style.colorForFeature(feature, true);
        var color = dataset.style.fillcolor;
        if (feature.properties.thumbnail) {
            marker = options.thumbnailTemplate({
                thumbnail: getImageCache(feature.properties.thumbnail, 80, 60),
                thumbnail2x: getImageCache(feature.properties.thumbnail, 120, 90),
                color: color
            });
        } else {
            marker = options.markerTemplate({
                icon: '',
                color: color
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
            if (!url) {
                return;
            }
            $('#overlay').removeClass('hidden').html($('<img src="' + url + '" />')).click(function () {
                $('#overlay').addClass('hidden').html('');
            });
        });
    }


    function showFeature(feature, dataset, getData, callbacks, index, numFeatures) {
        var template = dataset.template;
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

        var color = dataset.style.fillcolor;

        var provider = dataset.provider || dataset.name;
        var content = '<span class="providertext" style="color:' + color + ';">' + provider + '</span>';

        var properties = _.clone(feature.properties);
        properties.provider = provider;
        content += template(_.extend({image: null}, properties));

        if (options.footerTemplate && properties.link) {
            content += options.footerTemplate(properties);
        }

        content = $(['<div>', content, '</div>'].join(' '));
        if (isInIframe()) {
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

        //TODO: Fix these
        /*
        var mediaContainer = element.find('.media-container');
        if (mediaContainer.length) {
            //KR.MediaCarousel.SetupMediaCarousel(mediaContainer, setupFullscreenClick);
        }
        if (typeof audiojs !== 'undefined') {
            audiojs.createAll();
        }
        */

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
                return feature.dataset.name;
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