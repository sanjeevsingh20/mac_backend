const mongoose = require("mongoose");
const { Schema } = mongoose;

const SocialSchema = new Schema({
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user", // it takes refrence that from which user it comes from user database/models
    },
    instagram: {
      type: String,
    },
    facebook:{
        type: String,
    },
    twitter:{
        type: String,
    },
  });
  
  module.exports = mongoose.model("social", SocialSchema);