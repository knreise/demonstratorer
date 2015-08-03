module.exports = function(grunt) {

  var userConfig = require( './build.config.js' );

  // Project configuration.
  var taskConfig = {

    pkg: grunt.file.readJSON('package.json'),

    "file-creator": {

      "build-index": {
        'experiments/index.html': function(fs, fd, done) {
            grunt.util._.templateSettings.interpolate = /\{\{=(.+?)\}\}/g;
            grunt.util._.templateSettings.evaluate =  /\{\{(.+?)\}\}/g;
            var t = grunt.util._.template(fs.readFileSync('grunt_templates/examples.html.tpl', 'utf8'));
            fs.writeSync(fd, t({demonstrators: userConfig.experiments}));
            done(); 
          }
        },

      "build-demos": {
        files: grunt.util._.map(grunt.util._.filter(userConfig.demonstrators, function (d) {return !d.url;}), function (demonstrator) {
            return {
              file: 'demonstratorer/' + demonstrator.id + '.html',
              method: function(fs, fd, done) {

                  grunt.util._.templateSettings.interpolate = /\{\{=(.+?)\}\}/g;
                  grunt.util._.templateSettings.evaluate =  /\{\{(.+?)\}\}/g;

                  var t = grunt.util._.template(fs.readFileSync('./grunt_templates/new_demo.html.tpl', 'utf8'));

                  var template_markup = grunt.util._.map(userConfig.demoTemplates, function (template) {
                      var arr = ['<script type="text/template" id="' + template + '_template">'];
                      arr.push(fs.readFileSync('templates/' + template + '.tmpl', 'utf8'));
                      arr.push('</script>');
                      arr.push('\n');
                      return arr.join('\n');
                  }).join('\n');

                  var demo_template_markup = grunt.util._.map(userConfig.demoDatasetTemplates, function (template) {
                      var arr = ['<script type="text/template" id="' + template + '_template">'];
                      arr.push(fs.readFileSync('templates/datasets/' + template + '.tmpl', 'utf8'));
                      arr.push('</script>');
                      arr.push('\n');
                      return arr.join('\n');
                  }).join('\n');

                  demonstrator.template_markup = template_markup.concat(demo_template_markup);

                  if (!demonstrator.image) {
                    demonstrator.image = null;
                  }

                  demonstrator.desc = fs.readFileSync('demonstratorer/desc_' + demonstrator.id + '.txt', 'utf8');
                  demonstrator.inline_js = fs.readFileSync('demonstratorer/' + demonstrator.id + '.js', 'utf8');
                  demonstrator.scriptLinks = userConfig.demoScriptsExternal.concat(['dist/scripts.min.js']);
                  demonstrator.cssLinks = userConfig.demoCssExternal.concat(['dist/style.css']);

                  fs.writeSync(fd, t(demonstrator));
                  done(); 
              }
            };
          })
      },

      "build-generators": {
        'demonstratorer/config.html': function (fs, fd, done) {
            var demonstrator = {};
            grunt.util._.templateSettings.interpolate = /\{\{=(.+?)\}\}/g;
            grunt.util._.templateSettings.evaluate =  /\{\{(.+?)\}\}/g;
            var t = grunt.util._.template(fs.readFileSync('./grunt_templates/new_demo.html.tpl', 'utf8'));

            var template_markup = grunt.util._.map(userConfig.demoTemplates, function (template) {
                var arr = ['<script type="text/template" id="' + template + '_template">'];
                arr.push(fs.readFileSync('templates/' + template + '.tmpl', 'utf8'));
                arr.push('</script>');
                arr.push('\n');
                return arr.join('\n');
            }).join('\n');

            var demo_template_markup = grunt.util._.map(userConfig.demoDatasetTemplates, function (template) {
                var arr = ['<script type="text/template" id="' + template + '_template">'];
                arr.push(fs.readFileSync('templates/datasets/' + template + '.tmpl', 'utf8'));
                arr.push('</script>');
                arr.push('\n');
                return arr.join('\n');
            }).join('\n');

            demonstrator.template_markup = template_markup.concat(demo_template_markup);

            demonstrator.image = null;
            demonstrator.desc = null;
            demonstrator.name = null;

            demonstrator.inline_js = fs.readFileSync('demonstratorer/config.js', 'utf8');
            demonstrator.scriptLinks = userConfig.demoScriptsExternal.concat(['dist/scripts.min.js']);
            demonstrator.cssLinks = userConfig.demoCssExternal.concat(['dist/style.css']);

            fs.writeSync(fd, t(demonstrator));
            done(); 
        },
        'demonstratorer/config_3d.html': function (fs, fd, done) {
            var demonstrator = {};
            grunt.util._.templateSettings.interpolate = /\{\{=(.+?)\}\}/g;
            grunt.util._.templateSettings.evaluate =  /\{\{(.+?)\}\}/g;
            var t = grunt.util._.template(fs.readFileSync('./grunt_templates/new_demo3d.html.tpl', 'utf8'));

            var template_markup = grunt.util._.map(userConfig.demoTemplates, function (template) {
                var arr = ['<script type="text/template" id="' + template + '_template">'];
                arr.push(fs.readFileSync('templates/' + template + '.tmpl', 'utf8'));
                arr.push('</script>');
                arr.push('\n');
                return arr.join('\n');
            }).join('\n');

            var demo_template_markup = grunt.util._.map(userConfig.demoDatasetTemplates, function (template) {
                var arr = ['<script type="text/template" id="' + template + '_template">'];
                arr.push(fs.readFileSync('templates/datasets/' + template + '.tmpl', 'utf8'));
                arr.push('</script>');
                arr.push('\n');
                return arr.join('\n');
            }).join('\n');

            demonstrator.template_markup = template_markup.concat(demo_template_markup);
            demonstrator.name = null;

            demonstrator.inline_js = fs.readFileSync('demonstratorer/config3d.js', 'utf8');
            demonstrator.scriptLinks = userConfig.demoScriptsExternal3d.concat(['dist/scripts3d.min.js']);
            demonstrator.cssLinks = userConfig.demoCssExternal3d.concat(['dist/style3d.css']);

            fs.writeSync(fd, t(demonstrator));
            done(); 
        }
      },

      "build-index2": {
        'index.html': function(fs, fd, done) {
            grunt.util._.templateSettings.interpolate = /\{\{=(.+?)\}\}/g;
            grunt.util._.templateSettings.evaluate =  /\{\{(.+?)\}\}/g;
            var t = grunt.util._.template(fs.readFileSync('grunt_templates/index.html.tpl', 'utf8'));
            var demos = userConfig.demonstrators;
            grunt.util._.map(demos, function (d) {
              if (!d.url) {
                d.url = 'demonstratorer/' + d.id + '.html';
              }
            });
            fs.writeSync(fd, t({demos: demos}));
            done(); 
          }
        },

      "build-experiments": {
        files: grunt.util._.map(userConfig.experiments, function (demonstrator) {
            return {
              file: 'experiments/' + demonstrator.key + '.html',
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

                  var demo_template_markup = grunt.util._.map(userConfig.demoDatasetTemplates, function (template) {
                      var arr = ['<script type="text/template" id="' + template + '_template">'];
                      arr.push(fs.readFileSync('templates/datasets/' + template + '.tmpl', 'utf8'));
                      arr.push('</script>');
                      arr.push('\n');
                      return arr.join('\n');
                  }).join('\n');

                  demonstrator.template_markup = demonstrator.template_markup.concat(demo_template_markup);

                  demonstrator.html = fs.readFileSync('./experiments_content/' + demonstrator.key + '/html.html', 'utf8');
                  demonstrator.inline_js = fs.readFileSync('./experiments_content/' + demonstrator.key + '/inline.js', 'utf8');

                  demonstrator.scriptLinks = userConfig.commonScripts.concat(demonstrator.scripts);

                  demonstrator.cssLinks = userConfig.commonCss.concat(demonstrator.css);

                  fs.writeSync(fd, t(demonstrator));
                  done(); 
              }
            };
          })
      }
    },
    watch: {
      scripts: {
        files: ['./common/js/*.*', './experiments_content/**/*.*', './templates/**/*.*', './build.config.js'],
        tasks: ['default'],
        options: {
          spawn: true,
        }
      }
    },
    concat: {
        options: {
            separator: '\n'
        },
        script: {
            src: userConfig.demoScripts,
            dest: 'dist/scripts.js'
        },
        script3d: {
            src: userConfig.demoScripts3d,
            dest: 'dist/scripts3d.js'
        },
        css: {
          src: userConfig.demoCss,
          dest: 'dist/style.css'
        },
        css3d: {
          src: userConfig.demoCss3d,
          dest: 'dist/style3d.css'
        }
    },
    uglify: {
      dist: {
          files: {
              'dist/scripts.min.js': ['<%= concat.script.dest %>'],
              'dist/scripts3d.min.js': ['<%= concat.script3d.dest %>']
          }
      }
    }
  };

  grunt.initConfig( grunt.util._.extend( taskConfig, userConfig ) );

  
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-file-creator');

  grunt.registerTask('demos', ['concat', 'uglify', 'file-creator:build-demos', 'file-creator:build-generators', 'file-creator:build-index2']);

  grunt.registerTask('default', ['file-creator:build-experiments', 'file-creator:build-index', 'concat', 'uglify']);

  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-concat');
};