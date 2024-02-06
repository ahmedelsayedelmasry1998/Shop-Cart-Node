const mongoose = require("mongoose");
const productSchema = mongoose.Schema({
imagePath : {
    type:String,
    required : true,
},
productName : {
type : String,
required : true,
},
information : {
type : {
    storageCapacity  : String,
    numberOfSim : String,
    realComaraResaluation :String,
    dualSize: String
},
required : true,
},
price :{
    type : Number,
    required : true,
}

});
module.exports = mongoose.model("Product",productSchema);