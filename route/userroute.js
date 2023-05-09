const UserSchema = require("../model/usermodel");
const { Router } = require('express');
const bcrypt = require('bcrypt');
const route = require('express').Router();
const jwt = require('jsonwebtoken');
const { mailsending } = require('../middleware/mailer');
const ejs=require('ejs');
const {join} = require('path');



const transporter = nodemailer.createTransport({
    service: "gmail",
    host:"smtp.gmail.com",
        port: 587,
        secure:false,
    auth: {
       user: process.env.email,
       pass: process.env.pass,
    },
});


route.post("/register",async (req,res)=>{
    console.log("user body",req.body);
     let userName = req.body.userName;
     let email = req.body.email;
     let password = req.body.password;
     let role = req.body.role;
     let port= 8005;

    const mailData = {
        to:email,
        subject:"verify email",
        text:"Hello",
     fileName:"emailverification.ejs",
        details:{
            name:userName,
            date:new Date(),
            link:`http://localhost:${port}/user/email-verify?userName=${userName}`,
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

//emailverification
route.get('/email-verify',async(req,res)=>{
    try{
        const data = await UserSchema.findOne({userName:req.query.userName}).exec();

        if(data){
        
            if(data.verified){
                console.log(true,data.verified);
                
                res.render("verify.ejs",{title:"Your account is  verified"});
                
                }
            else{
                console.log(false,data.verified);
                const data = await UserSchema
                .findOneAndUpdate(
                    {userName:req.query.userName},
                    {verified:true},
                    {new:true}
                ).exec();

                
                res.render("verify.ejs",{title:"Your accout is verified successfully"});
            }

            }else{
                res.render("verify.ejs",{title:"Your account  verification failed"});
            }
        }catch(err){
        return res.status(400).json({status: false,message:"failed",});
    }
})
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
//login user
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
                res.status(400).json({status:false,message:'Password does not match'});
                
            }
        }
        else{
            res.status(200).json({status:false,message:'user not found'});
        }
    }
    else{
        res.status(400).json({status:false,message:'enter email id'});
    }
});
//send reset link to the password
route.post("/resetlink",async(req,res)=>{
    try{
        let email = req.body.email;
        let user = await UserSchema.findOne({email:email}).exec();
        if(user){
            console.log("valid");
            res.render("resetlink",{title:"Reset password link is sent to your account"})
            const url = `http://localhost:8005/user/reset`
               transporter.sendMail({
                  to: email,
                  subject: 'Verify Account',
                  html: `Click <a href = '${url}'>here</a> to confirm your email.`
       });

        }
        else{
            res.status(400).json({status:"false",message:"Enter valid Email"});
        }

    }catch(err){
           console.log("err");
    }
});


//resetPassword
route.post('/resetPassword',async(req,res)=>{
    let userName=req.body.userName;
    let resetPassword=req.body.resetPassword;
    let user = await UserSchema.findOne({userName:userName}).exec();
    try{
    if(user){
        let updatePassword = await UserSchema.findOneAndUpdate({password:resetPassword}).exec();
        res.status(200)
    .json({
        status:true,
        message:"successfully updated",
        result: updatePassword,
    });
    }
}catch(err){
    res.status(400).json({status:"false",message:err.message});
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