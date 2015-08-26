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

            var title = '{{= data.name }}';
            var image = '{{= data.image }}';

            {{= data.inline_js }}
        </script>
    </body>
</html>
