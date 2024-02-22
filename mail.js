const nodemailer = require('nodemailer');



// Nodemailer configuration


async function sendmail(Email,Name,otp){
    const transporter=nodemailer.createTransport({
        service:"gmail",
        auth:{
            user: 'murshidm2x@gmail.com', 
            pass: 'xsijdqeknincbxnl', 
        }
    })

  
//configure email condebt
const mailOptions ={
from:'murshidm2x@gmail.com',
to:Email,
subject:`email verification for ${Name}`,
text:`This OTP is valid for the next 1 minute. This is your otp:${otp}, `
}

//send mail

try {
    const result= await transporter.sendMail(mailOptions)
    // console.log("email send success fully");
} catch (error) {
   console.log("error");
}




}
module.exports=sendmail