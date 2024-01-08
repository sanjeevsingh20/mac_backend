const express = require("express")
const cors = require("cors")
const app = express()
const port = process.env.PORT || 5000;
const connectmongo = require("../model/database");
const bodyParser = require("body-parser");
const compression = require("compression")

app.use(express.json());
connectmongo()
app.use(compression())
app.use(express.static('public'))

app.use(cors({
  origin:"*"
}))
 
app.use("/api/auth",require("../routes/autehntication"))

app.use("/api/user",require("../routes/contact"))
app.use("/api/logged",require("../routes/profile"))
app.use("/api/blogs" , require("../routes/blogs"))
// app.use(express.urlencoded({extended:true, limit:"50mb"}));

app.get("/", (req, res) => {
    res.send("Hello World");
  });
  
app.get("/new", (req, res) => {
    res.send("this is new Blog page");
  });
  
  app.listen(port, () => {
    console.log(`Example app listening on port http://localhost:${port}`);
});
