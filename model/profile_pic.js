const mongoose = require("mongoose");
const { Schema } = mongoose;

const ProfileSchema = new Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user", // it takes refrence that from which user it comes from user database/models
  },
  profile_pic: {
    type: String,
  },
});

module.exports = mongoose.model("profiles", ProfileSchema);
