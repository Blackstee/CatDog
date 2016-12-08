var mongoose = require ('mongoose');

var mypost = new mongoose.Schema({
    title: { type: String},
    author: { type: String },
    description: { type: String },
    image: {type: Buffer },
    modified: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Post', mypost);
