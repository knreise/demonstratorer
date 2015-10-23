'use strict';
var packagejson = require('./package.json');

var config = {
  pkg: packagejson,
  src: 'src',
  dist: 'dist'
};

module.exports = function (grunt) {

  // Configuration
  grunt.initConfig({
    config: config,
    pkg: config.pkg,
    uglify: {
      options: {
        banner: '/*! <%= pkg.name %> - v<%= pkg.version %> - ' +
        '<%= grunt.template.today("yyyy-mm-dd") %> */'
      },
      build: {
        src: '<%= config.dist %>/<%= pkg.name %>.js',
        dest: '<%= config.dist %>/<%= pkg.name %>.min.js'
      }
    },
    copy: {
      main: {
          src: ['<%= config.src %>/<%= pkg.name %>.js'],
          dest: '<%= config.dist %>/<%= pkg.name %>.js'
      }
    }
  });

  grunt.registerTask('default', [
    'copy',
    'uglify'
  ]);

  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-uglify');
};
