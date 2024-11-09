const express = require("express");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const User = require("./userModal");
require("dotenv").config();

const requireAuth = async (req, res, next) => {
  const { authorization } = req.headers;
  if (!authorization) {
    return res.status(401).json({ error: "Authorization token required" });
  }

  const token = authorization.split(" ")[1];

  try {
    const { _id } = jwt.verify(token, process.env.SECRET);
    req.User = await User.findOne({ _id }).select("_id");
    next();
  } catch (error) {
    console.log(error);
    res.status(400).json({ error: "Request is not authorized" });
  }
};

const buyitems = async (req, res) => {
  const { user, item, number, price,round } = req.body;
  if (!mongoose.Types.ObjectId.isValid(user._id)) {
    return res.status(404).json({ error: "user does not exist !!!" });
  }
  const id = user._id;
  var amount = user.amount;
  amount = amount - number * price;
  var a = 1;
  user.cart.forEach((stuff) => {
    if (stuff.item === item) {
      stuff.number = stuff.number + number;
      a++;
    }
  });
  if (a == 1) {
    const newitem = { item: item, number: number };
    user.cart.push(newitem);
  }
  try {
    const newUser = await User.findByIdAndUpdate(
      { _id: id },
      { amount: amount, cart: user.cart , round:round},
      { new: true }
    );
    res.status(200).json(newUser);
  } catch (error) {
    res.status(400).json(error.message);
  }
};

const sellitems = async (req, res) => {
  const { user, item, number, price,round } = req.body;
  if (!mongoose.Types.ObjectId.isValid(user._id)) {
    return res.status(404).json({ error: "user does not exist !!!" });
  }
  const id = user._id;
  const existing = await User.findById(id);
  existing.amount = existing.amount + number*price;
  existing.round = round;
  existing.cart.forEach((stuff) => {
    if (stuff.item === item) {
      stuff.number = stuff.number - number;
    }
  });
  existing.cart.filter((stuff) => stuff.number > 0)
  
  try {
    const updatedUser = await existing.save();
    res.status(200).json(updatedUser);
  } catch (error) {
    res.status(400).json(error.message);
  }
};

const router = express.Router();

router.use(requireAuth);

router.patch("/buy", buyitems);
router.patch("/sell", sellitems);

module.exports = router;