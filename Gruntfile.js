module.exports = function (grunt) {


        function getTemplateFromFile(filename, fs) {
            return grunt.util._.template(fs.readFileSync(filename, 'utf8'));
        }

        var knreiseApiConfig = require('./knreiseApi.config.js');

        var taskConfig = {
            watch: {
                scripts: {
                    files: ['templates/**/*.tmpl'],
                    tasks: ['file-creator:folder'],
                    options: {
                        atBegin: true,
                        spawn: false
                    }
                }
            },
            'file-creator': {
                options: {
                    openFlags: 'w'
                },
                'folder': {
                    'src/templates_gen.js': function (fs, fd, done) {
                        var glob = grunt.file.glob;
                        var _ = grunt.util._;
                        glob('templates/**/*.tmpl', function (err, files) {

                            var templates = _.map(files, function (filename) {
                                var parts = filename.split('/');
                                var id = parts[parts.length - 1].split('.')[0];
                                if (parts[1] === 'datasets') {
                                    id += '_template';
                                }
                                return {
                                    filename: filename,
                                    id: id
                                };
                            });
                            var pageTemplate = getTemplateFromFile('./grunt_templates/templateList.js.tpl', fs);
                            fs.writeSync(fd, pageTemplate({templates: templates}));
                            done();
                        });
                    }
                }
            },
            concat: {
                options: {
                    separator: '\n'
                },
                script_external: {
                    src: knreiseApiConfig.scripts,
                    dest: 'public/knreiseApi.js'
                }
            }
        };

        grunt.initConfig(grunt.util._.extend(taskConfig, knreiseApiConfig));

        grunt.loadNpmTasks('grunt-contrib-concat');
        grunt.loadNpmTasks('grunt-contrib-watch');
        grunt.loadNpmTasks('grunt-file-creator');
        grunt.registerTask('default', [
            'file-creator:folder'
        ]);
};