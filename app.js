var express = require('express')
var fileUpload = require('express-fileupload');
var fs = require('fs');
var gm = require('gm');
var async = require('async');
var app = express();

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
            .in("-gravity", "center")
            .in("./uploads/filename.jpg")
            .write("./uploads/result.jpg", function(e) {
                if (err) return res.send('Error');
                res.redirect('/result.jpg');
            });
    });
});

app.listen(3000, function() {
    console.log('Example app listening on port 3000!');
});
