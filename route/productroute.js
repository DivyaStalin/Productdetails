const router = require('express').Router();
const productSchema = require('../model/productmodel');
//console.log("productschem",productSchema);
const {isAdmin} = require('../middleware/auth')
const upload = require('../middleware/upload');
const catSchema = require("../model/categorymodel");
const multer = require('multer');
const path = require('path')

const storage = multer.diskStorage({
    destination:(req,file,cb) =>{
        cb(null,'uploads/')
    },
    filename: (req,file,cb) => {
        const filename = path.extname(file.originalname);
         cb(null,filename+'-'+Date.now());
    }
});
const uploadOptions = multer({storage:storage}).single('image');
router.post('/image',async(req,res)=>{
    try{
        
        const upload = await multer({ storage : storage}).single("file");
        upload(req,res,(err)=>{
            if(!req.file){
                res.send("Please select a file");
            }else if(err instanceof multer.MulterError){
                res.send(err);
            }
            else{
                res.send(req.file.filename);
            }
        });
}
     catch(err){
        console.log("Error",err);
        }
    
});
router.post('/addproduct',upload.single('file'), async (req,res)=>{
    try{
         console.log("body",req.body);
         //const filename = await uploadOptions(req,res);
            
        const productdata=new productSchema({    
         productName : req.body.productName,
         price : req.body.price,
         color : req.body.color,
         catUuid :req.body.catUuid,
         userUuid : req.body.userUuid
        })
         if(req.file){
            productdata.file=req.file.path
         }
     
        //const data = new productSchema(productdata);

         productdata.save()

        .then(response => {
            res.status(200)
            .json({status:true,message:'success'});
    
        })
        .catch(error=>{
             res.status(400).json({status: false,message:"failed",});
        });    
    }catch(err){
        console.log("err",err);
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
        let queryObj= {...req.query};
        console.log("query",queryObj);
        let queryStr = JSON.stringify(queryObj);
         queryStr = queryStr.replace(/\b(gte|lte|gt|lt)\b/g,(match)=>`$${match}`);
        let result = await productSchema.find(JSON.parse(queryStr));
        res.status(200).json({status:true,message:'success',result:result});
        
       }catch(err){
        res.status(400).json({status:false,message:err.message});
      console.log(err.message);

    }  
    });  
    //sort product by name
    router.get('/search', async(req,res)=>{
        try{
            let keyword = req.query.productName;
            let data = await productSchema.find({
                "$or":[{productName:{'$regex':req.query.keyword}}]
            }).exec();
            if(data)
                 res.status(200).json({status:true,message:'success',result:data});
            }catch(err){
            res.status(400).json({status:false,message:err.message});
          console.log(err.message);
        }  
});  
    
module.exports = router;