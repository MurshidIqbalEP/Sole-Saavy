const moongose = require("mongoose")
// moongose.connect("mongodb://127.0.0.1:27017/sole_Savvy");
require('dotenv').config();
moongose.connect(process.env.MONGODB_URI)


const express = require("express")
const app = express();
const port = process.env.port || 3000;
const path = require("path")
const session = require("express-session")
const nocache = require('nocache');



const userRoute  = require('./routes/userRoutes');
const adminRoute = require('./routes/adminRoutes');

app.use(express.static(path.join(__dirname, 'public')));

app.use(nocache());

app.use(
    session({
        secret: Math.floor(10000 + Math.random() * 90000).toString(),
        resave: false,
        saveUninitialized: true,
    })
)


app.use('/', userRoute)
app.use('/admin', adminRoute);

app.use('/*', (req,res)=>{
    res.status(404).render('userView/404.ejs')
});


app.set("view engine", "ejs")

app.listen(port, () => {
    console.log("server is running on port 3000");
})

