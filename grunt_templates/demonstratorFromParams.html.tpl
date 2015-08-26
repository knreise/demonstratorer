<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">

        <title>KNReise - {{= data.name }}</title>

{{ _.each(data.cssLinks, function (style) { }}
        <link href='../{{= style }}' rel='stylesheet' />{{ } ) }}

    </head>
    <body>

<div id="sidebar"></div>
<div id="map"></div>



<script type="text/template" id="description_template">
{{= data.desc }}
</script>



{{= data.template_markup }}

{{ _.each(data.scriptLinks, function (script) { }}
        <script src="../{{= script }}" type="text/javascript"></script>{{ }) }}
        <script type="text/javascript">

            
            (function () {
                'use strict';

                var title = '{{= data.name }}';
                var image = '{{= data.image }}';

                var qs = {{=data.params}};

                //set up an instance of the Norvegiana API
                var api = new KR.API({
                    flickr: {
                        apikey: 'ab1f664476dabf83a289735f97a6d56c'
                    },
                    jernbanemuseet: {
                        apikey: '336a8e06-78d9-4d2c-84c9-ac4fab6e8871'
                    }
                });

                if (qs.title && !title) {
                    $('title').append(qs.title);
                }

                if (qs.norvegianaCollection) {
                    KR.setupCollectionMap(api, qs.norvegianaCollection, qs.layer);
                } else {
                    KR.setupMapFromUrl(api, qs.datasets, qs);
                }

            }());
        </script>
    </body>
</html>
