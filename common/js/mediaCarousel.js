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


    function _createInactiveMarkup(url, type) {
        return $('<div class="hidden"> </div>')
            .attr('data-src', url)
            .attr('data-type', type);
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
            return _createInactiveMarkup(mediaObject.url, mediaObject.type);
        }));
        outer.append(list);
        if (media.length > 1) {
            outer.append($('<div class="media-navigation"><a class="prev circle"><span class="glyphicon glyphicon-chevron-left" aria-hidden="true"></span></a><a class="next circle active"><span class="glyphicon glyphicon-chevron-right" aria-hidden="true"></span></a></div>'));
        }
        return outer[0].outerHTML;
    };
}(KR.MediaCarousel));
