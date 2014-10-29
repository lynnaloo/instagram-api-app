//needed to parse the template files for cache busting and require includes
var handlebars = require( 'handlebars' );

module.exports = function(grunt) {
    var config = {
        pkg: grunt.file.readJSON('package.json'),
        paths: {
        	src: '../src/',
        	build: '../build/',
        	tmp: 'tmp/',
            assets: '../src/assets/'
        },
        templates: ['index-template.html'], //include all of your template files here that will be parsed by handlebars
        copy: {
            build: {
                files: [
                    {
                        // Explicitly defining folders and assets that will be included in the build
                        src: ['.htaccess', 'assets/css/**', 'assets/img/**', 'assets/js/**', //need to include non-compiled js since dev will be using dynamic version
                              'assets/js/libs/**','robots.txt'].concat('<%= templates %>'), //also include the template files that will be converted
                        cwd: '<%= paths.src %>', //since the copy plugin fails when using '../' paths, you must set the cwd to src
                        dest: '<%= paths.build %>',
                        expand: true,
                        dot: true
                    }
                ]
            }
        },
        requirejs: {
            compile: {
            	options: {
            		findNestedDependencies: true,
                    name: 'main',
	                out: '<%= paths.assets %>js/app.min.js',
	                baseUrl: '<%= paths.assets %>js',
	                mainConfigFile: '<%= paths.assets %>js/main.js'
            	}
            }
        },
        jshint: {
            validate: {
                files: {
                    src: ['<%= paths.assets %>js/main.js', '<%= paths.assets %>js/app/**/*.js']
                }
            }
        },
        sass: {
            compile: {
                files: {
                    '<%= paths.assets %>css/styles.css': '<%= paths.assets %>scss/styles.scss'
                }
            }
        },
        watch: { //compile sass, run jshint, and convert handlebar templates
            assets: {
                files: [
                    '<%= paths.assets %>js/main.js',
                    '<%= paths.assets %>js/app.js',
                    '<%= paths.assets %>js/app/**/*.js',
                    '<%= paths.assets %>scss/**/*'
                ],
                tasks: ['jshint:validate', 'sass:compile']
            },
            templates: {
                files: [], //empty for now, because we will fill in after the config is defined (see note below for why)
                tasks: ['preprocess-html:local'],
            },
        },
        shell: {
        	predeploy: {
        		options: {
                    stdout: true
                },
                command: 'rm app.tar'
        	},
        	deploy: {
                options: {
                    stdout: true
                },
                //the bash script requires 2 parameters - the environment, and whether you want to reload the database from your schema file
                //default is local, false
                command: 'bash deploy.sh ' + (grunt.option('env') || 'local') + ' ' + (grunt.option('reloadschema') || 'false')
            }
        },
        uglify: {
            options: {
                banner: '/*! <%= pkg.name %>, built on <%= grunt.template.today("yyyy-mm-dd HH:MM:ss") %> */\n',
                preserveComments: false,
                compress: true,
                mangle: {
                    except: ['jQuery', 'Backbone']
                }
            }
        },
        cssmin: {
            options: {
                banner: '/*! <%= pkg.name %>, built on <%= grunt.template.today("yyyy-mm-dd HH:MM:ss") %> */\n',
            }
        },
        //config values used by handlebar template parsing for the various environements
        //ex. locally you want to use dynamic require includes, on prod you don't.
        'preprocess-html': {
            'local': {
                context: {
                        base_api_url: 'http://localhost:8888',
                        use_appjs: false,
                        use_cachebust: false,
                        cachebust: cacheBustValue
                }
            },
            'dev': {
                    context: {
                            base_api_url: 'http://dev.iheartnorfolk.com',
                            use_appjs: false,
                            use_cachebust: true,
                            cachebust: cacheBustValue
                    }
            },
            'staging': {
                    context: {
                            base_api_url: 'http://dev.iheartnorfolk.com',
                            use_appjs: true,
                            use_cachebust: true,
                            cachebust: cacheBustValue
                    }
            },
            'prod': {
                    context: {
                            base_api_url: 'http://dev.iheartnorfolk.com',
                            use_appjs: true,
                            use_cachebust: true,
                            cachebust: cacheBustValue
                    }
            }
        },
        clean: {
            options: {
                force: true
            },
            build_pre: {
                src: ['<%= paths.build %>', '<%= paths.tmp %>']
            },
            build_post: {
                src: ['<%= paths.tmp %>']
            }
        },
    };

    //kind of a hack, but watch will not work by setting a cwd and using filenames, while copy will only work this way.
    //so fill in the values based on the non-pathed values
    config.watch.templates.files = (function() {
        var template_paths = config.templates.slice(0);
        template_paths.forEach(function(value, index, arr) {
            arr[index] = config.paths.src + arr[index];
        });
        return template_paths;
    })();

    grunt.initConfig( config );

    grunt.loadNpmTasks('grunt-contrib-copy'); //copies files to the build directory
    grunt.loadNpmTasks('grunt-contrib-sass'); //compiles sass
    grunt.loadNpmTasks('grunt-contrib-jshint'); //validates your js
    grunt.loadNpmTasks('grunt-contrib-watch'); //monitors file changes for sass / handlebars compilation
    grunt.loadNpmTasks('grunt-contrib-uglify'); //compresses your js
    grunt.loadNpmTasks('grunt-contrib-cssmin'); //minifies your css
    grunt.loadNpmTasks('grunt-contrib-requirejs'); //runs the require optimizer
    grunt.loadNpmTasks('grunt-shell'); //allows us to call our bash script for deployment

    //this task runs the handlebar template parser. if run locally, it puts the compiled file into src
    //if run for another environment, it puts the compiled file into build and removes the template file from build
    grunt.registerMultiTask('preprocess-html', "Prepares the HTML file for staging or production mode.", function(){

        var self = this;
        var dir = (this.target === "local") ? "../src/" : config.paths.build;
        config.templates.forEach(function(template, index, arr) {

            console.log(template);
            var contents = grunt.file.read( dir+ template );
            var result = handlebars.compile( contents )( self.data.context );

            grunt.file.write( dir+ template.replace("-template", ""), result );

            if(self.target !== "local") {
                grunt.file.delete( dir+ template, { force: true } );
            }
        });

    });

    //first step of building - deletes the build directory
    grunt.registerTask( 'init-build', "Deletes and re-creates build folder for further build operations.", function(){

        grunt.file.delete( '../build', { force: true } );
    });

    //last step of deployment - deletes the build directory. this could be combined with the above function but you may
    //want to add separate cleanup logic for the start and end of a deployment.
    grunt.registerTask( 'destroy-build', "Cleans up any files and folders used during the build process.", function(){

        grunt.file.delete( '../build', { force: true } );
    });

    //utility function to set the handlebars cachebusting value to the last git commit sha
    grunt.registerTask( 'git-revision', "Gets GIT HEAD SHA for use by other tasks.", function(){

        var done = this.async();

        grunt.util.spawn( {cmd:"git", args:['rev-parse','HEAD']}, function( err_, result_ ) {

                if ( err_ || !result_ || !result_.stdout ) {
                        grunt.log.error("Error: " + err_);
                        return;
                }

                cacheBustValue = result_.stdout.slice(0,10);

                config['preprocess-html'].local.context.cachebust = cacheBustValue;
                config['preprocess-html'].dev.context.cachebust = cacheBustValue;
                config['preprocess-html'].staging.context.cachebust = cacheBustValue;
                config['preprocess-html'].prod.context.cachebust = cacheBustValue;

                done();
        });
    });


    //compiles sass, require, and handlebar templates. copies the correct files to a build directory that will be used for deployment.
    grunt.registerTask('build', ['sass', 'requirejs', 'init-build', 'copy', 'uglify', 'cssmin', 'git-revision', 'preprocess-html:'+(grunt.option('env') || 'local')]);

    //runs the build task then deploys the build directory via the deploy.sh shell file.
    //ex: grunt deploy --env=dev --reloadschema=false
    grunt.registerTask('deploy', ['shell:predeploy', 'build', 'shell:deploy']);

    grunt.registerTask('timestamp', function() { grunt.log.subhead(Date()); });

};

var cacheBustValue = Math.round( (new Date().getTime())/1000 );
