<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">

{{ _.each(cssLinks, function (style) { }}
        <link href='../{{= style }}' rel='stylesheet' />{{ } ) }}

    </head>
    <body>

<div id="sidebar"></div>
<div id="map"></div>



<script type="text/template" id="description_template">
{{= desc }}
</script>



{{= template_markup }}

{{ _.each(scriptLinks, function (script) { }}
        <script src="../{{= script }}" type="text/javascript"></script>{{ }) }}
        <script type="text/javascript">
            var title = '{{= name }}';
            {{= inline_js }}
        </script>
    </body>
</html>
