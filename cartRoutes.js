const express = require("express");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const User = require("./userModal");
require("dotenv").config();

const Data=[
  {
      Commodityname:'oil',
      prices:[
          100, 89.45, 80.8, 68.68, 42.58, 46.39, 52.01, 17.09, 17.33, 11.44, 25.39,
          31.74,
      ],
      Image:'https://res.cloudinary.com/dgtdkqfsx/image/upload/v1731140561/oil-price_eqdx8h.png'
  },
  {
      Commodityname:'wheat',
      prices:[
          100, 102.5, 125.05, 173.32, 86.66, 138.65, 166.38, 183.02, 155.57, 178.9,
          232.58, 244.2,
      ],
      Image:'https://res.cloudinary.com/dgtdkqfsx/image/upload/v1731140692/flour_vmys6b.png'
  },
  {
      Commodityname:'gold',
      prices: [
          100, 88, 83.6, 95.3, 133.42, 150.77, 134.18, 112.71, 129.62, 162.02, 164.46,
          180.9,
      ],
      Image:'https://res.cloudinary.com/dgtdkqfsx/image/upload/v1731141009/coins_a53g7q.png'
  },
  {
      Commodityname:'urea',
      prices:[
          100, 103.1, 105.36, 107.26, 108.76, 110.18, 112.05, 114.74, 102.12, 112.13,
          229.86, 181.43,
      ],
      Image:'https://res.cloudinary.com/dgtdkqfsx/image/upload/v1731140803/fertility_uku47l.png'
  },
  {
      Commodityname:'copper',
      prices:[
          100, 117.5, 115.97, 98.57, 39.43, 40.41, 29.9, 20.03, 16.03, 14.18, 17.3,
          17.53,
      ],
      Image:'https://res.cloudinary.com/dgtdkqfsx/image/upload/v1731141140/copper_aixrgk.png'
  },
  {
      Commodityname:'iron',
      prices:[
          100, 70, 71.19, 73.46, 29.38, 30.12, 29.21, 19.57, 7.83, 8.84, 9.55, 8.07,
          8.1,
      ],
      Image:'https://res.cloudinary.com/dgtdkqfsx/image/upload/v1731140803/ore_khalvr.png'
  },
  {
      Commodityname:'corn',
      prices:[
          100, 87.5, 91.17, 91.26, 130.13, 134.82, 107.85, 96.42, 97.29, 160.33,
          151.84, 140.9,
      ],
      Image:'https://res.cloudinary.com/dgtdkqfsx/image/upload/v1731140803/food_c0hchi.png'
  },
  {
      Commodityname:'steel',
      prices:[
          100, 102.53, 90.49, 164.22, 104, 103.48, 85.47, 84.44, 86.46, 86.01, 84.56,
          78.3,
      ],
      Image:'https://res.cloudinary.com/dgtdkqfsx/image/upload/v1731141062/steel-bar_gl6joc.png'
  },
  {
      Commodityname:'cotton',
      prices:[
          100, 103.3, 106.99, 109.05, 111.34, 278.37, 283.66, 141.83, 156.01, 159.44,
          207.27, 213.69,
      ],
      Image:'https://res.cloudinary.com/dgtdkqfsx/image/upload/v1731140803/cotton-balls_fixxd5.png'
  },
  {
      Commodityname:'rubber',
      prices:[
          100, 103.8, 107.32, 139.52, 89.29, 71.43, 28.57, 17.14, 17.38, 13.03, 13.4,
          13.55,
      ],
      Image:'https://res.cloudinary.com/dgtdkqfsx/image/upload/v1731140803/rubber_j1l2qq.png'
  }
]


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
  const { user, item, number, price, round } = req.body;
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
      { amount: amount, cart: user.cart, round: round },
      { new: true }
    );
    res.status(200).json(newUser);
  } catch (error) {
    res.status(400).json(error.message);
  }
};

const sellitems = async (req, res) => {
  const { user, item, number, price, round } = req.body;
  if (!mongoose.Types.ObjectId.isValid(user._id)) {
    return res.status(404).json({ error: "user does not exist !!!" });
  }
  const id = user._id;
  const existing = await User.findById(id);
  existing.amount = existing.amount + number * price;
  existing.round = round;
  existing.cart.forEach((stuff) => {
    if (stuff.item === item) {
      stuff.number = stuff.number - number;
    }
  });
  existing.cart.filter((stuff) => stuff.number >= 0);

  try {
    const updatedUser = await existing.save();
    res.status(200).json(updatedUser);
  } catch (error) {
    res.status(400).json(error.message);
  }
};

function getPrice(name) {
    const commodity = Data.find((item) => item.Commodityname === name);
    return commodity ? commodity.prices[10] : null;
  }

const result = async (req, res) => {
  try {
    const alldata = await User.find();
    const result = alldata
      .map((user) => ({
        name: user.name,
        finalamount: user.finalamount,
      }))
      .sort((a, b) => b.finalamount - a.finalamount);

    res.status(200).json(result);
  } catch (error) {
    res.status(400).json(error.message);
  }
};

const myresult = async (req, res) => {
  const { user } = req.body;
  if (!mongoose.Types.ObjectId.isValid(user._id)) {
    return res.status(404).json({ error: "user does not exist !!!" });
  }
  try {
    let total = user.amount;
    const id = user._id;

    user.cart.forEach((each) => {
      total += getPrice(each.item) * each.number;
    });

    const updatedUser = await User.findByIdAndUpdate(
      id,
      { finalamount: total },
      { new: true }
    );
    res.status(200).json(updatedUser)
  } catch (error) {
    res.status(400).json(error.message);
  }
};

const router = express.Router();

// router.use(requireAuth);

router.get("/result", result);
router.post("/myresult", myresult);
router.patch("/buy", buyitems);
router.patch("/sell", sellitems);

module.exports = router;