const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const saltRounds = 10;
const jwt = require("jsonwebtoken");

const userSchema = mongoose.Schema({
  name: {
    type: String,
    maxlength: 50,
  },
  email: {
    type: String,
    trim: true,
    unique: 1,
  },
  password: {
    type: String,
    minlength: 5,
  },
  lastname: {
    type: String,
    maxlength: 50,
  },
  role: {
    type: Number,
    default: 0,
  },
  image: String,
  token: {
    type: String,
  },
  tokenExp: {
    type: Number,
  },
});

userSchema.pre("save", function (next) {
  let user = this;

  //? 비밀번호를 암호화 시킨다.
  if (user.isModified("password")) {
    bcrypt.genSalt(saltRounds, function (err, salt) {
      if (err) return next(err);
      bcrypt.hash(user.password, salt, function (err, hash) {
        if (err) return next(err);
        user.password = hash;
        next();
      });
    });
  } else {
    next();
  }
});

userSchema.methods.comparePassword = function (plainPassword, cb) {
  // plainPassword = 1234567
  // 암호화된 비밀번호 = '$2b$10$9rL7asjK1O9GnVdq3Yud2O.hVvsipHVJ8oVBB29GCIVmOZMCbWgGK'

  bcrypt.compare(plainPassword, this.password, function (err, isMatch) {
    if (err) {
      return cb(err);
    }

    cb(null, isMatch);
  });
};

userSchema.methods.generateToken = function (cb) {
  // ? JsonWebToken을 이용하여 토큰 생성하기
  let user = this;

  let token = jwt.sign(user._id.toHexString(), "secretToken");

  user.token = token;
  user.save(function (err, user) {
    if (err) {
      return cb(err);
    }
    cb(null, user);
  });
};

userSchema.statics.findByToken = function (token, cb) {
  let user = this;

  //! 토큰을 Decode 한다.
  jwt.verify(token, "secretToken", function (err, decoded) {
    //? 1. 유저 아이디를 이용해서 유저를 찾은 다음에
    //? 2. 클라이언트에서 가져온 token과 DB에 보관된 토큰이 일치하는지 확인

    user.findOne({ _id: decoded, token: token }, function (err, user) {
      if (err) {
        return cb(err);
      }
      cb(null, user);
    });
  });
};

//? 최종적으로 생성한 테이블(스키마)를 모델로 감싸주고 exports를 해준다.
const User = mongoose.model("User", userSchema);

module.exports = { User };
