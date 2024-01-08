const express = require("express");
const router = express.Router();
const PHOTO = require("../model/profile_pic");
const Social_media = require("../model/social_media");
const multer = require("multer");
const getuser = require("../middleware/logged");
const {
  query,
  validationResult,
  body,
  ExpressValidator,
} = require("express-validator");
const path = require("path");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/images");
  },
  filename: (req, file, cb) => {
    cb(
      null,
      file.fieldname + "_" + Date.now() + path.extname(file.originalname)
    );
  },
});
const upload = multer({
  storage: storage,
});
router.post(
  "/upload_profile",
  getuser,
  upload.single("photo"),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(404).json({ error: errors.array() });
    } else {
      try {
        const user_pic = await PHOTO.findOne({ user: req.User.id });
        if (!user_pic) {
          const pic = new PHOTO({
            profile_pic: req.file.filename,
            user: req.User.id,
          });
          const saved_pic = await pic.save();
          res.json(req.file);
        } else {
          const update_pic = await PHOTO.findByIdAndUpdate(
            user_pic.id,
            { $set: { profile_pic: req.file.filename } },
            { new: true }
          );
          res.json(update_pic);
        }
      } catch (error) {
        res
          .status(401)
          .json({ error: "Something Error Occured ! Please Try Again Later" });
      }
    }
  }
);
router.post("/add_social", getuser, async (req, res) => {
  try {
    const user_social = await Social_media.findOne({ user: req.User.id });
    if (!user_social) {
      const social = new Social_media({
        user: req.User.id,
        instagram: req.body.instagram,
        facebook: req.body.facebook,
        twitter: req.body.twitter,
      });
      const saved_social = await social.save();
      res.json(saved_social);
    } else {
      const update_social = await Social_media.findByIdAndUpdate(
        user_social.id,
        {
          $set: {
            instagram: req.body.instagram,
            facebook: req.body.facebook,
            twitter: req.body.twitter,
          },
        },
        { new: true }
      );
      res.json(update_social);
    }
  } catch (error) {
    res.json({error:"Some Error Occured ! Please Try Again Later"})
  }
});

router.get("/get_profile", getuser, async (req, res) => {
  try {
    const data = await PHOTO.find({ user: req.User.id });
    res.send(data);
  } catch (error) {
    res.send({ error: error });
  }
});
router.get("/get_images", async (req, res) => {
  try {
    const data = await PHOTO.findById({user: req.body.userid});
    res.send(data);
  } catch (error) {
    res.send({ error: error });
  }
});

module.exports = router;
