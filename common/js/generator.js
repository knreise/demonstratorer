/*global L:false, window:false, location:false */

var KR = this.KR || {};

/*
    (messy?) Code for setting up the generator
*/

(function () {
    'use strict';

    var layerTemplate = _.template('<option value="<%= id %>" <% if(selected) {print("selected") } %>><%= id %></option>');
    var datasetTemplate = _.template($('#dataset_template').html());

    var api = new KR.API();

    function toggleInputs(element, disabled) {
        var inputs = element.find('select, input:not([type="radio"])');
        if (disabled) {
            inputs.attr('disabled', 'disabled');
        } else {
            inputs.removeAttr('disabled');
            element.find('input[type="radio"]').prop('checked', true);
        }
    }


    function buildLimitSelections(ids, municipalities, counties) {
        var callback;
        var selected = 0;

        var extras = {
            'line': {
                allstatic: true
            }
        };

        var elements = _.map(ids, function (id, idx) {
            var template = _.template($('#' + id + '_template').html());
            var element = $('#' + id + '_container').html(template({
                municipalities: municipalities,
                counties: counties
            }));
            if (idx !== selected) {
                toggleInputs(element, true);
            } else {
                toggleInputs(element, false);
            }
            return element;
        });

        _.each(elements, function (element, index) {
            element.on('click', function () {
                _.each(elements, function (e, idx) {
                    if (idx === index) {
                        toggleInputs(elements[idx], false);
                        selected = index;
                    } else {
                        toggleInputs(elements[idx], true);
                    }
                    if (callback) {
                        callback();
                    }
                });
            });
        });

        _.each(elements, function (element) {
            element.find('select, input').on('change', function () {
                if (callback) {
                    callback();
                }
            });
        });

        var map = L.map('bbox_map').fitBounds(L.latLngBounds.fromBBoxString('3.779297,57.751076,31.464844,71.357067'));
        L.tileLayer.kartverket('norges_grunnkart').addTo(map);
        map.on('moveend', function () {
            $('#bbox').val(map.getBounds().toBBoxString());
            callback();
        });

        return {
            getValues: function () {
                var values = {};
                if (_.has(extras, ids[selected])) {
                    values = extras[ids[selected]];
                }
                return _.reduce(elements[selected].find('select, input'), function (acc, el) {
                    if (el.id && $(el).val()) {
                        acc[el.id] = $(el).val();
                    }
                    return acc;
                }, values);
            },
            callback: function (cb) {
                callback = cb;
                cb();
            }
        };

    }

    function getCountyList(callback) {
        var dataset = {
            api: 'cartodb',
            query: 'SELECT fylkesnr, navn FROM fylker ORDER BY navn',
            mapper: function (data) {
                return data.rows;
            }
        };

        api.getData(dataset, callback);
    }

    function getMunicipalityList(callback) {
        var dataset = {
            api: 'cartodb',
            query: 'SELECT komm, navn FROM kommuner ORDER BY navn',
            mapper: function (data) {
                return data.rows;
            }
        };

        api.getData(dataset, callback);
    }


    function buildLayerList(element) {
        var callback;
        var selected = 'norges_grunnkart_graatone';

        var layers = L.tileLayer.kartverket.getLayers();
        layers = layers.concat(['nib', 'hist']);

        var options = _.chain(layers)
            .map(function (layer) {
                return {id: layer, selected: layer === selected};
            })
            .map(layerTemplate)
            .value();

        var map = L.map('layers_map').setView([65.5, 17.0], 4);
        var layer = L.tileLayer.kartverket(selected).addTo(map);

        element.html(options);

        element.on('change', function () {
            if (layer) {
                map.removeLayer(layer);
            }
            var layerName = element.val();

            KR.Util.getBaseLayer(layerName, function (l) {
                if (l) {
                    layer = l;
                    layer.addTo(map);
                } else {
                    layer = null;
                }
            });
            callback();
        });

        return {
            getValues: function () {
                return {layer: element.val()};
            },
            callback: function (cb) {
                callback = cb;
                cb();
            }
        };
    }

    function getTitle(element) {
        var callback;

        element.on('change', function () {
            callback();
        });

        return {
            getValues: function () {
                var title = element.val();
                if (title !== '') {
                    return {title: title};
                }
                return {};
            },
            callback: function (cb) {
                callback = cb;
                cb();
            }
        };
    }


    function buildDatasetList() {
        var callback;
        var datasetConfig = KR.Config.getDatasetList(api, null);

        var datasets = _.chain(datasetConfig)
            .map(function (value, key) {
                if (value.hideFromGenerator) {
                    return;
                }
                var name = value.name || key;
                var description = value.description || 'Ingen beskrivelse';
                var allowTopic = !!(value.allowTopic && value.dataset && value.dataset.api === 'norvegiana');
                return datasetTemplate({
                    name: name,
                    key: key,
                    description: description,
                    allowTopic: allowTopic
                });
            })
            .compact()
            .value();

        $('#datasets')
            .html(datasets)
            .sortable().bind('sortupdate', function () {
                callback();
            })
            .find('input[name="datasetsCheckbox"]')
            .change(function (e) {
                var id = $(e.target).val();
                var topic = $('#' + id + '-topic');
                if (topic) {
                    if (e.target.checked) {
                        topic.removeAttr('disabled');
                    } else {
                        topic.attr('disabled', 'disabled');
                    }
                }
                callback();
            });


        $('#datasets').find(':text').on('keyup', function () {
            callback();
        });

        return {
            getValues: function () {
                var checkboxes = $('#datasets').find('input[name="datasetsCheckbox"]');
                var checked = _.chain(checkboxes)
                    .filter(function (checkbox) {
                        return checkbox.checked;
                    })
                    .map(function (checkbox) {
                        var value = $(checkbox).val();
                        var input = $(checkbox).parent().parent().find(':text');
                        if (input && input.val() && input.val() !== '') {
                            value += ':' + input.val();
                        }
                        return value;
                    })
                    .value();

                return {
                    datasets: checked.join(',')
                };
            },
            callback: function (cb) {
                callback = cb;
                cb();
            }
        };
    }

    function buildFilter() {
        var callback;

        var geomFilter = $('#geomFilter_cb');
        var showGeom = $('#showGeom_cb');
        geomFilter.click(function () {
            if (showGeom.is(':checked')) {
                showGeom.prop('checked', false);
            }
            callback();
        });

        showGeom.click(function () {
            if (!geomFilter.is(':checked')) {
                geomFilter.prop('checked', true);
            }
            callback();
        });

        return {
            getValues: function () {
                return {
                    geomFilter: geomFilter.is(':checked'),
                    showGeom: showGeom.is(':checked')
                };
            },
            callback: function (cb) {
                callback = cb;
                cb();
            }
        };
    }

    function setupClick(element, limits, layer, datasets, title, filters) {
        var use3d = false;

        var getParams = function () {
            var params = _.extend(
                {},
                datasets.getValues(),
                limits.getValues(),
                layer.getValues(),
                title.getValues()
            );

            if (_.has(params, 'komm') || _.has(params, 'fylke')) {
                params = _.extend(params, filters.getValues());
            }
            return params;
        }

        var generateUrl = function () {
            var params = getParams();
            var path = window.location.pathname;
            var page = '/config.html';
            if (use3d) {
                page = '/config_3d.html';
            }

            var url = location.protocol + '//' + location.host + path.replace('/generator.html', '') + page + '?' + KR.Util.createQueryParameterString(params);
            $('.map-link').html('<a href="' + url + '" target="_blank">' + url + '</a>');
        };


        limits.callback(generateUrl);
        layer.callback(generateUrl);
        datasets.callback(generateUrl);
        title.callback(generateUrl);
        filters.callback(generateUrl);

        element.on('click', generateUrl);

        $('#show-params').on('click', function () {
            var params = getParams();
            params.datasets = params.datasets.split(',');
            $('#params').html(JSON.stringify(params, null, 2));
        });

        $('#3d').on('change', function () {
            use3d = this.checked;
            generateUrl();
        });
    }

    KR.initGenerator = function () {
        var counties, municipalities;

        var fetched = _.after(2, function () {
            var limits = buildLimitSelections(['municipality', 'county', 'line', 'bbox'], municipalities, counties);
            var title = getTitle($('#title'));
            var datasets = buildDatasetList($('#datasets'));
            var layer = buildLayerList($('#layers'));
            var filters = buildFilter();
            setupClick($('#generate'), limits, layer, datasets, title, filters);
        });


        getCountyList(function (res) {
            counties = res;
            fetched();
        });


        getMunicipalityList(function (res) {
            municipalities = res;
            fetched();
        });
    };
}());
