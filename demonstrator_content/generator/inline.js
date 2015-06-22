var layerTemplate = _.template('<option value="<%= id %>" <% if(selected) {print("selected") } %>><%= id %></option>');
var datasetTemplate = _.template(
    '<div class="checkbox">' +
        '<label>' +
        '<input type="checkbox" name="datasets" id="<%= key %>" value="<%= key %>">' +
        '<%= name %>' +
        '</label>' +
    '</div>'
);

var api = new KR.API({
    cartodb: {
        apikey: 'e6b96c1e6a71b8b2c6f8dbb611c08da5842f5ff5',
        user: 'knreise'
    }
});


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
            element.find('select, input').attr('disabled', 'disabled');
        }
        return element;
    });

    _.each(elements, function (element, index) {
        element.on('click', function () {
            _.each(elements, function (e, idx) {
                if (idx === index) {
                    elements[idx].find('select, input').removeAttr('disabled');
                    selected = index;
                } else {
                    elements[idx].find('select, input').attr('disabled', 'disabled');
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

    var options = _.chain(L.tileLayer.kartverket.getLayers())
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

function buildDatasetList(element) {
    var callback;
    var datasetConfig = KR.Config.getDatasetList(api, null);
    var checkboxes = _.map(datasetConfig, function (value, key) {
        var name = value.name || key;
        return datasetTemplate({name: name, key: key});
    });

    element.html(checkboxes);

    _.each(element.find('input'), function (checkbox) {
        $(checkbox).on('change', function () {
            callback();
        });
    })

    return {
        getValues: function () {
            var checked = element.find('input[type=checkbox]:checked').map(function () {
                return this.value;
            }).get();
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


function setupClick(element, limits, layer, datasets) {

    var generateUrl = function () {
        var params = _.extend({}, limits.getValues(), layer.getValues(), datasets.getValues());
        var path = window.location.pathname;
        var url = location.protocol + '//' + location.host + path.replace('/generator.html', '') +  '/config.html?' + KR.Util.createQueryParameterString(params);
        $('#link').html('<a href="' + url + '" target="_blank">' + url + '</a>');
    };


    limits.callback(generateUrl);
    layer.callback(generateUrl);
    datasets.callback(generateUrl);

    element.on('click', generateUrl);
}


getMunicipalityList(function (municipalities) {
    var limits = buildLimitSelections(['municipality', 'line', 'bbox'], municipalities);

    var datasets = buildDatasetList($('#datasets'));
    var layer = buildLayerList($('#layers'));
    setupClick($('#generate'), limits, layer, datasets);
});
