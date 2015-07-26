module.exports = function(grunt) {

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        jsdoc : {
            dist : {
                src: [
                    'src/**/*',
                    'README.md'
                ],
                options: {
                    destination: 'doc'
                }
            }
        },
        jshint: {
            //files: ['Gruntfile.js', 'js/*.js','!js/lib/*.js', '!js/*min.js'],
            files: [
                'src/**/*',
            ],
            options: {
                reporter: require('jshint-stylish'),
                globals: {
                    jQuery: true,
                    console: false,
                    module: true,
                    document: true
                }
            }
        },
        plato: {
            default: {
                options : {
                    exclude: /\.min\.js$/    // excludes source files finishing with ".min.js"
                },
                files: {
                    'reports': ['src/**/*.js']
                }
            }
        },
        less: {
            development: {
                options: {
                    paths: ["less"]
                },
                files: {
                    "stylesheets/development.css": "less/bootstrap.less"
                }
            },
            production: {
                options: {
                    paths: ["less"],
                    plugins: [
                        new (require('less-plugin-autoprefix'))({browsers: ["last 2 versions"]}),
                        new (require('less-plugin-clean-css'))({ sourceMap: true, target: "dest/css" })
                    ]
                },
                files: {
                    "path/to/result.css": "path/to/source.less"
                }
            }
        },
        uglify  : {
            options : {
                banner : '<%= banner %>'
            },
            dist    : {
                src  : '<%= concat.dist.dest %>',
                dest : 'dist/Marionette.JsonForm.min.js'
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-less');
    grunt.loadNpmTasks('grunt-plato');
    grunt.loadNpmTasks('grunt-jsdoc');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.registerTask('complexity:report', 'plato');
    grunt.registerTask('document', ['jsdoc']);
    grunt.registerTask('lint', ['jshint']);
    grunt.registerTask('build', ['requirejs']);
    grunt.registerTask('default', ['jshint', 'jsdoc', 'uglify']);
};