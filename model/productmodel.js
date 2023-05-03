const mongoose = require('mongoose');
const crypto = require("crypto");

const productSchema = mongoose.Schema(
    { 
        uuid: {type:String,required:false},
        productName: {type:String,required:true},
        price: {type:String,required:true},
        color: {type:String,required:true},
        productModel:{type:String,required:true},
        userUuid: {type:String,required:true}

     },
     {
        timestamps:true,
     }
);

productSchema.pre("save",function (next){
    this.uuid =
    "PRO-" + crypto.pseudoRandomBytes(4).toString("hex").toLocaleUpperCase();
    next();
});

module.exports = mongoose.model("product",productSchema,"Product");