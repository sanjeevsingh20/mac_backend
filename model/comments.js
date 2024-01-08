const mongoose = require("mongoose");
const { Schema } = mongoose;

const CommentSchema = new Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user", // it takes refrence that from which user it comes from user database/models
  },
  blog_id:{
    type: mongoose.Schema.Types.ObjectId,
    ref: "blog", // it takes refrence that from which user it comes from blog database/models
  },
  comment_user:{
    type:String,
    required: true,
  },
  profile_pic: {
    type: String,
  },
  usercomments :{
    type: String
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("comments", CommentSchema);
