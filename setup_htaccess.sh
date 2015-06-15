Header add Access-Control-Allow-Origin "*"
Header add Access-Control-Allow-Headers "origin, x-requested-with, content-type"

<IfModule mod_headers.c>
    <FilesMatch "\.(png|jpeg)$">
        SetEnvIf Origin ":" IS_CORS
        Header Set Access-Control-Allow-Origin "*" env=IS_CORS
    </FilesMatch>
</IfModule>

AddType application/octet-stream terrain
AddEncoding gzip terrain