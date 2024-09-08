const DB = require('mongoose')

module.exports = DB.model("exercises", new DB.Schema({
    description: {
        type: String,
        required: true,
        unique: true
    },
    duration: {
        type: Number,
        required: true,
    },
    date: {
        type: String,
        required: true
    }
}));