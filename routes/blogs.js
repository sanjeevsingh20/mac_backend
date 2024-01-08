const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const profiles = require("../model/profile_pic");
const comments = require("../model/comments");
const user = require("../model/users");
const { query, validationResult, body } = require("express-validator");
const getuser = require("../middleware/logged");
const blogs = require("../model/blogs");
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/blogimage");
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

//Adding A New Blog
router.post(
  "/addnewblog",
  getuser,

  body("blog_title", "Please Enter Blog Title").isLength({
    max: 150,
  }),
  body("blog_content", "Please Enter at least 300 characters").isLength({
    min: 5,
  }),
  body("meta_description", "Please Enter at least 200 characters").isLength({
    max: 200,
  }),

  body("blog_status", "Please Set Blog Status").notEmpty(),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(404).json({ errors: errors.array() });
    } else {
      try {
        const user_find = await user.findById(req.User.id);
        const profile = await profiles.findOne({ user: req.User.id });
        if (!user_find) {
          success = false;
          res
            .status(401)
            .json({ success, error: "Please Authenticate Yourself" });
        } else {
          const create_blog = new blogs({
            user: req.User.id,
            Title: req.body.blog_title,
            Tagline: req.body.tagline ? req.body.tagline : "",
            Meta: req.body.meta_description ? req.body.meta_description : "",
            Content: req.body.blog_content,
            Status: req.body.blog_status,
            Author: user_find.First_name,
            Profile_Pic: profile.profile_pic,
          });
          const save_blog = await create_blog.save();

          res.json({ success: true, data: save_blog });
        }
      } catch (error) {
        res.status(505).json({ error: "Internal Server Error" });
      }
    }
  }
);

//Get The details Of the specific Blog
router.get("/once_blog/:id", async (req, res) => {
  try {
    const blog = await blogs.findById(req.params.id);
    if (!blog) {
      res.json({ success: false, data: "Blog Not Found" });
    } else {
      res.json({ success: true, data: blog });
    }
  } catch (error) {
    res.status(505).json({ error: "Internal Server Error" });
  }
});

//To Update the Blog
router.put(
  "/update_blog/:id",
  getuser,

  body("u_blog_title", "Please Enter Blog Title").isLength({
    max: 200,
  }),
  body("u_blog_content", "Please Enter at least 300 characters").isLength({
    min: 5,
  }),
  body("u_blog_status", "Please Set Blog Status").notEmpty(),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(404).json({ errors: errors.array() });
    } else {
      try {
        const {
          u_blog_title,
          u_tagline,
          u_blog_content,
          u_blog_status,
          u_meta_desc,
        } = req.body;

        const upadateblog = {};
        if (u_blog_title) {
          upadateblog.Title = u_blog_title;
        }
        if (u_tagline) {
          upadateblog.Tagline = u_tagline;
        }
        if (u_blog_content) {
          upadateblog.Content = u_blog_content;
        }
        if (u_blog_status) {
          upadateblog.Status = u_blog_status;
        }
        if (u_meta_desc) {
          upadateblog.Meta = u_meta_desc;
        }

        const user_find = await user.findById(req.User.id);
        if (!user_find) {
          res.json({ error: "Unauthorized User" });
        } else {
          const update_blog = await blogs.findByIdAndUpdate(
            req.params.id,
            {
              $set: upadateblog,
            },
            { new: true }
          );
          res.json({ success: true, data: update_blog });
        }
      } catch (error) {
        res.status(505).json({ error: "Internal Server Error" });
      }
    }
  }
);


//Delete The Blog Post
router.delete("/delete_post/:id", getuser, async (req, res) => {
  try {
    const blog = await blogs.findById(req.params.id);
    if (blog) {
      if (blog.user == req.User.id) {
        const delete_blog = await blogs.findByIdAndDelete(req.params.id);
        res.json({ success: true, deleted: delete_blog });
      } else {
        res.json({ error: "Please Authenticate Yourself" });
      }
    } else {
      res.json({
        success: false,
        error: "Blog Post Not Found ! Maybe It Already Deleted",
      });
    }
  } catch (error) {
    res.status(505).json({ error: "Internal Server Error" });
  }
});

//Get All the Blogs Of the user
router.get("/getallblogs", getuser, async (req, res) => {
  try {
    const blog_find = await blogs.find({ user: req.User.id });
    if (!blog_find) {
      res.json({ success: false, data: "No Blogs Found" });
    } else {
      res.json({ success: true, data: blog_find });
    }
  } catch (error) {
    res.status(505).json({ error: "Internal Server Error" });
  }
});

//Getting all The Blogs in database
router.get("/mactronics/blogs", async (req, res) => {
  try {
    const blog_find = await blogs.find().sort({ Date: -1 });
    if (!blog_find) {
      res.json({ success: false, data: "No Blogs Found" });
    } else {
      res.json({ success: true, data: blog_find });
    }
  } catch (error) {
    res.status(505).json({ error: "Internal Server Error" });
  }
});

//Adding Comments to the blogs
router.post(
  "/add_comments/:id",
  body("user_comments", "Please Add Your Comments").notEmpty(),
  getuser,
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(404).json({ errors: errors.array() });
    } else {
      try {
        const { user_comments } = req.body;
        const blogs_find = await blogs.findById(req.params.id);
        const user_find = await user.findById(req.User.id).select(["First_name","Last_name"]);
        const profile_find = await profiles.findOne({user:req.User.id})
        if (!blogs_find && !user_find) {
          res.json({ message: "Blog Not Found" });
        } else {
         
          const create_comment = new comments({
            user: req.User.id,
            blog_id: req.params.id,
            comment_user: (user_find.First_name +" "+ (user_find.Last_name?user_find.Last_name:"")),
            profile_pic: profile_find.profile_pic,
            usercomments: user_comments,
          });
          const save_comment = await create_comment.save();

          res.json({ success: true, data: save_comment });
        }
      } catch (error) {
        res.status(505).json({ error: "Internal Server Error" });
      }
    }
  }
);

//Getting all comments of specific post
router.get("/getcomments/:id",async(req,res)=>{
  try {
    const commentsfind = await comments.find({blog_id:req.params.id})
    res.json(commentsfind)
    
  } catch (error) {
    res.status(505).json({ error: "Internal Server Error" });
  }
})

//adding like to the comment
router.get("/getblogs/:items",async(req,res)=>{

  try {
    const text = req.params.items
    var regexPattern = new RegExp(text, 'i');
    const data = await blogs.find({ Title: { $regex: regexPattern} })
    if(data){
      res.json({success:true,data})
    }else{
      res.json({success:false})
    }
    
    
  } catch (error) {
    res.status(505).json({ error: "Internal Server Error" });
  }
})

module.exports = router;
