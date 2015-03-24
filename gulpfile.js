/*global -$ */
'use strict';

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

gulp.task('extras', function() {
    return gulp.src([
        'demo/*.*',
        '!demo/*.html'
    ], {
        dot: true
    }).pipe(gulp.dest('dist'));
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

gulp.task('build', ['jshint', 'styles', 'extras'], function() {
    return gulp.src('dist/**/*').pipe(plugins.size({
        title: 'build',
        gzip: true
    }));
});

gulp.task('default', ['clean'], function() {
    gulp.start('build');
});
