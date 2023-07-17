const mongoose = require('mongoose');

const connetToMongo =async () => {
    await mongoose.connect("mongodb+srv://Sameer:beZdmx5TeDMLDV5@cluster0.rubvk.mongodb.net/p?retryWrites=true&w=majority", { useNewUrlParser: true },()=>{
        console.log("connect to Mongodb")
    })
}
module.exports = connetToMongo;