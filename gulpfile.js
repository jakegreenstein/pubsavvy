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
        .pipe(gp_concat('vendor-concat.js'))
        .pipe(gulp.dest('./public/min/'))
        .pipe(gp_rename('vendor.min.js'))
        .pipe(gp_uglify())
        .pipe(gulp.dest('./public/build/'));
});


gulp.task('angular', function(){
    return gulp.src(
    		[
				'./public/admin/bower_components/jquery/dist/jquery.min.js',
				'./public/admin/js/fileupload/angular-file-upload-shim.js',
				'./public/admin/bower_components/angular/angular.min.js',
				'./public/admin/bower_components/angular-route/angular-route.min.js',
				'./public/admin/bower_components/angular-sanitize/angular-sanitize.min.js',
				'./public/admin/bower_components/angular-resource/angular-resource.min.js',
				'./public/admin/js/fileupload/angular-file-upload.js',
				'./public/admin/js/numeral.min.js',
				'./public/admin/angular/app.js',
				'./public/admin/angular/services/accountService.js',
				'./public/admin/angular/services/generalService.js',
				'./public/admin/angular/services/restService.js',
				'./public/admin/angular/services/uploadService.js',
				'./public/admin/angular/controllers/autosearch.js',
				'./public/admin/angular/controllers/home.js',
				'./public/admin/angular/controllers/search.js',
				'./public/admin/angular/controllers/account.js',
				'./public/admin/angular/controllers/question.js'
    		]
    	)
        .pipe(gp_concat('angular-concat.js'))
        .pipe(gulp.dest('./public/min/'))
        .pipe(gp_rename('app.js'))
        .pipe(gp_uglify())
        .pipe(gulp.dest('./public/build/'));
});

gulp.task('default', ['build', 'angular'], function(){});

