var api = new KR.API({
    cartodb: {
        apikey: 'e6b96c1e6a71b8b2c6f8dbb611c08da5842f5ff5',
        user: 'knreise'
    }
});


var dataset = {
    api: 'cartodb',
    query: 'SELECT komm, navn FROM kommuner ORDER BY navn',
    mapper: function (data) {return data.rows; }
};

api.getData(dataset, function (response) {
    var options = _.map(response, function (komm) {
        return $('<option value="' + komm.komm + '">' + komm.navn + '</option>');
    });
    $('#municipalities').html(options);
});


var datasetConfig = getDatasetList(api, null);

var radios = _.map(datasetConfig, function (value, key) {

    var name = value.name || key;

    return $('<div class="checkbox">' +
        '<label>' +
        '<input type="checkbox" name="datasets" id="' + key + '" value="' + key + '">' +
        name +
        '</label>' +
    '</div>');
});

$('#datasets').html(radios);

$('#generate').on('click', function () {

    var komm = $('#municipalities').val();
    var checkedVals = $('#datasets input[type=checkbox]:checked').map(function() {
        return this.value;
    }).get();

    if (checkedVals.length) {
        var params = KR.Util.createQueryParameterString({
            komm: komm,
            datasets: checkedVals.join(',')
        });

        var path = window.location.pathname;
        var url = location.protocol + '//' + location.host + path.replace('/generator.html', '') +  '/config.html?' + params;

        $('#link').html('<a href="' + url + '" target="_blank">' + url + '</a>');
    } else {
        $('#link').html('');
    }
});