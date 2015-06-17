var municipalityTemplate = _.template('<option value="<%= komm %>"><%= navn %></option>');
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

function buildMunicipalityList(element) {
    var dataset = {
        api: 'cartodb',
        query: 'SELECT komm, navn FROM kommuner ORDER BY navn',
        mapper: function (data) {
            return data.rows;
        }
    };

    api.getData(dataset, function (response) {
        element.html(_.map(response, municipalityTemplate));
    });

    return {
        getSelected: function () {
            return element.val();
        }
    };
}


function buildLayerList(element) {
    var selected = 'norges_grunnkart_graatone';

    var options = _.chain(L.tileLayer.kartverket.getLayers())
        .map(function (layer) {
            return {id: layer, selected: layer === selected};
        })
        .map(layerTemplate)
        .value();

    element.html(options);

    return {
        getSelected: function () {
            return element.val();
        }
    };
}

function buildDatasetList(element) {

    var datasetConfig = KR.Config.getDatasetList(api, null);
    var radios = _.map(datasetConfig, function (value, key) {
        var name = value.name || key;
        return datasetTemplate({name: name, key: key});
    });

    element.html(radios);

    return {
        getSelected: function () {
            return element.find('input[type=checkbox]:checked').map(function () {
                return this.value;
            }).get();
        }
    };
}


function setupClick(element, municipalities, datasets, layer) {

    var lineElement = $('#line');
    lineElement.keyup(function () {

        if (lineElement.val() !== '') {
            $('#municipalities').attr('disabled', 'disabled');
        } else {
            $('#municipalities').removeAttr('disabled');
        }
    });

    element.on('click', function () {
        var selectedDatasets = datasets.getSelected().join(',');

        if (!selectedDatasets.length) {
            $('#link').html('');
            return;
        }

        var params = {
            layer: layer.getSelected(),
            datasets: selectedDatasets
        };

        var line = lineElement.val();
        if (line !== '') {
            params.line = line;
            params.allstatic = true;

            var buffer = $('#buffer').val();
            if (buffer !== '') {
                params.buffer = buffer;
            }
        } else {
            params.komm =  municipalities.getSelected();
        }

        params = KR.Util.createQueryParameterString(params);
        var path = window.location.pathname;
        var url = location.protocol + '//' + location.host + path.replace('/generator.html', '') +  '/config.html?' + params;

        $('#link').html('<a href="' + url + '" target="_blank">' + url + '</a>');
    });
}

var municipalities = buildMunicipalityList($('#municipalities'));
var datasets = buildDatasetList($('#datasets'));
var layer = buildLayerList($('#layers'));
setupClick($('#generate'), municipalities, datasets, layer);
