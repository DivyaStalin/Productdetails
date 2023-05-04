const mongoose = require('mongoose');
const crypto = require('crypto');

const catSchema = mongoose.Schema(
    {
    uuid : {type:String,required:false},
    pName: {type:String,required:true},
    catName : {type:String,required:true},
    image :{type:String,required:true},
    userUuid:{type:String,required:true}
    
    },
    {
        timestamps:true
    });

    catSchema.pre("save",function(next){
        this.uuid  = "CAT-" + crypto.pseudoRandomBytes(10).toString("hex").toLocaleUpperCase();
        next();
    });
    module.exports = mongoose.model("cat",catSchema,"cat");