const mongoose = require('mongoose');

const UsersSchema = new mongoose.Schema(
    {
        fname:String,
        lname:String, 
        email:{ type: String,unique:true},
        password:String,
        Usertype:String,

    },{
        collection:'users'
    }
);

mongoose.model('users' , UsersSchema)


const ProductsSchema = new mongoose.Schema(
    {
        name:String,
        img:String,
        desc:String, 
        price:Number

    },{
        collection:'Products'
    }
);

mongoose.model('Products' , ProductsSchema)


const MedeeSchema = new mongoose.Schema({
    name:String,
    img:String,
    desc:String,
},{
    collection:"Medee"
})

mongoose.model("Medee" , MedeeSchema)


