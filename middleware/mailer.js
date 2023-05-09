const mailer =require('nodemailer');
const ejs=require('ejs');
const {join} = require('path');
  async function mail(mailData){
    let transporter = mailer.createTransport({
        service:"gmail",
        host:"smtp.gmail.com",
        port: 587,
        secure:false,
        auth:{
            user:"divyachinnu.j1988@gmail.com",
            pass:"nhtlbvntzdkzzbde"
        }
    });
    
    const data = await ejs.renderFile(join(__dirname,"../templates",mailData.fileName),
    mailData,mailData.details);
    const info = await transporter.sendMail({
        from:mailData.from,
        to:mailData.to,
        subject:mailData.subject,
        text:mailData.text,
        html:data,
    });
    console.log("message sent",info.messageId);
  }
    
  module.exports = {
    mailsending:mail,
  }