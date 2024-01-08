const jwt = require("jsonwebtoken")
const config = require("../config/confidentials")
const express = require("express");


const getuser = async (req, res, next) => {
  const token = req.header("Authorization");
  try {
    if (!token) {
      res.status(401).send({ error: "Authenticate Yourself" });
    } else {
      try {
        const data = jwt.verify(token, config.secret_key);
        req.User = data.user;
      } catch (error) {
        console.log({ error: error });
      }
    }
  } catch (error) {
    console.log({error})
  }
 
  next();
};

module.exports = getuser;
