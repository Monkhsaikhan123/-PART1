const express = require ('express');
const app = express();
const mongoose = require('mongoose')

app.use(express.json())
const cors = require('cors')
app.use(cors())
const bcrypt = require('bcryptjs')
app.set("view engine", "ejs");
app.use(express.urlencoded({extended:false}))
var nodemailer = require('nodemailer');

const jwt = require('jsonwebtoken');
const JWT_SECRET= "hagakljkglahgahgla[]lkjfk34dadw3523ghdgz";


mongoose.connect("mongodb+srv://DbUser:DbUser@munkh.tgu5wgq.mongodb.net/Login",{

}).then(()=>{console.log("connected Database")})
.catch((e)=>console.log(e))

require('./schema')
const User = mongoose.model('users');

app.post('/register', async(req,res)=>{
    const {fname, lname, email,password,Usertype} = req.body;

    const encryptedPassword = await bcrypt.hash(password, 10)
    try{
        const oldUser =await User.findOne({email});
        if(oldUser){
           return res.send({error: " User Exist"})
        }
        await User.create({
            fname,
            lname,
            email,
            password:encryptedPassword,
            Usertype
        })
        res.send({status : 'ok'})
    }catch{
        res.send({status: 'error'})
    }
})

app.post('/login-user', async(req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email })
    if(!user){
        return res.json({error : "User not Found"});
    }
    if(await bcrypt.compare(password, user.password)){
        const token = jwt.sign({email: user.email}, JWT_SECRET, {
            expiresIn:'1000m'
        });
        
        if(res.status(201)){
            return res.json({status: 'ok', data:token})
        }else{
            return res.json({error: 'error'});
        }
    }
    res.json({status:'error', error:'invalid password'})
})


app.post('/userData', async(req,res)=>{
    const {token}= req.body;
    try {
        const user=jwt.verify(token,JWT_SECRET,(err,res)=>{
            if(err){
                return 'token expired';
            }
           return res;
        });
        console.log(user);
        if(user==='token expired'){
            return res.send({status:'error', data:'token expired'})
        }
        
        const useremail = user.email;
        console.log(user)
        User.findOne({email:useremail}).then((data)=>{
            res.send({status:'ok', data:data})
        }).catch((error)=>{
            res.send({status:'error', data:error})
        })

    } catch (error) {
        
    }
})
app.post('/forgot-password', async(req,res)=>{
    const{email}= req.body
    try {
        const oldUser = await User.findOne({email});
        if(!oldUser){
            return res.json({status:"user not exists!"})
        }
        const secret = JWT_SECRET + oldUser.password;
        const token = jwt.sign({email:oldUser.email, id:oldUser._id}, secret, {expiresIn:'5m'})
        const link = `http://localhost:3000/reset-password/${oldUser._id}/${token}`;
        var transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
              user: 'monkhsaikhan01@gmail.com',
              pass: 'ymsp jsnp srdv bugm'
            }
          });
          
          var mailOptions = {
            from: 'youremail@gmail.com',
            to: email,
            subject: 'Password Reset',
            text: link
          };
          
          transporter.sendMail(mailOptions, function(error, info){
            if (error) {
              console.log(error);
            } else {
              console.log('Email sent: ' + info.response);
            }
          });
        console.log(link);
    } catch (error) {
        
    }
})
app.get('/reset-password/:id/:token', async(req,res)=>{
    const {id,token} = req.params;
    console.log(req.params)
    const oldUser = await User.findOne({_id : id});
    if(!oldUser){
        return res.json({status:"User not exists!!"})
    }
    const secret = JWT_SECRET + oldUser.password;
    try{
        const verify=jwt.verify(token,secret)
        res.render("index",{email:verify.email, status:'Not verified'})
    }catch(error){
        console.log(error);
        res.send("Not verified");
    }
})

app.post('/reset-password/:id/:token', async(req,res)=>{
    const {id,token} = req.params;
    const{password}=req.body;
    const oldUser = await User.findOne({_id : id});
    if(!oldUser){
        return res.json({status:"User not exists!!"})
    }
    const secret = JWT_SECRET + oldUser.password;
    try{
        const verify=jwt.verify(token,secret)
        const encryptedPassword = await bcrypt.hash(password,10);
        await User.updateOne(
        {
            _id:id,
        },
        {
            $set:{
                password:encryptedPassword,
            }
        }
        )
        res.render('index', {email:verify.email,status:'verified'})



    }catch(error){
        console.log(error);
        res.json({status:"Something wend wrong"});
    }
})




/* Product Database */


const Products = mongoose.model('Products')
app.post('/addProduct',async(req,res)=>{
    const {name, img, desc, price} = req.body;
    try {
        await Products.create({
            name,
            img,
            desc,
            price
        })
        res.send({status:'ok'})
    } catch (error) {
        res.send({status:'error'})
    }
})







///MEDEENII DATABASE
const medeeModel = mongoose.model("Medee")

app.get('/medee', async(req,res)=>{
    const data = await medeeModel.find({})
    res.json({success:true, data:data})
})


///Create data and save data mongodb

//http://localhost:3000/create
app.post('/create',async(req,res) =>{
    console.log(req.body)
    const data = new medeeModel(req.body)
    await data.save()
    res.send({success: true, message: 'data save successfully', data : data})
})

///update data
//http://localhost:3000/update


app.put('/update' , async(req,res)=>{
    console.log(req.body)
    const { id, ...rest} = req.body

    console.log(rest)
    const data = await medeeModel.updateOne({_id : id},rest)
    res.send({success: true, message: "data update successfully", data : data})
})

// delete api
//http://localhost:3000/delete/id
app.delete('/delete/:id',async(req,res)=>{
    const id = req.params.id
    console.log(id)
    const data = await medeeModel.deleteOne({_id : id})
    res.send({success: true, message: "data deleted successfully", data : data})
})


app.listen(3000,()=>{
    console.log("server started")
});

