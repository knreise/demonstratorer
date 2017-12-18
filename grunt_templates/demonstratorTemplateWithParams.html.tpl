<!DOCTYPE html>
<html lang='en'>
    <head>
        <meta charset='utf-8'>
        <meta http-equiv='X-UA-Compatible' content='IE=edge'>
        <meta name='viewport' content='width=device-width, initial-scale=1'>
        <title>KNReise - demonstratorer</title>
    </head>

    <body>

        <div id='sidebar'></div>
        <div id='map'></div>

        <script type='text/javascript' src='../setupMap.bundle.js'></script>
        <script type='text/javascript'>

            (function () {

                var title = '{{= data.name }}';
                var image = '{{= data.image }}';

                var params = {{=data.params}};

                window.setupMapFromUrl(params.datasets, params);

            }());

        </script>
    </body>
</html>
