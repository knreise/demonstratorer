module.exports = function (grunt) {

        var demoConfig = require('./src/demonstrators/index.js');

        function getTemplateFromFile(filename, fs) {
            return grunt.util._.template(fs.readFileSync(filename, 'utf8'));
        }

        function setTemplateSettings() {
            grunt.util._.templateSettings.interpolate = /\{\{=(.+?)\}\}/g;
            grunt.util._.templateSettings.evaluate = /\{\{(.+?)\}\}/g;
        }

        function resetTemplateSettings() {
            grunt.util._.templateSettings.interpolate =/<%=([\s\S]+?)%>/g;
            grunt.util._.templateSettings.evaluate = /<%([\s\S]+?)%>/g;
        }

        function getNonUrlDemos() {

            var demos = []
                .concat(demoConfig.demonstrators)
                .concat(demoConfig.demonstrators_extra)
                .concat(demoConfig.demonstrators_dev);

            return grunt.util._.filter(demos, function (d) {
                return !d.url;
            });
        }

        var taskConfig = {
            'file-creator': {
                options: {
                    openFlags: 'w'
                },
                'create-template-import': {
                    'src/templates/list.js': function (fs, fd, done) {
                        var glob = grunt.file.glob;
                        var _ = grunt.util._;
                        glob('src/templates/templates/**/*.tmpl', function (err, files) {

                            var templates = _.map(files, function (filename) {
                                filename = filename.replace('src/templates/templates/', '');
                                var parts = filename.split('/');

                                var id = parts[parts.length - 1].split('.')[0];
                                if (parts[0] === 'datasets') {
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
                },
                'build-demos': {
                    files: grunt.util._.map(getNonUrlDemos(), function (demonstrator) {
                        var _ = grunt.util._;

                        var method;
                        if (_.has(demonstrator, 'params')) {
                            method = function (fs, fd, done) {
                                setTemplateSettings();
                                if (demonstrator.name && !demonstrator.params.title) {
                                    demonstrator.params.title = demonstrator.name;
                                }
                                var d = {
                                    name: demonstrator.name || null,
                                    desc: demonstrator.desc || null,
                                    image: demonstrator.image || null,
                                    params: JSON.stringify(demonstrator.params, null, 4),
                                };

                                var pageTemplate = getTemplateFromFile('./grunt_templates/demonstratorTemplateWithParams.html.tpl', fs);
                                fs.writeSync(fd, pageTemplate({data: d}));
                                resetTemplateSettings();
                                done();
                            };
                        } else {
                            method = function (fs, fd, done) {

                                setTemplateSettings();

                                if (!demonstrator.image) {
                                    demonstrator.image = null;
                                }

                                try {
                                    demonstrator.desc = fs.readFileSync('demonstratorer_content/' + demonstrator.id + '.txt', 'utf8');
                                } catch (e) {
                                    demonstrator.desc = '';
                                }

                                demonstrator.inline_js = fs.readFileSync('demonstratorer_content/' + demonstrator.id + '.js', 'utf8');

                                var pageTemplate = getTemplateFromFile('./grunt_templates/demonstratorTemplateWithCode.html.tpl', fs);
                                fs.writeSync(fd, pageTemplate({data: demonstrator}));
                                resetTemplateSettings();
                                done();
                            };
                        }

                        return {
                            file: 'public/demonstratorer/' + demonstrator.id + '.html',
                            method: method
                        };
                    })
                }
            },
            watch: {
                'create-template-import': {
                    files: ['templates/**/*.tmpl'],
                    tasks: ['create-template-import'],
                    options: {
                        atBegin: true,
                        spawn: false
                    }
                },
                'build-demos': {
                    files: ['demonstratorer_content/**/*.*', './src/demonstrators/index.js'],
                    tasks: ['build-demos'],
                    options: {
                        atBegin: true,
                        spawn: false
                    }
                }
            }
        };

        grunt.initConfig(grunt.util._.extend(taskConfig));

        grunt.loadNpmTasks('grunt-contrib-concat');
        grunt.loadNpmTasks('grunt-contrib-watch');
        grunt.loadNpmTasks('grunt-file-creator');

        grunt.registerTask('create-template-import', ['file-creator:create-template-import']);
        grunt.registerTask('build-demos', ['file-creator:build-demos']);
        grunt.registerTask('watch-create-template-import', ['watch:create-template-import']);
        grunt.registerTask('watch-build-demos', ['watch:build-demos']);
};