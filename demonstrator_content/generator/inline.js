var layerTemplate = _.template('<option value="<%= id %>" <% if(selected) {print("selected") } %>><%= id %></option>');
var datasetTemplate = _.template($('#dataset_template').html());

var api = new KR.API({
    cartodb: {
        apikey: 'e6b96c1e6a71b8b2c6f8dbb611c08da5842f5ff5',
        user: 'knreise'
    }
});

function toggleInputs(element, disabled) {
    var inputs = element.find('select, input:not([type="radio"])');
    if (disabled)  {
        inputs.attr('disabled', 'disabled');
    } else {
        inputs.removeAttr('disabled');
        element.find('input[type="radio"]').prop('checked', true);
    }
}


function buildLimitSelections(ids, municipalities) {
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
            municipalities: municipalities
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
        element.find('select, input').on('change', function (e) {
            if (callback) {
                callback();
            }
        });
    });

    return {
        getValues: function () {
            var values = {};
            if (_.has(extras, ids[selected])) {
                values = extras[ids[selected]];
            }
            return _.reduce(elements[selected].find('select, input'), function (acc, el) {
                acc[el.id] = $(el).val();
                return acc;
            }, values);
        },
        callback: function (cb) {
            callback = cb;
            cb();
        }
    };

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


    element.html(options);

    element.on('change', function (e) {
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

    element.on('change', function (e) {
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


function buildDatasetList(element) {
    var callback;
    var datasetConfig = KR.Config.getDatasetList(api, null);
    var datasets = _.map(datasetConfig, function (value, key) {
        var name = value.name || key;
        var description = value.description || 'Ingen beskrivelse';
        return datasetTemplate({
            name: name,
            key: key,
            description: description
        });
    });
    $('#datasets')
        .html(datasets)
        .sortable().bind('sortupdate', function () {
            callback();
        })
        .find('input[name="datasetsCheckbox"]')
        .change(function (a) {
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
                    return $(checkbox).val();
                })
                .value();
            console.log(checked);

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


function setupClick(element, limits, layer, datasets, title) {

    var generateUrl = function () {
        var params = _.extend(
            {},
            datasets.getValues(),
            limits.getValues(),
            layer.getValues(),
            title.getValues()
        );
        var path = window.location.pathname;
        var url = location.protocol + '//' + location.host + path.replace('/generator.html', '') +  '/config.html?' + KR.Util.createQueryParameterString(params);
        $('.map-link').html('<a href="' + url + '" target="_blank">' + url + '</a>');
    };


    limits.callback(generateUrl);
    layer.callback(generateUrl);
    datasets.callback(generateUrl);

    title.callback(generateUrl);

    element.on('click', generateUrl);
}


getMunicipalityList(function (municipalities) {
    var limits = buildLimitSelections(['municipality', 'line', 'bbox'], municipalities);
    var title = getTitle($('#title'));
    var datasets = buildDatasetList($('#datasets'));
    var layer = buildLayerList($('#layers'));
    setupClick($('#generate'), limits, layer, datasets, title);
});
