var gulp = require("gulp");
var sass = require("gulp-sass");
var useref = require("gulp-useref");
var gulpIf = require("gulp-if");
var uglify = require("gulp-uglify");
var cleanCSS = require("gulp-clean-css");
var clean = require("gulp-clean");
var autoprefixer = require("gulp-autoprefixer");
var runSequence = require("run-sequence");
var sourcemaps = require("gulp-sourcemaps");
var replace = require("gulp-replace");

gulp.task("useref", function() {
    return gulp.src("frontend-source/index.html")
        .pipe(useref())
        // .pipe(sourcemaps.init())
        .pipe(gulpIf("*.js", uglify()))
        // .pipe(sourcemaps.write())
        .pipe(gulpIf("*.css", cleanCSS()))
        .pipe(replace(/(\/[a-z0-9/.]+\.(css|js))/gi, '/mirkoplusy$1'))
        .pipe(gulp.dest("frontend/"));
});

gulp.task("sass", function() {
   //noinspection JSUnresolvedFunction
    return gulp.src("frontend-source/sass/*.sass")
       .pipe(sass({outputStyle: "expanded"}).on("error", sass.logError))
        .pipe(autoprefixer({
            browsers: ["last 2 versions"]
        }))
       .pipe(gulp.dest("frontend-source/css/"));
});

gulp.task("copy-rest-files", function() {
    gulp.src("frontend-source/fonts/**/*").pipe(gulp.dest("frontend/fonts/"));
    gulp.src("node_modules/jquery/dist/jquery.min.js").pipe(gulp.dest("frontend/js/"));
    gulp.src("node_modules/mustache/mustache.min.js").pipe(gulp.dest("frontend/js/"));
    gulp.src("frontend-source/template.html").pipe(gulp.dest("frontend/"));
});

gulp.task("clean-frontend", function() {
    return gulp.src("./frontend/*")
        .pipe(clean({force: true, read: false}));
});

gulp.task("build", function(callback) {
    runSequence("clean-frontend", "sass", ["useref", "copy-rest-files"], callback);
});