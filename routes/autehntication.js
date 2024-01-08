const express = require("express");
const router = express.Router();
const user = require("../model/users");
const profiles = require("../model/profile_pic");
const social = require("../model/social_media");
const { query, validationResult, body } = require("express-validator");
const jet_token = require("jsonwebtoken");
const bycrypt = require("bcryptjs");
const config = require("../config/confidentials");
const nodemailer = require("nodemailer");
const path = require("path");
const getuser = require("../middleware/logged");

const transport = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: config.email_user,
    pass: config.emai_password,
  },
});

//Adding new user to database

router.post(
  "/",
  body("username", "Enter a valid Email").isEmail(),
  body("gender", "Please Enter Your Gender"),
  body("Pass_word", "Password Should be Minimum 8 Characters").isLength({
    min: 8,
  }),
  body("fname", "Name should be minimum 3 characters").isLength({ min: 3 }),
  body("about", "Write about you with maximum 1000 charcters").isLength({
    max: 1000,
  }),
  async (req, res) => {
    const errors = validationResult(req);
    console.log(errors)
    if (!errors.isEmpty()) {
      return res.status(404).json({ error: errors.array() });
    } else {
      try {
        let user_find = await user.findOne({ Email: req.body.username });

        if (user_find) {
          success = false;
          res.status(404).json({
            success,
            Error: "Soory Username already exists ! Login instead",
          });
        } else {
          const salt = await bycrypt.genSalt(15);

          const passw = await bycrypt.hash(req.body.Pass_word, salt);

          const create_user = await user.create({
            First_name: req.body.fname,
            Last_name: req.body.lname,
            Gender: req.body.gender,
            Department: req.body.department,
            About: req.body.about,
            Email: req.body.username,
            Password: passw,
          });
          let user_log = await user.findOne({ Email: req.body.username });
          const data = {
            user: {
              id: user_log.id,
            },
          };
          const authtoken = jet_token.sign(data, config.secret_key);
          success = true;
          const mailoptions = {
            from: "manojkumarsinghy20@gmail.com",
            to: `${req.body.username}`,
            subject:
              "Welcome to MACTRONICS - Your Gateway to Electronics Excellence!",
            text: `Hello`,
            html: `<div style="width: 70vw; padding: 30px; background-color: aliceblue; font-family: 'Gill Sans', 'Gill Sans MT', Calibri, 'Trebuchet MS', sans-serif;">
                    <div style="background-color: #0E2A5C;"><a href="https://mac-tronics.vercel.app/"><img src="https://i.postimg.cc/Hsy1ZbFp/image-removebg-preview-18.png" alt="" width="200px"></a></div>
                    <h3 style="font-weight: bold;">Dear ${req.body.fname},</h3>
                    <p style="font-weight: bold; font-size: larger; font-family: 'Gill Sans', 'Gill Sans MT', Calibri, 'Trebuchet MS', sans-serif;">Welcome to MACTRONICS, the cutting-edge web app powered by the Department of Electronics at Maharaja Agrasen College. We are thrilled to have you on board and embark on this exciting journey of exploration, learning, and innovation in the realm of electronics.</p>
                    <p style="font-weight: bold; font-size: larger; ">Here's a glimpse of what you can expect:</p>
                    <ul>
                        <li>
                            <strong>Comprehensive Courseware: </strong>Immerse yourself in a range of courses tailored to various skill levels, from beginners to seasoned experts. Our courses are designed to equip you with practical, real-world skills.
                        </li>
                        <br>
                        <li>
                            <strong>Live Workshops with Experts: </strong>Participate in live workshops hosted by industry leaders. Engage in discussions, ask questions, and gain hands-on experience with the latest tools and technologies.
                        </li>
                        <br>
                        <li>
                            <strong>Dynamic Blogging Platform: </strong>Express your thoughts, insights, and expertise in the world of electronics through our blog feature. Share your unique perspective and contribute to the collective knowledge of the MACTRONICS community.
                        </li>
                        <br>
                        <li>
                            <strong>Rich Resource Library: </strong>Dive into an extensive collection of articles, research papers, and reference materials covering a wide spectrum of topics in electronics and related fields.
                        </li>
                    </ul>
                    <p style="font-weight: bold; font-size: larger; font-family: 'Gill Sans', 'Gill Sans MT', Calibri, 'Trebuchet MS', sans-serif;">Your feedback is invaluable to us, and we're committed to providing you with the best learning experience possible. Should you have any questions, suggestions, or simply want to say hello, our support team is here to assist you at <a href="">supportmactronics@gmail.com</a></p>
                    <br>
                    <br>
                    <span>Warm regards,</span>
                    <br><br>
                    <span> Sanjeev (Admin)</span><br>
                    <span>
                        Department ofElectronics
                    </span>
                    <br>
                    <span>
                        Maharaja Agrasen College
                    </span>
                    
                </div>`,
          };
          transport.sendMail(mailoptions, (err, info) => {
            if (err) {
              res.json({ error: "Email not sent due to some conditions" });
            } else {
              console.log(info.response);
            }
          });
          res.json({
            success,
            authtoken: authtoken,
          });
        }
      } catch (error) {
        res.status(501).json({ errors: "Internal Server Error" });
      }
    }
  }
);

//API To get Login Portal

router.post(
  "/login",
  body("Email", "Enter a valid Email").isEmail(),
  body("Password", "Password Should not be Blank").exists(),
  async (req, res) => {
    const errors = validationResult(req);
    success = false;
    if (!errors.isEmpty()) {
      res.status(404).json({
        success,
        error: "Please Enter Your Details",
      });
    } else {
      try {
        const { Email, Password } = req.body;
        const user_log = await user.findOne({ Email: Email });

        if (!user_log) {
          res.status(404).json({
            error: "Please Enter Correct Login Details",
          });
        } else {
          const passw = await bycrypt.compare(Password, user_log.Password);
          if (!passw) {
            res.status(404).json({
              msg: "Please Enter Correct Login Details",
            });
          } else {
            const data = {
              user: {
                id: user_log.id,
              },
            };
            const authtoken = jet_token.sign(data, config.secret_key);
            success = true;
            res.json({
              success,
              authtoken: authtoken,
            });
          }
        }
      } catch (error) {
        res.status(401).send({
          error: "Unauthecated User Found",
        });
      }
    }
  }
);
//API for updating the data

router.post(
  "/upadte_profile",
  body("Abouts", "Write about you with maximum 1000 charcters").isLength({
    max: 1000,
  }),
  getuser,
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(404).json({ error: errors.array() });
    } else {
      try {
        const { first_name, last_name, Genders, Deaprtment, Abouts } = req.body;
        const newtitle = {};
        if (first_name) {
          newtitle.First_name = first_name;
        }
        if (last_name) {
          newtitle.Last_name = last_name;
        }
        if (Genders) {
          newtitle.Gender = Genders;
        }
        if (Deaprtment) {
          newtitle.Department = Deaprtment;
        }
        if (Abouts) {
          newtitle.About = Abouts;
        }

        let users = await user.findById(req.User.id);
        if (users.id.toString() !== req.User.id) {
          res.status(401).json({ Invalid: "Unauthorized user" });
        } else {
          upadted_user = await user.findByIdAndUpdate(
            req.User.id,
            { $set: newtitle },
            { new: true }
          );
          res.json(upadted_user);
        }
      } catch (error) {
        res.json({
          error: "This Action Can't be Done at This Moment ! Please Try Again",
        });
      }
    }
  }
);
//API For Logged in User details

router.get("/logged_user", getuser, async (req, res) => {
  try {
    const user_id = req.User.id;
    const data = await user.findById(user_id).select("-Password");
    const profile = await profiles.findOne({ user: user_id });
    const social_media = await social.find({ user: user_id });
    res.send({ data, profile, social_media });
  } catch (error) {
    res.send({ error: "Please Authenticate Yourself" });
  }
});

//API for sending OTP
router.post(
  "/email_verificatoin",
  body("user_mail", "Please Enter valid Email").isEmail(),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(404).json({ errors: errors.array() });
    } else {
      try {
        const usefind = await user.findOne({ Email: req.body.user_mail });
        if (usefind) {
          const OTP = Math.floor(Math.random() * (900000 - 100000)) + 100000;
          const mailoptions = {
            from: "manojkumarsinghy20@gmail.com",
            to: `${req.body.user_mail}`,
            subject:
              "One-Time Password (OTP) for Password Change on Mactronics Website",
            text: `Hello`,
            html: `<div style="width: 70vw; padding: 30px; background-color: aliceblue; font-family: 'Gill Sans', 'Gill Sans MT', Calibri, 'Trebuchet MS', sans-serif;">
                  <div style="background-color: #0E2A5C;"><a href="https://mac-tronics.vercel.app/"><img src="https://i.postimg.cc/Hsy1ZbFp/image-removebg-preview-18.png" alt="" width="200px"></a></div>
                  <p style="font-weight: bold; font-size: larger; font-family: 'Gill Sans', 'Gill Sans MT', Calibri, 'Trebuchet MS', sans-serif;">We hope this message finds you well.</p>
                  <p style="font-weight: bold; font-size: larger; font-family: 'Gill Sans', 'Gill Sans MT', Calibri, 'Trebuchet MS', sans-serif;">As a part of our commitment to security, we have generated a One-Time Password (OTP) for your Mactronics account. This OTP will be required to complete the password change process on the Mactronics website, which is the official website of the Department of Electronics.</p><br><br>
                  <h2 style="font-weight: bold;">Your OTP : ${OTP}</h2>
                  
                  <p style="font-weight: bold; font-size: larger; font-family: 'Gill Sans', 'Gill Sans MT', Calibri, 'Trebuchet MS', sans-serif;">Please remember to keep this OTP confidential and refrain from sharing it with anyone. It is also advisable not to write it down in easily accessible places.
                  <br>
                  If you did not initiate this request, please contact our support team immediately. <a href="">supportmactronics@gmail.com</a></p>
                  <br>
                  <br>
                  <span>Warm regards,</span>
                  <br><br>
                  <span> Sanjeev (Admin)</span><br>
                  <span>
                      Department ofElectronics
                  </span>
                  <br>
                  <span>
                      Maharaja Agrasen College
                  </span>
                  
              </div>`,
          };
          transport.sendMail(mailoptions, (err, info) => {
            if (err) {
              res.json({ error: "Email not sent due to some conditions" });
            } else {
              console.log(info.response);
            }
          });
          success = true;
          res.json({ success, OTP });
        } else {
          success = false;
          res.json({
            success,
            error:
              "Create a new account since no user is associated with this email address.",
          });
        }
      } catch (error) {
        success = false;
        res.status(501).json({ success, error: "Internal Server Error" });
      }
    }
  }
);

//API for updating password

router.post(
  "/update_password",
  body("user_mail", "Enter a Valid Email").isEmail(),
  body("user_pass", "Please Enter At Least 8 Characters").isLength({
    min: 8,
  }),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(401).json({ errors: errors.array() });
    } else {
      try {
        const { user_mail, user_pass } = req.body;
        const user_find = await user.findOne({ Email: user_mail });
        if (user_find) {
          const salt = await bycrypt.genSalt(15);
          const passw = await bycrypt.hash(user_pass,salt);
          const data = await user.findByIdAndUpdate(
            user_find.id,
            { $set: { Password: passw } },
            { new: true }
          );
          success= true
          res.json({success,Email:user_mail})
        }
        else{
          res.json({error:"Please provide the email associated with your account."})
        }
      } catch (error) {
        res.status(501).json({ error: "Internal Server Error" });
      }
    }
  }
);
module.exports = router;
