<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body>
        <h1>KNREISE - demonstratorer</h1>
        <ul>{{ _.each(demonstrators, function (demonstrator) { }}
            <li><a href="demonstratorer/{{= demonstrator.key }}.html">{{= demonstrator.name }}</a></li>{{ }) }}
            <li><a href="demonstratorer/style.html">Stiler</a></li>
        </ul>
    </body>
</html>