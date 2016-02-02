// including plugins

var gulp = require('gulp'),
    gp_concat = require('gulp-concat'),
    gp_rename = require('gulp-rename'),
    gp_uglify = require('gulp-uglify');


gulp.task('build', function(){
    return gulp.src(
    		[
				'./public/site/js/jquery.min.js',
				'./public/site/js/bootstrap.min.js',
				'./public/site/js/flexslider.min.js',
				'./public/site/js/lightbox.min.js',
				'./public/site/js/masonry.min.js',
				'./public/site/js/twitterfetcher.min.js',
				'./public/site/js/spectragram.min.js',
				'./public/site/js/ytplayer.min.js',
				'./public/site/js/countdown.min.js',
				'./public/site/js/smooth-scroll.min.js',
				'./public/site/js/parallax.js',
				'./public/site/js/scripts.js'
    		]
    	)
        .pipe(gp_concat('gulp-concat.js'))
        .pipe(gulp.dest('./public/min/'))
        .pipe(gp_rename('vendor.min.js'))
        .pipe(gp_uglify())
        .pipe(gulp.dest('./public/build/'));
});

gulp.task('default', ['build'], function(){});