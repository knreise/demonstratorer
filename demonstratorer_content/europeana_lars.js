(function () {
    'use strict';

    var api = new KR.API({
        europeana: {
            apikey: 'pYEaya4fK'
        }
    });

    var providers = ['Riksantikvarieämbetet'];
    var colors = ['#ff7373'];
    var countries = ['Sweden']

/*    var datasets = _.map(countries, function (country, i) {
        return {
            name: providers[i],
            hideFromGenerator: true,
            provider: 'Europeana',
            dataset: {
                api: 'europeana',
                /\*query: 'DATA_PROVIDER:"Riksantikvarieämbetet" AND COUNTRY:"' + country.toLowerCase() + '"'*\/
                query: 'kyrka+Eskilstuna&edmPreview=true&qf=DATA_PROVIDER:"Riksantikvarieämbetet" AND COUNTRY:"' + country.toLowerCase() + '"'
            },
            bbox: true,
            isStatic: true,
            template: KR.Util.getDatasetTemplate('europeana280_2'),
            style: {
                thumbnail: true,
                fillcolor: colors[i]
                },
            description: 'Riksantikvarieämbetet från K-samsök'
        };
    });*/

    /*&query=kyrka&edmPreview=true&qf=DATA_PROVIDER:"Riksantikvarieämbetet"*/

    var datasets = [
         {
            name: 'Castles - Norway',
            hideFromGenerator: true,
            provider: 'Europeana',
            dataset: {
                api: 'europeana',
                query: 'castle',
                qf: 'COUNTRY:"norway"'
            },
            bbox: true,
            isStatic: true,
            template: KR.Util.getDatasetTemplate('europeana280_2'),
            style: {
                thumbnail: true,
                fillcolor: '#ff0000'
                },
            minZoom: 5,
            description: 'Fritekstsøk på Castle'
        },
        {
            name: 'Castles - Sweden',
            hideFromGenerator: true,
            provider: 'Europeana',
            dataset: {
                api: 'europeana',
                query: 'castle',
                qf: 'COUNTRY:"sweden"'
            },
            bbox: true,
            isStatic: true,
            template: KR.Util.getDatasetTemplate('europeana280_2'),
            style: {
                thumbnail: true,
                fillcolor: '#0000ff'
                },
            minZoom: 5,
            description: 'Fritekstsøk på Castle'
        },
        {
            name: 'Castles - Latvia',
            hideFromGenerator: true,
            provider: 'Europeana',
            dataset: {
                api: 'europeana',
                query: 'castle',
                qf: 'COUNTRY:"latvia"'
            },
            bbox: true,
            isStatic: true,
            template: KR.Util.getDatasetTemplate('europeana280_2'),
            style: {
                thumbnail: true,
                fillcolor: '#00ee00'
                },
            minZoom: 5,
            description: 'Fritekstsøk på Castle'
        }
        ,
        {
            name: 'Castles - Estonia',
            hideFromGenerator: true,
            provider: 'Europeana',
            dataset: {
                api: 'europeana',
                query: 'castle',
                qf: 'COUNTRY:"estonia"'
            },
            bbox: true,
            isStatic: true,
            template: KR.Util.getDatasetTemplate('europeana280_2'),
            style: {
                thumbnail: true,
                fillcolor: '#00ffff'
                },
            minZoom: 5,
            description: 'Fritekstsøk på Castle'
        },
        {
            name: 'Castles - Lithuania',
            hideFromGenerator: true,
            provider: 'Europeana',
            dataset: {
                api: 'europeana',
                query: 'castle',
                qf: 'COUNTRY:"lithunia"'
            },
            bbox: true,
            isStatic: true,
            template: KR.Util.getDatasetTemplate('europeana280_2'),
            style: {
                thumbnail: true,
                fillcolor: '#ff0000'
                },
            minZoom: 5,
            description: 'Fritekstsøk på Castle'
        }
        ,
        {
            name: 'Castles - Poland',
            hideFromGenerator: false,
            provider: 'Europeana',
            dataset: {
                api: 'europeana',
                query: 'castle',
                qf: 'COUNTRY:"poland"'
            },
            bbox: true,
            isStatic: true,
            template: KR.Util.getDatasetTemplate('europeana280_2'),
            style: {
                thumbnail: true,
                fillcolor: '#b3b300'
                },
            minZoom: 5,
            description: 'Fritekstsøk på Castle'
        }
        ,
        {
            name: 'Castles - Germany',
            hideFromGenerator: true,
            provider: 'Europeana',
            dataset: {
                api: 'europeana',
                query: 'castle',
                qf: 'COUNTRY:"germany"'
            },
            bbox: true,
            isStatic: true,
            template: KR.Util.getDatasetTemplate('europeana280_2'),
            style: {
                thumbnail: true,
                fillcolor: '#5500ff'
                },
            minZoom: 5,
            description: 'Fritekstsøk på Castle'
        }
		 ,
        {
            name: 'Castles - France',
            hideFromGenerator: true,
            provider: 'Europeana',
            dataset: {
                api: 'europeana',
                query: 'castle',
                qf: 'COUNTRY:"france"'
            },
            bbox: true,
            isStatic: true,
            template: KR.Util.getDatasetTemplate('europeana280_2'),
            style: {
                thumbnail: true,
                fillcolor: '#ffff00'
                },
            minZoom: 5,
            description: 'Fritekstsøk på Castle'
        }
		,
        {
            name: 'Castles - United Kingdom',
            hideFromGenerator: true,
            provider: 'Europeana',
            dataset: {
                api: 'europeana',
                query: 'castle',
                qf: 'COUNTRY:"unitedkingdom"'
            },
            bbox: true,
            isStatic: true,
            template: KR.Util.getDatasetTemplate('europeana280_2'),
            style: {
                thumbnail: true,
                fillcolor: '#cc0000'
                },
            minZoom: 5,
            description: 'Fritekstsøk på Castle'
        }
		,
        {
            name: 'Castles - Hungary',
            hideFromGenerator: true,
            provider: 'Europeana',
            dataset: {
                api: 'europeana',
                query: 'castle',
                qf: 'COUNTRY:"hungary"'
            },
            bbox: true,
            isStatic: true,
            template: KR.Util.getDatasetTemplate('europeana280_2'),
            style: {
                thumbnail: true,
                fillcolor: '#3333ff'
                },
            minZoom: 5,
            description: 'Fritekstsøk på Castle'
        }
		,
        {
            name: 'Castles - Europe',
            hideFromGenerator: true,
            provider: 'Europeana',
            dataset: {
                api: 'europeana',
                query: 'castle',
                qf: 'COUNTRY:"europe"'
            },
            bbox: true,
            isStatic: true,
            template: KR.Util.getDatasetTemplate('europeana280_2'),
            style: {
                thumbnail: true,
                fillcolor: '#ff751a'
                },
            minZoom: 5,
            description: 'Fritekstsøk på Castle'
        }

/*,
         {
            name: 'Akershus (NOR)',
            hideFromGenerator: true,
            provider: 'Europeana - Kulturrådet (Akershusbasen)',
            dataset: {
                api: 'europeana',
                query: 'kirke',
                qf: 'DATA_PROVIDER:"Akershusbasen" AND COUNTRY:"norway"'
            },
            bbox: true,
            isStatic: true,
            template: KR.Util.getDatasetTemplate('europeana280_2'),
            style: {
                thumbnail: true,
                fillcolor: '#0000ff'
                },
            description: 'Akershusbasen fra Digitalt museum'
        }*/
        
    ];    

    var layer = L.tileLayer('https://api.mapbox.com/styles/v1/vemundolstad/ciptnvtke003dcxmbfp6twjlr/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoidmVtdW5kb2xzdGFkIiwiYSI6ImNpcHRsNW8yOTAwMzVoem0yN3kyZ3B6eXcifQ.E8botDAcNDcki0fCncD4Gw') 

    KR.setupMap(api, datasets, {
        title: title,
        bbox: '-28.828125,46.40625,34.1618181612,71.9653876991',
        image: 'https://www.europeana.eu/api/v2/thumbnail-by-url.json?size=w400&uri=https%3A%2F%2Fwww.dropbox.com%2Fs%2Fqpl39c1v2bj3q67%2FNO_Munch_The_Scream_NG.M.00939.jpg%3Fraw%3D1&size=LARGE&type=IMAGE',
        description: $('#description_template').html(),
        geomFilter: true,
        showGeom: true,
        showScaleBar: true,
        fillcolor: '#ddb522',
        minZoom: 4,
        layer: layer
    });
}());
