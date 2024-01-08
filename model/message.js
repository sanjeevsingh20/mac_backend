const mongoose = require("mongoose");
const { Schema } = mongoose;

const MessageSchema = new Schema({
  Full_name: {
    type: String,
    required: true,
  },
  Message_Email: {
    type: String,
    required: true,
  },
  Subject: {
    type: String,
    required: true,
  },
  Message: {
    type: String,
    required: true,
  },
  
  date: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("messages", MessageSchema);
