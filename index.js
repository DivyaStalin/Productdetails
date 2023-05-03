const {Admin} = require('mongodb');
const bodyparser = require("body-parser");
const {userInfo} = require('os');
const express = require('express');
const mongoose = require('mongoose');
const app = express();

app.set("view engine","ejs");
app.use(express.static('./img'));
app.get('/signup',(req,res)=>{
    res.render('signup.ejs');
});
app.get('/login',(req,res)=>{
    res.render('login.ejs');
});
app.get('/logout',(req,res)=>{
    res.render('login.ejs');
});

const env = require("dotenv").config();
app.use(express.json());
const userroute = require("./route/userroute");
const productRoute= require("./route/productroute");
const port = 8005;
//db_url="mongodb+srv://register:signin@cluster0.a9meatp.mongodb.net/test";
app.use(bodyparser.urlencoded({extended:false}));
app.use(bodyparser.json());
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

app.listen(port,() => {
    console.log("App is listening port:8080");
});

