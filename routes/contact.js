const express = require("express");
const router = express.Router();
const messages = require("../model/message");
const {
  query,
  validationResult,
  body,
  ExpressValidator,
} = require("express-validator");

router.post(
  "/messages",
  body("full_name", "Please Enter Your Full Name"),
  body("message_email", "Please Enter Your Mail").isEmail(),
  body("subject", "Please Enter Your Subject"),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors) {
      return res.status(404).json({ error: errors.array() });
    } else {
      try {
        const create_msg = await messages.create({
          Full_name: req.body.full_name,
          Message_Email: req.body.message_email,
          Subject: req.body.subject,
          Message: req.body.message,
        });
        success = true;
        res.json({
          success,
          msg:"Message Sent Successfully"
        });
      } catch (error) {
        res.status(501).json({ errors: "Internal Server Error" });
      }
    }
  }
);
module.exports = router;
