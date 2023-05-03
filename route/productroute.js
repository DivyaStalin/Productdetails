const router = require('express').Router();
const productSchema = require('../model/productmodel');
//console.log("productschem",productSchema);
const {isAdmin} = require('../middleware/auth')

router.post('/addproduct',isAdmin, async (req,res)=>{
         console.log("body",req.body);
        let productName = req.body.productName;
        let price = req.body.price;
        let color = req.body.color;
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
    
    
module.exports = router;