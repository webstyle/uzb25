var express = require('express')
var fileUpload = require('express-fileupload');
var fs = require('fs');
var gm = require('gm');
var async = require('async');
var sharp = require('sharp');

var passport = require('passport');
var FacebookStrategy = require('passport-facebook');

var app = express();

var facebook_client_id = "id";
var facebook_client_secret = "";

passport.use(new FacebookStrategy({
        clientID: facebook_client_id,
        clientSecret: facebook_client_secret,
        callbackURL: "http://localhost:3000/auth/facebook/callback"
    },
    function(accessToken, refreshToken, profile, cb) {
        console.log(arguments);
    }
));

app.use(express.static('public'));
app.use(express.static('result'));

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
		

		// graphicsmagick
        // gm()
        //     .command('composite')
        //     .in("-gravity", "center")
        //     .in("./uploads/uzb.png")
        //     .in("-gravity", "center")
        //     .in("./uploads/filename.jpg")
        //     .write("./result/result.jpg", function(err) {
        //         if (err) return res.send('Error');
        //         res.redirect('/result.jpg');
        //     });
        
	
		// libvips
        sharp('./uploads/uzb.png')
            .resize(140)
            .toBuffer()
            .then(function(logo) {
                sharp('./uploads/filename.jpg')
                    .background('#fff')
                    .overlayWith(logo, {
                        gravity: sharp.gravity.south
                    })
                    .quality(90)
                    .toFile('./result/result.jpg', function(err, info) {
                        console.log(err);
                        if (err) return res.send(err);
                        res.redirect('/result.jpg')
                    })
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
