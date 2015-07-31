<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">

{{ _.each(cssLinks, function (style) { }}
        <link href='../{{= style }}' rel='stylesheet' />{{ } ) }}

    </head>
    <body>

        <div id="topbar" class="navbar-header">

            <a class="navbar-brand pull-left" rel="home" href="#" title="Folgefonna" style="padding-top: 0px;">
                <img src="../common/img/Kulturradet_simple.png" class="navbar-logo"></img>
            </a>
            <p class="navbar-text"></p>
            <button id="playpause" type="button" class="btn btn-default navbar-btn hidden">
                <span class="glyphicon glyphicon-play" aria-hidden="true"></span>
            </button>

        </div>


        <div id="cesium-sidebar"></div>

        <div class="spinner-wrapper">
            <div class="spinner"></div>
        </div>

        <div id="cesium-viewer"></div>


        {{= template_markup }}

{{ _.each(scriptLinks, function (script) { }}
        <script src="../{{= script }}" type="text/javascript"></script>{{ }) }}
        <script type="text/javascript">
            {{= inline_js }}
        </script>
    </body>
</html>
