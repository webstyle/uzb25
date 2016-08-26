// models/user.js
var mongoose = require('mongoose');

// define the schema for our images model
var imagesSchema = mongoose.Schema({
    uuid: String,
    image : {
        fileName : String,
        path: String
    },
    results : Array,
    userId: String,
    created_at: Date
});

// create the model for users and expose it to our app
module.exports = mongoose.model('Images', imagesSchema);
