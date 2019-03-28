const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const SenserSchema = new Schema({
    Position: {
        type: String,
    },
    Macaddress: {
        type: String,
    },
    Temp_Low: {
        type: Number,
    },
    Temp_Hight: {
        type: Number,
    },
    Humdi_Low: {
        type: Number,
    },
    Humdi_Hight: {
        type: Number,
    },
    Key_Room: {
        type: String,
    },
    Id_Build: {
        type: String
    },
    date: {
        type: Date,
        default: Date.now
    }
},{
    collection: 'sensers'
});

module.exports = mongoose.model('sensers', SenserSchema);