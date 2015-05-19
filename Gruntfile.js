module.exports = function(grunt) {

  var userConfig = require( './build.config.js' );

  // Project configuration.
  var taskConfig = {

    pkg: grunt.file.readJSON('package.json'),

    "file-creator": {

      "build-index": {
        'index.html': function(fs, fd, done) {
            grunt.util._.templateSettings.interpolate = /\{\{=(.+?)\}\}/g;
            grunt.util._.templateSettings.evaluate =  /\{\{(.+?)\}\}/g;
            var t = grunt.util._.template(fs.readFileSync('grunt_templates/index.html.tpl', 'utf8'));
            fs.writeSync(fd, t({demonstrators: userConfig.demonstrators}));
            done(); 
          }
        },

      "build-demos": {
        files: grunt.util._.map(userConfig.demonstrators, function (demonstrator) {
            return {
              file: 'demonstratorer/' + demonstrator.key + '.html',
              method: function(fs, fd, done) {
                  grunt.util._.templateSettings.interpolate = /\{\{=(.+?)\}\}/g;
                  grunt.util._.templateSettings.evaluate =  /\{\{(.+?)\}\}/g;
                var t = grunt.util._.template(fs.readFileSync('./grunt_templates/demonstrator.html.tpl', 'utf8'));
                demonstrator.template_markup = grunt.util._.map(demonstrator.templates, function (template) {
                  var arr = ['<script type="text/template" id="' + template + '_template">'];
                  arr.push(fs.readFileSync('templates/' + template + '.tmpl', 'utf8'));
                  arr.push('</script>');
                  arr.push('\n');
                  return arr.join('\n');
                }).join('\n');

                demonstrator.html = fs.readFileSync('./demonstrator_content/' + demonstrator.key + '/html.html', 'utf8');
                demonstrator.inline_js = fs.readFileSync('./demonstrator_content/' + demonstrator.key + '/inline.js', 'utf8');

                demonstrator.scriptLinks = userConfig.commonScripts.concat(demonstrator.scripts);

                fs.writeSync(fd, t(demonstrator));
                done(); 
              }
            };
          })
      }
    },
    watch: {
      scripts: {
        files: ['./demonstrator_content/**/*.js', './build.config.js'],
        tasks: ['default'],
        options: {
          spawn: true,
        }
      }
    }
  };

  grunt.initConfig( grunt.util._.extend( taskConfig, userConfig ) );

  grunt.loadNpmTasks('grunt-file-creator');
  grunt.loadNpmTasks('grunt-contrib-watch');

  grunt.registerTask('default', ['file-creator:build-demos', 'file-creator:build-index']);
};