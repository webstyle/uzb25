var sharp = require('sharp');
var path = require('path');


module.exports.overlay = overlay;

var posterUrl = ['./1.png', './uzb.png'];
var result, newUuid, newFileName;

/**
 * Overlay image-manipulation with poster
 * @param image
 */
function overlay(image, callback) {
        
    var uploadsPath = path.join(__dirname, '../uploads') + '/' + image.fileName;
    var resultsPath = path.join(__dirname, '../result') + '/' + image.fileName;
    
    console.log(image);
    console.log('logo');

    newFileName = image.uuid + '.jpg';

    sharp()
        .background('#fff')
        .overlayWith(posterUrl[0], {
            gravity: sharp.gravity.south
        })
        .quality(90)
        .toFile(resultsPath, function (err, info) {
            console.log('err',err);
            if (err) return callback(err);

            callback(null, {
                fileName: newFileName,
                savedPathPath: result,
                uuid: newUuid,
                info: info
            });
        })
};