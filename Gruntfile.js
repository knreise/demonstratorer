module.exports = function (grunt) {
    'use strict';

    var userConfig = require('./build.config.js');

    function getTemplateMarkup(templateList, templateFunc, fs) {
        return grunt.util._.map(templateList, function (template) {
            var arr = ['<script type="text/template" id="' + template + '_template">'];
            arr.push(fs.readFileSync(templateFunc(template), 'utf8'));
            arr.push('</script>');
            arr.push('\n');
            return arr.join('\n');
        }).join('\n');
    }

    function setTemplateSettings() {
        grunt.util._.templateSettings.interpolate = /\{\{=(.+?)\}\}/g;
        grunt.util._.templateSettings.evaluate =  /\{\{(.+?)\}\}/g;
    }

    function getTemplates(fs) {
        var templates = getTemplateMarkup(
            userConfig.demoTemplates,
            function (template) {return 'templates/' + template + '.tmpl'; },
            fs
        );

        var demoTemplates = getTemplateMarkup(
            userConfig.demoDatasetTemplates,
            function (template) {return 'templates/datasets/' + template + '.tmpl'; },
            fs
        );

        return templates.concat(demoTemplates);
    }

    function getNonUrlDemos() {
        return grunt.util._.filter(userConfig.demonstrators, function (d) {
            return !d.url;
        });
    }

    function getTemplateFromFile(filename, fs) {
        return grunt.util._.template(fs.readFileSync(filename, 'utf8'));
    }

    // Project configuration.
    var taskConfig = {

        pkg: grunt.file.readJSON('package.json'),

        'file-creator': {

            'build-demos': {
                files: grunt.util._.map(getNonUrlDemos(), function (demonstrator) {

                    if (grunt.util._.has(demonstrator, 'params')) {
                        return {
                        file: 'demonstratorer/' + demonstrator.id + '.html',
                        method: function (fs, fd, done) {
                            setTemplateSettings();
                            if (demonstrator.name && !demonstrator.params.title) {
                                demonstrator.params.title = demonstrator.name;
                            }
                            var d = {
                                template_markup: getTemplates(fs),
                                name: demonstrator.name || null,
                                desc: demonstrator.desc || null,
                                image: demonstrator.image || null,
                                params: JSON.stringify(demonstrator.params, null, 4),
                                inline_js: fs.readFileSync('demonstratorer_content/config.js', 'utf8'),
                                scriptLinks: userConfig.demoScriptsExternal.concat(['dist/scripts.min.js']),
                                cssLinks: userConfig.demoCssExternal.concat(['dist/style.css'])
                            };

                            var pageTemplate = getTemplateFromFile('./grunt_templates/demonstratorFromParams.html.tpl', fs);
                            fs.writeSync(fd, pageTemplate(d));
                            done();
                        }
                      }
                    }

                    return {
                        file: 'demonstratorer/' + demonstrator.id + '.html',
                        method: function (fs, fd, done) {

                            setTemplateSettings();

                            demonstrator.template_markup = getTemplates(fs);

                            if (!demonstrator.image) {
                                demonstrator.image = null;
                            }

                            try {
                                demonstrator.desc = fs.readFileSync('demonstratorer_content/' + demonstrator.id + '.txt', 'utf8');
                            } catch (e) {
                                demonstrator.desc = '';
                            }

                            demonstrator.inline_js = fs.readFileSync('demonstratorer_content/' + demonstrator.id + '.js', 'utf8');
                            demonstrator.scriptLinks = userConfig.demoScriptsExternal.concat(['dist/scripts.min.js']);
                            demonstrator.cssLinks = userConfig.demoCssExternal.concat(['dist/style.css']);

                            var pageTemplate = getTemplateFromFile('./grunt_templates/new_demo.html.tpl', fs);
                            fs.writeSync(fd, pageTemplate(demonstrator));
                            done();
                        }
                    };
                })
            },

            'build-generators': {

                'demonstratorer/config.html': function (fs, fd, done) {
                    setTemplateSettings();
                    var demonstrator = {
                        template_markup: getTemplates(fs),
                        name: null,
                        desc: null,
                        image: null,
                        inline_js: fs.readFileSync('demonstratorer_content/config.js', 'utf8'),
                        scriptLinks: userConfig.demoScriptsExternal.concat(['dist/scripts.min.js']),
                        cssLinks: userConfig.demoCssExternal.concat(['dist/style.css'])
                    };

                    var pageTemplate = getTemplateFromFile('./grunt_templates/new_demo.html.tpl', fs);
                    fs.writeSync(fd, pageTemplate(demonstrator));
                    done();
                },

                'demonstratorer/config_3d.html': function (fs, fd, done) {
                    setTemplateSettings();
                    var demonstrator = {
                        template_markup: getTemplates(fs),
                        name: null,
                        inline_js: fs.readFileSync('demonstratorer_content/config3d.js', 'utf8'),
                        scriptLinks: userConfig.demoScriptsExternal3d.concat(['dist/scripts3d.min.js']),
                        cssLinks: userConfig.demoCssExternal3d.concat(['dist/style3d.css'])
                    };
                    var pageTemplate = getTemplateFromFile('./grunt_templates/new_demo3d.html.tpl', fs);
                    fs.writeSync(fd, pageTemplate(demonstrator));
                    done();
                }
            },

            'build-index': {
                'index.html': function (fs, fd, done) {
                    setTemplateSettings();
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

            'build-experiments': {
                files: grunt.util._.map(userConfig.experiments, function (demonstrator) {
                    return {
                        file: 'experiments/' + demonstrator.key + '.html',
                        method: function (fs, fd, done) {
                            setTemplateSettings();

                            var templates = getTemplateMarkup(
                                demonstrator.templates,
                                function (template) {return 'templates/' + template + '.tmpl'; },
                                fs
                            );

                            demonstrator.template_markup = templates.concat(getTemplates(fs));

                            demonstrator.html = fs.readFileSync('./experiments_content/' + demonstrator.key + '/html.html', 'utf8');
                            demonstrator.inline_js = fs.readFileSync('./experiments_content/' + demonstrator.key + '/inline.js', 'utf8');
                            demonstrator.scriptLinks = userConfig.commonScripts.concat(demonstrator.scripts);
                            demonstrator.cssLinks = userConfig.commonCss.concat(demonstrator.css);

                            var pageTemplate = getTemplateFromFile('./grunt_templates/demonstrator.html.tpl', fs);
                            fs.writeSync(fd, pageTemplate(demonstrator));
                            done();
                        }
                    };
                })
            },

            'build-experiments-index': {
                'experiments/index.html': function (fs, fd, done) {
                    setTemplateSettings();
                    var pageTemplate = getTemplateFromFile('grunt_templates/examples.html.tpl', fs);
                    fs.writeSync(fd, pageTemplate({demonstrators: userConfig.experiments}));
                    done();
                }
            }
        },
        watch: {
            scripts: {
                files: [
                    './common/js/*.*',
                    './experiments_content/**/*.*',
                    './templates/**/*.*',
                    './build.config.js'
                ],
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

    grunt.initConfig(grunt.util._.extend(taskConfig, userConfig));

    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-file-creator');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-concat');

    grunt.registerTask('demos', [
        'concat',
        'uglify',
        'file-creator:build-demos',
        'file-creator:build-generators',
        'file-creator:build-index'
    ]);
    grunt.registerTask('default', [
        'concat',
        'uglify',
        'file-creator:build-experiments',
        'file-creator:build-experiments-index'
    ]);
};
