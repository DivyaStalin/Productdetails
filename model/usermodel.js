const mongoose = require('mongoose');

const Schema = mongoose.Schema;
const crypto = require('crypto');

const userSchema = new Schema({
   uuid:{type:String,required:false},
    userName:{type:String,require:true},
    email:{type:String,require:true},
    password:{type:String,require:true},
    loginstatus:{type:String,require:false,default:false},
    verified:{type:String,required:false,default:true},
    role:{type:String,enum:['admin','user'],required:true,default:"user"},
    
},
{
    timestamps:true,
});
userSchema.pre("save",function(next){
    this.uuid = "USER-" + crypto.pseudoRandomBytes(4).toString('hex').toLocaleUpperCase();
    next();
});



const User = mongoose.model("user",userSchema);

module.exports = User;