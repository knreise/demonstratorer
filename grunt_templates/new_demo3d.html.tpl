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

        <div id="topbar" class="navbar-header">

            <a class="navbar-brand pull-left" rel="home" href="#" title="Folgefonna" style="padding-top: 0px;">
                <img src="../common/img/Kulturradet_simple.png" class="navbar-logo"></img>
            </a>
            <p class="navbar-text" id="page_title"></p>
            <button id="playpause" type="button" class="btn btn-default navbar-btn hidden">
                <span class="glyphicon glyphicon-play" aria-hidden="true"></span>
            </button>

        </div>


        <div id="cesium-sidebar"></div>

        <div class="spinner-wrapper">
            <div class="spinner"></div>
        </div>

        <div id="cesium-viewer"></div>


        {{= data.template_markup }}

{{ _.each(data.scriptLinks, function (script) { }}
        <script src="../{{= script }}" type="text/javascript"></script>{{ }) }}
        <script type="text/javascript">
            {{= data.inline_js }}
        </script>
    </body>
</html>
