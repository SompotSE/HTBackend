const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const AuthorizeSchema = new Schema({
    Key_Room: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    },
    Id_User: {
        type: String
    }
},{
    collection: 'authorize'
});

module.exports = mongoose.model('authorize', AuthorizeSchema);