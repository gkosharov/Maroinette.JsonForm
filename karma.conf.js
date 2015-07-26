// Karma configuration
// Generated on Mon Feb 09 2015 19:13:53 GMT+0200 (FLE Standard Time)

module.exports = function (config) {
    config.set({

        // base path that will be used to resolve all patterns (eg. files, exclude)
        basePath: '',


        // frameworks to use
        // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
        frameworks: [/*'jasmine-jquery','jasmine', */'requirejs'/*, 'sinon'*/],
        // list of files / patterns to load in the browser
        files: [
            {pattern: 'test/spec/*Spec.js', watched: true, served:  true, included: false},
            {pattern: 'src/*.js', watched: true, served:  true, included: false},

            'test/test-main.js'
        ],

       /* coverageReporter: {
            type: 'html',
            dir: 'test/reports/coverage'
        },*/

        plugins: [
            // these plugins will be require() by Karma

            /*'karma-jasmine',
            'karma-jasmine-jquery',
            'jasmine-jquery',*/
            'karma-requirejs',
            'karma-chrome-launcher',
            'karma-firefox-launcher',
            'karma-jasmine-html-reporter',
            'karma-coverage'
        ],

        // preprocess matching files before serving them to the browser
        // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
        preprocessors: {
            "src/**/*.js": "coverage"
        },


        // test results reporter to use
        // possible values: 'dots', 'progress'
        // available reporters: https://npmjs.org/browse/keyword/karma-reporter
        reporters: ['progress', 'coverage', 'html'],


        // web server port
        port: 9876,


        // enable / disable colors in the output (reporters and logs)
        colors: true,


        // level of logging
        // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
        logLevel: config.LOG_INFO,


        // enable / disable watching file and executing tests whenever any file changes
        autoWatch: false,


        // start these browsers
        // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
        browsers: ['Chrome'],


        // Continuous Integration mode
        // if true, Karma captures browsers, runs the tests and exits
        singleRun: false
    });
};
