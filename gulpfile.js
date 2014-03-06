// Include Gulp.
var gulp = require('gulp');

// Include Plugins.
var util = require('gulp-util'),
    jshint = require('gulp-jshint'),
    notify = require('gulp-notify'),
    concat = require('gulp-concat'),
    plumber = require('gulp-plumber'),
    uglify = require('gulp-uglify'),
    gulpif = require('gulp-if'),

    //test
    browserify = require('gulp-browserify'),

// Server 
livereload = require('gulp-livereload'),

// Enviornment
env = !!util.env.production,

map = require('map-stream'),
events = require('events'),
emmitter = new events.EventEmitter(),
path = require('path'),

jsRoute = './src/',
jsPath = jsRoute + '/index.js',
jsAssets = ['src/**/*.js','src/**/*.hbs'];

// // Custom linting reporter used for error notify
// jsHintErrorReporter = map(function (file, cb) {
//   if (!file.jshint.success) {
//     file.jshint.results.forEach(function (err) {
//       if (err) {
 
//         // Error message
//         var msg = [
//           path.basename(file.path),
//           'Line: ' + err.error.line,
//           'Reason: ' + err.error.reason
//         ];
 
//         // Emit this error event
//         emmitter.emit('error', new Error(msg.join('\n')));
 
//       }
//     });
 
//   }
//   cb(null, file);
// });

// // JS Lint tasks
// gulp.task('lint', function(){

//     gulp.src(['./src/**/*.js'])
//         .pipe(plumber())
//         .pipe(jshint())
//         .pipe(jshint.reporter('jshint-stylish'))
//         .pipe(jsHintErrorReporter) 
//         .on('error', notify.onError({ 
//             title : 'ಠ_ಠ FFS! Lint failed'
//         }))

// });

gulp.task('build', function() {

    gulp.src('src/index.js')
        .pipe(browserify({
            ignore : ['jquery','underscore']
        }))
        .pipe(concat('demo.js'))
        .pipe(gulp.dest('./demo/'))

    gulp.src([
            'src/header.js',
            'src/fastdom.js',
            'src/utils.js',
            'src/dom-utils.js',
            'src/events.js',
            'src/model.js',
            'src/collection.js',
            'src/view.js',
            'src/sync.js',
            'src/router.js',
            'src/history.js',
            'src/footer.js'
        ])
        .pipe(plumber())
        .pipe(concat('gasworks.js'))
        .pipe(uglify())
        .pipe(gulp.dest('./dist/'))

});

// Server
gulp.task('server', function() {

    var server = livereload();
    gulp.watch(jsAssets, function(evt) {
        gulp.run(['scripts'], function(){;
            server.changed(evt.path);
        })
    });

});