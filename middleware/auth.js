const jwt = require('jsonwebtoken')
const userSchema = require('../model/usermodel');

async function isAdmin(req,res,next){
    try{
      let token = req.header("token");
      if(!token){
        res.status(404).json({
            status:false,message:'unauthorised access'
        });
      }

      const decode = jwt.verify(token,process.env.secretKey);
      if(decode.role === "admin"){
        next();
      }else{
        res.status(404).json({message:"unauthorised user"});
      }
    }catch(err){
        res.status(400).json({
            message:err.message
        });

    }
}
module.exports = {
    isAdmin,
}