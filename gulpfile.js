'use strict';

var gulp = require('gulp');
var eslint = require('gulp-eslint');
var uglify = require('gulp-terser');
var rename = require('gulp-rename');
var streamify = require('gulp-streamify');
var pkg = require('./package.json');
var rollup = require('rollup-stream');
var source = require('vinyl-source-stream');
var path = require('path');
var {exec} = require('mz/child_process');

gulp.task('default', ['build']);

var argv = require('yargs')
	.option('output', {alias: 'o', default: 'dist'})
	.option('samples-dir', {default: 'samples'})
	.option('docs-dir', {default: 'docs'})
	.option('www-dir', {default: 'www'})
	.argv;

gulp.task('build', function() {
    var out = argv.output;
	var task = function() {
		return rollup('rollup.config.js')
			.pipe(source(pkg.name + '.js'))
			.pipe(gulp.dest(out))
			.pipe(rename(pkg.name + '.min.js'))
			.pipe(streamify(uglify({output: {comments: 'some'}})))
			.pipe(gulp.dest(out));
	};

	var tasks = [task()];
	if (argv.watch) {
		tasks.push(watch('src/**/*.js', task));
    }

	return tasks;
});

gulp.task('lint', function () {
    var files = [
		'samples/**/*.js',
		'src/**/*.js',
		'*.js'
	];
    return gulp.src(files)
        .pipe(eslint({fix:true}))
        .pipe(eslint.format())
        .pipe(eslint.failAfterError());
});

gulp.task('docs', function(done) {
	var script = require.resolve('gitbook-cli/bin/gitbook.js');
	var out = path.join(argv.output, argv.docsDir);
	var cmd = process.execPath;

	exec([cmd, script, 'install', './'].join(' ')).then(() => {
		return exec([cmd, script, 'build', './', out].join(' '));
	}).then(() => {
		done();
	}).catch((err) => {
		done(new Error(err.stdout || err));
	});
});