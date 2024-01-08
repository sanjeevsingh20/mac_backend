const mongoose = require("mongoose")
const config = require("../config/confidentials")
const mongoURL = config.uri
const connectmongo =  async() => {

    try {
     const conn = await mongoose.connect(mongoURL,{
        useNewUrlParser: true,
        useUnifiedTopology: true
      });
      console.log("Connected succes");
    } catch (error) {
      console.log("Not Connected ")
    }
    
  };
  module.exports = connectmongo;