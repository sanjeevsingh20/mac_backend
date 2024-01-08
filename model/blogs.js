const mongoose = require("mongoose");
const { Schema } = mongoose;

const BlogSchema = new Schema({
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user", // it takes refrence that from which user it comes from user database/models
    },
    Title: {
      type: String,
      required: true,
    },
    Tagline:{
        type:String,
    },
    Content:{
        type: String,
        required: true,
    },
    Meta:{
        type: String,
    },
    Status:{
        type: String,
        required: true,
    },
    Date:{
      type: Date,
      default: Date.now,
    },
    Author:{
      type:String,
      required: true,
    },
    Profile_Pic:{
      type:String,
    }
  });
  
  module.exports = mongoose.model("blog", BlogSchema);