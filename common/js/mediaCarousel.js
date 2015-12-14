/*global audiojs: false*/

var KR = this.KR || {};

KR.MediaCarousel = {};

(function (ns) {
    'use strict';

    function Counter(num, current) {
        current = current || 0;

        var hasNext = function () {
            return (current < num - 1);
        };

        var hasPrev = function () {
            return (current > 0);
        };

        return {
            prev: function () {
                if (!hasPrev()) {
                    return current;
                }
                return --current;
            },
            next: function () {
                if (!hasNext()) {
                    return current;
                }
                return ++current;
            },
            hasNext: hasNext,
            hasPrev: hasPrev
        };
    }


    function _createImage(mediaObject) {
        var src = mediaObject.url;
        return $('<img data-type="image" class="fullwidth img-thumbnail" src="' + src + '" />');
    }

    function _createVideo(mediaObject) {
        var src = mediaObject.url;
        if (src.indexOf('mp4') !== -1) {
            //  <% if(images) { %>poster="<%= images[0] %>" <% } %> 
            return $('<video data-type="video" class="video-js vjs-default-skin fullwidth" controls preload="auto" height="315" data-setup="{}"><source src="' + src + '" type="video/mp4"></video>');
        }
        return $('<iframe data-type="video" class="fullwidth" height="315" src="' + src + '" frameborder="0" allowfullscreen></iframe>');
    }

    function _createSound(mediaObject) {
        var src = mediaObject.url;
        return $('<audio data-type="sound" src="' + src + '" preload="auto"></audio>');
    }

    function _createCaptionedImage(mediaObject) {
        var container = $('<div class="image with-caption"></div>');
        container.append('<img class="thumbnail fullwidth" src="' + mediaObject.url + '" />');
        container.append('<p>' + mediaObject.caption + ' (<a href="' + mediaObject.license + '" target="_blank">Lisens</a>)</p>');
        return container;
    }

    var generators = {
        'image': _createImage,
        'video': _createVideo,
        'sound': _createSound,
        'captioned_image': _createCaptionedImage,
    };

    function _getMarkup(mediaObject) {
        if (_.has(generators, mediaObject.type)) {
            var element = generators[mediaObject.type](mediaObject);
            element.attr('data-type', mediaObject.type);
            element.attr('data-created', true);
            return element;
        }
    }


    function _createInactiveMarkup(mediaObject) {
        var element = $('<div class="hidden"> </div>')
            .attr('data-src', mediaObject.url)
            .attr('data-type', mediaObject.type);

        _.each(mediaObject, function (value, key) {
            element.attr('data-own-' + key, value);
        });
        return element;
    }

    function getDataAttributes(node) {
        var d = {}, 
            re_dataAttr = /^data-own\-(.+)$/;

        $.each(node.get(0).attributes, function(index, attr) {
            if (re_dataAttr.test(attr.nodeName)) {
                var key = attr.nodeName.match(re_dataAttr)[1];
                d[key] = attr.nodeValue;
            }
        });

        return d;
    }

    ns.SetupMediaCarousel = function (mediaContainer) {
        var media = mediaContainer.find('.media-list').children();
        var counter = new Counter(media.length);
        function showMedia(idx) {
            media = mediaContainer.find('.media-list').children();
            var mediaElement = $(media[idx]);
            media.addClass('hidden');
            if (mediaElement.attr('data-created') || mediaElement.hasClass('audiojs')) {
                mediaElement.removeClass('hidden');
            } else {
                var mediaObject = {
                    type: mediaElement.attr('data-type'),
                    url: mediaElement.attr('data-src')
                };
                mediaObject = _.extend(mediaObject, getDataAttributes(mediaElement));


                var element = _getMarkup(mediaObject);
                mediaElement.replaceWith(element);
                if (element.is('audio')) {
                    audiojs.create(element);
                }
            }

            if (counter.hasPrev()) {
                mediaContainer.find('.prev').addClass('active');
            } else {
                mediaContainer.find('.prev').removeClass('active');
            }

            if (counter.hasNext()) {
                mediaContainer.find('.next').addClass('active');
            } else {
                mediaContainer.find('.next').removeClass('active');
            }

        }

        mediaContainer.find('.next').on('click', function () {
            if (counter.hasNext()) {
                showMedia(counter.next());
            }
        });

        mediaContainer.find('.prev').on('click', function () {
            if (counter.hasPrev()) {
                showMedia(counter.prev());
            }
        });
    };

    ns.CreateMediaListMarkup = function (media) {
        var outer = $('<div class="media-container"></div>');
        var list = $('<div class="media-list"></div>');
        list.append(_.map(media, function (mediaObject, index) {
            var active = index === 0;

            if (active) {
                return _getMarkup(mediaObject);
            }
            return _createInactiveMarkup(mediaObject);
        }));
        outer.append(list);
        if (media.length > 1) {
            outer.append($('<div class="media-navigation"><a class="prev circle"><span class="glyphicon glyphicon-chevron-left" aria-hidden="true"></span></a><a class="next circle active"><span class="glyphicon glyphicon-chevron-right" aria-hidden="true"></span></a></div>'));
        }
        return outer[0].outerHTML;
    };
}(KR.MediaCarousel));
