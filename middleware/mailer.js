const mailer =require('nodemailer');
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
    const info = await transporter.sendMail({
        from:mailData.from,
        to:mailData.to,
        subject:mailData.subject,
        text:mailData.text,
    });
    console.log("message sent",info.messageId);
  }
  module.exports = {
    mailsending:mail,
  };