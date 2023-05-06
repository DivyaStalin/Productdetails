const UserSchema = require("../model/usermodel");
const { Router } = require('express');
const bcrypt = require('bcrypt');
const route = require('express').Router();
const jwt = require('jsonwebtoken');
const { mailsending } = require('../middleware/mailer');

route.post("/register",async (req,res)=>{
    console.log("user body",req.body);
     let userName = req.body.userName;
     let email = req.body.email;
     let password = req.body.password;
     let role = req.body.role;

    const mailData = {
        to:email,
        subject:"verify email",
        text:"Hello",
        details:{
            name:userName,
            date:new Date(),
        },
    };

    let mailresult = mailsending(mailData);
    if(!mailresult){
        console.log("mail not sending");
    }else{
        console.log("email sent");
        const user =  UserSchema(req.body);
        const salt = await bcrypt.genSalt(10);
        user.password = bcrypt.hashSync(password,salt);
    
        const result = await user.save();
        if(result){
          return res.status(200)
          .json({status:true,message:'success',result:result});}
         else {
            return res.status(400).json({status: false,message:"failed",});
    }
    }
    
});
route.get('/getall',async(req,res)=>{
    const alluser = await UserSchema.find().exec();

    if(alluser){
        res.status(200)
        .json({status:true,message:'success',result:alluser});   
    }
    else{
        res.status(400)
        .json({status:false,message:'failed'});
    }
});
route.get("/getone",async(req,res) => {
    let user = req.body.userName;
    const alluser = await UserSchema.findOne({userName:user}).exec();
    console.log("user det",alluser);
    if(alluser){
        res.status(200)
        .json({status:true,message:'success',result:alluser});   
    }
    else{
        res.status(400)
        .json({status:false,message:'failed'});
    }
});
route.put("/updateuser",async (req, res) => {
let user = req.body.userName;
let mail = req.body.email;
const User = await UserSchema.findOne({ userName:user}).exec();
if (User){
    const updateMail = await UserSchema.findOneAndUpdate({email:mail}).exec();
    res.status(200)
    .json({
        status:true,
        message:"successfully updated",
        result: updateMail,
    });
}
else{
    res.status(400).json({
        status:false,
        message:"no user found"
    });
}
});
route.delete("/delete",async (req,res)=>{
    let mail = req.body.email;
    console.log("mail",mail);
    const User = await UserSchema.findOne({email:mail}).exec();
    console.log("user",User);
    if(User){
        const deleteuser = await UserSchema.deleteOne({email:mail}).exec();

        res.status(200).json({
            status:true,
            message:"deleted successfully",
        });
    }else{
        res.status(400)
        .json({status:false,
        message:"No user found",
    });
    }
});
route.post('/login',async(req,res)=>{
    let email = req.body.email;
    let password = req.body.password;
    let userdetails;
    const user = await UserSchema.findOne({email:email}).select("-email-_id").exec();
    if(email){
         userdetails = await UserSchema.findOne({email:email}).exec();

      if(userdetails){
            let match = await bcrypt.compare(password,userdetails.password);
            let payload = { uuid:userdetails.uuid,role:userdetails.role};
            if(match){
                let userdetails = user.toObject();
                let jwttoken = jwt.sign(payload,process.env.secretkey);
                userdetails.jwttoken = jwttoken;
                 await UserSchema
                .findOneAndUpdate({email:email},{loginstatus:true},{new:true})
                .exec();
                res
                .status(200)
                .json({status:true,message:'login success',result:userdetails});
            }
            else{
                res.status(400).json({status:false,message:'password doesnot match'});
            }
        }else{
            res.status(200).json({status:false,message:'user not found'});
        }
    }else{
        res.status(400).json({status:false,message:'enter email id'});

    }
});
route.post('/logout',async(req,res)=>{

        let userName = req.body.userName;
        const userdetails = await UserSchema.findOne({userName:userName}).exec();
        if(userdetails){
            await UserSchema.findOneAndUpdate(
                {userName:userName},
                {loginstatus:false},
                {new:true}).exec();
            
        res
        .status(404)
        .json({status:true,message:'logout successfully'});
            }

    
    else{
        res
        .status(400)
        .json({status:false,message:'No user found'});
    }

});
module.exports = route;