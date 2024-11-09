const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const User = require("./userModal");
const cartRoutes = require('./cartRoutes')
require("dotenv").config();

const app = express();
app.use(express.json());

const corsOptions = {
  origin: process.env.LINK,
  optionsSuccessStatus: 200,
  credentials: true,
};

app.options("*", cors(corsOptions));
app.use(cors(corsOptions));

app.listen(process.env.PORT, async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log(`Connected to MongoDB and listening on port ${process.env.PORT}`);
  } catch (error) {
    console.log(error);
  }
});

const createToken = (_id) => {
    return jwt.sign({ _id }, process.env.SECRET, { expiresIn: "2d" });
};

const loginuser = async (req, res) => {
    const { phonenumber,name } = req.body;
  
    try {
    const exists = await User.findOne({ phonenumber });
    if (exists) {
        const token = createToken(exists._id);
        const user = exists;
        res.status(200).json({user,token})
    }
    const user = await User.create({phonenumber:phonenumber,amount:10000,name:name});
    const token = createToken(user._id);
  
      res.status(200).json({ user, token });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
};

app.get('/',(req,res)=>{
  res.status(200).json({ database:'connecting' })
})
app.post('/login',loginuser)
app.use('/cart',cartRoutes)
