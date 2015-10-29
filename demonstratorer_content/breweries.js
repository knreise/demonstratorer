    (function () {
        'use strict';

        var api = new KR.API({
            cartodb: {
                user: 'norkart'
            }

        });

        var datasets = [
            {
                name: 'Bryggerier',
                provider: 'Bryggerier',
                dataset: {
                    api: 'cartodb',
                    table: 'breweries',
                    columns: ['name as title', 'image as thumbnail', '*']
                },
                isStatic: true,
                bbox: true,
                style: {fillcolor: '#FF8000', thumbnail: true},
                cluster: false,
                template: KR.Util.getDatasetTemplate('breweries')
            },
            {
                name: 'Wikipedia',
                provider: 'Wikipedia',
                dataset: {
                    api: 'wikipedia'
                },
                template: KR.Util.getDatasetTemplate('wikipedia'),
                style: {template: true},
                minZoom: 13
            }
        ];

        KR.setupMap(api, datasets, {
            title: 'My title',
            //bbox: '10.162354,59.664273,11.205368,59.959135',
            komm: '0301',
            image: 'http://baconmockup.com/300/200/',
            description: 'Long description here',
            layer: 'norges_grunnkart'
        });

    }());
