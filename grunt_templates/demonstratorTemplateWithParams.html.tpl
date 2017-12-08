<!DOCTYPE html>
<html lang='en'>
    <head>
        <meta charset='utf-8'>
        <meta http-equiv='X-UA-Compatible' content='IE=edge'>
        <meta name='viewport' content='width=device-width, initial-scale=1'>
        <title>KNReise - demonstratorer</title>
        <link href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-BVYiiSIFeK1dGmJRAkycuHAHRg32OmUcww7on3RYdg4Va+PmSTsz/K68vbdEjh4u" crossorigin="anonymous">
    </head>

    <body>

        <div id='sidebar'></div>
        <div id='map'></div>

        <script src="../knreiseApi.js" type="text/javascript"></script>
        <script type='text/javascript' src='../../dist/setupMap.bundle.js'></script>
        <script type='text/javascript'>

            (function () {

                var title = '{{= data.name }}';
                var image = '{{= data.image }}';

                var api = new KR.API({
                    flickr: {
                        apikey: 'ab1f664476dabf83a289735f97a6d56c'
                    },
                    jernbanemuseet: {
                        apikey: '336a8e06-78d9-4d2c-84c9-ac4fab6e8871'
                    }
                });

                var params = {{=data.params}};

                window.setupMapFromUrl(api, params.datasets, params);

            }());

        </script>
    </body>
</html>
