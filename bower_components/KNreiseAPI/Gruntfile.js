module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
     concat: {
      options: {
        separator: '\n'
      },
      dist: {
        src: [
          'src/util.js',
          'src/arcgis.js',
          'src/cartodb.js',
          'src/norvegiana.js',
          'src/wikipedia.js',
          'src/api.js'
        ],
        dest: 'dist/<%= pkg.name %>.js'
      }
    },
    uglify: {
      options: {
        banner: '/*! <%= pkg.name %> <%= pkg.version %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
      },
      build: {
        src: 'dist/<%= pkg.name %>.js',
        dest: 'dist/<%= pkg.name %>.min.js'
      }
    }
  });

  // Load the plugin that provides the "uglify" task.
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-bump-build-git');


  // Default task(s).
  grunt.registerTask('default', ['concat', 'uglify']);

};
