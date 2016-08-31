var express = require('express')
var path = require('path');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var fileUpload = require('express-fileupload');
var async = require('async');
var uuid = require('node-uuid');
var image = require('./image-manipulation');
var sharp = require('sharp');
var flash = require('connect-flash');
var session = require('express-session');
var mongoose = require('mongoose');
var passport = require('passport');
var FacebookStrategy = require('passport-facebook');
require('./config/passport')(passport); // pass passport for configuration

var graph = require('fbgraph');

var Images = require('./models/images');
var User = require('./models/user');

var port = process.env.PORT || 3000;
var app = express();

mongoose.connect('mongodb://localhost:27017/facebook3'); // connect to our database

app.use(express.static('result'));

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: false
}));

// required for passport
app.use(session({
    secret: 'ilovescotchscotchyscotchscotch'
})); // session secret
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash()); // use connect-flash for flash messages stored in session


app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// default options
app.use(fileUpload());

app.get('/', function(req, res) {
    res.render('index');
});

app.post('/upload', isLoggedIn, function(req, res) {
    var sampleFile;
    var user = req.user;

    if (!req.files) {
        return res.send('No files were uploaded.');;
    }

    sampleFile = req.files.sampleFile;
    var newUuid = uuid.v4();
    var newFileName = newUuid + '.jpg';
    var newUploadedImagePath = './uploads/' + newFileName;

    sampleFile.mv(newUploadedImagePath, function(err) {
        if (err) {
            return res.status(500).send(err);
        }
        overlay({
            path: newUploadedImagePath,
            fileName: newFileName,
            uuid: newUuid,
            userId: user.facebook.id
        }, function(err, image) {
          console.log(err);
            if (err) return res.send('Error');

            res.redirect('/view/' + image.uuid);
        });
    });
});

app.get('/view/:uuid', function(req, res) {
    if (!req.params.uuid) return res.redirect('/');
    var uuid = req.params.uuid;
    Images.findOne({
        uuid: uuid
    }, function(err, image) {
        if (err) return res.json(err);
        console.log(image);
        res.render('result', image);
    });
});


// route for showing the profile page
app.get('/profile', isLoggedIn, function(req, res) {
    var user = req.user;
    var params = {
        fields: "picture"
    };

    graph
        .setAccessToken(user.facebook.token)
        .get(user.facebook.id + "/picture", params, function(err, resp) {
            Images.find({userId:user.facebook.id},function(err, images) {
                if (err) return res.json(err);
                var haveImages = (images.length >= 1) ? true : false;
                res.render('profile.ejs', {
                    user: user,
                    haveImages: haveImages,
                    image: resp,
                    images: images
                });
            })
        });
});

// =====================================
// FACEBOOK ROUTES =====================
// =====================================
// route for facebook authentication and login
app.get('/auth/facebook', passport.authenticate('facebook', {
    scope: 'email'
}));

// handle the callback after facebook has authenticated the user
app.get('/auth/facebook/callback',
    passport.authenticate('facebook', {
        successRedirect: '/profile',
        failureRedirect: '/'
    }));

// route for logging out
app.get('/logout', function(req, res) {
    req.logout();
    res.redirect('/');
});

app.listen(port, function() {
    console.log('Example app listening on port', port);
});

// route middleware to make sure a user is logged in
function isLoggedIn(req, res, next) {

    // if user is authenticated in the session, carry on
    if (req.isAuthenticated())
        return next();

    // if they aren't redirect them to the home page
    res.redirect('/');
}

var posterUrl = ['./image-manipulation/cover-uzb.png', './image-manipulation/1.png', './image-manipulation/uzb.png'];
var result, newFileName;

function overlay(image, callback) {

    var resultFile = './result/' + image.fileName;

    console.log(image);
    console.log('logo');

    newFileName = image.uuid + '.jpg';

    sharp('./uploads/' + image.fileName)
        .background('#fff')
        .overlayWith(posterUrl[0], {
            gravity: sharp.gravity.south
        })
        .quality(90)
        .toFile(resultFile, function(err, info) {
            if (err) return callback(err);

            var imageResults = [];
            imageResults.push(resultFile);

            var toSave = {
                uuid: image.uuid,
                image: {
                    fileName: image.fileName,
                    path: image.path
                },
                results: imageResults,
                userId: image.userId,
                created_at: new Date(),
                userId: image.userId
            };
            var newImages = new Images(toSave);
            newImages.save(function(err, result) {
                if (err) console.log(err);
            });

            var toReturn = {
                uuid: image.uuid,
            };
            callback(null, toReturn);
        })
};
