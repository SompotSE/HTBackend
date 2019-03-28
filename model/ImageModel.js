const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ImageSchema = new Schema({
    Id_Map: {
        type: String
    },
    Id_Build: {
        type: String
    },
}, {
        collection: 'image'
    });

module.exports = mongoose.model('image', ImageSchema);