const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ImageSchema = new Schema({
    image: {
        type: String,
    },
}, {
        collection: 'image'
    });

module.exports = mongoose.model('image', ImageSchema);