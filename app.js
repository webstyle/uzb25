var express = require('express')
var fileUpload = require('express-fileupload');
var fs = require('fs');
var gm = require('gm');
var async = require('async');

var passport = require('passport');
var FacebookStrategy = require('passport-facebook');

var app = express();


passport.use(new FacebookStrategy({
        clientID: 1179014042141213,
        clientSecret: "915a8f331012718516e73c2480f40aba",
        callbackURL: "http://localhost:3000/auth/facebook/callback"
    },
    function(accessToken, refreshToken, profile, cb) {
        console.log(arguments);
    }
));

app.use(express.static('public'));
app.use(express.static('uploads'));

// default options
app.use(fileUpload());

app.post('/upload', function(req, res) {
    var sampleFile;

    if (!req.files) {
        res.send('No files were uploaded.');
        return;
    }

    sampleFile = req.files.sampleFile;
    var uploadedFile = './uploads/filename.jpg';
    sampleFile.mv(uploadedFile, function(err) {
        if (err) {
            return res.status(500).send(err);
        }

        gm()
            .command('composite')
            .in("-gravity", "center")
            .in("./uploads/uzb.png")
            .blur(30, 30)
            .in("-gravity", "center")
            .in("./uploads/filename.jpg")
            .write("./uploads/result.jpg", function(e) {
                if (err) return res.send('Error');
                res.redirect('/result.jpg');
            });
    });
});


app.get('/auth/facebook',
    passport.authenticate('facebook'));

app.get('/auth/facebook/callback',
    passport.authenticate('facebook', {
        failureRedirect: '/login'
    }),
    function(req, res) {
        // Successful authentication, redirect home.
        res.redirect('/');
    });

var port = process.env.PORT || 3000;

app.listen(port, function() {
    console.log('Example app listening on port', port);
});
