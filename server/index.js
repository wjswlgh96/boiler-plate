const express = require("express");
const app = express();
const port = 4000;
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const { auth } = require("./middleware/auth");
const { User } = require("./models/User");

const config = require("./config/key");

const mongoose = require("mongoose");

//application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));

//application/json
app.use(bodyParser.json());
app.use(cookieParser());

mongoose
  .connect(config.mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connect Success!"))
  .catch((err) => console.log(err));

app.get("/", (req, res) => {
  res.send("Hello World! 노드몬 테스트");
});

app.get("/api/hello", (req, res) => {
  res.send("안녕하세요 ~");
});

app.post("/api/users/register", (req, res) => {
  const user = new User(req.body);

  user.save((err, userInfo) => {
    console.log("err: ", err);
    if (err) return res.json({ success: false, err });

    return res.status(200).json({
      success: true,
    });
  });
});

app.post("/api/users/login", (req, res) => {
  //? 1. 요청된 이메일을 DB에 있는지 찾는다.
  User.findOne({ email: req.body.email }, (err, user) => {
    if (!user) {
      return res.json({
        loginSuccess: false,
        message: "제공된 이메일에 해당하는 유저가 없습니다.",
      });
    }

    //? 2. 요청된 이메일이 DB에 있다면, 비밀번호가 일치하는지 확인한다.
    user.comparePassword(req.body.password, (err, isMatch) => {
      if (!isMatch) {
        return res.json({
          loginSuccess: false,
          message: "비밀번호가 틀렸습니다.",
        });
      }

      //? 3. 비밀번호까지 일치한다면 유저를 위한 Token을 생성한다.
      user.generateToken((err, user) => {
        if (err) {
          res.status(400).send(err);
        }

        //! 토큰을 저장한다. 어디에? 쿠키, 로컬스토리지 (이번에는 쿠키에 저장함)
        res
          .cookie("x_auth", user.token)
          .status(200)
          .json({ loginSuccess: true, userId: user._id });
      });
    });
  });
});

app.get("/api/users/auth", auth, (req, res) => {
  res.status(200).json({
    _id: req.user._id,
    isAdmin: req.user.role === 0 ? false : true,
    isAuth: true,
    email: req.user.email,
    name: req.user.name,
    lastname: req.user.lastname,
    role: req.user.role,
    image: req.user.image,
  });
});

app.get("/api/users/logout", auth, (req, res) => {
  User.findOneAndUpdate({ _id: req.user._id }, { token: "" }, (err, user) => {
    if (err) return res.json({ success: false, err });

    return res.status(200).send({
      success: true,
    });
  });
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
