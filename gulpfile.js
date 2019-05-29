const DOCS_COMMAND = process.env.DOCS_COMMAND || 'npm run docs'
const DOCS_OUTPUT = process.env.DOCS_OUTPUT || "../docs"

const gulp = require('gulp')
const sass = require('gulp-sass')
const autoprefixer = require('gulp-autoprefixer')
const run = require('gulp-run')
const babel = require('gulp-babel')
const uglify = require('gulp-uglify')
const rename = require('gulp-rename')
const concat = require('gulp-concat')
const path = require('path')
const browserSync = require('browser-sync').create();

gulp.task('sass', () => {
  return gulp.src('styles/app.sass')
    .pipe(sass({
      outputStyle: 'compressed',
    }))
    .pipe(autoprefixer())
    .pipe(rename({ suffix: '.min' }))
    .pipe(gulp.dest('static/styles'))
})

gulp.task('js', () => {
  return gulp.src(path.join('scripts/', '*.js'), { base: 'app' })
    .pipe(concat('app.js'))
    .pipe(babel({
      presets: ['@babel/env'],
    }))
    .pipe(uglify())
    .pipe(rename({ suffix: '.min' }))
    .pipe(gulp.dest('static/scripts'))
})

gulp.task('docs', function(done) {
  return run(`cd .. && ${DOCS_COMMAND}`).exec({callback: done})
})

gulp.task('watch', (done) => {
  gulp.watch('styles/**/*.sass', ['sass', 'docs'])
  gulp.watch('scripts/**/*.js', ['js', 'docs'])
  gulp.watch('tmpl/**/*.tmpl', ['docs'])
  gulp.watch('publish.js', ['docs'])
  if (process.env.DOCS) {
    console.log(process.env.DOCS.split(','))
    gulp.watch(process.env.DOCS.split(','), ['docs'])
  }
  done();
})

gulp.task('sync', (done) => {
  browserSync.init({
    server: {
      baseDir: DOCS_OUTPUT
    }
  })
  gulp.watch(`${DOCS_OUTPUT}/*`).on('change', browserSync.reload);
  done();
})

gulp.task('build', gulp.series('sass', 'js'));

gulp.task('default', gulp.series('sass', 'js', 'docs', 'watch', 'sync'));