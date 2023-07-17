const mongoose = require('mongoose');

const BdaySchema = new mongoose.Schema({
    name:{
        type:String,
        required:true,
    },
    phone:{
        type:Number,
        required:true
    },
    Dob:{
        type:String,
        required:true
    },
    date:{
        type:Date,
        default:Date.now
    },
})

module.exports = mongoose.model('bday',BdaySchema);