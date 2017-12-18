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

        <script type="text/template" id="description_template">
            {{= data.desc }}
        </script>

        <script type='text/javascript' src='../setupMap.bundle.js'></script>
        <script type='text/javascript'>

            var title = '{{= data.name }}';
            var image = '{{= data.image }}';

            {{= data.inline_js }}
        </script>
    </body>
</html>
