const gulp = require('gulp');
const sass = require('gulp-sass');
const browserSync = require('browser-sync');
const nodemon = require('gulp-nodemon');

sass.compiler = require('node-sass');

// Sass compilation
gulp.task('sass', function() {
  return gulp
    .src('./sass/*.scss')
    .pipe(sass().on('error', sass.logError))
    .pipe(gulp.dest('./public/css'));
});

// Sass watching, depending on "sass" task
gulp.task('sass:watch', function() {
  gulp.watch('./sass/*.scss', gulp.series('sass'));
});

// Nodemon task:
// Start nodemon once and execute callback (browser-sync)
gulp.task('nodemon', cb => {
  let started = false;
  return nodemon({
    script: 'app.js'
  }).on('start', () => {
    if (!started) {
      cb();
      started = true;
    }
  });
});

// BrowserSync task:
// calls nodemon tasks and pass itself as callback
gulp.task(
  'browser-sync',
  gulp.series('nodemon', () => {
    browserSync.init(null, {
      proxy: 'http://localhost:5000',
      files: ['public/**/*.*'],
      port: 3000
    });
  })
);

// Dev Task: 
// Parallel execution of browser-sync/nodemon
// and sass watching
gulp.task('default', gulp.parallel('browser-sync', 'sass:watch'));