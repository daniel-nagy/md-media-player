module.exports = function (grunt) {
'use strict';

  // load plugins
  require('load-grunt-tasks')(grunt, {scope: 'devDependencies'});

  grunt.initConfig({
    
    config: {
      livereload: 35729
    },
    
    // Add vendor prefixes
    autoprefixer: {
      options: {
        browsers: ['last 2 versions']
      },
      app: {
        files: {
          'app/app.css': 'app/app.css'
        }
      },
      build: {
        files: {
          'dist/md-media-player.css': 'dist/md-media-player.css'
        }
      }
    },
    
    // remove generated files
    clean: {
      app: 'app/app.css',
      build: '.temp',
      dist: 'dist'
    },

    // condense javascript into a single file
    concat: {
      options: {
        separator: '\n\n',
      },
      build: {
        files: {
          'dist/md-media-player.js': ['app/md-media-player/**/*.js', '.temp/templates.js']
        }
      }
    },
    
    // static web server
    connect: {
      app: {
        options: {
          port: 8000,
          // hostname: '127.0.0.1',
          hostname: '0.0.0.0',
          livereload: '<%= config.livereload %>',
          base: ['bower_components', 'dist', 'app'],
        }
      }
    },
    
    // minify css files
    cssmin: {
      build: {
        files: {
          'dist/md-media-player.min.css': 'dist/md-media-player.css'
        }
      }
    },
    
    // convert templates to javascript and load them into
    // the template cache
    html2js: {
      build: {
        options: {
          base: 'app/md-media-player',
          module: 'md.media.templates',
          quoteChar: '\'',
          rename: function(moduleName) {
            return 'templates.' + moduleName.split('/').pop();
          },
          useStrict: true,
        },
        files: {
          '.temp/templates.js': 'app/md-media-player/**/*.html'
        }
      }
    },
    
    // report bad javascript syntax, uses jshint-stylish for
    // more readable logging to the console
    jshint: {
      options: {
        jshintrc: '.jshintrc',
        reporter: require('jshint-stylish'),
        force: true
      },
      build: 'app/md-media-player/**/*.js',
      app: ['app/app.js', 'app/scripts/**/*.js']
    },

    // compile less
    less: {
      app: {
        files: {
          'app/app.css': 'app/styles/app.less'
        }
      },
      build: {
        files: {
          'dist/md-media-player.css': 'app/md-media-player/styles/md-media-player.less'
        }
      }
    },

    // minify javascript files
    uglify: {
      build: {
        files: {
          'dist/md-media-player.min.js': 'dist/md-media-player.js'
        }
      }
    },
    
    // perform tasks on file change
    watch: {
      options: {
        livereload: '<%= config.livereload %>'
      },
      appLess: {
        files: 'app/styles/**/*.less',
        tasks: ['less:app', 'autoprefixer:app']
      },
      appScripts: {
        files: ['app/app.js', 'app/scripts/**/*.js'],
        tasks: 'jshint:app',
      },
      appTemplates: {
        files: 'app/templates/**/*.html'
      },
      buildLess: {
        files: 'app/md-media-player/**/*.less',
        tasks: ['less:build', 'autoprefixer:build'],
      },
      buildScripts: {
        files: 'app/md-media-player/**/*.js',
        tasks: ['jshint:build', 'concat:build'],
      },
      buildTemplates: {
        files: 'app/md-media-player/**/*.html',
        tasks: ['html2js:build', 'concat:build'],
        // tasks: ['concat:build']
      },
      gruntfile: {
        files: 'Gruntfile.js'
      },
      index: {
        files: 'app/index.html',
      }
    }
  });
  
  grunt.registerTask('default', function() {
    
    // buld the md-media-player module
    grunt.task.run('build');
    
    // start the app
    grunt.task.run('serve');
  });
  
  grunt.registerTask('build', [
    'jshint:build',
    'less:build',
    'autoprefixer:build',
    'cssmin:build',
    'html2js:build',
    'concat:build',
    'uglify:build'
  ]);
  
  grunt.registerTask('serve', [
    'jshint:app',
    'less:app',
    'autoprefixer:app',
    'connect:app',
    'watch'
  ]);

};