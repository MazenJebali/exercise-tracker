const DB = require('mongoose')

const structure = new DB.Schema({
    idUser: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true,
    },
    duration: {
        type: Number,
        required: true,
    },
    date: {
        type: String,
        required: true
    }
})

structure.index({ idUser: 1, description: 1 }, { unique: true });

module.exports = DB.model("exercises", structure);