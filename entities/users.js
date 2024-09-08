const DB = require('mongoose')

module.exports = DB.model("users", new DB.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    }
}));