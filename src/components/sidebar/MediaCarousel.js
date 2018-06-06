/*global audiojs: false*/
import $ from 'jquery';
import * as _ from 'underscore';


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


function _createFullsize(mediaObject, img) {
     if (!_.isUndefined(mediaObject.fullsize)) {
        img.attr('data-fullsize-url', mediaObject.fullsize);
        img.parent().addClass('image-fullscreen-link');
    }
}

function _createImage(mediaObject) {
    var src = mediaObject.url;
    var img = $('<img data-type="image" class="fullwidth img-thumbnail" src="' + src + '" />');
    _createFullsize(mediaObject, img);
    return img;
}

function _createFWImage(mediaObject) {
    var container = $('<div class="image with-caption"></div>');
    var link = $('<a target="_blank" href="' + mediaObject.href + '"></a>');
    var img = $('<img class="thumbnail fullwidth" src="' + mediaObject.image + '" />');
    link.append(img);
    container.append(link);
    _createFullsize(mediaObject, img);
    container.append('<p>Fotograf/ Tegnet av: ' + mediaObject.creator + '</p>');
    container.append('<p>Klausul/ Vilkår for bruk: ' + mediaObject.license + '</p>');
    return container;
}

function _createWikImage(mediaObject) {
    var container = $('<div class="image with-caption"></div>');
    var link = $('<a target="_blank" href="' + mediaObject.href + '"></a>');
    var img = $('<img class="thumbnail fullwidth" src="' + mediaObject.image + '" />');
    link.append(img);
    container.append(link);
    _createFullsize(mediaObject, img);
    container.append('<p>Beskrivelse: ' + mediaObject.description + '</p>');
    container.append('<p>Fotograf: ' + mediaObject.creator + '</p>');
    return container;
}


function _createUserImage(mediaObject) {
    var container = $('<div class="image with-caption"></div>');
    var img = $('<img class="thumbnail fullwidth" src="' + mediaObject.image + '" />');
    container.append(img);
    _createFullsize(mediaObject, img);
    container.append('<p>Beskrivelse: ' + mediaObject.description + '</p>');
    container.append('<p>Fotograf: ' + mediaObject.creator + '</p>');
    container.append('<p>Klausul/ Vilkår for bruk: ' + mediaObject.license + '</p>');
    return container;
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
    var img = $('<img class="thumbnail fullwidth" src="' + mediaObject.url + '" />');
    container.append(img);
    _createFullsize(mediaObject, img);
    container.append('<p>' + mediaObject.caption + ' (<a href="' + mediaObject.license + '" target="_blank">Lisens</a>)</p>');
    return container;
}

var generators = {
    'image': _createImage,
    'brukerbilde': _createUserImage,
    'wiki_image': _createWikImage,
    'fotoweb_image': _createFWImage,
    'video': _createVideo,
    'sound': _createSound,
    'captioned_image': _createCaptionedImage
};

function _getMarkup(mediaObject) {
    console.log(mediaObject);
    if (_.has(generators, mediaObject.type)) {
        return generators[mediaObject.type](mediaObject);
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

export default function MediaCarousel(mediaContainer, media) {

    var startAt = 0;
    var counter = new Counter(media.length, startAt);

    var outer = $('<div class="media-container"></div>');
    var list = $('<div class="media-list"></div>');
    outer.append(list);
    if (media.length > 1) {
        outer.append($('<div class="media-navigation"><a class="prev circle"><span class="glyphicon glyphicon-chevron-left" aria-hidden="true"></span></a><a class="next circle active"><span class="glyphicon glyphicon-chevron-right" aria-hidden="true"></span></a></div>'));
    }
    mediaContainer.append(outer);
    showMedia(startAt);

    function showMedia(idx) {
        var mediaObject = media[idx];
        var element = _getMarkup(mediaObject);
        list.empty().append(element);
        if (element.is('audio')) {
                audiojs.create(element);
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

/*
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
*/

