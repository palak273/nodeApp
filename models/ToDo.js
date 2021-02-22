const mongoose = require('mongoose')

const todoTemplate = new mongoose.Schema({
    todo:{
        type: String,
        required:true
    },
    date:{
        type:Date,
        default:Date.now
    }
})

module.exports = mongoose.model('mytodos', todoTemplate)