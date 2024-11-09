const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const userSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  phonenumber: {
    type: Number,
    required: true,
    unique: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  finalamount: {
    type: Number,
    default: 0,
  },
  cart: {
    type: [
      {
        item: String,
        number: Number,
      },
    ],
    default: [],
    required: true,
  },
  round: {
    type: Number,
    default: 1,
  },
});

module.exports= mongoose.model('User', userSchema)