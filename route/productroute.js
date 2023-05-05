const router = require('express').Router();
const productSchema = require('../model/productmodel');
//console.log("productschem",productSchema);
const {isAdmin} = require('../middleware/auth')
const catSchema = require("../model/categorymodel");
router.post('/addproduct',isAdmin, async (req,res)=>{
         console.log("body",req.body);
        let productName = req.body.productName;
        let price = req.body.price;
        let color = req.body.color;
        let catUuid=req.body.catUuid;
        let userUuid = req.body.userUuid;
        
        const data = new productSchema(req.body);

        const result = await data.save();
        if(result){
            return res.status(200)
            .json({status:true,message:'success',result:result});}
            else {
                return res.status(400).json({status: false,message:"failed",});
            }
});
router.put("/updateproduct",async (req, res) => {
    let productName = req.body.productName;
    let color = req.body.color;
    const User = await productSchema.findOne({ productName:productName}).exec();
    if (User){
        const updateColor = await productSchema.findOneAndUpdate({color:color}).exec();
        res.status(200)
        .json({
            status:true,
            message:"successfully updated",
            result: updateColor,
        });
    }
    else{
        res.status(400).json({
            status:false,
            message:"no user found"
        });
    }
    });
    router.delete("/deleteproduct",async (req,res)=>{
        let productName = req.body.productName;
        
        const User = await productSchema.findOne({productName:productName}).exec();
        
        if(User){
            const deleteuser = await productSchema.deleteOne({productName:productName}).exec();
    
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
    router.get('/getallproduct', async(req,res)=>{
        const alluser = await productSchema.find().exec();
    
        if(alluser){
            res.status(200)
            .json({status:true,message:'success',result:alluser});   
        }
        else{
            res.status(400)
            .json({status:false,message:'failed'});
        }
    });
    router.get("/getone",isAdmin,async(req,res) => {
        let user = req.body.productName;
        const alluser = await productSchema.findOne({productName:user}).exec();
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
   router.post('/addcategory',isAdmin,async(req,res)=>{
    try{
      console.log("request body",req.body);
    let catName = req.body.catName;
    let image = req.body.image;
    let userUuid = req.body.userUuid;
    
    const data = new catSchema(req.body);
    const result = await data.save();
    console.log("result:",result);
    res.status(200)
            .json({status:true,message:'successfully added',result:result});  
    }catch(err){
        res.status(400)
        .json({status:false,message:err.message});   
    }
   }); 
   router.get("/getcatproduct",async(req,res) => {
    let pName = req.body.pName;
    const alluser = await catSchema.find({pName:pName}).exec();
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
router.get("/getcatuser",async(req,res) => {
    let uuid = req.body.userUuid;
    const alluser = await catSchema.find({userUuid:uuid}).exec();
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


//aggregate using category and user based product
router.get('/catuserandproduct',async(req,res)=>{
try{
    const details = await catSchema.aggregate([
        {
            $lookup:{
            from:"Product",
            localField:"uuid",
            foreignField:"catUuid",
            as:"product_details"
        }

        },
        {
            $lookup:{
            from:"users",
            localField:"userUuid",
            foreignField:"uuid",
            as:"user_details"
        }

        },
        
        {
            $project: {
                _id:0,
                createdAt:0,
                updatedAt:0,
                image:0,
                _v:0
            }
        },
        {
            $unwind:{
                path:"$product_details",
                preserveNullAndEmptyArrays: true,
            }
        },
    ]);
    if(details.length>0){
        res.status(200).json({
            status:true,message:"success",result:details
        });
    }else{
        res.status(200).json({
        status:true,message:"Product details are not found"
        });
    }

}catch(err){
  res.status(400).json({status:false,message:err.message});
  console.log(err.message);
}
});
//filter product by price
router.get('/filterByPrice', async(req,res)=>{
    try{
        let id = req.query.id;
        const filterProduct = await productSchema.find({price:id}).exec();
        if(filterProduct)
             res.status(200).json({status:true,message:'success',result:filterProduct});
        }catch(err){
        res.status(400).json({status:false,message:err.message});
      console.log(err.message);
    }  
    });  
    //sort product by name
    router.get('/getProductByName', async(req,res)=>{
        try{
            let id = req.query.id;
            const filterProduct = await productSchema.find({productName:id}).exec();
            if(filterProduct)
                 res.status(200).json({status:true,message:'success',result:filterProduct});
            }catch(err){
            res.status(400).json({status:false,message:err.message});
          console.log(err.message);
        }  
});  
    
module.exports = router;