var sharp = require('sharp');
var uuid = require('node-uuid');

module.exports.overlay = overlay;

let posterUrl = ['../poster/1.png', '../poster/uzb.jpg'];
let result;

/**
 * Overlay image-manipulation with poster
 * @param image
 */
function overlay(image) {
    sharp(posterUrl[0])
        .resize(140)
        .toBuffer()
        .then(function (logo) {

            result = uuid.v4() + '.jpg';

            sharp(image)
                .background('#fff')
                .overlayWith(logo, {
                    gravity: sharp.gravity.south
                })
                .quality(90)
                .toFile(result, function (err, info) {
                    if (err) return res.send(err);

                    console.log(info);
                    res.redirect('/' + result);
                })
        });
};