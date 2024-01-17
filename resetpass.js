const nodemailer = require('nodemailer');



// Nodemailer configuration


async function resetpassmail(Email,Name,token){
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
subject:`email for Reset password ${Name}`,
html:`<p>please click here to <a href="http://127.0.0.1:3000/forget-password?token=${token}">Reset</a></p>`
}

//send mail

try {
    const result= await transporter.sendMail(mailOptions)
} catch (error) {
   console.log("error");

}




}
module.exports=resetpassmail