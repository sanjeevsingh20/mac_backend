const mongoose = require("mongoose");
const { Schema } = mongoose;

const UserSchema = new Schema({
  First_name: {
    type: String,
    required: true,
  },
  Last_name: {
    type: String,
    required: true,
  },
  Gender: {
    type: String,
    required: true,
  },
  Department: {
    type: String,
    required: true,
  },
  About: {
    type: String,
    required: true,
  },
  Email: {
    type: String,
    required: true,
    unique: true,
  },
 
  Password: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("user", UserSchema);
