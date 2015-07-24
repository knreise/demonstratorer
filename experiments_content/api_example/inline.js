//create an API instance:
var api = new KR.API();


//a bbok to use for ourt queries
var bbox = '9.010277,61.886299,9.9282,62.343127';

//define some datasets

//all from digitalt fortalt (morvegiana)
var digitaltFortalt = {
    api: 'norvegiana',
    dataset: 'difo'
};

//combine two datasets
var combined = {
    api: 'norvegiana',
    dataset: ['MUSIT', 'DiMu']
};

//more specific query on a norvegiana dataset
var query = {
    api: 'norvegiana',
    dataset: 'Kulturminnesok',
    query: 'delving_title:Fangstlokalitet'
};

//articles from wikipedia
var wikipedia = {
    api: 'wikipedia'
};

var byantikvaren = {
    api: 'cartodb',
    table: 'search_1'
};

var verneomraader = {
    api: 'cartodb',
    table: 'naturvernomrader_utm33_2',
    columns: ['iid', 'omradenavn', 'vernef_id', 'verneform']
};

var fangstgroper = {
    api: 'kulturminnedata',
    query: "Navn='Fangstgrop'",
    layer: 0
};


//wrap the datasets in layer
var layers = [
    {
        name: 'Digitalt fortalt (norvegiana)',
        dataset: digitaltFortalt,
    },
    {
        name: 'Museumsdata (norvegiana)',
        dataset: combined,
    },
    {
        name: 'Fangstlokalitet (norvegiana)',
        dataset: query,
    },
    {
        name: 'Wikipedia',
        dataset: wikipedia,
    },
    {
        name: 'Byantikvaren (cartodb)',
        dataset: byantikvaren,
    },
    {
        name: 'Verneområder (cartodb)',
        dataset: verneomraader,
    },
    {
        name: 'Fangstgroper (ArcGIS REST)',
        dataset: fangstgroper
    }
];

var errorCallback = function (response) {
    console.log(response);
}

var placeholder = $('#placeholder');
_.each(layers, function (layer) {
    var div = $('<div></div>')
    div.append('<h3>' + layer.name + '</h3>');
    var button = $('<button type="button">Hent data</button>').on('click', function () {
        api.getBbox(layer.dataset, bbox, function (res) {
            console.log(res);
        }, errorCallback);
    });
    div.append([button]);
    placeholder.append(div);
});