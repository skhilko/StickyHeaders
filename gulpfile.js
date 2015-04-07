/*global -$ */
'use strict';

var DIR_BUILD_BASE = 'dist/';
var DIR_BUILD_SCRIPTS = DIR_BUILD_BASE + 'scripts/';
var DIR_BUILD_STYLES = DIR_BUILD_BASE + 'styles/';
var BASE_NAME = 'stickyheaders';


var gulp = require('gulp');
var plugins = require('gulp-load-plugins')();
var browserSync = require('browser-sync');
var reload = browserSync.reload;



function processStyles (src) {
    return function () {
        return gulp.src(src)
            .pipe(plugins.sourcemaps.init())
            .pipe(plugins.sass({
                outputStyle: 'nested', // libsass doesn't support expanded yet
                precision: 10,
                includePaths: ['.'],
                onError: console.error.bind(console, 'Sass error:')
            }))
            .pipe(plugins.postcss([
                require('autoprefixer-core')({
                    browsers: ['last 1 version']
                })
            ]))
            .pipe(plugins.sourcemaps.write())
            .pipe(gulp.dest('.tmp/styles'))
            .pipe(reload({
                stream: true
            }));
    };
}

gulp.task('styles', processStyles('src/styles/main.scss'));

gulp.task('styles-demo', processStyles('demo/styles/demo.scss'));

gulp.task('jshint', function() {
    return gulp.src('app/scripts/**/*.js')
        .pipe(reload({
            stream: true,
            once: true
        }))
        .pipe(plugins.jshint())
        .pipe(plugins.jshint.reporter('jshint-stylish'))
        .pipe(plugins.if(!browserSync.active, plugins.jshint.reporter('fail')));
});

gulp.task('html', ['styles'], function() {
    var assets = plugins.useref.assets({
        searchPath: ['.tmp', '.']
    });

    return gulp.src('demo/*.html')
        .pipe(assets)
        .pipe(plugins.if('*.js', plugins.uglify()))
        .pipe(plugins.if('*.css', plugins.csso()))
        .pipe(assets.restore())
        .pipe(plugins.useref())
        .pipe(plugins.if('*.html', plugins.minifyHtml({
            conditionals: true,
            loose: true
        })))
        .pipe(gulp.dest('dist'));
});

gulp.task('clean', require('del').bind(null, ['.tmp', 'dist']));

gulp.task('serve', ['styles', 'styles-demo'], function() {
    browserSync({
        notify: false,
        port: 9000,
        server: {
            baseDir: ['.tmp', 'src', 'demo'],
            routes: {
                '/bower_components': 'bower_components'
            }
        }
    });

    // watch for changes
    gulp.watch([
        'demo/*.html',
        'src/scripts/**/*.js'
    ]).on('change', reload);

    gulp.watch([
        'src/styles/**/*.scss',
        ], ['styles']);

    gulp.watch([
        'demo/styles/**/*.scss'
        ], ['styles-demo']);
});


gulp.task('build:vanilla', ['jshint'], function() {

    return gulp.src('src/scripts/main.js')
        .pipe(plugins.sourcemaps.init())
        .pipe(plugins.header(';(function(window, document, undefined) {'))
        .pipe(plugins.footer('})(window, window.document);'))
        .pipe(plugins.rename({ basename: BASE_NAME }))
        .pipe(plugins.size({ showFiles: true }))
        .pipe(gulp.dest(DIR_BUILD_SCRIPTS))
        .pipe(plugins.uglify())
        .pipe(plugins.rename({ extname: '.min.js' }))
        .pipe(plugins.size({ showFiles: true }))
        .pipe(plugins.sourcemaps.write('../maps'))
        .pipe(gulp.dest(DIR_BUILD_SCRIPTS));

});

gulp.task('build:jquery', ['jshint'], function() {

    return gulp.src(['src/scripts/main.js', 'src/scripts/jquery-plugin.js'])
        .pipe(plugins.sourcemaps.init())
        .pipe(plugins.concat(BASE_NAME + '.jquery.js'))
        .pipe(plugins.header(';(function($, window, document, undefined) {'))
        .pipe(plugins.footer('})(jQuery, window, window.document);'))
        .pipe(plugins.size({ showFiles: true }))
        .pipe(gulp.dest(DIR_BUILD_SCRIPTS))
        .pipe(plugins.uglify())
        .pipe(plugins.rename({ extname: '.min.js' }))
        .pipe(plugins.size({ showFiles: true }))
        .pipe(plugins.sourcemaps.write('../maps'))
        .pipe(gulp.dest(DIR_BUILD_SCRIPTS));
});

gulp.task('build:styles', ['styles'], function() {

    return gulp.src(['.tmp/styles/main.css'])
        .pipe(plugins.rename({ basename: BASE_NAME }))
        .pipe(gulp.dest(DIR_BUILD_STYLES))
        .pipe(plugins.csso())
        .pipe(plugins.rename({ extname: '.min.css' }))
        .pipe(gulp.dest(DIR_BUILD_STYLES));
});

gulp.task('build', ['build:vanilla', 'build:jquery', 'build:styles'], function() {

    return gulp.src(DIR_BUILD_BASE + '**/*').pipe(plugins.size({
        title: 'build',
        gzip: true
    }));
});

gulp.task('default', ['clean'], function() {
    gulp.start('build');
});
