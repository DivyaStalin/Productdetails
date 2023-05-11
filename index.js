const {Admin} = require('mongodb');
const bodyparser = require("body-parser");
const {userInfo} = require('os');
const express = require('express');
const mongoose = require('mongoose');
const app = express();
const braintree = require('braintree');
const cors = require('cors');

app.use(cors({origin:"http://localhost:8005"}));
app.use(function(req,res,next){
    res.header("Access-control-Allow-origin","*");
    res.header("Access-Control-Allow-Headers","X-requested-With");
    next();
});

app.use(bodyparser.urlencoded({extended:false}));
app.use(bodyparser.json());


app.set("view engine","ejs");
app.use(express.static('./img'));
app.get('/signup',(req,res)=>{
    res.render('signup.ejs');
});
app.get('/login',(req,res)=>{
    res.render('login.ejs');
});
app.get('/register',(req,res)=>{
    res.render('login.ejs');
});
app.get('/resetlink',(req,res)=>{
    res.render('resetlink.ejs');
});
app.get('/reset',(req,res)=>{
    res.render('reset.ejs');
});



const env = require("dotenv").config();
app.use(express.json());
const userroute = require("./route/userroute");
const productRoute= require("./route/productroute");
const port = 8005;
const uri = process.env.db_url;
mongoose.connect(
    uri, {
    useNewUrlParser:true,
    useUnifiedTopology:true,
})
.then(()=>{
    console.log("Database Connected");
})
.catch((err)=>{
    console.log("DB error",err);
});

app.use("/user",userroute);
app.use("/product",productRoute);


const config ={
    environment:  braintree.Environment.Sandbox,
    merchantId:   'whg32stk6p7sn682',
    publicKey:    's697fcpmr5hkqzw6',
    privateKey:   'd84505c14e95cf3147d88174b62c7f12'

}

const gateway =new braintree.BraintreeGateway(config);
//Token Generation

app.get('/tokenGeneration',async(req,res)=>{
    try{
          gateway.clientToken.generate({},(err,resData)=>{
            if(err){
                return res.send({err:err});
            }else{
                console.log(resData);
                return res.status(200).json({status:true,message:"success",token:resData.clientToken});
            }
          })
    }catch(err){
        return res.json({err:err});

    }
})
// Payment using Braintree
app.post("/salesTransaction",async(req,res)=>{
   try{ 
    const paymentData = gateway.transaction.sale({
    amount : req.body.amount,
    PaymentMethodNonce:req.body.PaymentMethodNonce,
    options:{
        submitForSettlement:true
    }
}).then(data=>{
    console.log(data);
    return res.status(200).json({
        status:true,
        message:"success",
        result:data.transaction
    });
    }).catch(err=>{
        return res.json({err:err})
    });
}catch(error){
    return res.json({err:err});
}  
});


app.listen(port,() => {
    console.log("App is listening port:8080");
});

